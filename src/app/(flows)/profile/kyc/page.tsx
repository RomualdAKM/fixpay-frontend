import Link from "next/link";
import { Check, ChevronRight, Lock, Shield } from "lucide-react";

import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { kycSteps, type KycStep } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const metadata = { title: "Vérification KYC" };

/**
 * État réel de l'étape, porté par la TYPOGRAPHIE et non par une tuile teintée :
 * l'audit relevait deux indicateurs de couleur par ligne (la pastille du
 * stepper ET une IconTile 42px de la même teinte) pour zéro information
 * supplémentaire. Les IconTile ont disparu, la pastille reste.
 */
const STEP_STATUS: Record<
  KycStep["state"],
  { label: string; className: string }
> = {
  done: { label: "Validé", className: "text-success" },
  active: { label: "À compléter", className: "text-primary" },
  locked: {
    label: "Disponible après l'étape 2",
    className: "text-text-muted",
  },
};

/**
 * Horodatage de la dernière action sur l'étape. L'audit reproche au parcours
 * de n'exposer aucune date de soumission ; les données de démo sont figées
 * (pas de calcul au rendu) pour que serveur et client rendent la même chaîne.
 */
const STEP_TIMESTAMP: Record<number, string | undefined> = {
  1: "14 avr., 13:20",
};

const doneCount = kycSteps.filter((step) => step.state === "done").length;
/* Compté, pas raconté : « 1 étape sur 3 validée » suivi de « mis à jour il y a
   3 h » passait à deux lignes en mobile et poussait tout le stepper vers le
   bas — c'est ce genre de ligne qui finissait par jeter l'InfoBanner sous la
   barre d'action. */
const doneSummary = `${doneCount}/${kycSteps.length} validée`;

function StepIndicator({ step }: { step: KycStep }) {
  if (step.state === "done") {
    return (
      <span className="bg-success flex size-[26px] shrink-0 items-center justify-center rounded-full">
        <Check
          size={11}
          strokeWidth={3}
          className="text-white"
          aria-hidden="true"
        />
      </span>
    );
  }
  if (step.state === "active") {
    return (
      <span className="bg-primary flex size-[26px] shrink-0 items-center justify-center rounded-full text-[11px] leading-none font-bold text-white">
        {step.id}
      </span>
    );
  }
  return (
    <span className="bg-surface-2 border-border-strong text-text-muted flex size-[26px] shrink-0 items-center justify-center rounded-full border text-[11px] leading-none font-bold">
      {step.id}
    </span>
  );
}

function StepRow({ step, isLast }: { step: KycStep; isLast: boolean }) {
  const status = STEP_STATUS[step.state];
  const timestamp = STEP_TIMESTAMP[step.id];
  const locked = step.state === "locked";
  /*
   * mock-data range l'état dans le sous-titre de l'étape complétée
   * (« Complété ») : la ligne le porte désormais elle-même, on ne l'écrit
   * donc pas deux fois.
   */
  const subtitle = step.subtitle === "Complété" ? undefined : step.subtitle;

  const content = (
    <>
      {/* Rail de liaison CONTINU : il part sous la pastille et rejoint celle
          de l'étape suivante en traversant le padding de ligne et le filet.
          Confiné à la ligne (`flex-1` dans la colonne), il s'arrêtait à 80px
          du repère suivant et se lisait comme deux tirets flottants — un
          connecteur qui ne connecte pas est plus fautif qu'un connecteur mal
          placé. Géométrie : colonne de 26px après un padding de 16px, donc un
          axe à 29px ; départ 6px sous la pastille, arrivée 6px au-dessus de
          la suivante (16px de padding sur la ligne d'après). */}
      {!isLast && (
        <span
          aria-hidden="true"
          className="bg-border absolute top-[48px] -bottom-[10px] left-[28.5px] w-px"
        />
      )}
      <StepIndicator step={step} />

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          {locked && (
            <Lock
              size={12}
              strokeWidth={2}
              absoluteStrokeWidth
              aria-hidden="true"
              className="text-text-muted shrink-0"
            />
          )}
          {/* Aucune opacité globale : c'est la couleur du titre qui porte le
              verrouillage, pas un opacity-45 qui efface toute la ligne. */}
          <span
            className={cn(
              "block truncate text-[15px] leading-[20px] font-medium",
              locked ? "text-text-muted" : "text-text",
            )}
          >
            {step.title}
          </span>
        </span>
        {subtitle && (
          <span className="text-text-muted mt-[3px] block text-[13px] leading-[18px]">
            {subtitle}
          </span>
        )}
        <span
          className={cn(
            "mt-[3px] block text-[12px] leading-[16px] font-medium",
            status.className,
          )}
        >
          {timestamp ? `${status.label} le ${timestamp}` : status.label}
        </span>
      </span>

      {step.state === "active" && (
        <ChevronRight
          size={16}
          strokeWidth={2}
          absoluteStrokeWidth
          aria-hidden="true"
          className="text-icon-muted shrink-0 self-center"
        />
      )}
    </>
  );

  const rowClass = "relative flex w-full items-start gap-3.5 px-4 py-4";

  if (step.state === "active") {
    return (
      <Link
        href="/profile/kyc/document"
        className={cn(
          rowClass,
          "hover:bg-surface-2 transition-colors",
          "focus-visible:ring-primary/60 focus-visible:ring-2 focus-visible:outline-none",
        )}
      >
        {content}
      </Link>
    );
  }
  return <div className={rowClass}>{content}</div>;
}

