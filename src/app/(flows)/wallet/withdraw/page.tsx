"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { AmountInput } from "@/components/ui/AmountInput";
import { BalanceCard } from "@/components/ui/BalanceCard";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StepProgress } from "@/components/ui/StepProgress";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { TransactionFacts } from "@/components/ui/TransactionFacts";
import { formatAmount, formatFcfa } from "@/lib/format";
import { countries, wallet, withdrawFacts } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/* Même squelette et même échelle d'espacement que l'écran 04 — voir le
   commentaire de rythme de wallet/deposit/page.tsx. Les deux assistants
   doivent se lire comme un seul objet de produit décliné deux fois. */
const FLOW_MAIN =
  "px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[840px] lg:px-10 lg:pt-9 lg:pb-12";
const FLOW_GRID = "mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10";
const FLOW_ASIDE = "mt-8 lg:mt-0";

/** Indicatif et opérateurs réellement présents dans chaque pays (cf. 04). */
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

/** Dernier compte utilisé — le compte Wave lié de l'écran 16. */
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
 * Frais réels du retrait : part proportionnelle avec plancher. C'est le seul
 * flux du produit qui en porte — un retrait Mobile Money en zone UEMOA en a
 * toujours.
 */
function withdrawFee(amount: number): number {
  if (amount <= 0) return 0;
  const rate = withdrawFacts.feeRate ?? 0;
  return Math.max(Math.round((amount * rate) / 100), withdrawFacts.feeMin ?? 0);
}

/** Rangée de liste (et non carte flottante) — identique à l'écran 04. */
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
 * Écran 05 · Retrait Mobile Money — assistant en 4 étapes.
 *
 * ÉTAPE 11 (composition) : mêmes gestes que sur l'écran 04, dont il est le
 * frère — liste groupée au lieu de six cartes autonomes, pastille de sélection
 * remontée au-dessus du seuil de 3:1, opérateurs filtrés par pays, CTA présent
 * à chaque étape, récapitulatif cliquable en guise de navigation arrière,
 * `TransactionFacts` en fin de colonne de vérité.
 *
 * Ce qui reste propre au retrait : le solde retirable est rappelé en tête de
 * la colonne de saisie (c'est la contrainte du flux), et les frais affichés
 * sont les frais réels (1 %, min. 100 FCFA), recalculés à la frappe.
 */
export default function WalletWithdrawPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");

  const debited = parseAmount(amount);
  const fee = withdrawFee(debited);
  const countryName = countries.find((c) => c.code === country)?.name;
  const dial = country ? COUNTRY_META[country]?.dial : undefined;
  const availableOperators = country
    ? (COUNTRY_META[country]?.operators ?? [])
    : [];
  const operatorName = operator ? OPERATOR_NAMES[operator] : undefined;

  /*
   * Le « solde après » n'apparaît qu'une fois un montant saisi, frais compris,
   * et jamais au-delà du solde : `formatFcfa` rend une valeur absolue, un
   * reste négatif s'y afficherait en positif.
   */
  const withinBalance = debited > 0 && debited + fee <= wallet.balance;
  const balanceAfter = withinBalance
    ? formatFcfa(wallet.balance - debited - fee)
    : undefined;

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
    (step === 4 && debited >= withdrawFacts.min && withinBalance);

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
      value: debited > 0 ? formatFcfa(debited) : undefined,
      step: 4,
    },
  ];

  return (
    <>
      <main className={FLOW_MAIN}>
        <PageHeader title="Retrait Mobile Money" backHref="/wallet" />
        <p className="text-text-muted mt-2 text-[12.5px] leading-[17px]">
          Vers Orange Money, Wave, MTN ou Moov
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
            {/* La ressource avant la décision : ce qu'on peut réellement
                retirer. Elle ouvre la colonne de saisie sur les 4 étapes, à la
                même place que la BalanceCard des écrans 06 et 07. */}
            <BalanceCard
              label="Disponible au retrait"
              amount={formatFcfa(wallet.balance)}
            />

            {step === 1 && (
              <>
                <section className="mt-8">
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
              <section className="mt-8">
                <SectionLabel>{`Opérateur à créditer · ${countryName ?? ""}`}</SectionLabel>
                <GlassCard className="divide-border mt-3 divide-y overflow-hidden">
                  {availableOperators.map((id) => (
                    <ChoiceRow
                      key={id}
                      title={OPERATOR_NAMES[id] ?? id}
                      meta={`Compte ${dial ?? ""} · retrait crédité sous 5 min`}
                      selected={operator === id}
                      onSelect={() => setOperator(id)}
                    />
                  ))}
                </GlassCard>
              </section>
            )}

            {step === 3 && (
              <section className="mt-8 lg:max-w-[420px]">
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
                  Compte {operatorName ?? "Mobile Money"} à créditer, indicatif{" "}
                  {dial ?? ""}.
                </p>
              </section>
            )}

            {step === 4 && (
              <section className="mt-8 lg:max-w-[420px]">
                <div className="flex items-baseline justify-between gap-3">
                  <SectionLabel>Montant du retrait (FCFA)</SectionLabel>
                  <button
                    type="button"
                    onClick={() =>
                      setAmount(
                        formatAmount(
                          Math.max(
                            0,
                            wallet.balance - withdrawFee(wallet.balance),
                          ),
                        ),
                      )
                    }
                    className="text-primary focus-visible:ring-primary/60 rounded-xs text-[12.5px] leading-[18px] font-medium transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
                  >
                    Tout retirer
                  </button>
                </div>
                <div className="mt-3">
                  <AmountInput
                    value={amount}
                    onChange={setAmount}
                    placeholder="0"
                    ariaLabel="Montant du retrait en francs CFA"
                  />
                </div>
                <p className="text-text-secondary mt-2 text-[11.5px] leading-[16px]">
                  Minimum {formatFcfa(withdrawFacts.min)}
                  {fee > 0 ? ` · Frais prélevés : ${formatFcfa(fee)}` : ""}
                </p>
              </section>
            )}
          </div>

          {/* ---- Colonne de vérité ---- */}
          <aside className={FLOW_ASIDE}>
            {step > 1 && (
              <section>
                <SectionLabel>Votre retrait</SectionLabel>
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
              </section>
            )}

            <section className={step > 1 ? "mt-8" : undefined}>
              {step >= 3 && operatorName ? (
                <>
                  <SectionLabel>{`Frais et délai · ${operatorName}`}</SectionLabel>
                  <div className="mt-3">
                    <TransactionFacts
                      fee={withdrawFacts.feeLabel}
                      delay={withdrawFacts.delay}
                      limit={
                        withdrawFacts.remainingLimit
                          ? formatFcfa(withdrawFacts.remainingLimit)
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
                label="Confirmer le retrait"
                disabled={!stepValid}
                onClick={() => router.push("/wallet/withdraw/success")}
              />
            )}
          </div>
        </StickyActionBar>
      </main>

      <BottomNav />
    </>
  );
}

/** CTA de flux avec état inactif — même objet que sur les écrans 04 et 13. */
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
