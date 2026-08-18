"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

import { PinPromptDialog } from "@/components/auth/PinPromptDialog";
import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { InlineError } from "@/components/feedback/InlineError";
import { AmountInput } from "@/components/ui/AmountInput";
import { BalanceCard } from "@/components/ui/BalanceCard";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StepProgress } from "@/components/ui/StepProgress";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { TransactionFacts } from "@/components/ui/TransactionFacts";
import {
  useCreateWithdrawal,
  useOperators,
  useWallet,
  useWithdrawal,
  useWithdrawalQuote,
} from "@/lib/api/moneyHooks";
import { isWithdrawalFinal } from "@/lib/api/status";
import { PinTicketAction, type Operator } from "@/lib/api/types";
import { formatFcfa } from "@/lib/format";
import { formatMoney, majorUnits, xofMinor } from "@/lib/money";
import { groupOperatorsByCountry } from "@/lib/operators";
import { cn } from "@/lib/utils";

const FLOW_MAIN =
  "px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[840px] lg:px-10 lg:pt-9 lg:pb-12";
const FLOW_GRID = "mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10";
const FLOW_ASIDE = "mt-8 lg:mt-0";

const MIN_AMOUNT_FCFA = 200;

const PAYOUT_DELAY_LABEL = "Sous 5 min";

const STEP_LABELS = ["Pays", "Opérateur", "Bénéficiaire", "Montant"] as const;

function parseAmount(raw: string): number {
  return Number(raw.replace(/\D/g, "")) || 0;
}

function phoneDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}

function toE164(dial: string | undefined, phone: string): string {
  const cc = (dial ?? "").replace(/\D/g, "");
  const local = phoneDigits(phone).replace(/^0+/, "");
  return `+${cc}${local}`;
}

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

/** Champ texte simple pour le bénéficiaire (réutilise le style AmountInput). */
function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div className="mt-2">
        <AmountInput
          value={value}
          onChange={onChange}
          variant="text"
          placeholder={placeholder}
          ariaLabel={label}
        />
      </div>
    </div>
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
 * Suivi après initiation : le retrait peut partir en `pending_approval`
 * (maker-checker) ou `pending` avant de devenir `success`. Le front POLL
 * jusqu'à un état final ; à `success` → écran de succès.
 */
