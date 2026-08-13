"use client";

import type { ReactNode } from "react";
import { AlertCircle, BadgeCheck, Clock, Loader2, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { InlineError } from "@/components/feedback/InlineError";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { useKyc } from "@/lib/api/accountHooks";
import type { KycStatus } from "@/lib/api/types";
import { formatDate } from "@/lib/format";

/**
 * État réel du dossier KYC (GET /api/kyc), porté par le statut backend
 * `none | pending | approved | rejected`. L'écran ne raconte plus une
 * progression figée : il affiche le vrai statut, la date de soumission ou
 * d'examen, et le motif de rejet le cas échéant.
 */
const STATUS_VIEW: Record<
  KycStatus,
  {
    icon: LucideIcon;
    iconClass: string;
    label: string;
    tone: string;
  }
> = {
  none: {
    icon: Shield,
    iconClass: "text-primary-light",
    label: "Non commencée",
    tone: "text-text-muted",
  },
  pending: {
    icon: Clock,
    iconClass: "text-warning",
    label: "En cours d'examen",
    tone: "text-warning",
  },
  approved: {
    icon: BadgeCheck,
    iconClass: "text-success",
    label: "Vérifiée",
    tone: "text-success",
  },
  rejected: {
    icon: AlertCircle,
    iconClass: "text-danger",
    label: "À corriger",
    tone: "text-danger",
  },
};

export default function KycPage() {
  const kycQuery = useKyc();
  const profile = kycQuery.data;

  return (
    <>
      <main className="flex-1 px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[720px] lg:px-10 lg:pt-9 lg:pb-12">
        <PageHeader title="Vérification KYC" backHref="/profile" />

        <GlassCard className="mt-8 p-4 lg:p-5">
          <div className="flex items-center gap-2.5">
            <Shield
              size={16}
              strokeWidth={1.75}
              absoluteStrokeWidth
              className="text-primary-light shrink-0"
              aria-hidden="true"
            />
            <h2 className="text-text text-[14.5px] leading-[19px] font-semibold">
              Vérification d&apos;identité obligatoire
            </h2>
          </div>
          <p className="text-text-secondary mt-2 text-[12.5px] leading-[19px] lg:max-w-[520px]">
            Nécessaire pour activer votre compte, alimenter vos cartes et retirer
            vers Mobile Money.
          </p>
        </GlassCard>

        {kycQuery.isPending ? (
          <div className="mt-16 flex justify-center">
            <Loader2 size={28} className="text-primary animate-spin" aria-hidden />
          </div>
        ) : kycQuery.isError || !profile ? (
          <div className="mt-8">
            <InlineError error={kycQuery.error} />
            <button
              type="button"
              onClick={() => void kycQuery.refetch()}
              className="text-primary-light mt-3 text-[13px] font-medium underline-offset-4 hover:underline"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <StatusBody status={profile.status} view={STATUS_VIEW[profile.status]}>
            {profile.status === "pending" && profile.submitted_at ? (
              <p className="text-text-muted mt-2 text-[12.5px] leading-[18px]">
                Pièces envoyées le {formatDate(profile.submitted_at)}. Examen sous
                24 h — vous serez notifié dès la décision.
              </p>
            ) : null}

            {profile.status === "approved" && profile.reviewed_at ? (
              <p className="text-text-muted mt-2 text-[12.5px] leading-[18px]">
                Validée le {formatDate(profile.reviewed_at)}. Vos plafonds sont
                relevés (palier {profile.level}).
              </p>
            ) : null}

            {profile.status === "rejected" && profile.rejection_reason ? (
              <div className="border-danger/30 bg-danger/10 mt-4 rounded-md border px-3.5 py-3">
                <p className="text-danger text-[12px] leading-[17px] font-semibold">
                  Motif du rejet
                </p>
                <p className="text-text-secondary mt-1 text-[12.5px] leading-[18px]">
                  {profile.rejection_reason}
                </p>
              </div>
            ) : null}

            {profile.status === "none" ? (
              <p className="text-text-muted mt-2 text-[12.5px] leading-[18px]">
                Importez votre pièce d&apos;identité (recto, verso) et un selfie
                pour lancer la vérification.
              </p>
            ) : null}
          </StatusBody>
        )}

        <div className="mt-8">
          <p className="text-text-muted text-[11.5px] leading-[17px]">
            Vérification exigée par la réglementation LBC/FT de l&apos;UEMOA
            (BCEAO). Vos pièces sont chiffrées et conservées 5 ans après la
            clôture du compte.
          </p>
        </div>

        {profile &&
        (profile.status === "none" || profile.status === "rejected") ? (
          <StickyActionBar>
            <div className="lg:mt-10">
              <Button href="/profile/kyc/document" className="lg:max-w-[320px]">
                {profile.status === "rejected"
                  ? "Renvoyer mes pièces"
                  : "Commencer la vérification"}
              </Button>
            </div>
          </StickyActionBar>
        ) : null}
      </main>

      <BottomNav />
    </>
  );
}

function StatusBody({
  status,
  view,
  children,
}: {
  status: KycStatus;
  view: (typeof STATUS_VIEW)[KycStatus];
  children: ReactNode;
}) {
  const Icon = view.icon;
  return (
    <section className="mt-8">
      <div className="flex items-center gap-3">
        <span className="border-border bg-surface flex size-11 shrink-0 items-center justify-center rounded-full border">
          <Icon
            size={20}
            strokeWidth={1.75}
            absoluteStrokeWidth
            aria-hidden="true"
            className={view.iconClass}
          />
        </span>
        <div className="min-w-0">
          <p className="text-text-muted text-[12px] leading-[16px]">
            Votre dossier
          </p>
          <p
            className={`text-[16px] leading-[21px] font-semibold ${view.tone}`}
          >
            {view.label}
          </p>
        </div>
      </div>
      <div className="mt-1" data-status={status}>
        {children}
      </div>
    </section>
  );
}
