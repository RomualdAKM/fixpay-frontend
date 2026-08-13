"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";

import { ApiError } from "./ApiError";
import {
  cancelCard,
  cashoutCard,
  enableCard,
  fetchCard,
  fetchCardCashoutQuote,
  fetchCardOffers,
  fetchCardRechargeQuote,
  fetchCardTransactions,
  fetchCards,
  issueCard,
  rechargeCard,
  revealCard,
  suspendCard,
} from "./endpoints";
import { MAX_POLL_ATTEMPTS, POLL_INTERVAL_MS } from "./moneyHooks";
import type {
  Card,
  CardCashout,
  CardCashoutQuote,
  CardIssuanceOrder,
  CardOffer,
  CardRecharge,
  CardRechargeQuote,
  CardReveal,
  CardTransaction,
  CashoutCardInput,
  IssueCardInput,
  RechargeCardInput,
} from "./types";

/**
 * Bounded polling for a card resource that has no dedicated status endpoint:
 * keep re-fetching every {@link POLL_INTERVAL_MS} until `resolved`, then stop —
 * and never exceed {@link MAX_POLL_ATTEMPTS} so a stuck order can't poll forever.
 */
function boundedPoll(updateCount: number, resolved: boolean): number | false {
  if (resolved) return false;
  if (updateCount >= MAX_POLL_ATTEMPTS) return false;
  return POLL_INTERVAL_MS;
}

// ---- Reads -------------------------------------------------------------

/** GET /api/cards — the user's cards. */
export function useCards(): UseQueryResult<Card[], ApiError> {
  return useQuery<Card[], ApiError>({
    queryKey: queryKeys.cards,
    queryFn: () => fetchCards(),
  });
}

/** GET /api/cards/{uuid} — one card. Disabled while `uuid` is null. */
export function useCard(uuid: string | null): UseQueryResult<Card, ApiError> {
  return useQuery<Card, ApiError>({
    queryKey: uuid ? queryKeys.card(uuid) : ["cards", "idle"],
    queryFn: () => fetchCard(uuid as string),
    enabled: uuid !== null,
  });
}

/**
 * GET /api/cards/{uuid}/transactions — a flat list of card movements
 * (consumptions, recharges, cashouts), newest first. The backend does not
 * paginate this endpoint.
 */
export function useCardTransactions(
  uuid: string | null,
): UseQueryResult<CardTransaction[], ApiError> {
  return useQuery<CardTransaction[], ApiError>({
    queryKey: uuid ? queryKeys.cardTransactions(uuid) : ["cards", "idle", "tx"],
    queryFn: () => fetchCardTransactions(uuid as string),
    enabled: uuid !== null,
  });
}

/** GET /api/card-offers — issuable BINs and their XOF issuance price. */
export function useCardOffers(): UseQueryResult<CardOffer[], ApiError> {
  return useQuery<CardOffer[], ApiError>({
    queryKey: queryKeys.cardOffers,
    queryFn: () => fetchCardOffers(),
  });
}

// ---- Issuance ----------------------------------------------------------

/**
 * POST /api/cards — start an issuance. Requires the `card_issue` PIN ticket,
 * supplied by the caller. The returned order is asynchronous.
 */
export function useIssueCard(): UseMutationResult<
  CardIssuanceOrder,
  ApiError,
  { input: IssueCardInput; pinTicket: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, pinTicket }) => issueCard(input, pinTicket),
    // L'émission débite immédiatement le portefeuille (prix d'émission XOF) et
    // fait apparaître une carte : on invalide comme les autres mutations
    // d'argent carte, pour que le solde et la liste ne restent pas périmés.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
      void queryClient.invalidateQueries({ queryKey: queryKeys.cards });
    },
  });
}

