"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { AmountInput } from "@/components/ui/AmountInput";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StepProgress } from "@/components/ui/StepProgress";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { TransactionFacts } from "@/components/ui/TransactionFacts";
import { formatFcfa } from "@/lib/format";
import { countries, depositFacts, wallet } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   RYTHME VERTICAL DES 5 ÉCRANS DE FLUX (04 → 08)

   Une seule échelle, appliquée au RÔLE du bloc et non à sa position :
     8px  (mt-2)   un élément et son aide immédiate (champ → « Minimum … »)
     12px (mt-3)   un en-tête de groupe et son contenu
     16px (mt-4)   deux blocs du même groupe (bandeau de contexte → ressource)
     32px (mt-8)   deux GROUPES de sens différent
   Rien entre 16 et 32 : c'est ce continuum de valeurs voisines (20/24/28) qui
   faisait lire les écrans comme une liste d'éléments équidistants.

   SQUELETTE COMMUN aux 5 flux, pour qu'ils se ressemblent enfin :
     en-tête → [contexte du flux] → grille 2 colonnes à lg
       · colonne de saisie      : ce que l'utilisateur remplit
       · colonne de vérité      : ce que l'opération va coûter et produire,
                                  toujours terminée par <TransactionFacts>
     → <StickyActionBar> hors grille, un seul CTA par écran.
   En mobile la grille retombe en une colonne : la colonne de vérité vient donc
   toujours JUSTE avant le CTA, ce qui est aussi l'ordre de lecture attendu.
   --------------------------------------------------------------------------- */
const FLOW_MAIN =
  "px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[840px] lg:px-10 lg:pt-9 lg:pb-12";
const FLOW_GRID = "mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10";
const FLOW_ASIDE = "mt-8 lg:mt-0";

/**
 * Indicatif et opérateurs RÉELLEMENT présents dans chaque pays. L'audit
 * reprochait « un mot par ligne » : une liste de pays sans indicatif ni
 * opérateur n'apprend rien de plus que le nom du pays, et laissait croire que
 * les quatre mêmes opérateurs existaient partout. Ces données sont locales
 * (mock-data ne modélise que le couple code/nom) comme les étapes 2 à 4.
 */
const COUNTRY_META: Record<string, { dial: string; operators: string[] }> = {
  BJ: { dial: "+229", operators: ["mtn", "moov", "celtiis"] },
  BF: { dial: "+226", operators: ["orange", "moov"] },
  CI: { dial: "+225", operators: ["orange", "mtn", "moov", "wave"] },
  ML: { dial: "+223", operators: ["orange", "moov"] },
  SN: { dial: "+221", operators: ["orange", "free", "wave"] },
  TG: { dial: "+228", operators: ["moov", "tmoney"] },
};

const OPERATOR_NAMES: Record<string, string> = {
  orange: "Orange Money",
  wave: "Wave",
  mtn: "MTN MoMo",
  moov: "Moov Money",
  free: "Free Money",
  celtiis: "Celtiis Cash",
  tmoney: "T-Money",
};

/**
 * Dernier compte utilisé — le compte Wave lié de l'écran 16. L'audit relevait
 * l'absence de section « Récemment utilisé » sur un écran dont 90 % des
 * parcours réels repartent du même compte : c'est la seule chose qui évite de
 * redérouler quatre étapes pour un dépôt hebdomadaire.
 */
const RECENT = {
  country: "CI",
  operator: "wave",
  dial: "+225",
  phone: "07 •• •• 41",
} as const;

/** Libellés des 4 étapes. */
const STEP_LABELS = ["Pays", "Opérateur", "Numéro", "Montant"] as const;

/** Montant saisi au clavier natif → entier de francs (« 50 000 » → 50000). */
function parseAmount(raw: string): number {
  return Number(raw.replace(/\D/g, "")) || 0;
}

