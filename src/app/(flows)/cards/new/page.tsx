"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { PinPromptDialog } from "@/components/auth/PinPromptDialog";
import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { InlineError } from "@/components/feedback/InlineError";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SelectableRow } from "@/components/ui/SelectableRow";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { VirtualCard } from "@/components/ui/VirtualCard";
import {
  useCardIssuanceResult,
  useCardOffers,
  useCards,
  useIssueCard,
} from "@/lib/api/cardHooks";
import {
  PinTicketAction,
  type CardIssuanceOrder,
  type CardOffer,
} from "@/lib/api/types";
import { useWallet } from "@/lib/api/moneyHooks";
import { formatMoney } from "@/lib/money";

const FLOW_MAIN =
  "px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[840px] lg:px-10 lg:pt-9 lg:pb-12";

/** VirtualCard n'accepte que visa/mastercard ; l'organisation du BIN les nomme. */
function brandOf(offer: CardOffer): "visa" | "mastercard" {
  return offer.brand.toLowerCase().includes("master") ? "mastercard" : "visa";
}

/**
 * Suivi de l'émission asynchrone. Il n'existe pas d'endpoint de statut pour
 * l'ordre : une fois le POST revenu `pending` sans carte, la carte est observée
 * en interrogeant GET /api/cards jusqu'à l'apparition d'un uuid absent avant
 * l'émission. À la carte → écran de succès ; à l'échec → message d'échec.
 */
