"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { InlineError } from "@/components/feedback/InlineError";
import { AmountInput } from "@/components/ui/AmountInput";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StepProgress } from "@/components/ui/StepProgress";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import {
  useCreateDeposit,
  useDeposit,
  useOperators,
  useWallet,
} from "@/lib/api/moneyHooks";
import { isDepositFinal } from "@/lib/api/status";
import type { Operator } from "@/lib/api/types";
import { formatFcfa } from "@/lib/format";
import { majorUnits, xofMinor } from "@/lib/money";
import { groupOperatorsByCountry } from "@/lib/operators";
import { cn } from "@/lib/utils";

const FLOW_MAIN =
  "px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[840px] lg:px-10 lg:pt-9 lg:pb-12";
const FLOW_GRID = "mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10";
const FLOW_ASIDE = "mt-8 lg:mt-0";

/** Plancher indicatif (défaut backend `zayono.min_amount_minor`) ; la borne
 *  exacte est validée côté serveur et renvoyée en 422 si dépassée. */
const MIN_AMOUNT_FCFA = 200;

const STEP_LABELS = ["Pays", "Opérateur", "Numéro", "Montant"] as const;

function parseAmount(raw: string): number {
  return Number(raw.replace(/\D/g, "")) || 0;
}

function phoneDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}

/** Compose un numéro E.164 à partir de l'indicatif du pays et de la saisie. */
function toE164(dial: string | undefined, phone: string): string {
  const cc = (dial ?? "").replace(/\D/g, "");
  const local = phoneDigits(phone);
  return `+${cc}${local}`;
}

/** Rangée d'une liste de choix (pays / opérateur), pastille de sélection. */
function ChoiceRow({
  title,
  meta,
  selected,
  onSelect,
}: {
  title: string;
  meta: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
        "focus-visible:ring-primary/60 focus-visible:ring-2 focus-visible:outline-none",
        selected ? "bg-primary-surface" : "hover:bg-surface-2",
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="text-text block truncate text-[14px] leading-[19px] font-medium">
          {title}
        </span>
        <span className="text-text-muted mt-[2px] block truncate text-[11.5px] leading-[15px]">
          {meta}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "flex size-[20px] shrink-0 items-center justify-center rounded-full",
          selected ? "bg-primary" : "border-border-strong border-2",
        )}
      >
        {selected && <Check size={11} strokeWidth={3} className="text-white" />}
      </span>
    </button>
  );
}

function FlowCta({
  label,
  disabled,
  loading,
  onClick,
}: {
  label: string;
  disabled: boolean;
  loading?: boolean;
  onClick: () => void;
}) {
  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className="border-border bg-surface-2 text-text-muted inline-flex h-[50px] w-full cursor-not-allowed items-center justify-center rounded-md border text-[15px] font-semibold lg:max-w-[320px]"
      >
        {label}
      </button>
    );
  }
  return (
    <Button onClick={onClick} className="lg:max-w-[320px]">
      {loading ? "Envoi…" : label}
    </Button>
  );
}

/**
 * Panneau de suivi après initiation : tant que le dépôt n'est pas final, le
 * front POLL GET /api/deposits/{uuid}. Si un `checkout_url` est fourni, il faut
 * poursuivre le paiement sur cette page ; sinon l'opérateur pousse une demande
 * de validation sur le téléphone. À la confirmation → écran de succès.
 */
