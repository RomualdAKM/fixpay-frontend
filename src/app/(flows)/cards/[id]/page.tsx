"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { PinPromptDialog } from "@/components/auth/PinPromptDialog";
import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { InlineError } from "@/components/feedback/InlineError";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { ListGroup } from "@/components/ui/ListGroup";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { VirtualCard } from "@/components/ui/VirtualCard";
import {
  useCancelCard,
  useCard,
  useCardTransactions,
  useEnableCard,
  useRevealCard,
  useSuspendCard,
} from "@/lib/api/cardHooks";
import { PinTicketAction, type CardTransaction } from "@/lib/api/types";
import { cardBrand, cardExpiry, cardStatusLabel, cardTransactionLabel, maskedPan } from "@/lib/cards";
import { formatDate } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { useAutoDismiss } from "@/lib/useAutoDismiss";
import { cn } from "@/lib/utils";

const MASKED_CARD_NUMBER = "•••• •••• •••• ••••";

/**
 * Fenêtre au-delà de laquelle un PAN/CVV révélé est repurgé automatiquement,
 * même si l'écran reste monté (épaule indiscrète, capture d'écran). Le secret
 * backend est éphémère : on ne le garde pas au-delà d'un délai borné côté
 * client, comme le font les applications bancaires.
 */
const REVEAL_AUTO_HIDE_MS = 45_000;

/** Group a full PAN into blocks of four: "4291123456784291" -> "4291 1234 …". */
function groupPan(pan: string): string {
  return pan.replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();
}

/** Ligne de spécification : intitulé à gauche, valeur à droite, filet bas. */
function SpecRow({
  term,
  value,
  last = false,
}: {
  term: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 py-[11px]",
        !last && "border-border border-b",
      )}
    >
      <span className="text-text text-[13px] leading-[17px]">{term}</span>
      <span className="text-text shrink-0 text-[13px] leading-[17px] font-semibold">
        {value}
      </span>
    </div>
  );
}

