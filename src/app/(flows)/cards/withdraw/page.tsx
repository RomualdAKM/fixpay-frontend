"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PinPromptDialog } from "@/components/auth/PinPromptDialog";
import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { InlineError } from "@/components/feedback/InlineError";
import { AmountInput } from "@/components/ui/AmountInput";
import { Button } from "@/components/ui/Button";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { QuickAmountChips } from "@/components/ui/QuickAmountChips";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SelectableRow } from "@/components/ui/SelectableRow";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { TransactionFacts } from "@/components/ui/TransactionFacts";
import {
  useCardCashoutQuote,
  useCards,
  useCashoutCard,
} from "@/lib/api/cardHooks";
import { PinTicketAction } from "@/lib/api/types";
import { formatMoney, usdMinor } from "@/lib/money";
import { cardExpiry, maskedPan } from "@/lib/cards";

const FLOW_MAIN =
  "px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[840px] lg:px-10 lg:pt-9 lg:pb-12";
const FLOW_GRID = "mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10";
const FLOW_ASIDE = "mt-8 lg:mt-0";

/** Ne garde que les chiffres : le dollar-carte est saisi en unités entières,
 *  et le champ doit refléter exactement le montant qui sert au devis et à
 *  l'exécution (un « . » parasite ne doit pas multiplier la somme par 10). */
function sanitizeDollars(raw: string): string {
  return raw.replace(/\D/g, "");
}

/** Montant en dollars entiers saisi au clavier natif (« 50 » → 50). */
function parseDollars(raw: string): number {
  return Number(sanitizeDollars(raw)) || 0;
}

const QUICK_USD = [10, 25, 50, 100];
const MIN_USD = 1;

export default function CardWithdrawPage() {
  const router = useRouter();
  const queryCard = useSearchParams().get("card");

  const cardsQuery = useCards();
  const cashout = useCashoutCard();

  const [selectedCard, setSelectedCard] = useState<string | null>(queryCard);
  const [amount, setAmount] = useState("");
  const [pinOpen, setPinOpen] = useState(false);

  const activeCards = useMemo(
    () => (cardsQuery.data ?? []).filter((c) => c.status === "active"),
    [cardsQuery.data],
  );

  useEffect(() => {
    if (selectedCard !== null) return;
    if (queryCard && activeCards.some((c) => c.uuid === queryCard)) {
      setSelectedCard(queryCard);
    } else if (activeCards.length === 1) {
      setSelectedCard(activeCards[0]!.uuid);
    }
  }, [queryCard, activeCards, selectedCard]);

  const dollars = parseDollars(amount);
  const amountUsdMinor = usdMinor(dollars);

  const quoteQuery = useCardCashoutQuote(
    selectedCard,
    dollars >= MIN_USD ? amountUsdMinor : 0,
  );
  const quote = quoteQuery.data;

  const canConfirm =
    selectedCard !== null &&
    dollars >= MIN_USD &&
    quote !== undefined &&
    !cashout.isPending;

  const onTicket = (pinTicket: string) => {
    setPinOpen(false);
    if (!selectedCard) return;
    cashout.mutate(
      {
        uuid: selectedCard,
        input: { amount_minor: amountUsdMinor, currency: "USD" },
        pinTicket,
      },
      {
        onSuccess: (result) =>
          router.push(`/cards/withdraw/success?uuid=${result.uuid}`),
      },
    );
  };

  return (
    <>
      <main className={FLOW_MAIN}>
        <PageHeader title="Retirer de la carte" backHref="/cards" />

        <div className={FLOW_GRID}>
          {/* ---- Colonne de saisie ---- */}
          <div>
            <InfoBanner>
              Le montant en dollars est retiré de la carte et recrédité en
              francs sur votre portefeuille FixPay, au taux appliqué.
            </InfoBanner>

            <section className="mt-8 lg:max-w-[420px]">
              <SectionLabel>Montant à retirer (USD)</SectionLabel>
              <div className="mt-3">
                <AmountInput
                  value={amount}
                  onChange={(v) => setAmount(sanitizeDollars(v))}
                  placeholder="0"
                  ariaLabel="Montant à retirer en dollars"
                />
              </div>
              <div className="mt-3">
                <QuickAmountChips
                  amounts={QUICK_USD}
                  onSelect={(n) => setAmount(String(n))}
                />
              </div>
              <p className="text-text-secondary mt-2 text-[11.5px] leading-[16px]">
                Minimum {MIN_USD} USD
              </p>
              {cashout.isError && (
                <InlineError error={cashout.error} className="mt-3" />
              )}
            </section>
          </div>

          {/* ---- Colonne de vérité ---- */}
          <aside className={FLOW_ASIDE}>
            <section>
              <SectionLabel>Carte à débiter</SectionLabel>
              {cardsQuery.isPending ? (
                <div className="bg-surface-2 mt-3 h-[64px] animate-pulse rounded-md" />
              ) : activeCards.length === 0 ? (
                <p className="text-text-muted mt-3 text-[12.5px] leading-[18px]">
                  Aucune carte active à débiter.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {activeCards.map((card) => (
                    <SelectableRow
                      key={card.uuid}
                      title={maskedPan(card.pan_last4)}
                      subtitle={`Carte ${card.currency} · Exp ${cardExpiry(card)}`}
                      height={64}
                      selected={selectedCard === card.uuid}
                      onSelect={() => setSelectedCard(card.uuid)}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="mt-8">
              <SectionLabel>Ce que vous recevez</SectionLabel>
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
                    feeLabel="Retiré de la carte"
                    fee={formatMoney(quote.amount_usd)}
                    delay="Instantané"
                  />
                  <div className="border-border mt-3.5 flex items-baseline justify-between border-t pt-3.5">
                    <span className="text-text-secondary text-[12.5px] leading-[16px]">
                      Crédité au portefeuille
                    </span>
                    <span className="text-text text-[13.5px] leading-[18px] font-semibold">
                      {formatMoney(quote.credited_xof)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-text-muted mt-3 text-[12px] leading-[17px]">
                  Saisissez un montant pour afficher le crédit réel.
                </p>
              )}
            </section>
          </aside>
        </div>

        <StickyActionBar>
          <div>
            {canConfirm ? (
              <Button
                onClick={() => setPinOpen(true)}
                className="lg:max-w-[320px]"
              >
                {cashout.isPending ? "Envoi…" : "Confirmer le retrait"}
              </Button>
            ) : (
              <button
                type="button"
                disabled
                className="border-border bg-surface-2 text-text-muted inline-flex h-[50px] w-full cursor-not-allowed items-center justify-center rounded-md border text-[15px] font-semibold lg:max-w-[320px]"
              >
                Confirmer le retrait
              </button>
            )}
          </div>
        </StickyActionBar>
      </main>

      {/* Ticket : action card_cashout, ressource card liée à l'uuid, SANS
          montant (la garde consomme le ticket avec amount=null). */}
      <PinPromptDialog
        open={pinOpen}
        action={PinTicketAction.CardCashout}
        resourceType="card"
        resourceUuid={selectedCard ?? undefined}
        description={
          quote
            ? `Retrait de ${formatMoney(quote.amount_usd)} · ${formatMoney(
                quote.credited_xof,
              )} crédités au portefeuille.`
            : undefined
        }
        onTicket={onTicket}
        onCancel={() => setPinOpen(false)}
      />

      <BottomNav />
    </>
  );
}
