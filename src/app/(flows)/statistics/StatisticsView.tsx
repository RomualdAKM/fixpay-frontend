"use client";

import { useEffect, useMemo, useState } from "react";

import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { InlineError } from "@/components/feedback/InlineError";
import { AmountFigure } from "@/components/ui/AmountText";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useCards } from "@/lib/api/cardHooks";
import { useWallet, useWalletTransactions } from "@/lib/api/moneyHooks";
import { walletTransactionToRow } from "@/lib/api/presenters";
import { cardExpiry, cardStatusLabel } from "@/lib/cards";
import type { Transaction } from "@/lib/display-types";
import { formatFcfa, formatSigned } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

const PERIODS = [
  { id: "7j", label: "7 jours", days: 7 },
  { id: "14j", label: "14 jours", days: 14 },
  { id: "30j", label: "30 jours", days: 30 },
] as const;

type Period = (typeof PERIODS)[number];

const MAX_WINDOW_DAYS = 30;

const CATEGORY_PALETTE = [
  "bg-primary",
  "bg-gold",
  "bg-orange",
  "bg-surface-4",
] as const;

function categoryColor(index: number): string {
  return CATEGORY_PALETTE[index] ?? "bg-surface-4";
}

const MONTHS_FR = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
] as const;

const SHORT_MONTHS_FR = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
] as const;

function dayOrdinal(d: Date): string {
  return d.getDate() === 1 ? "1er" : String(d.getDate());
}

function shortDay(d: Date): string {
  return `${d.getDate()} ${SHORT_MONTHS_FR[d.getMonth()]}`;
}

function rangeLabel(start: Date, end: Date): string {
  const endPart = `${dayOrdinal(end)} ${MONTHS_FR[end.getMonth()]} ${end.getFullYear()}`;
  if (
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    return `Du ${dayOrdinal(start)} au ${endPart}`;
  }
  return `Du ${dayOrdinal(start)} ${MONTHS_FR[start.getMonth()]} au ${endPart}`;
}

function dayFloor(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfDay(d: Date): number {
  return dayFloor(d).getTime();
}

function inPeriod(at: string, start: Date, end: Date): boolean {
  const parsed = new Date(at);
  if (Number.isNaN(parsed.getTime())) return false;
  const t = startOfDay(parsed);
  return t >= startOfDay(start) && t <= startOfDay(end);
}

function shiftDays(from: Date, delta: number): Date {
  return new Date(from.getFullYear(), from.getMonth(), from.getDate() + delta);
}

function niceCeiling(value: number): number {
  if (value <= 0) return 0;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 7.5]) {
    const candidate = step * magnitude;
    if (candidate >= value) return candidate;
  }
  return 10 * magnitude;
}

function compactAmount(value: number): string {
  if (value === 0) return "0";
  if (value >= 1_000_000) {
    const millions = Math.round((value / 1_000_000) * 10) / 10;
    return `${String(millions).replace(".", ",")} M`;
  }
  if (value >= 1_000) return `${Math.round(value / 1_000)} k`;
  return String(Math.round(value));
}

interface CategorySlice {
  label: string;
  amount: number;
  percent: number;
}

interface PeriodData {
  start: Date;
  end: Date;
  label: string;
  outflows: Transaction[];
  total: number;
  dailyAverage: number;
  inflows: number;
  inflowCount: number;
  days: { date: Date; total: number }[];
  max: number;
  spendDays: number;
  biggest?: Transaction;
  previousTotal: number;
  previousLabel: string;
  categories: CategorySlice[];
}