function DepositStatusView({
  uuid,
  onReset,
}: {
  uuid: string;
  onReset: () => void;
}) {
  const router = useRouter();
  const depositQuery = useDeposit(uuid);
  const deposit = depositQuery.data;

  useEffect(() => {
    if (deposit && deposit.status === "success") {
      router.replace(`/wallet/deposit/success?uuid=${deposit.uuid}`);
    }
  }, [deposit, router]);

  const failed =
    deposit && isDepositFinal(deposit.status) && deposit.status !== "success";

  return (
    <main className={FLOW_MAIN}>
      <PageHeader title="Dépôt Mobile Money" backHref="/wallet" />

      <div className="mt-10 flex flex-col items-center text-center lg:mt-16">
        {depositQuery.isError ? (
          <div className="w-full max-w-[420px]">
            <InlineError error={depositQuery.error} />
          </div>
        ) : failed ? (
          <>
            <p className="text-text text-[16px] leading-[22px] font-semibold">
              Dépôt non abouti
            </p>
            <p className="text-text-muted mt-2 max-w-[360px] text-[13px] leading-[19px]">
              {deposit?.failure_reason ??
                "L'opération a été refusée par l'opérateur."}
            </p>
          </>
        ) : deposit?.checkout_url && !isDepositFinal(deposit.status) ? (
          <>
            <p className="text-text text-[16px] leading-[22px] font-semibold">
              Poursuivez le paiement
            </p>
            <p className="text-text-muted mt-2 max-w-[360px] text-[13px] leading-[19px]">
              Finalisez le dépôt sur la page sécurisée de l&apos;opérateur.
            </p>
            <a
              href={deposit.checkout_url}
              className="bg-primary focus-visible:ring-primary/60 mt-6 inline-flex h-[50px] w-full max-w-[320px] items-center justify-center rounded-md text-[15px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
            >
              Ouvrir le paiement
            </a>
          </>
        ) : (
          <>
            <Loader2
              size={32}
              className="text-primary animate-spin"
              aria-hidden="true"
            />
            <p className="text-text mt-5 text-[16px] leading-[22px] font-semibold">
              Validez sur votre téléphone
            </p>
            <p className="text-text-muted mt-2 max-w-[360px] text-[13px] leading-[19px]">
              Confirmez la demande Mobile Money reçue sur votre téléphone. Le
              solde est crédité dès la confirmation.
            </p>
          </>
        )}

        {(failed || depositQuery.isError) && (
          <button
            type="button"
            onClick={onReset}
            className="text-primary-light mt-6 text-[13.5px] leading-[18px] font-medium underline-offset-4 hover:underline"
          >
            Nouveau dépôt
          </button>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

export default function WalletDepositPage() {
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState<string | null>(null);
  const [operatorCode, setOperatorCode] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [depositUuid, setDepositUuid] = useState<string | null>(null);

  const operatorsQuery = useOperators("payin");
  const walletQuery = useWallet();
  const createDeposit = useCreateDeposit();

  const countries = useMemo(
    () => groupOperatorsByCountry(operatorsQuery.data ?? []),
    [operatorsQuery.data],
  );

  const currentCountry = countries.find((c) => c.code === country);
  const availableOperators: Operator[] = currentCountry?.operators ?? [];
  const operator = availableOperators.find((o) => o.code === operatorCode);
  const dial = currentCountry?.dial;

  const credited = parseAmount(amount);
  const balanceAfter =
    credited > 0 && walletQuery.data
      ? formatFcfa(majorUnits(walletQuery.data.balance) + credited)
      : undefined;

  const stepValid =
    (step === 1 && country !== null) ||
    (step === 2 && operatorCode !== null) ||
    (step === 3 && phoneDigits(phone).length >= 8) ||
    (step === 4 && credited >= MIN_AMOUNT_FCFA);

  const recap: Array<{ label: string; value?: string; step: number }> = [
    { label: "Pays", value: currentCountry?.name, step: 1 },
    { label: "Opérateur", value: operator?.name, step: 2 },
    {
      label: "Numéro",
      value: phone ? `${dial ?? ""} ${phone}`.trim() : undefined,
      step: 3,
    },
    {
      label: "Montant",
      value: credited > 0 ? formatFcfa(credited) : undefined,
      step: 4,
    },
  ];

  const submit = () => {
    if (!operator) return;
    createDeposit.mutate(
      {
        operator: operator.code,
        amount_minor: xofMinor(credited),
        currency: "XOF",
        phone: toE164(dial, phone),
      },
      {
        onSuccess: (deposit) => {
          if (deposit.checkout_url && isDepositFinal(deposit.status)) {
            // Already settled synchronously (rare): go straight to success.
            if (deposit.status === "success") {
              setDepositUuid(deposit.uuid);
              return;
            }
          }
          setDepositUuid(deposit.uuid);
        },
      },
    );
  };

  if (depositUuid) {
    return (
      <DepositStatusView
        uuid={depositUuid}
        onReset={() => {
          setDepositUuid(null);
          createDeposit.reset();
          setStep(4);
        }}
      />
    );
  }

  return (
    <>
      <main className={FLOW_MAIN}>
        <PageHeader title="Dépôt Mobile Money" backHref="/wallet" />
        <p className="text-text-muted mt-2 text-[12.5px] leading-[17px]">
          Depuis votre compte Mobile Money vers le portefeuille FixPay
        </p>

        <div className="mt-8">
          <p className="text-text-secondary text-[12px] leading-[16px]">
            Étape {step} sur 4 · {STEP_LABELS[step - 1]}
          </p>
          <div className="mt-2">
            <StepProgress steps={4} current={step} />
          </div>
        </div>

        <div className={FLOW_GRID}>
          {/* ---- Colonne de saisie ---- */}
          <div>
            {step === 1 && (
              <section>
                <SectionLabel>Pays du compte Mobile Money</SectionLabel>
                {operatorsQuery.isPending ? (
                  <GlassCard className="mt-3 divide-y divide-border overflow-hidden">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="animate-pulse px-4 py-3.5">
                        <div className="bg-surface-2 h-[14px] w-2/5 rounded-xs" />
                        <div className="bg-surface-2 mt-2 h-[11px] w-3/5 rounded-xs" />
                      </div>
                    ))}
                  </GlassCard>
                ) : operatorsQuery.isError ? (
                  <div className="mt-3">
                    <InlineError error={operatorsQuery.error} />
                    <button
                      type="button"
                      onClick={() => void operatorsQuery.refetch()}
                      className="text-primary-light mt-3 text-[13px] font-medium underline-offset-4 hover:underline"
                    >
                      Réessayer
                    </button>
                  </div>
                ) : countries.length === 0 ? (
                  <p className="text-text-muted mt-3 py-4 text-[12.5px] leading-[18px]">
                    Aucun opérateur de dépôt n&apos;est disponible.
                  </p>
                ) : (
                  <GlassCard className="divide-border mt-3 divide-y overflow-hidden">
                    {countries.map((c) => (
                      <ChoiceRow
                        key={c.code}
                        title={c.name}
                        meta={`${c.dial ?? ""} · ${c.operators
                          .map((o) => o.name)
                          .join(", ")}`}
                        selected={country === c.code}
                        onSelect={() => {
                          setCountry(c.code);
                          setOperatorCode(null);
                        }}
                      />
                    ))}
                  </GlassCard>
                )}
              </section>
            )}

            {step === 2 && (
              <section>
                <SectionLabel>{`Opérateur à débiter · ${currentCountry?.name ?? ""}`}</SectionLabel>
                <GlassCard className="divide-border mt-3 divide-y overflow-hidden">
                  {availableOperators.map((o) => (
                    <ChoiceRow
                      key={o.code}
                      title={o.name}
                      meta={`Compte ${dial ?? ""}`}
                      selected={operatorCode === o.code}
                      onSelect={() => setOperatorCode(o.code)}
                    />
                  ))}
                </GlassCard>
              </section>
            )}

            {step === 3 && (
              <section className="lg:max-w-[420px]">
                <SectionLabel>Numéro Mobile Money</SectionLabel>
                <div className="mt-3">
                  <AmountInput
                    value={phone}
                    onChange={setPhone}
                    variant="text"
                    placeholder="07 00 00 00 00"
                    ariaLabel="Numéro Mobile Money"
                  />
                </div>
                <p className="text-text-secondary mt-2 text-[11.5px] leading-[16px]">
                  Compte {operator?.name ?? "Mobile Money"} à débiter, indicatif{" "}
                  {dial ?? ""}.
                </p>
              </section>
            )}

            {step === 4 && (
              <section className="lg:max-w-[420px]">
                <SectionLabel>Montant du dépôt (FCFA)</SectionLabel>
                <div className="mt-3">
                  <AmountInput
                    value={amount}
                    onChange={setAmount}
                    placeholder="0"
                    ariaLabel="Montant du dépôt en francs CFA"
                  />
                </div>
                <p className="text-text-secondary mt-2 text-[11.5px] leading-[16px]">
                  Minimum {formatFcfa(MIN_AMOUNT_FCFA)}
                </p>
                {createDeposit.isError && (
                  <InlineError error={createDeposit.error} className="mt-3" />
                )}
              </section>
            )}
          </div>

          {/* ---- Colonne de vérité ---- */}
          <aside className={FLOW_ASIDE}>
            {step > 1 && (
              <section>
                <SectionLabel>Votre dépôt</SectionLabel>
                <dl className="divide-border mt-3 divide-y">
                  {recap.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-baseline justify-between gap-3 py-2.5"
                    >
                      <dt className="text-text-muted text-[12px] leading-[16px]">
                        {row.label}
                      </dt>
                      <dd className="min-w-0 text-right">
                        {row.value ? (
                          <button
                            type="button"
                            onClick={() => setStep(row.step)}
                            className="text-text focus-visible:ring-primary/60 rounded-xs text-[13px] leading-[18px] font-medium transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:outline-none"
                          >
                            {row.value}
                          </button>
                        ) : (
                          <span className="text-text-muted text-[13px] leading-[18px]">
                            —
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
                {balanceAfter && (
                  <div className="border-border mt-3.5 flex items-baseline justify-between border-t pt-3.5">
                    <span className="text-text-secondary text-[12.5px] leading-[16px]">
                      Solde après
                    </span>
                    <span className="text-text text-[13.5px] leading-[18px] font-medium">
                      {balanceAfter}
                    </span>
                  </div>
                )}
              </section>
            )}
          </aside>
        </div>

        <StickyActionBar>
          <div>
            {step < 4 ? (
              <FlowCta
                label="Continuer"
                disabled={!stepValid}
                onClick={() => setStep(step + 1)}
              />
            ) : (
              <FlowCta
                label="Confirmer le dépôt"
                disabled={!stepValid || createDeposit.isPending}
                loading={createDeposit.isPending}
                onClick={submit}
              />
            )}
          </div>
        </StickyActionBar>
      </main>

      <BottomNav />
    </>
  );
}
