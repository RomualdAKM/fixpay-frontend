"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type UseInfiniteQueryResult,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";

import { ApiError } from "./ApiError";
import {
  createDeposit,
  createWithdrawal,
  fetchDeposit,
  fetchMobileMoneyAccounts,
  fetchOperators,
  fetchWallet,
  fetchWalletTransactions,
  fetchWithdrawal,
  fetchWithdrawalQuote,
  linkMobileMoneyAccount,
  setPrimaryMobileMoneyAccount,
  unlinkMobileMoneyAccount,
} from "./endpoints";
import { isDepositFinal, isWithdrawalFinal } from "./status";
import type {
  CreateDepositInput,
  CreateWithdrawalInput,
  Deposit,
  LinkMobileMoneyAccountInput,
  MobileMoneyAccount,
  Operator,
  OperatorPurpose,
  Paginated,
  Wallet,
  WalletTransaction,
  Withdrawal,
  WithdrawalQuote,
} from "./types";

/** How often an open deposit/withdrawal is re-polled, in ms. */
export const POLL_INTERVAL_MS = 2500;

/**
 * Upper bound on background polls before we stop re-fetching a still-open
 * deposit/withdrawal. At {@link POLL_INTERVAL_MS} this is ~10 min. Without it a
 * tab left open on an operation the user never validates (deposit stuck in
 * `initiated`) or a withdrawal awaiting hours-long maker-checker approval would
 * hit the network forever. Polling always stops earlier on a final status.
 */
export const MAX_POLL_ATTEMPTS = 240;

/**
 * Refetch cadence for a polled money resource: keep polling every
 * {@link POLL_INTERVAL_MS} until the status is final or the attempt cap is
 * reached, then stop.
 */
export function pollInterval(
  updateCount: number,
  status: string | undefined,
  isFinal: (status: string) => boolean,
): number | false {
  if (status && isFinal(status)) return false;
  if (updateCount >= MAX_POLL_ATTEMPTS) return false;
  return POLL_INTERVAL_MS;
}

// ---- Wallet ------------------------------------------------------------

/** GET /api/wallet — balance and status. */
export function useWallet(): UseQueryResult<Wallet, ApiError> {
  return useQuery<Wallet, ApiError>({
    queryKey: queryKeys.wallet,
    queryFn: () => fetchWallet(),
  });
}

/**
 * GET /api/wallet/transactions — the wallet ledger, paginated. Consumers call
 * `fetchNextPage()` and read `data.pages[*].items`.
 */
export function useWalletTransactions(): UseInfiniteQueryResult<
  { pages: Paginated<WalletTransaction>[]; pageParams: number[] },
  ApiError
> {
  return useInfiniteQuery<
    Paginated<WalletTransaction>,
    ApiError,
    { pages: Paginated<WalletTransaction>[]; pageParams: number[] },
    typeof queryKeys.walletTransactions,
    number
  >({
    queryKey: queryKeys.walletTransactions,
    queryFn: ({ pageParam }) => fetchWalletTransactions(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.pagination;
      return current_page < last_page ? current_page + 1 : undefined;
    },
  });
}

// ---- Operators ---------------------------------------------------------

/** GET /api/operators?purpose= — curated Mobile Money operators. */
export function useOperators(
  purpose?: OperatorPurpose,
): UseQueryResult<Operator[], ApiError> {
  return useQuery<Operator[], ApiError>({
    queryKey: queryKeys.operators(purpose),
    queryFn: () => fetchOperators(purpose),
  });
}

// ---- Mobile Money accounts ---------------------------------------------

/** GET /api/mobile-money-accounts — linked accounts (primary first). */
export function useMobileMoneyAccounts(): UseQueryResult<
  MobileMoneyAccount[],
  ApiError
> {
  return useQuery<MobileMoneyAccount[], ApiError>({
    queryKey: queryKeys.mobileMoneyAccounts,
    queryFn: async () => (await fetchMobileMoneyAccounts()).items,
  });
}

/**
 * POST /api/mobile-money-accounts — link an account. Requires a PIN ticket for
 * the `link_mm_account` action, supplied by the caller alongside the input.
 */
