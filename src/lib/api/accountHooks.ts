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
  fetchKyc,
  fetchNotifications,
  fetchReferral,
  markAllNotificationsRead,
  markNotificationRead,
  payoutReferral,
  submitKyc,
} from "./endpoints";
import type {
  KycProfile,
  NotificationList,
  Referral,
  ReferralPayout,
  SubmitKycInput,
} from "./types";

// ---- KYC ---------------------------------------------------------------

/** GET /api/kyc — the user's verification profile (status, level, reason). */
export function useKyc(): UseQueryResult<KycProfile, ApiError> {
  return useQuery<KycProfile, ApiError>({
    queryKey: queryKeys.kyc,
    queryFn: () => fetchKyc(),
  });
}

/**
 * POST /api/kyc — submit the identity documents (multipart). On success the
 * fresh profile (now `pending`) is written to the cache and `me` is invalidated
 * so any KYC-driven banner re-reads the real level once it changes.
 */
export function useSubmitKyc(): UseMutationResult<
  KycProfile,
  ApiError,
  SubmitKycInput
> {
  const queryClient = useQueryClient();
  return useMutation<KycProfile, ApiError, SubmitKycInput>({
    mutationFn: (input) => submitKyc(input),
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.kyc, profile);
      void queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}

// ---- Referral ----------------------------------------------------------

/** GET /api/referral — code, link, referees and the available balance. */
export function useReferral(): UseQueryResult<Referral, ApiError> {
  return useQuery<Referral, ApiError>({
    queryKey: queryKeys.referral,
    queryFn: () => fetchReferral(),
  });
}

/**
 * POST /api/referral/payouts — sweep the available referral balance to the
 * wallet. Requires the `referral_payout` PIN ticket (no amount bound), supplied
 * by the caller. On success the referral balance and wallet are refreshed; a
 * `pending` result means the payout awaits approval and is surfaced as such.
 */
export function usePayoutReferral(): UseMutationResult<
  ReferralPayout,
  ApiError,
  { pinTicket: string }
> {
  const queryClient = useQueryClient();
  return useMutation<ReferralPayout, ApiError, { pinTicket: string }>({
    mutationFn: ({ pinTicket }) => payoutReferral(pinTicket),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.referral });
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
    },
  });
}

// ---- Notifications -----------------------------------------------------

/** GET /api/notifications — recent notifications and the unread count. */
export function useNotifications(
  limit?: number,
): UseQueryResult<NotificationList, ApiError> {
  return useQuery<NotificationList, ApiError>({
    queryKey: limit ? [...queryKeys.notifications, limit] : queryKeys.notifications,
    queryFn: () => fetchNotifications(limit),
  });
}

/**
 * POST /api/notifications/{id}/read. The list is invalidated so the read state
 * and the unread badge are recomputed from the server, never guessed.
 */
export function useMarkNotificationRead(): UseMutationResult<
  void,
  ApiError,
  string
> {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: async (id) => {
      await markNotificationRead(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

/** POST /api/notifications/read-all — clear the whole unread badge. */
export function useMarkAllNotificationsRead(): UseMutationResult<
  void,
  ApiError,
  void
> {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, void>({
    mutationFn: async () => {
      await markAllNotificationsRead();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}