/** The outcome of tracking an issuance order to the card it produces. */
export interface CardIssuanceResult {
  /** UUID of the issued card, once known (directly or by polling the list). */
  cardUuid: string | null;
  /** The order settled as `failed`. */
  failed: boolean;
  failureReason: string | null;
  /** A GET /api/cards poll failed. */
  isError: boolean;
  error: ApiError | null;
  /** Still waiting for the card to appear, under the attempt cap. */
  isPending: boolean;
  /** The attempt cap was reached without a card — treat as still in progress. */
  capReached: boolean;
}

/**
 * Follow an asynchronous issuance to the card it creates. There is no GET
 * endpoint for the order, so once the POST returns `pending` without a
 * `card_uuid`, the card is observed by polling GET /api/cards for a UUID that
 * was not present before the issuance (captured in `knownUuids`).
 */
export function useCardIssuanceResult(
  order: CardIssuanceOrder | null,
  knownUuids: readonly string[],
): CardIssuanceResult {
  const queryClient = useQueryClient();
  const directUuid = order?.card_uuid ?? null;
  const failed = order?.state === "failed";
  const needsPoll = order !== null && !failed && directUuid === null;

  const query = useQuery<Card[], ApiError>({
    queryKey: queryKeys.cards,
    queryFn: () => fetchCards(),
    enabled: needsPoll,
    refetchInterval: (q) => {
      const found = (q.state.data ?? []).some(
        (card) => !knownUuids.includes(card.uuid),
      );
      return boundedPoll(q.state.dataUpdateCount, found);
    },
  });

  const newCard =
    (query.data ?? []).find((card) => !knownUuids.includes(card.uuid)) ?? null;
  const cardUuid = directUuid ?? newCard?.uuid ?? null;
  // `dataUpdateCount` lives on the cached query state, not on the hook result.
  const updateCount =
    queryClient.getQueryState<Card[]>(queryKeys.cards)?.dataUpdateCount ?? 0;
  const capReached =
    needsPoll &&
    cardUuid === null &&
    !query.isError &&
    updateCount >= MAX_POLL_ATTEMPTS;

  return {
    cardUuid,
    failed,
    failureReason: order?.failure_reason ?? null,
    isError: query.isError,
    error: query.error,
    isPending:
      needsPoll && cardUuid === null && !capReached && !query.isError,
    capReached,
  };
}

// ---- Recharge ----------------------------------------------------------

/** GET /api/cards/{uuid}/recharge/quote — disabled until an amount is entered. */
export function useCardRechargeQuote(
  uuid: string | null,
  amountUsdMinor: number,
): UseQueryResult<CardRechargeQuote, ApiError> {
  return useQuery<CardRechargeQuote, ApiError>({
    queryKey: queryKeys.cardRechargeQuote(uuid ?? "", amountUsdMinor),
    queryFn: () => fetchCardRechargeQuote(uuid as string, amountUsdMinor),
    enabled: uuid !== null && amountUsdMinor > 0,
    staleTime: 30_000,
  });
}

/**
 * POST /api/cards/{uuid}/recharge with the `card_recharge` ticket. The result
 * is cached under its own UUID so the success screen can read the real amounts,
 * and the wallet + card views are refreshed.
 */
export function useRechargeCard(): UseMutationResult<
  CardRecharge,
  ApiError,
  { uuid: string; input: RechargeCardInput; pinTicket: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, input, pinTicket }) =>
      rechargeCard(uuid, input, pinTicket),
    onSuccess: (recharge) => {
      queryClient.setQueryData(
        queryKeys.cardRecharge(recharge.uuid),
        recharge,
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
      if (recharge.card_uuid) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.card(recharge.card_uuid),
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.cardTransactions(recharge.card_uuid),
        });
      }
    },
  });
}

/**
 * Read a recharge result from the cache set by {@link useRechargeCard}. There is
 * no GET endpoint for a recharge, so the query never fetches — an absent result
 * (e.g. a hard refresh of the success URL) resolves to `undefined`, which the
 * screen renders as "receipt unavailable" rather than inventing one.
 */
