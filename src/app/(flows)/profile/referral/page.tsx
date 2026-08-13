"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Check, Clock, Loader2 } from "lucide-react";

import { PinPromptDialog } from "@/components/auth/PinPromptDialog";
import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { InlineError } from "@/components/feedback/InlineError";
import { Button } from "@/components/ui/Button";
import { HeroGradientCard } from "@/components/ui/HeroGradientCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { usePayoutReferral, useReferral } from "@/lib/api/accountHooks";
import {
  isReferralPayoutPendingApproval,
  isReferralPayoutSettled,
} from "@/lib/api/status";
import { PinTicketAction } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

/** Libellé du statut d'un filleul (App\Domain\Referral\ReferralStatus). */
const REFEREE_STATUS: Record<string, string> = {
  active: "Actif",
  revoked: "Annulé",
};

export default function ReferralPage() {
  const referralQuery = useReferral();
  const referral = referralQuery.data;
  const payout = usePayoutReferral();

  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const copyTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    },
    [],
  );

  const flash = (target: "code" | "link") => {
    setCopied(target);
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(null), 1600);
  };

  const copy = (value: string, target: "code" | "link") => {
    void navigator.clipboard?.writeText(value).catch(() => {});
    flash(target);
  };

  const onPayoutTicket = (pinTicket: string) => {
    setPinOpen(false);
    payout.mutate({ pinTicket });
  };

  const balance = referral?.commission_balance;
  const hasBalance = (balance?.amount_minor ?? 0) > 0;
  const result = payout.data;

  // Le vert + coche est réservé au SEUL état final « completed » : l'argent a
  // atteint le portefeuille. Un payout en attente de validation (maker-checker)
  // n'a rien déplacé — il porte une tonalité warning + horloge, pas un succès.
  const payoutState = result
    ? isReferralPayoutSettled(result.status)
      ? "settled"
      : isReferralPayoutPendingApproval(result.status)
        ? "pending"
        : "failed"
    : null;
  const PayoutIcon =
    payoutState === "settled"
      ? Check
      : payoutState === "pending"
        ? Clock
        : AlertCircle;

  return (
    <>
      <main className="px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[720px] lg:px-10 lg:pt-9 lg:pb-12">
        <PageHeader title="Parrainage" backHref="/profile" />

        <HeroGradientCard className="mt-3.5 lg:mt-6 lg:p-7">
          <h2 className="text-[16px] leading-[21px] font-bold text-white">
            Parrainez vos proches
          </h2>
          <p className="mt-[10px] max-w-[298px] text-[12.5px] leading-[20px] text-white/70 lg:max-w-[440px]">
            Partagez votre code : vos gains de parrainage s&apos;accumulent ici
            et se transfèrent vers votre portefeuille en un geste.
          </p>
        </HeroGradientCard>

        {referralQuery.isPending ? (
          <div className="mt-10 flex justify-center">
            <Loader2 size={26} className="text-primary animate-spin" aria-hidden />
          </div>
        ) : referralQuery.isError || !referral ? (
          <div className="mt-6">
            <InlineError error={referralQuery.error} />
            <button
              type="button"
              onClick={() => void referralQuery.refetch()}
              className="text-primary-light mt-3 text-[13px] font-medium underline-offset-4 hover:underline"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <>
            {/* Solde de parrainage réel (Money XOF). */}
            <div className="border-border mt-5 border-y py-4">
              <SectionLabel>Gains disponibles</SectionLabel>
              <p className="text-text mt-1 text-[26px] leading-[32px] font-bold tracking-[-0.01em]">
                {balance ? formatMoney(balance) : "—"}
              </p>
              <p className="text-text-muted mt-1 text-[12px] leading-[17px]">
                Transférables vers votre portefeuille, après votre code PIN.
              </p>
            </div>

            {result && payoutState ? (
              <div
                className={cn(
                  "mt-4 flex items-start gap-2.5 rounded-md border px-3.5 py-3",
                  payoutState === "settled"
                    ? "border-success/30 bg-success/10"
                    : payoutState === "pending"
                      ? "border-warning/30 bg-warning/10"
                      : "border-danger/30 bg-danger/10",
                )}
              >
                <PayoutIcon
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                  className={cn(
                    "mt-[1px] shrink-0",
                    payoutState === "settled"
                      ? "text-success"
                      : payoutState === "pending"
                        ? "text-warning"
                        : "text-danger",
                  )}
                />
                <p className="text-text-secondary text-[12.5px] leading-[18px]">
                  {payoutState === "settled"
                    ? `${formatMoney(result.amount)} transférés vers votre portefeuille.`
                    : payoutState === "pending"
                      ? `Demande de transfert de ${formatMoney(result.amount)} enregistrée — en attente de validation.`
                      : "Le transfert n'a pas abouti."}
                </p>
              </div>
            ) : null}

            {payout.isError && <InlineError error={payout.error} className="mt-4" />}

            <SectionLabel className="mt-6">Votre code de parrainage</SectionLabel>
            <div className="border-border mt-2 flex items-center justify-between gap-4 border-y py-3.5">
              <span className="text-text font-mono text-[21px] leading-[27px] font-medium tracking-[0.5px]">
                {referral.code}
              </span>
              <button
                type="button"
                onClick={() => copy(referral.code, "code")}
                className="text-primary focus-visible:ring-primary/60 shrink-0 rounded-sm text-[13px] font-medium focus-visible:ring-2 focus-visible:outline-none"
              >
                {copied === "code" ? "Copié !" : "Copier"}
              </button>
            </div>
            <div className="border-border flex items-center justify-between gap-4 border-b py-3.5">
              <span className="text-text-secondary min-w-0 truncate font-mono text-[12.5px] leading-[17px]">
                {referral.link}
              </span>
              <button
                type="button"
                onClick={() => copy(referral.link, "link")}
                className="text-primary focus-visible:ring-primary/60 shrink-0 rounded-sm text-[13px] font-medium focus-visible:ring-2 focus-visible:outline-none"
              >
                {copied === "link" ? "Copié !" : "Copier le lien"}
              </button>
            </div>

            <SectionLabel className="mt-6">Mes filleuls</SectionLabel>
            {referral.referees.length === 0 ? (
              <p className="text-text-muted mt-1.5 text-[12.5px] leading-[19px]">
                Aucun filleul pour l&apos;instant. Un ami est compté lorsqu&apos;il
                s&apos;inscrit avec votre code.
              </p>
            ) : (
              <ul className="divide-border mt-1 divide-y">
                {referral.referees.map((row) => (
                  <li
                    key={row.uuid}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-text truncate text-[13.5px] leading-[18px] font-medium">
                        {row.referee.name ?? "Filleul"}
                      </p>
                      {row.created_at ? (
                        <p className="text-text-muted mt-[2px] text-[11.5px] leading-[15px]">
                          {formatDate(row.created_at)}
                        </p>
                      ) : null}
                    </div>
                    <span className="text-text-secondary shrink-0 text-[12px] leading-[16px]">
                      {REFEREE_STATUS[row.status] ?? row.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <StickyActionBar>
              <div className="lg:mt-8">
                <Button
                  onClick={() => setPinOpen(true)}
                  disabled={!hasBalance || payout.isPending}
                  className="lg:max-w-[320px]"
                >
                  {payout.isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" aria-hidden />
                      Transfert…
                    </span>
                  ) : (
                    "Transférer mes gains"
                  )}
                </Button>
              </div>
            </StickyActionBar>
          </>
        )}
      </main>

      {/* Ticket referral_payout : action seule, SANS montant (la garde consomme
          le ticket avec amount=null — un montant lié renverrait 403). */}
      <PinPromptDialog
        open={pinOpen}
        action={PinTicketAction.ReferralPayout}
        title="Transférer vos gains"
        description="Confirmez avec votre code PIN pour transférer vos gains de parrainage vers votre portefeuille."
        onTicket={onPayoutTicket}
        onCancel={() => setPinOpen(false)}
      />

      <BottomNav />
    </>
  );
}