/**
 * Longueur significative d'un numéro, espaces exclus. On ne compte pas que les
 * CHIFFRES : le compte repris depuis « Récemment utilisé » arrive masqué
 * (« 07 •• •• 41 »), et un compte déjà connu ne doit pas être invalidé par sa
 * propre représentation.
 */
function phoneLength(raw: string): number {
  return raw.replace(/\s/g, "").length;
}

/**
 * Rangée d'une LISTE, pas carte flottante. Les six pays étaient six surfaces
 * autonomes — douze bordures dessinées pour une seule énumération (marqueur
 * [F] de l'audit). Une liste est ici UNE surface, et ses rangées ne sont
 * séparées que par un filet.
 *
 * La pastille vide passe de `border-border-strong` (1,55:1 sur la surface,
 * sous le seuil de 3:1 exigé d'un composant d'interface) à `border-text-muted`
 * (4,2:1 mesuré sur le même fond) : c'est l'affordance de sélection d'un écran
 * dont la sélection est l'unique fonction.
 */
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
        "focus-visible:outline-primary focus-visible:outline-2 focus-visible:-outline-offset-2",
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
          selected ? "bg-primary" : "border-text-muted border-2",
        )}
      >
        {selected && <Check size={11} strokeWidth={3} className="text-white" />}
      </span>
    </button>
  );
}

/**
 * Écran 04 · Dépôt Mobile Money — assistant en 4 étapes.
 *
 * ÉTAPE 11 (composition) :
 * - les 6 pays cessent d'être 6 cartes flottantes : une seule surface, six
 *   rangées, un filet entre elles ; et chaque rangée porte enfin l'indicatif
 *   et les opérateurs du pays ;
 * - l'étape 2 ne propose plus que les opérateurs du pays choisi — les frais
 *   Mobile Money dépendent du couple pays/opérateur, les annoncer avant lui
 *   était la « plausibilité » que l'audit condamnait ;
 * - `TransactionFacts` n'affirme donc plus rien avant l'étape 3 : jusque-là
 *   une phrase dit à quelle condition ces chiffres s'afficheront ;
 * - un CTA existe à CHAQUE étape (le mobile n'en portait aucun aux étapes 1
 *   et 2 : l'écran paraissait fini alors qu'il attendait une sélection) ;
 * - la sélection ne saute plus d'elle-même à l'étape suivante : c'est le CTA
 *   qui avance, et le récapitulatif qui permet de revenir en arrière ;
 * - desktop : deux colonnes (saisie / vérité de l'opération) au lieu d'une
 *   colonne de 620px dans un canevas vide à 51 %.
 */