export function useCardRechargeResult(
  uuid: string | null,
): UseQueryResult<CardRecharge, ApiError> {
  return useQuery<CardRecharge, ApiError>({
    queryKey: uuid ? queryKeys.cardRecharge(uuid) : ["card-recharges", "idle"],
    queryFn: () =>
      Promise.reject(new ApiError(404, "card_recharge_result_unavailable")),
    enabled: false,
  });
}

// ---- Cashout -----------------------------------------------------------

/** GET /api/cards/{uuid}/cashout/quote — disabled until an amount is entered. */
export function useCardCashoutQuote(
  uuid: string | null,
  amountUsdMinor: number,
): UseQueryResult<CardCashoutQuote, ApiError> {
  return useQuery<CardCashoutQuote, ApiError>({
    queryKey: queryKeys.cardCashoutQuote(uuid ?? "", amountUsdMinor),
    queryFn: () => fetchCardCashoutQuote(uuid as string, amountUsdMinor),
    enabled: uuid !== null && amountUsdMinor > 0,
    staleTime: 30_000,
  });
}

/** POST /api/cards/{uuid}/cashout with the `card_cashout` ticket. */
export function useCashoutCard(): UseMutationResult<
  CardCashout,
  ApiError,
  { uuid: string; input: CashoutCardInput; pinTicket: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, input, pinTicket }) =>
      cashoutCard(uuid, input, pinTicket),
    onSuccess: (cashout) => {
      queryClient.setQueryData(queryKeys.cardCashout(cashout.uuid), cashout);
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
      if (cashout.card_uuid) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.card(cashout.card_uuid),
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.cardTransactions(cashout.card_uuid),
        });
      }
    },
  });
}

/** Read a cashout result from the cache set by {@link useCashoutCard}. */
export function useCardCashoutResult(
  uuid: string | null,
): UseQueryResult<CardCashout, ApiError> {
  return useQuery<CardCashout, ApiError>({
    queryKey: uuid ? queryKeys.cardCashout(uuid) : ["card-cashouts", "idle"],
    queryFn: () =>
      Promise.reject(new ApiError(404, "card_cashout_result_unavailable")),
    enabled: false,
  });
}

// ---- Reveal ------------------------------------------------------------

/**
 * POST /api/cards/{uuid}/reveal with the `reveal_pan` ticket. The secrets are
 * returned to the caller and DELIBERATELY never cached: this is a mutation, so
 * nothing lands in the query cache, and the response is `no-store`. The caller
 * shows them briefly and resets the mutation on close so they leave memory.
 */
export function useRevealCard(): UseMutationResult<
  CardReveal,
  ApiError,
  { uuid: string; pinTicket: string }
> {
  return useMutation({
    mutationFn: ({ uuid, pinTicket }) => revealCard(uuid, pinTicket),
  });
}

// ---- Lifecycle ---------------------------------------------------------

function useCardLifecycleMutation(
  action: (uuid: string) => Promise<Card>,
): UseMutationResult<Card, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation<Card, ApiError, string>({
    mutationFn: (uuid) => action(uuid),
    onSuccess: (card) => {
      queryClient.setQueryData(queryKeys.card(card.uuid), card);
      void queryClient.invalidateQueries({ queryKey: queryKeys.cards });
    },
  });
}

/** POST /api/cards/{uuid}/suspend — freeze. */
export function useSuspendCard(): UseMutationResult<Card, ApiError, string> {
  return useCardLifecycleMutation(suspendCard);
}

/** POST /api/cards/{uuid}/enable — unfreeze. */
export function useEnableCard(): UseMutationResult<Card, ApiError, string> {
  return useCardLifecycleMutation(enableCard);
}

/** POST /api/cards/{uuid}/cancel — cancel for good. */
export function useCancelCard(): UseMutationResult<Card, ApiError, string> {
  return useCardLifecycleMutation(cancelCard);
}