function buildPeriod(
  period: Period,
  rows: Transaction[],
  nowMs: number,
): PeriodData {
  const end = dayFloor(new Date(nowMs));
  const start = shiftDays(end, -(period.days - 1));
  const previousEnd = shiftDays(start, -1);
  const previousStart = shiftDays(previousEnd, -(period.days - 1));

  const isOutflow = (m: Transaction) => m.direction === "debit";

  const outflows = rows.filter(
    (m) => isOutflow(m) && inPeriod(m.at, start, end),
  );
  const total = outflows.reduce((sum, m) => sum + Math.abs(m.amount), 0);

  const previousTotal = rows
    .filter((m) => isOutflow(m) && inPeriod(m.at, previousStart, previousEnd))
    .reduce((sum, m) => sum + Math.abs(m.amount), 0);

  const credits = rows.filter(
    (m) => m.direction === "credit" && inPeriod(m.at, start, end),
  );

  const days = Array.from({ length: period.days }, (_, i) => {
    const date = shiftDays(start, i);
    const dayTotal = outflows
      .filter((m) => startOfDay(new Date(m.at)) === startOfDay(date))
      .reduce((sum, m) => sum + Math.abs(m.amount), 0);
    return { date, total: dayTotal };
  });

  const byCategory = new Map<string, number>();
  for (const movement of outflows) {
    byCategory.set(
      movement.title,
      (byCategory.get(movement.title) ?? 0) + Math.abs(movement.amount),
    );
  }
  const categories = [...byCategory.entries()]
    .map(([label, amount]) => ({
      label,
      amount,
      percent: total > 0 ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    start,
    end,
    label: rangeLabel(start, end),
    outflows,
    total,
    dailyAverage: Math.round(total / period.days),
    inflows: credits.reduce((sum, m) => sum + m.amount, 0),
    inflowCount: credits.length,
    days,
    max: days.reduce((m, d) => Math.max(m, d.total), 0),
    spendDays: days.filter((d) => d.total > 0).length,
    biggest: [...outflows].sort(
      (a, b) => Math.abs(b.amount) - Math.abs(a.amount),
    )[0],
    previousTotal,
    previousLabel: rangeLabel(previousStart, previousEnd),
    categories,
  };
}

const CHART_HEIGHT = 140;
const AXIS_WIDTH = 44;

function DailySpendChart({ data }: { data: PeriodData }) {
  const { days, max, spendDays } = data;
  const ceiling = niceCeiling(max);
  const ticks = [ceiling, ceiling / 2, 0];
  const labelStep = days.length <= 7 ? 1 : days.length <= 14 ? 2 : 5;
  const sparse = spendDays > 0 && spendDays * 2 < days.length;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <SectionLabel>Sorties jour par jour</SectionLabel>
        <span className="text-text-muted shrink-0 text-[11.5px] leading-[15px]">
          {max > 0 ? `Pic ${formatFcfa(max)}` : "Aucune sortie"}
        </span>
      </div>

      {max === 0 ? (
        <p className="text-text-secondary border-border mt-3 border-t py-8 text-[12.5px] leading-[18px]">
          Aucune sortie sur cette période : il n&apos;y a rien à tracer.
          Essayez une fenêtre plus longue.
        </p>
      ) : (
        <>
          <div
            role="img"
            aria-label={`Histogramme des sorties quotidiennes ${data.label.toLowerCase()}. Total ${formatFcfa(
              data.total,
            )} sur ${spendDays} ${spendDays > 1 ? "jours" : "jour"}, moyenne ${formatFcfa(
              data.dailyAverage,
            )} par jour, pic ${formatFcfa(max)}.`}
            className="mt-3.5 flex"
          >
            <div
              aria-hidden
              className="relative shrink-0"
              style={{ height: CHART_HEIGHT, width: AXIS_WIDTH }}
            >
              {ticks.map((tick) => (
                <span
                  key={tick}
                  className="text-text-muted absolute right-2 -translate-y-1/2 text-[10.5px] leading-[12px]"
                  style={{ top: `${(1 - tick / ceiling) * 100}%` }}
                >
                  {compactAmount(tick)}
                </span>
              ))}
            </div>

            <div className="relative flex-1" style={{ height: CHART_HEIGHT }}>
              {ticks.map((tick, index) => (
                <span
                  key={tick}
                  aria-hidden
                  className={cn(
                    "absolute inset-x-0 h-px",
                    index === ticks.length - 1
                      ? "bg-border-strong"
                      : "bg-border",
                  )}
                  style={{ top: `${(1 - tick / ceiling) * 100}%` }}
                />
              ))}

              <div className="absolute inset-0 flex items-end gap-[2px]">
                {days.map((day) => {
                  const percent = (day.total / ceiling) * 100;
                  const inside = percent >= 35;
                  return (
                    <div
                      key={day.date.toISOString()}
                      className="relative flex h-full flex-1 items-end"
                      title={`${shortDay(day.date)} · ${formatFcfa(day.total)}`}
                    >
                      {day.total > 0 && (
                        <>
                          <span
                            className={cn(
                              "absolute inset-x-0 text-center text-[10px] leading-[12px]",
                              inside
                                ? "font-medium text-white"
                                : "text-text-muted",
                            )}
                            style={{
                              bottom: inside
                                ? `calc(${percent}% - 16px)`
                                : `calc(${percent}% + 3px)`,
                            }}
                          >
                            {compactAmount(day.total)}
                          </span>
                          <div
                            className="bg-primary mx-auto w-full max-w-[40px] rounded-xs"
                            style={{ height: `${percent}%` }}
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            aria-hidden
            className="mt-2 flex gap-[2px]"
            style={{ paddingLeft: AXIS_WIDTH }}
          >
            {days.map((day, index) => {
              const isEdge = index === 0 || index === days.length - 1;
              const shown = isEdge || index % labelStep === 0;
              return (
                <span
                  key={day.date.toISOString()}
                  className={cn(
                    "flex-1 truncate text-center text-[10.5px] leading-[14px]",
                    day.total > 0 ? "text-text-secondary" : "text-text-muted",
                  )}
                >
                  {shown
                    ? isEdge
                      ? shortDay(day.date)
                      : String(day.date.getDate())
                    : ""}
                </span>
              );
            })}
          </div>

          {sparse && (
            <p className="text-text-muted mt-2.5 text-[11.5px] leading-[16px]">
              {spendDays} {spendDays > 1 ? "jours servis" : "jour servi"} sur{" "}
              {days.length} : la fenêtre montre des sorties isolées, pas une
              tendance.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function SpendRow({
  transaction,
  last,
}: {
  transaction: Transaction;
  last: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-[65px] items-center gap-[13px]",
        !last && "border-border border-b",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-text truncate text-[13.5px] font-medium">
          {transaction.title}
        </p>
        <p className="text-text-muted mt-[2px] truncate text-[11.5px]">
          {transaction.date}
        </p>
      </div>
      <AmountFigure
        value={formatSigned(transaction)}
        className="text-text shrink-0 text-[14px] font-semibold"
      />
    </div>
  );
}

function FactRow({
  label,
  detail,
  value,
  last = false,
}: {
  label: string;
  detail: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 py-[11px]",
        !last && "border-border border-b",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-text text-[13px] leading-[17px]">{label}</p>
        <p className="text-text-muted mt-[2px] truncate text-[11.5px] leading-[15px]">
          {detail}
        </p>
      </div>
      <AmountFigure
        value={value}
        className="text-text shrink-0 text-[14px] leading-[18px] font-semibold"
      />
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="mt-8 animate-pulse" aria-hidden="true">
      <div className="bg-surface-2 h-[13px] w-[150px] rounded-xs" />
      <div className="bg-surface-2 mt-3 h-[38px] w-[220px] rounded-sm" />
      <div className="bg-surface-2 mt-6 h-[140px] w-full rounded-md" />
      <div className="bg-surface-2 mt-8 h-[180px] w-full rounded-md" />
    </div>
  );
}

export function StatisticsView() {
  const [period, setPeriod] = useState<Period>(PERIODS[0]);
  const [nowMs] = useState<number>(() => Date.now());

  const txQuery = useWalletTransactions();
  const walletQuery = useWallet();
  const cardsQuery = useCards();

  const {
    data: txData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = txQuery;

  const maxWindowStart = useMemo(
    () => startOfDay(shiftDays(dayFloor(new Date(nowMs)), -(MAX_WINDOW_DAYS - 1))),
    [nowMs],
  );

  const rows = useMemo(
    () =>
      (txData?.pages ?? [])
        .flatMap((page) => page.items)
        .map((tx, index) => walletTransactionToRow(tx, index)),
    [txData],
  );

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const oldest = rows[rows.length - 1];
    if (!oldest?.at) return;
    const oldestDay = new Date(oldest.at);
    if (Number.isNaN(oldestDay.getTime())) return;
    if (startOfDay(oldestDay) >= maxWindowStart) {
      void fetchNextPage();
    }
  }, [rows, hasNextPage, isFetchingNextPage, fetchNextPage, maxWindowStart]);

  const data = useMemo(
    () => buildPeriod(period, rows, nowMs),
    [period, rows, nowMs],
  );

  const analyticsReady = !txQuery.isPending && !txQuery.isError;
  const cards = cardsQuery.data ?? [];

  return (
    <>
      <main className="flex-1 px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[1080px] lg:px-10 lg:pt-9 lg:pb-12">
        <PageHeader title="Statistiques" backHref="/" />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div
            role="group"
            aria-label="Période"
            className="bg-surface-2 border-border inline-flex rounded-md border p-[3px]"
          >
            {PERIODS.map((p) => {
              const active = p.id === period.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "focus-visible:ring-primary/60 h-8 rounded-sm px-3.5 text-[12.5px] font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                    active
                      ? "bg-primary text-white"
                      : "text-text-secondary hover:text-text",
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          {analyticsReady && (
            <p className="text-text-muted text-[12.5px] leading-[16px]">
              {data.label}
            </p>
          )}
        </div>

        {txQuery.isPending ? (
          <AnalyticsSkeleton />
        ) : txQuery.isError ? (
          <div className="mt-8">
            <InlineError error={txQuery.error} />
            <button
              type="button"
              onClick={() => void txQuery.refetch()}
              className="text-primary-light mt-3 text-[13px] leading-[18px] font-medium underline-offset-4 hover:underline"
            >
              Réessayer
            </button>
          </div>
        ) : rows.length === 0 ? (
          <p className="text-text-secondary border-border mt-8 border-y py-8 text-[13px] leading-[19px]">
            Aucun mouvement de portefeuille pour le moment. Vos statistiques
            apparaîtront dès vos premières opérations.
          </p>
        ) : (
          <div className="contents lg:mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
            <div className="contents lg:block">
              <section className="mt-8 lg:mt-0">
                <SectionLabel>Sorties sur la période</SectionLabel>
                <AmountFigure
                  value={formatFcfa(data.total)}
                  className="text-text mt-1 block text-[32px] leading-[40px] font-bold tracking-[-0.02em]"
                />
                <p className="text-text-secondary mt-1 text-[12.5px] leading-[17px]">
                  {data.outflows.length}{" "}
                  {data.outflows.length > 1 ? "sorties" : "sortie"} ·{" "}
                  {formatFcfa(data.dailyAverage)} par jour en moyenne
                </p>

                <div className="mt-5">
                  <DailySpendChart data={data} />
                </div>
              </section>

              <section className="mt-8">
                <SectionHeader title="Repères de la période" />
                <div className="mt-2">
                  {data.biggest ? (
                    <FactRow
                      label="Sortie la plus élevée"
                      detail={`${data.biggest.title} · ${data.biggest.date}`}
                      value={formatFcfa(Math.abs(data.biggest.amount))}
                    />
                  ) : null}
                  <FactRow
                    label="Jours sans sortie"
                    detail={`sur ${data.days.length} jours de la fenêtre`}
                    value={String(data.days.length - data.spendDays)}
                  />
                  <FactRow
                    label="Même durée, juste avant"
                    detail={data.previousLabel}
                    value={formatFcfa(data.previousTotal)}
                  />
                  <FactRow
                    label="Entrées sur la période"
                    detail={`${data.inflowCount} ${
                      data.inflowCount > 1
                        ? "mouvements crédités"
                        : "mouvement crédité"
                    }`}
                    value={formatFcfa(data.inflows)}
                    last
                  />
                </div>
              </section>
            </div>

            <div className="contents lg:block">
              <div className="mt-8 lg:mt-0">
                <SectionHeader title="Répartition des sorties" />
              </div>

              <GlassCard className="mt-3 p-[17px] lg:p-6">
                {data.categories.length === 0 ? (
                  <p className="text-text-secondary text-[12.5px] leading-[17px]">
                    Aucune sortie sur cette période.
                  </p>
                ) : (
                  <>
                    <div
                      role="img"
                      aria-label={`Répartition : ${data.categories
                        .map((c) => `${c.label} ${c.percent} %`)
                        .join(", ")}.`}
                      className="flex h-3 gap-[2px]"
                    >
                      {data.categories.map((category, index) => (
                        <span
                          key={category.label}
                          className={cn(
                            "h-full min-w-[6px] rounded-xs",
                            categoryColor(index),
                          )}
                          style={{ width: `${category.percent}%` }}
                        />
                      ))}
                    </div>

                    <div className="border-border divide-border mt-3.5 divide-y border-t">
                      {data.categories.map((category, index) => (
                        <div
                          key={category.label}
                          className="flex items-center gap-2.5 py-2.5"
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              "size-2.5 shrink-0 rounded-xs",
                              categoryColor(index),
                            )}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="text-text block truncate text-[13px] leading-[17px]">
                              {category.label}
                            </span>
                            <span className="text-text-muted mt-[2px] block text-[11.5px] leading-[15px]">
                              {formatFcfa(category.amount)}
                            </span>
                          </span>
                          <span className="text-text shrink-0 text-[15px] leading-[20px] font-semibold">
                            {category.percent} %
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </GlassCard>

              <div className="mt-8">
                <SectionHeader title="Détail des sorties" />
                <p className="text-text-muted mt-1 text-[11.5px] leading-[15px]">
                  {data.outflows.length}{" "}
                  {data.outflows.length > 1 ? "mouvements" : "mouvement"} · débits
                  du portefeuille
                </p>
                <div className="mt-2">
                  {data.outflows.length === 0 ? (
                    <p className="text-text-secondary py-6 text-[12.5px] leading-[17px]">
                      Rien à afficher sur cette période.
                    </p>
                  ) : (
                    data.outflows.map((movement, index) => (
                      <SpendRow
                        key={movement.id}
                        transaction={movement}
                        last={index === data.outflows.length - 1}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <section className="mt-8">
          <SectionHeader title="Soldes actuels" />
          <div className="mt-2">
            {walletQuery.isPending ? (
              <div className="animate-pulse py-[11px]" aria-hidden="true">
                <div className="bg-surface-2 h-[13px] w-[120px] rounded-xs" />
                <div className="bg-surface-2 mt-2 h-[11px] w-[80px] rounded-xs" />
              </div>
            ) : walletQuery.isError ? (
              <InlineError error={walletQuery.error} />
            ) : (
              <FactRow
                label="Portefeuille"
                detail="Compte FCFA disponible"
                value={formatMoney(walletQuery.data.balance)}
                last={cards.length === 0 && !cardsQuery.isPending}
              />
            )}

            {cardsQuery.isError ? (
              <div className="mt-2">
                <InlineError error={cardsQuery.error} />
              </div>
            ) : cardsQuery.isPending ? (
              <div className="animate-pulse py-[11px]" aria-hidden="true">
                <div className="bg-surface-2 h-[13px] w-[120px] rounded-xs" />
                <div className="bg-surface-2 mt-2 h-[11px] w-[80px] rounded-xs" />
              </div>
            ) : (
              cards.map((card, index) => (
                <FactRow
                  key={card.uuid}
                  label={`Carte •••• ${card.pan_last4}`}
                  detail={`${cardStatusLabel(card.status)} · Exp ${cardExpiry(card)}`}
                  value={formatMoney(card.balance)}
                  last={index === cards.length - 1}
                />
              ))
            )}
          </div>
          <p className="text-text-muted mt-2 text-[11.5px] leading-[15px]">
            Soldes du jour : ils ne dépendent pas de la période choisie.
          </p>
        </section>
      </main>

      <BottomNav />
    </>
  );
}