export default function WalletDepositPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");

  const credited = parseAmount(amount);
  const countryName = countries.find((c) => c.code === country)?.name;
  const dial = country ? COUNTRY_META[country]?.dial : undefined;
  const availableOperators = country
    ? (COUNTRY_META[country]?.operators ?? [])
    : [];
  const operatorName = operator ? OPERATOR_NAMES[operator] : undefined;

  /** Le « solde après » n'apparaît qu'une fois un montant saisi. */
  const balanceAfter =
    credited > 0 ? formatFcfa(wallet.balance + credited) : undefined;

  const useRecent = () => {
    setCountry(RECENT.country);
    setOperator(RECENT.operator);
    setPhone(RECENT.phone);
    setStep(4);
  };

  const stepValid =
    (step === 1 && country !== null) ||
    (step === 2 && operator !== null) ||
    (step === 3 && phoneLength(phone) >= 8) ||
    (step === 4 && credited >= depositFacts.min);

  const recap: Array<{ label: string; value?: string; step: number }> = [
    { label: "Pays", value: countryName, step: 1 },
    { label: "Opérateur", value: operatorName, step: 2 },
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

  return (
    <>
      <main className={FLOW_MAIN}>
        <PageHeader title="Dépôt Mobile Money" backHref="/wallet" />
        <p className="text-text-muted mt-2 text-[12.5px] leading-[17px]">
          Depuis Orange Money, Wave, MTN ou Moov
        </p>

        {/* En-tête de progression : l'étape est écrite, la barre l'illustre. */}
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
              <>
                <section>
                  <SectionLabel>Récemment utilisé</SectionLabel>
                  <GlassCard className="mt-3 overflow-hidden">
                    <ChoiceRow
                      title="Côte d'Ivoire · Wave"
                      meta={`${RECENT.dial} ${RECENT.phone} · reprendre ce compte`}
                      selected={false}
                      onSelect={useRecent}
                    />
                  </GlassCard>
                </section>

                <section className="mt-8">
                  <SectionLabel>Pays du compte Mobile Money</SectionLabel>
                  <GlassCard className="divide-border mt-3 divide-y overflow-hidden">
                    {countries.map((c) => (
                      <ChoiceRow
                        key={c.code}
                        title={c.name}
                        meta={`${COUNTRY_META[c.code]?.dial ?? ""} · ${(
                          COUNTRY_META[c.code]?.operators ?? []
                        )
                          .map((id) => OPERATOR_NAMES[id])
                          .join(", ")}`}
                        selected={country === c.code}
                        onSelect={() => setCountry(c.code)}
                      />
                    ))}
                  </GlassCard>
                </section>
              </>
            )}

            {step === 2 && (
              <section>
                <SectionLabel>{`Opérateur à débiter · ${countryName ?? ""}`}</SectionLabel>
                <GlassCard className="divide-border mt-3 divide-y overflow-hidden">
                  {availableOperators.map((id) => (
                    <ChoiceRow
                      key={id}
                      title={OPERATOR_NAMES[id] ?? id}
                      meta={`Compte ${dial ?? ""} · dépôt crédité sous 2 min`}
                      selected={operator === id}
                      onSelect={() => setOperator(id)}
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
                  Compte {operatorName ?? "Mobile Money"} à débiter, indicatif{" "}
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
                  Minimum {formatFcfa(depositFacts.min)}
                </p>
              </section>
            )}
          </div>

          {/* ---- Colonne de vérité : les choix faits, puis ce que ça coûte ---- */}
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
                          /* Le récapitulatif EST la navigation arrière : la
                             barre de progression n'en offrait aucune et le
                             bouton retour quittait le parcours entier. */
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
              </section>
            )}

            <section className={step > 1 ? "mt-8" : undefined}>
              {step >= 3 && operatorName ? (
                <>
                  <SectionLabel>{`Frais et délai · ${operatorName}`}</SectionLabel>
                  <div className="mt-3">
                    <TransactionFacts
                      fee={depositFacts.feeLabel}
                      delay={depositFacts.delay}
                      limit={
                        depositFacts.remainingLimit
                          ? formatFcfa(depositFacts.remainingLimit)
                          : undefined
                      }
                      balanceAfter={balanceAfter}
                    />
                  </div>
                </>
              ) : (
                <p className="text-text-muted text-[12px] leading-[17px]">
                  Les frais et le délai dépendent du pays et de l&apos;opérateur
                  : ils s&apos;affichent dès que l&apos;opérateur est choisi.
                </p>
              )}
            </section>
          </aside>
        </div>

        <StickyActionBar>
          {/* Le rythme de tête (marge, filet, padding) appartient désormais à
              la barre elle-même — voir `StickyActionBar`. */}
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
                disabled={!stepValid}
                onClick={() => router.push("/wallet/deposit/success")}
              />
            )}
          </div>
        </StickyActionBar>
      </main>

      <BottomNav />
    </>
  );
}

/**
 * CTA de flux, avec son état inactif. Reprend à l'identique le bouton
 * désactivé de l'écran 13 (surface neutre, libellé muted) plutôt qu'une
 * opacité posée sur l'aplat bleu, qui descend le libellé blanc sous tout seuil
 * de contraste.
 */
function FlowCta({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
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
      {label}
    </Button>
  );
}
