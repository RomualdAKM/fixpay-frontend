"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import { useLogin, useLogout, useMe, useRegister } from "@/lib/api/hooks";
import type { LoginInput, RegisterInput, User } from "@/lib/api/types";

/**
 * Bootstrap phase, then a verdict. `error` is distinct from `guest`: it means
 * GET /api/me could not be resolved (5xx, network failure) — the session may
 * well be intact — so the app must offer a retry instead of treating the user
 * as logged out. Only a real 401 (mapped to `null` by `useMe`) yields `guest`.
 */
export type AuthStatus = "loading" | "authenticated" | "guest" | "error";

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  /** Authenticate, then resolve — throws `ApiError` on failure (422/401). */
  login: (input: LoginInput) => Promise<User>;
  /** Register — resolves when the verification email is queued. */
  register: (input: RegisterInput) => Promise<void>;
  /** Invalidate the session and clear the client cache. */
  logout: () => Promise<void>;
  /** Re-run GET /api/me (e.g. after email verification or PIN set). */
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Bootstraps auth on mount via GET /api/me: a 200 → authenticated, a 401 →
 * guest. Exposes the current user, a coarse `status`, and the auth actions.
 * Session state lives in the httpOnly cookie; nothing is stored in JS storage.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const meQuery = useMe();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const status: AuthStatus = meQuery.isPending
    ? "loading"
    : meQuery.isError
      ? "error"
      : meQuery.data
        ? "authenticated"
        : "guest";

  const login = useCallback(
    async (input: LoginInput): Promise<User> => {
      const result = await loginMutation.mutateAsync(input);
      return result.user;
    },
    [loginMutation],
  );

  const register = useCallback(
    async (input: RegisterInput): Promise<void> => {
      await registerMutation.mutateAsync(input);
    },
    [registerMutation],
  );

  const logout = useCallback(async (): Promise<void> => {
    // Server invalidation is best-effort; the client cache is purged in the
    // mutation's `onSettled` regardless of outcome. A rejected call (dead
    // session → 401, desynced CSRF → 419, offline) must still resolve to a
    // clean guest state for the caller, never surface as an error.
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Swallowed on purpose: the local session has already been dropped.
    }
  }, [logoutMutation]);

  const refetch = useCallback(async (): Promise<void> => {
    await meQuery.refetch();
  }, [meQuery]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: meQuery.data ?? null,
      status,
      login,
      register,
      logout,
      refetch,
    }),
    [meQuery.data, status, login, register, logout, refetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access the auth context. Throws when used outside `AuthProvider`. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