/**
 * Écran 12 · KYC — bandeau réglementaire, état du dossier, stepper vertical
 * en UNE surface continue, délai d'examen et base légale, CTA épinglé.
 *
 * ÉTAPE 11 (composition) :
 * - le bandeau hero quitte le dégradé 135° : MIGRATION_DESIGN §3 le réserve à
 *   l'objet identitaire (carte bancaire, hero portefeuille), et le même
 *   vêtement habillait ici un avis réglementaire. Il redevient ce qu'il est,
 *   une surface neutre — au passage 35px de hauteur en moins ;
 * - l'InfoBanner de fin de page est SUPPRIMÉE en tant que carte. C'était elle
 *   que la barre d'action sciait en plein milieu d'une phrase, en biseau sur
 *   ses coins arrondis, ce qui se lisait comme un clipping accidentel. Son
 *   contenu et la mention légale forment maintenant un bloc de texte à plat
 *   sous un filet : un texte partiellement défilé ne produit aucune couture,
 *   et le pli tombe désormais APRÈS la fin du bandeau et du stepper ;
 * - rythme redérivé sur 8/12/16/32 : le stepper est collé à son en-tête
 *   (12px), les trois groupes de l'écran respirent à 32px.
 */
export default function KycPage() {
  return (
    <>
      <main className="flex-1 px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[720px] lg:px-10 lg:pt-9 lg:pb-12">
        <PageHeader title="Vérification KYC" backHref="/profile" />

        {/* Avis réglementaire : une surface neutre, pas le dégradé de la
            carte bancaire. L'icône est un glyphe en ligne de 16px, pas une
            tuile teintée. */}
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
            Nécessaire pour activer votre compte, alimenter vos cartes et
            retirer vers Mobile Money.
          </p>
        </GlassCard>

        {/* En-tête de SECTION, pas un libellé de champ : 15px semi-bold sur
            --c-text, comme partout ailleurs dans le produit. En 13px w500
            text-secondary il était typographiquement identique au méta-texte
            qui lui fait face, et moins présent que les titres d'étape. */}
        <div className="mt-8 flex items-baseline justify-between gap-3">
          <h2 className="text-text text-[15px] leading-[20px] font-semibold">
            Votre dossier
          </h2>
          <span className="text-text-muted text-right text-[12px] leading-[16px]">
            {doneSummary} · mis à jour il y a 3 h
          </span>
        </div>

        <GlassCard className="mt-3 overflow-hidden">
          <ol className="divide-border divide-y">
            {kycSteps.map((step, index) => (
              <li key={step.id}>
                <StepRow step={step} isLast={index === kycSteps.length - 1} />
              </li>
            ))}
          </ol>
        </GlassCard>

        {/* Méta-informations à plat — plus aucune carte au pli. */}
        <div className="mt-8">
          <p className="text-text-secondary text-[12.5px] leading-[19px]">
            Examen sous 24 h après l&apos;envoi. En cas de rejet, le motif
            s&apos;affiche ici et la pièce peut être renvoyée immédiatement.
          </p>
          <p className="text-text-muted mt-2 text-[11.5px] leading-[17px]">
            Vérification exigée par la réglementation LBC/FT de l&apos;UEMOA
            (BCEAO). Vos pièces sont chiffrées et conservées 5 ans après la
            clôture du compte.
          </p>
        </div>

        {/* Desktop : la barre d'action redevient un bloc du flux, sans marge
            haute — elle se collait à 20px de la mention réglementaire. La
            marge est posée ici (lg uniquement, le mobile garde sa barre
            épinglée), et le CTA cesse de s'étirer sur 640px. */}
        <StickyActionBar>
          <div className="lg:mt-10">
            <Button href="/profile/kyc/document" className="lg:max-w-[320px]">
              Continuer la vérification
            </Button>
          </div>
        </StickyActionBar>
      </main>

      <BottomNav />
    </>
  );
}
