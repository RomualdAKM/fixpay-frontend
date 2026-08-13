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
  fetchMe,
  login,
  logout,
  register,
  setPin,
  verifyPin,
} from "./endpoints";
import type {
  LoginInput,
  LoginResult,
  PinTicket,
  RegisterInput,
  User,
  VerifyPinInput,
} from "./types";

/**
 * Base data hooks over the API. Loading/error are surfaced uniformly through
 * React Query's `status`/`error`, where `error` is always an `ApiError`.
 */

/**
 * GET /api/me. A 401 resolves to `null` (guest) instead of an error state, so
 * consumers can branch on the value without inspecting the error.
 */
export function useMe(): UseQueryResult<User | null, ApiError> {
  return useQuery<User | null, ApiError>({
    queryKey: queryKeys.me,
    queryFn: async () => {
      try {
        return await fetchMe();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
  });
}

/** POST /api/login. On success primes the `me` cache with the returned user. */
export function useLogin(): UseMutationResult<LoginResult, ApiError, LoginInput> {
  const queryClient = useQueryClient();
  return useMutation<LoginResult, ApiError, LoginInput>({
    mutationFn: (input) => login(input),
    onSuccess: (result) => {
      queryClient.setQueryData(queryKeys.me, result.user);
    },
  });
}

/** POST /api/register — no session is established (email verification first). */
export function useRegister(): UseMutationResult<null, ApiError, RegisterInput> {
  return useMutation<null, ApiError, RegisterInput>({
    mutationFn: (input) => register(input),
  });
}

/**
 * POST /api/logout. Purging the client session is fail-safe: it runs in
 * `onSettled`, so the user always drops to guest even when the server call
 * rejects (expired session → 401, desynced CSRF → 419, network failure). The
 * server-side invalidation is best-effort; the client must never keep the
 * previous user's cached data around because the request failed.
 */
export function useLogout(): UseMutationResult<null, ApiError, void> {
  const queryClient = useQueryClient();
  return useMutation<null, ApiError, void>({
    mutationFn: () => logout(),
    onSettled: () => {
      queryClient.setQueryData(queryKeys.me, null);
      queryClient.clear();
    },
  });
}

/** POST /api/pin — set the transactional PIN. */
export function useSetPin(): UseMutationResult<null, ApiError, string> {
  return useMutation<null, ApiError, string>({
    mutationFn: (pin) => setPin(pin),
  });
}

/**
 * POST /api/pin/verify — obtain a single-use ticket. The result is returned to
 * the caller and deliberately NOT cached: a ticket is one-shot and short-lived.
 */
export function useVerifyPin(): UseMutationResult<
  PinTicket,
  ApiError,
  VerifyPinInput
> {
  return useMutation<PinTicket, ApiError, VerifyPinInput>({
    mutationFn: (input) => verifyPin(input),
  });
}