function WithdrawalStatusView({
  uuid,
  onReset,
}: {
  uuid: string;
  onReset: () => void;
}) {
  const router = useRouter();
  const withdrawalQuery = useWithdrawal(uuid);
  const withdrawal = withdrawalQuery.data;

  useEffect(() => {
    if (withdrawal && withdrawal.status === "success") {
      router.replace(`/wallet/withdraw/success?uuid=${withdrawal.uuid}`);
    }
  }, [withdrawal, router]);

  const rejected =
    withdrawal &&
    isWithdrawalFinal(withdrawal.status) &&
    withdrawal.status !== "success";
  const awaitingApproval = withdrawal?.status === "pending_approval";

  return (
    <main className={FLOW_MAIN}>
      <PageHeader title="Retrait Mobile Money" backHref="/wallet" />

      <div className="mt-10 flex flex-col items-center text-center lg:mt-16">
        {withdrawalQuery.isError ? (
          <div className="w-full max-w-[420px]">
            <InlineError error={withdrawalQuery.error} />
          </div>
        ) : rejected ? (
          <>
            <p className="text-text text-[16px] leading-[22px] font-semibold">
              Retrait refusé
            </p>
            <p className="text-text-muted mt-2 max-w-[360px] text-[13px] leading-[19px]">
              {withdrawal?.failure_reason ??
                "L'opération n'a pas pu être finalisée. Votre solde a été rétabli."}
            </p>
          </>
        ) : awaitingApproval ? (
          <>
            <p className="text-text text-[16px] leading-[22px] font-semibold">
              En attente d&apos;approbation
            </p>
            <p className="text-text-muted mt-2 max-w-[360px] text-[13px] leading-[19px]">
              Votre retrait a été enregistré et sera traité après validation par
              un opérateur FixPay.
            </p>
            <Button href="/wallet" className="mt-6 lg:max-w-[320px]">
              Retour au portefeuille
            </Button>
          </>
        ) : (
          <>
            <Loader2
              size={32}
              className="text-primary animate-spin"
              aria-hidden="true"
            />
            <p className="text-text mt-5 text-[16px] leading-[22px] font-semibold">
              Retrait en cours
            </p>
            <p className="text-text-muted mt-2 max-w-[360px] text-[13px] leading-[19px]">
              Le versement vers le compte Mobile Money du bénéficiaire est en
              cours de traitement.
            </p>
          </>
        )}

        {(rejected || withdrawalQuery.isError) && (
          <button
            type="button"
            onClick={onReset}
            className="text-primary-light mt-6 text-[13.5px] leading-[18px] font-medium underline-offset-4 hover:underline"
          >
            Nouveau retrait
          </button>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

export default function WalletWithdrawPage() {
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState<string | null>(null);
  const [operatorCode, setOperatorCode] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [pinOpen, setPinOpen] = useState(false);
  const [withdrawalUuid, setWithdrawalUuid] = useState<string | null>(null);

  const operatorsQuery = useOperators("payout");
  const walletQuery = useWallet();
  const createWithdrawal = useCreateWithdrawal();

  const countries = useMemo(
    () => groupOperatorsByCountry(operatorsQuery.data ?? []),
    [operatorsQuery.data],
  );
  const currentCountry = countries.find((c) => c.code === country);
  const availableOperators: Operator[] = currentCountry?.operators ?? [];
  const operator = availableOperators.find((o) => o.code === operatorCode);
  const dial = currentCountry?.dial;

  const debited = parseAmount(amount);
  const quoteQuery = useWithdrawalQuote(
    step === 4 ? operatorCode : null,
    step === 4 ? xofMinor(debited) : 0,
  );
  const quote = quoteQuery.data;

  const balanceMinor = walletQuery.data?.balance.amount_minor ?? 0;
  const clientDebitMinor = quote?.client_debit.amount_minor ?? 0;
  const withinBalance = quote ? clientDebitMinor <= balanceMinor : true;

  const recipientValid =
    phoneDigits(phone).length >= 8 &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0;

  const stepValid =
    (step === 1 && country !== null) ||
    (step === 2 && operatorCode !== null) ||
    (step === 3 && recipientValid) ||
    (step === 4 && debited >= MIN_AMOUNT_FCFA);

  const canConfirm =
    step === 4 &&
    debited >= MIN_AMOUNT_FCFA &&
    quote !== undefined &&
    withinBalance &&
    !createWithdrawal.isPending;

  const balanceAfter =
    quote && walletQuery.data
      ? formatFcfa(majorUnits(walletQuery.data.balance) - clientDebitMinor)
      : undefined;

  const recap: Array<{ label: string; value?: string; step: number }> = [
    { label: "Pays", value: currentCountry?.name, step: 1 },
    { label: "Opérateur", value: operator?.name, step: 2 },
    {
      label: "Bénéficiaire",
      value: recipientValid
        ? `${firstName} ${lastName} · ${dial ?? ""} ${phone}`.trim()
        : undefined,
      step: 3,
    },
    {
      label: "Montant",
      value: debited > 0 ? formatFcfa(debited) : undefined,
      step: 4,
    },
  ];

  const onTicket = (pinTicket: string) => {
    setPinOpen(false);
    if (!operator) return;
    createWithdrawal.mutate(
      {
        input: {
          operator: operator.code,
          amount_minor: xofMinor(debited),
          currency: "XOF",
          recipient: {
            phone: toE164(dial, phone),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            ...(email.trim() ? { email: email.trim() } : {}),
          },
        },
        pinTicket,
      },
      {
        onSuccess: (withdrawal) => setWithdrawalUuid(withdrawal.uuid),
      },
    );
  };

  if (withdrawalUuid) {
    return (
      <WithdrawalStatusView
        uuid={withdrawalUuid}
        onReset={() => {
          setWithdrawalUuid(null);
          createWithdrawal.reset();
          setStep(4);
        }}
      />
    );
  }

  return (
    <>
      <main className={FLOW_MAIN}>
        <PageHeader title="Retrait Mobile Money" backHref="/wallet" />
        <p className="text-text-muted mt-2 text-[12.5px] leading-[17px]">
          Du portefeuille FixPay vers un compte Mobile Money
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
            <BalanceCard
              label="Disponible au retrait"
              amount={
                walletQuery.data
                  ? formatMoney(walletQuery.data.balance)
                  : "…"
              }
            />

            {step === 1 && (
              <section className="mt-8">
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
                    Aucun opérateur de retrait n&apos;est disponible.
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
              <section className="mt-8">
                <SectionLabel>{`Opérateur à créditer · ${currentCountry?.name ?? ""}`}</SectionLabel>
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
              <section className="mt-8 space-y-5 lg:max-w-[420px]">
                <Field
                  label="Numéro du bénéficiaire"
                  value={phone}
                  onChange={setPhone}
                  placeholder="07 00 00 00 00"
                />
                <Field
                  label="Prénom"
                  value={firstName}
                  onChange={setFirstName}
                  placeholder="Prénom"
                />
                <Field
                  label="Nom"
                  value={lastName}
                  onChange={setLastName}
                  placeholder="Nom"
                />
                <Field
                  label="E-mail (facultatif)"
                  value={email}
                  onChange={setEmail}
                  placeholder="email@exemple.com"
                />
              </section>
            )}

            {step === 4 && (
              <section className="mt-8 lg:max-w-[420px]">
                <SectionLabel>Montant du retrait (FCFA)</SectionLabel>
                <div className="mt-3">
                  <AmountInput
                    value={amount}
                    onChange={setAmount}
                    placeholder="0"
                    ariaLabel="Montant du retrait en francs CFA"
                  />
                </div>
                <p className="text-text-secondary mt-2 text-[11.5px] leading-[16px]">
                  Minimum {formatFcfa(MIN_AMOUNT_FCFA)}
                </p>
                {quote && !withinBalance && (
                  <p className="text-danger mt-2 text-[11.5px] leading-[16px]">
                    Solde insuffisant pour ce montant, frais compris.
                  </p>
                )}
                {createWithdrawal.isError && (
                  <InlineError error={createWithdrawal.error} className="mt-3" />
                )}
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

            {step === 4 && (
              <section className="mt-8">
                <SectionLabel>Frais et total débité</SectionLabel>
                {quoteQuery.isFetching && !quote ? (
                  <div
                    className="bg-surface-2 mt-3 h-[52px] animate-pulse rounded-md"
                    aria-hidden="true"
                  />
                ) : quoteQuery.isError ? (
                  <InlineError error={quoteQuery.error} className="mt-3" />
                ) : quote ? (
                  <div className="mt-3">
                    <TransactionFacts
                      fee={formatMoney(quote.fixpay_fee)}
                      delay={PAYOUT_DELAY_LABEL}
                      balanceAfter={balanceAfter}
                    />
                    <div className="border-border mt-3.5 flex items-baseline justify-between border-t pt-3.5">
                      <span className="text-text-secondary text-[12.5px] leading-[16px]">
                        Total débité du portefeuille
                      </span>
                      <span className="text-text text-[13.5px] leading-[18px] font-semibold">
                        {formatMoney(quote.client_debit)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-text-muted mt-3 text-[12px] leading-[17px]">
                    Saisissez un montant pour afficher les frais réels.
                  </p>
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
                label="Confirmer le retrait"
                disabled={!canConfirm}
                loading={createWithdrawal.isPending}
                onClick={() => setPinOpen(true)}
              />
            )}
          </div>
        </StickyActionBar>
      </main>

      {/* Le ticket de retrait est émis SANS liaison de montant : la route
          `pin.ticket:withdraw` consomme le ticket avec un montant nul
          (RequirePinTicket -> consume(..., $amount = null)). Un ticket portant
          un amount_minor est rejeté en 403 (pin_ticket_invalid) par la garde
          `$ticket->amount_minor !== $amount?->amountMinor`. Le montant reste
          affiché à l'utilisateur via `description`. */}
      <PinPromptDialog
        open={pinOpen}
        action={PinTicketAction.Withdraw}
        description={
          quote
            ? `Retrait de ${formatMoney(quote.amount)} · ${formatMoney(
                quote.client_debit,
              )} débités.`
            : undefined
        }
        onTicket={onTicket}
        onCancel={() => setPinOpen(false)}
      />

      <BottomNav />
    </>
  );
}
