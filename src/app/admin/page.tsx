"use client";

import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";

import { InlineError } from "@/components/feedback/InlineError";
import {
  AdminCard,
  AdminEmpty,
  AdminLoading,
  AdminPageHeader,
} from "@/components/admin/ui";
import { useOverview } from "@/lib/admin/hooks";
import type { AdminOverview } from "@/lib/admin/types";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/format";

function StatCard({
  label,
  value,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone?: "neutral" | "success" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "danger"
        ? "text-danger"
        : "text-text";
  return (
    <AdminCard className="p-4">
      <div className="text-text-muted flex items-center gap-2 text-[12px] font-medium">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`mt-2 text-[20px] leading-[26px] font-semibold ${toneClass}`}>
        {value}
      </p>
    </AdminCard>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="text-text mb-3 text-[15px] font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function OverviewContent({ data }: { data: AdminOverview }) {
  const hasFloats = data.floats !== undefined;
  const hasPending = data.pending !== undefined;
  const hasConfig = data.config_version !== undefined;
  const hasAudit = data.audit !== undefined;
  const hasReconciliation = (data.reconciliation?.length ?? 0) > 0;

  if (
    !hasFloats &&
    !hasPending &&
    !hasConfig &&
    !hasAudit &&
    !hasReconciliation
  ) {
    return (
      <AdminCard>
        <AdminEmpty>
          Aucune section n&apos;est accessible avec vos permissions.
        </AdminEmpty>
      </AdminCard>
    );
  }

  return (
    <>
      {hasFloats ? (
        <Section title="Flottes (soldes des comptes de garantie)">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatCard
              label="Flotte VCC (cartes USD)"
              icon={<CreditCard size={14} aria-hidden="true" />}
              value={formatMoney(data.floats!.vcc)}
            />
            <StatCard
              label="Flotte Zayono (Mobile Money XOF)"
              icon={<Wallet size={14} aria-hidden="true" />}
              value={formatMoney(data.floats!.zayono)}
            />
          </div>
        </Section>
      ) : null}

      {hasPending ? (
        <Section title="Opérations en attente">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              label="Dépôts"
              icon={<Wallet size={14} aria-hidden="true" />}
              value={data.pending!.deposits}
            />
            <StatCard
              label="Retraits"
              icon={<Wallet size={14} aria-hidden="true" />}
              value={data.pending!.withdrawals}
            />
            <StatCard
              label="Émissions de carte"
              icon={<CreditCard size={14} aria-hidden="true" />}
              value={data.pending!.card_issuance_orders}
            />
          </div>
        </Section>
      ) : null}

      {hasConfig || hasAudit ? (
        <Section title="Intégrité du système">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {hasConfig ? (
              <StatCard
                label="Version de configuration"
                icon={<ShieldCheck size={14} aria-hidden="true" />}
                value={`v${data.config_version}`}
              />
            ) : null}
            {hasAudit ? (
              <StatCard
                label="Chaîne d'audit"
                icon={
                  data.audit!.chain_intact ? (
                    <CheckCircle2 size={14} aria-hidden="true" />
                  ) : (
                    <AlertTriangle size={14} aria-hidden="true" />
                  )
                }
                tone={data.audit!.chain_intact ? "success" : "danger"}
                value={data.audit!.chain_intact ? "Intègre" : "Rompue"}
              />
            ) : null}
          </div>
        </Section>
      ) : null}

      {data.reconciliation && data.reconciliation.length > 0 ? (
        <Section title="Dernières réconciliations">
          <AdminCard>
            <ul className="divide-border divide-y">
              {data.reconciliation.map((run, index) => (
                <li
                  key={`${run.kind}-${run.started_at}-${index}`}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="text-text text-[14px] font-medium">
                    {run.kind}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="text-text-secondary text-[13px]">
                      {run.status}
                    </span>
                    <span className="text-text-muted text-[12px]">
                      {formatDate(run.started_at)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </AdminCard>
        </Section>
      ) : null}
    </>
  );
}

export default function AdminOverviewPage() {
  const { data, isPending, isError, error } = useOverview();

  return (
    <>
      <AdminPageHeader
        title="Vue d'ensemble"
        description="L'état réel du système, section par section selon vos permissions. Les valeurs sont lues en direct — aucune n'est fabriquée."
      />
      {isPending ? (
        <AdminLoading />
      ) : isError ? (
        <InlineError error={error} />
      ) : (
        <OverviewContent data={data} />
      )}
    </>
  );
}