function IssuanceStatusView({
  order,
  knownUuids,
  onReset,
}: {
  order: CardIssuanceOrder;
  knownUuids: readonly string[];
  onReset: () => void;
}) {
  const router = useRouter();
  const result = useCardIssuanceResult(order, knownUuids);

  useEffect(() => {
    if (result.cardUuid) {
      router.replace(`/cards/new/success?card=${result.cardUuid}`);
    }
  }, [result.cardUuid, router]);

  const stalled = result.capReached;

  return (
    <main className={FLOW_MAIN}>
      <PageHeader title="Création de la carte" backHref="/cards" />

      <div className="mt-10 flex flex-col items-center text-center lg:mt-16">
        {result.isError ? (
          <div className="w-full max-w-[420px]">
            <InlineError error={result.error} />
          </div>
        ) : result.failed ? (
          <>
            <p className="text-text text-[16px] leading-[22px] font-semibold">
              Création non aboutie
            </p>
            <p className="text-text-muted mt-2 max-w-[360px] text-[13px] leading-[19px]">
              {result.failureReason ??
                "La carte n'a pas pu être créée. Le montant réservé a été rétabli sur votre portefeuille."}
            </p>
          </>
        ) : stalled ? (
          <>
            <p className="text-text text-[16px] leading-[22px] font-semibold">
              Création en cours
            </p>
            <p className="text-text-muted mt-2 max-w-[360px] text-[13px] leading-[19px]">
              Votre carte est en cours d&apos;émission. Elle apparaîtra dans
              « Mes cartes » dès qu&apos;elle sera prête.
            </p>
            <Button href="/cards" className="mt-6 lg:max-w-[320px]">
              Voir mes cartes
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
              Création de la carte
            </p>
            <p className="text-text-muted mt-2 max-w-[360px] text-[13px] leading-[19px]">
              Nous émettons votre carte virtuelle. Cela prend généralement
              quelques secondes.
            </p>
          </>
        )}

        {(result.failed || result.isError) && (
          <button
            type="button"
            onClick={onReset}
            className="text-primary-light mt-6 text-[13.5px] leading-[18px] font-medium underline-offset-4 hover:underline"
          >
            Réessayer
          </button>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

/**
 * Écran 09 · Créer une carte — sur le catalogue réel des BINs émissibles
 * (GET /api/card-offers). L'utilisateur choisit une offre (prix d'émission
 * débité du portefeuille en XOF), confirme avec son PIN (action card_issue),
 * puis POST /api/cards lance l'ordre asynchrone que l'écran suit jusqu'à la
 * carte → /cards/new/success.
 */
export default function CreateCardPage() {
  const offersQuery = useCardOffers();
  const walletQuery = useWallet();
  const cardsQuery = useCards();
  const issue = useIssueCard();

  const [selectedBin, setSelectedBin] = useState<string | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [order, setOrder] = useState<CardIssuanceOrder | null>(null);
  const [knownUuids, setKnownUuids] = useState<readonly string[]>([]);

  const offers = useMemo(() => offersQuery.data ?? [], [offersQuery.data]);
  const selectedOffer = useMemo(
    () => offers.find((o) => o.bin_uuid === selectedBin) ?? null,
    [offers, selectedBin],
  );

  const priceMinor = selectedOffer?.client_price.amount_minor ?? 0;
  const balanceMinor = walletQuery.data?.balance.amount_minor ?? 0;
  const withinBalance = selectedOffer ? priceMinor <= balanceMinor : true;

  // L'émission détecte la nouvelle carte comme l'uuid absent d'un instantané
  // pris AVANT le POST. Cet instantané n'est fiable que si la liste des cartes
  // est réellement chargée : sans `isSuccess`, un `[]` capturé alors que des
  // cartes existent ferait passer une carte préexistante pour la nouvelle
  // (faux succès), le débit d'émission étant déjà prélevé.
  const canConfirm =
    selectedOffer !== null &&
    withinBalance &&
    cardsQuery.isSuccess &&
    !issue.isPending;

  const onIssueTicket = (pinTicket: string) => {
    setPinOpen(false);
    if (!selectedOffer || !cardsQuery.isSuccess) return;
    setKnownUuids(cardsQuery.data.map((c) => c.uuid));
    issue.mutate(
      { input: { bin_uuid: selectedOffer.bin_uuid }, pinTicket },
      { onSuccess: (issued) => setOrder(issued) },
    );
  };

  if (order) {
    return (
      <IssuanceStatusView
        order={order}
        knownUuids={knownUuids}
        onReset={() => {
          setOrder(null);
          issue.reset();
        }}
      />
    );
  }

  return (
    <>
      <main className={FLOW_MAIN}>
        <PageHeader title="Créer une carte" backHref="/cards" />
        <p className="text-text-muted mt-2 text-[12.5px] leading-[17px]">
          Une carte virtuelle en dollars, alimentée depuis votre portefeuille
          FixPay.
        </p>

        <section className="mt-8">
          <SectionLabel>Choisissez votre carte</SectionLabel>
          <div className="mt-3">
            {offersQuery.isPending ? (
              <GlassCard className="divide-border divide-y overflow-hidden">
                {[0, 1].map((i) => (
                  <div key={i} className="animate-pulse px-4 py-4">
                    <div className="bg-surface-2 h-[14px] w-2/5 rounded-xs" />
                    <div className="bg-surface-2 mt-2 h-[11px] w-3/5 rounded-xs" />
                  </div>
                ))}
              </GlassCard>
            ) : offersQuery.isError ? (
              <div>
                <InlineError error={offersQuery.error} />
                <button
                  type="button"
                  onClick={() => void offersQuery.refetch()}
                  className="text-primary-light mt-3 text-[13px] font-medium underline-offset-4 hover:underline"
                >
                  Réessayer
                </button>
              </div>
            ) : offers.length === 0 ? (
              <p className="text-text-muted py-4 text-[12.5px] leading-[18px]">
                Aucune carte n&apos;est disponible à l&apos;émission pour le
                moment.
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {offers.map((offer) => (
                  <SelectableRow
                    key={offer.bin_uuid}
                    title={offer.brand}
                    subtitle={`Carte ${offer.currency} virtuelle`}
                    price={formatMoney(offer.client_price)}
                    height={72}
                    leading={
                      <VirtualCard size="mini" brand={brandOf(offer)} />
                    }
                    selected={selectedBin === offer.bin_uuid}
                    onSelect={() => setSelectedBin(offer.bin_uuid)}
                  />
                ))}
              </div>
            )}
          </div>

          {selectedOffer && !withinBalance && (
            <p className="text-danger mt-3 text-[11.5px] leading-[16px]">
              Solde du portefeuille insuffisant pour le prix d&apos;émission.
            </p>
          )}

          {issue.isError && <InlineError error={issue.error} className="mt-4" />}

          <div className="mt-4">
            <InfoBanner>
              Le prix d&apos;émission est débité une seule fois de votre
              portefeuille, à la création.
            </InfoBanner>
          </div>
        </section>

        <StickyActionBar>
          <div className="lg:max-w-[520px]">
            {selectedOffer ? (
              <p className="text-text-secondary mb-3 flex items-baseline justify-between gap-3 text-[12.5px] leading-[16px] lg:mb-3">
                <span>Prix d&apos;émission · débité du portefeuille</span>
                <span className="text-text shrink-0 text-[14px] font-semibold">
                  {formatMoney(selectedOffer.client_price)}
                </span>
              </p>
            ) : null}
            {canConfirm ? (
              <Button
                onClick={() => setPinOpen(true)}
                className="lg:max-w-[320px]"
              >
                {issue.isPending ? "Création…" : "Créer la carte"}
              </Button>
            ) : (
              <button
                type="button"
                disabled
                className="border-border bg-surface-2 text-text-muted inline-flex h-[50px] w-full cursor-not-allowed items-center justify-center rounded-md border text-[15px] font-semibold lg:max-w-[320px]"
              >
                Créer la carte
              </button>
            )}
          </div>
        </StickyActionBar>
      </main>

      {/* Ticket d'émission : action card_issue, sans ressource ni montant. */}
      <PinPromptDialog
        open={pinOpen}
        action={PinTicketAction.CardIssue}
        description={
          selectedOffer
            ? `Émission d'une carte ${selectedOffer.currency} · ${formatMoney(
                selectedOffer.client_price,
              )} débités du portefeuille.`
            : undefined
        }
        onTicket={onIssueTicket}
        onCancel={() => setPinOpen(false)}
      />

      <BottomNav />
    </>
  );
}