export function useLinkMobileMoneyAccount(): UseMutationResult<
  MobileMoneyAccount,
  ApiError,
  { input: LinkMobileMoneyAccountInput; pinTicket: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, pinTicket }) =>
      linkMobileMoneyAccount(input, pinTicket),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.mobileMoneyAccounts,
      });
    },
  });
}

/** DELETE /api/mobile-money-accounts/{uuid}. */
export function useUnlinkMobileMoneyAccount(): UseMutationResult<
  null,
  ApiError,
  string
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => unlinkMobileMoneyAccount(uuid),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.mobileMoneyAccounts,
      });
    },
  });
}

/** PUT /api/mobile-money-accounts/{uuid}/primary. */
export function useSetPrimaryMobileMoneyAccount(): UseMutationResult<
  MobileMoneyAccount,
  ApiError,
  string
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => setPrimaryMobileMoneyAccount(uuid),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.mobileMoneyAccounts,
      });
    },
  });
}

// ---- Deposits ----------------------------------------------------------

/** POST /api/deposits — initiate a pay-in and receive the deposit record. */
export function useCreateDeposit(): UseMutationResult<
  Deposit,
  ApiError,
  CreateDepositInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDepositInput) => createDeposit(input),
    onSuccess: (deposit) => {
      queryClient.setQueryData(queryKeys.deposit(deposit.uuid), deposit);
    },
  });
}

/**
 * GET /api/deposits/{uuid} with polling: re-fetches every few seconds while the
 * deposit is still open and stops as soon as it reaches a final status, then
 * refreshes the wallet balance. Disabled while `uuid` is null.
 */
export function useDeposit(
  uuid: string | null,
): UseQueryResult<Deposit, ApiError> {
  const queryClient = useQueryClient();
  return useQuery<Deposit, ApiError>({
    queryKey: uuid ? queryKeys.deposit(uuid) : ["deposits", "idle"],
    queryFn: async () => {
      const deposit = await fetchDeposit(uuid as string);
      if (isDepositFinal(deposit.status)) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
      }
      return deposit;
    },
    enabled: uuid !== null,
    refetchInterval: (query) =>
      pollInterval(
        query.state.dataUpdateCount,
        query.state.data?.status,
        isDepositFinal,
      ),
  });
}

// ---- Withdrawals -------------------------------------------------------

/**
 * GET /api/withdrawals/quote — fee and real debit for an operator/amount. Kept
 * disabled until an amount is entered and an operator picked.
 */
export function useWithdrawalQuote(
  operator: string | null,
  amountMinor: number,
): UseQueryResult<WithdrawalQuote, ApiError> {
  return useQuery<WithdrawalQuote, ApiError>({
    queryKey: queryKeys.withdrawalQuote(operator ?? "", amountMinor),
    queryFn: () =>
      fetchWithdrawalQuote({
        operator: operator as string,
        amount_minor: amountMinor,
      }),
    enabled: operator !== null && amountMinor > 0,
    staleTime: 30_000,
  });
}

/**
 * POST /api/withdrawals — initiate a payout with the `withdraw` PIN ticket in
 * the `X-Pin-Ticket` header.
 */
export function useCreateWithdrawal(): UseMutationResult<
  Withdrawal,
  ApiError,
  { input: CreateWithdrawalInput; pinTicket: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, pinTicket }) => createWithdrawal(input, pinTicket),
    onSuccess: (withdrawal) => {
      queryClient.setQueryData(
        queryKeys.withdrawal(withdrawal.uuid),
        withdrawal,
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
    },
  });
}

/** GET /api/withdrawals/{uuid} with polling until a final status. */
export function useWithdrawal(
  uuid: string | null,
): UseQueryResult<Withdrawal, ApiError> {
  const queryClient = useQueryClient();
  return useQuery<Withdrawal, ApiError>({
    queryKey: uuid ? queryKeys.withdrawal(uuid) : ["withdrawals", "idle"],
    queryFn: async () => {
      const withdrawal = await fetchWithdrawal(uuid as string);
      if (isWithdrawalFinal(withdrawal.status)) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
      }
      return withdrawal;
    },
    enabled: uuid !== null,
    refetchInterval: (query) =>
      pollInterval(
        query.state.dataUpdateCount,
        query.state.data?.status,
        isWithdrawalFinal,
      ),
  });
}