/** Une rangée de transaction carte, en USD (devise de la carte). */
function CardTransactionRow({
  transaction,
  last,
}: {
  transaction: CardTransaction;
  last: boolean;
}) {
  const credit =
    transaction.type === "recharge" || transaction.type === "refund";
  return (
    <div
      className={cn(
        "flex min-h-[65px] items-center gap-[13px] px-[15px] py-2.5",
        !last && "border-border border-b",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-text truncate text-[13.5px] font-medium">
          {transaction.merchant_name ??
            cardTransactionLabel(transaction.type)}
        </p>
        <p className="text-text-muted mt-[2px] truncate text-[11.5px]">
          {transaction.occurred_at ? formatDate(transaction.occurred_at) : "—"}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <span
          className={cn(
            "block text-[14px] font-semibold [word-spacing:0.12em]",
            credit ? "text-success" : "text-text",
          )}
        >
          {credit ? "+ " : "- "}
          {formatMoney(transaction.amount)}
        </span>
      </div>
    </div>
  );
}

/**
 * Écran 10 · Détail Carte — sur les données réelles de l'API.
 *
 * La carte, son statut et ses transactions viennent de GET /api/cards/{uuid} et
 * /transactions. Le PAN/CVV se révèle derrière le PIN (action reveal_pan,
 * ressource card) et n'est JAMAIS stocké : affiché brièvement, masqué par
 * défaut, purgé à la fermeture. Geler / dégeler / annuler confirment puis
 * rafraîchissent la carte. Aucun solde n'est affiché : l'API ne l'expose pas —
 * la donnée ne ment pas.
 */
export default function CardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const cardQuery = useCard(id);
  const transactionsQuery = useCardTransactions(id);

  const reveal = useRevealCard();
  const suspend = useSuspendCard();
  const enable = useEnableCard();
  const cancel = useCancelCard();

  const [pinOpen, setPinOpen] = useState(false);
  const [confirmFreeze, setConfirmFreeze] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  // Purge des secrets à la sortie de l'écran : le PAN/CVV ne survit pas au
  // démontage, et n'a jamais été écrit ailleurs que dans l'état de la mutation.
  const { reset: resetReveal } = reveal;
  useEffect(() => resetReveal, [resetReveal]);

  // Auto-masquage borné : une fois les secrets révélés, ils sont repurgés seuls
  // passé REVEAL_AUTO_HIDE_MS, même si l'écran reste ouvert. Annulé au masquage
  // manuel et au démontage.
  useAutoDismiss(Boolean(reveal.data), resetReveal, REVEAL_AUTO_HIDE_MS);

  if (cardQuery.error?.status === 404) notFound();

  const card = cardQuery.data;
  const revealed = reveal.data;

  const onRevealTicket = (pinTicket: string) => {
    setPinOpen(false);
    reveal.mutate({ uuid: id, pinTicket });
  };

  const faceNumber = revealed
    ? groupPan(revealed.pan)
    : card
      ? maskedPan(card.pan_last4)
      : MASKED_CARD_NUMBER;

  return (
    <>
      <main className="flex-1 px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[1080px] lg:px-10 lg:pt-9 lg:pb-12">
        <PageHeader title="Ma carte virtuelle" backHref="/cards" />

        {cardQuery.isPending ? (
          <div className="mt-16 flex justify-center">
            <Loader2 size={28} className="text-primary animate-spin" aria-hidden />
          </div>
        ) : cardQuery.isError || !card ? (
          <div className="mt-8">
            <InlineError error={cardQuery.error} />
          </div>
        ) : (
          <div className="contents lg:mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
            {/* ---- Colonne A : la carte, ses secrets, ses actions ---- */}
            <div className="contents lg:block">
              <div className="mt-4 lg:mt-0">
                <VirtualCard
                  size="lg"
                  brand={cardBrand(card.brand)}
                  number={faceNumber}
                  holder={card.cardholder_name}
                  expiry={revealed ? revealed.expiry : cardExpiry(card)}
                  balance={formatMoney(card.balance)}
                />
              </div>

              <div className="mt-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <SectionLabel>{`Carte ${card.currency}`}</SectionLabel>
                    <Badge
                      tone={card.status === "active" ? "success" : "primary"}
                    >
                      {cardStatusLabel(card.status)}
                    </Badge>
                  </div>
                  <p className="text-text-secondary mt-1 text-[12.5px] leading-[17px]">
                    Numéro et cryptogramme visibles à la demande, après votre
                    code PIN.
                  </p>
                </div>
                {card.status !== "cancelled" && (
                  <IconButton
                    icon={revealed ? EyeOff : Eye}
                    size={30}
                    iconClass="text-text-secondary"
                    label={revealed ? "Masquer" : "Afficher"}
                    onClick={() => {
                      if (revealed) {
                        reveal.reset();
                      } else {
                        setPinOpen(true);
                      }
                    }}
                  />
                )}
              </div>

              {reveal.isPending && (
                <p className="text-text-muted mt-3 flex items-center gap-2 text-[12.5px]">
                  <Loader2 size={14} className="animate-spin" aria-hidden />
                  Récupération sécurisée…
                </p>
              )}
              {reveal.isError && (
                <InlineError error={reveal.error} className="mt-3" />
              )}

              {revealed && (
                <div className="border-border mt-4 rounded-lg border p-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-text-muted text-[11.5px]">
                      Cryptogramme (CVV)
                    </span>
                    <span className="text-text font-mono text-[14px] font-semibold tracking-[2px]">
                      {revealed.cvv}
                    </span>
                  </div>
                  <div className="border-border mt-3 flex items-baseline justify-between gap-4 border-t pt-3">
                    <span className="text-text-muted text-[11.5px]">
                      Expiration
                    </span>
                    <span className="text-text font-mono text-[14px] font-semibold tracking-[1px]">
                      {revealed.expiry}
                    </span>
                  </div>
                  <p className="text-text-muted mt-3 text-[11px] leading-[15px]">
                    Ces informations ne sont pas conservées. Elles disparaissent
                    dès que vous masquez la carte ou quittez l&apos;écran.
                  </p>
                </div>
              )}

              {/* ---- Actions d'argent : uniquement carte active ---- */}
              {card.status === "active" && (
                <div className="mt-6 flex gap-2.5">
                  <Button
                    href={`/cards/top-up?card=${card.uuid}`}
                    className="flex-[1.4]"
                  >
                    Alimenter
                  </Button>
                  <Button
                    variant="glass"
                    href={`/cards/withdraw?card=${card.uuid}`}
                    className="text-text flex-1"
                  >
                    Retirer
                  </Button>
                </div>
              )}

              {/* ---- Détails de la carte ---- */}
              <section className="mt-8">
                <SectionHeader title="Détails" />
                <div className="mt-2">
                  <SpecRow term="Solde" value={formatMoney(card.balance)} />
                  <SpecRow term="Titulaire" value={card.cardholder_name} />
                  <SpecRow term="Numéro" value={maskedPan(card.pan_last4)} />
                  <SpecRow term="Expiration" value={cardExpiry(card)} />
                  <SpecRow term="Devise" value={card.currency} />
                  <SpecRow
                    term="Statut"
                    value={cardStatusLabel(card.status)}
                    last
                  />
                </div>
              </section>

              {/* ---- Cycle de vie ---- */}
              {card.status !== "cancelled" && (
                <div className="border-border mt-8 rounded-lg border p-4">
                  {card.status === "frozen" ? (
                    <>
                      <p className="text-text text-[13px] leading-[17px] font-semibold">
                        Carte gelée
                      </p>
                      <p className="text-text-secondary mt-1 text-[12px] leading-[17px]">
                        Les paiements sont refusés. Vous pouvez la dégeler à tout
                        moment.
                      </p>
                      <button
                        type="button"
                        onClick={() => enable.mutate(card.uuid)}
                        disabled={enable.isPending}
                        className="border-border text-primary hover:border-primary mt-3 inline-flex h-9 items-center rounded-md border px-4 text-[13px] font-semibold transition-colors disabled:opacity-60"
                      >
                        {enable.isPending ? "Déblocage…" : "Dégeler la carte"}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-text text-[13px] leading-[17px] font-semibold">
                        Geler la carte
                      </p>
                      <p className="text-text-secondary mt-1 text-[12px] leading-[17px]">
                        Les paiements seront refusés immédiatement. Vous pourrez
                        la dégeler ensuite.
                      </p>
                      {confirmFreeze ? (
                        <div className="mt-3 flex items-center gap-5">
                          <button
                            type="button"
                            onClick={() =>
                              suspend.mutate(card.uuid, {
                                onSuccess: () => setConfirmFreeze(false),
                              })
                            }
                            disabled={suspend.isPending}
                            className="border-warning text-warning-deep inline-flex h-9 items-center rounded-md border px-4 text-[13px] font-semibold disabled:opacity-60"
                          >
                            {suspend.isPending ? "Gel en cours…" : "Confirmer le gel"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmFreeze(false)}
                            className="text-text-secondary text-[13px]"
                          >
                            Retour
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmFreeze(true)}
                          className="border-border text-warning-deep hover:border-warning mt-3 inline-flex h-9 items-center rounded-md border px-4 text-[13px] font-semibold transition-colors"
                        >
                          Geler
                        </button>
                      )}
                    </>
                  )}

                  <div className="border-border mt-4 border-t pt-4">
                    <p className="text-text text-[13px] leading-[17px] font-semibold">
                      Annuler la carte
                    </p>
                    <p className="text-text-secondary mt-1 text-[12px] leading-[17px]">
                      Action définitive : la carte ne pourra plus être utilisée
                      ni réactivée.
                    </p>
                    {confirmCancel ? (
                      <div className="mt-3 flex items-center gap-5">
                        <button
                          type="button"
                          onClick={() => cancel.mutate(card.uuid)}
                          disabled={cancel.isPending}
                          className="border-danger text-danger inline-flex h-9 items-center rounded-md border px-4 text-[13px] font-semibold disabled:opacity-60"
                        >
                          {cancel.isPending
                            ? "Annulation…"
                            : "Confirmer l'annulation"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmCancel(false)}
                          className="text-text-secondary text-[13px]"
                        >
                          Retour
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmCancel(true)}
                        className="border-border text-danger hover:border-danger mt-3 inline-flex h-9 items-center rounded-md border px-4 text-[13px] font-semibold transition-colors"
                      >
                        Annuler la carte
                      </button>
                    )}
                    {(suspend.isError ||
                      enable.isError ||
                      cancel.isError) && (
                      <InlineError
                        error={suspend.error ?? enable.error ?? cancel.error}
                        className="mt-3"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ---- Colonne B : activité ---- */}
            <div className="contents lg:block">
              <div className="mt-8 lg:mt-0">
                <SectionHeader title="Transactions" />
                <div className="mt-2">
                  {transactionsQuery.isPending ? (
                    <ListGroup loading />
                  ) : transactionsQuery.isError ? (
                    <InlineError error={transactionsQuery.error} />
                  ) : (transactionsQuery.data ?? []).length === 0 ? (
                    <ListGroup
                      empty="Aucune transaction sur cette carte pour l'instant."
                    />
                  ) : (
                    <ListGroup>
                      {(transactionsQuery.data ?? []).map((transaction, index) => (
                        <CardTransactionRow
                          key={transaction.uuid}
                          transaction={transaction}
                          last={
                            index ===
                            (transactionsQuery.data ?? []).length - 1
                          }
                        />
                      ))}
                    </ListGroup>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Ticket de révélation : action reveal_pan, ressource card liée à l'uuid,
          SANS montant (la garde consomme le ticket avec amount=null). */}
      <PinPromptDialog
        open={pinOpen}
        action={PinTicketAction.RevealPan}
        resourceType="card"
        resourceUuid={id}
        title="Afficher le numéro de la carte"
        description="Confirmez avec votre code PIN pour révéler brièvement le numéro et le cryptogramme."
        onTicket={onRevealTicket}
        onCancel={() => setPinOpen(false)}
      />

      <BottomNav />
    </>
  );
}
