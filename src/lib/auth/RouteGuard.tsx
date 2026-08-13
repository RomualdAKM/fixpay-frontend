"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "./AuthProvider";

interface RouteGuardProps {
  children: ReactNode;
  /**
   * Minimum KYC level required to view the wrapped subtree. When the user's
   * `kyc_level` is below this, they are redirected to `/profile/kyc`.
   */
  requireKycLevel?: number;
  /**
   * Require the transactional PIN to be set. NOTE: GET /api/me does not
   * currently expose a `pin_set` flag, so this branch is inert until the
   * backend adds one; the hook is wired so the wiring lot only flips a field.
   */
  requirePin?: boolean;
}

/** Full-viewport centered wait state shown while GET /api/me is in flight. */
function AuthLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-bg flex min-h-dvh items-center justify-center"
    >
      <span
        aria-hidden="true"
        className="border-border-strong border-t-primary size-7 animate-spin rounded-full border-2"
      />
      <span className="sr-only">Chargement…</span>
    </div>
  );
}

/**
 * Shown when the session could not be verified (5xx / network blip). The
 * session may still be valid, so we offer a retry instead of dropping the user
 * to /login — a momentary backend hiccup must not read as a logout.
 */
function AuthError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="bg-bg flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <p className="text-text max-w-[300px] text-[15px] leading-[22px]">
        Impossible de vérifier votre session. Vérifiez votre connexion.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="border-border bg-surface text-text hover:bg-surface-2 focus-visible:ring-primary/60 flex h-11 items-center justify-center rounded-md border px-6 text-[14px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        Réessayer
      </button>
    </div>
  );
}

/**
 * Client-side guard for the protected app subtree.
 *
 * While auth is bootstrapping it renders a light wait state (avoids both a
 * flash of protected content and a blank screen on slow networks). Once
 * resolved: a guest is redirected to `/login` (carrying the attempted path in
 * `?next=` so login can return them there); a verification failure shows a
 * retry affordance rather than a redirect; an authenticated user missing a
 * required KYC level is sent to `/profile/kyc`. The middleware provides only a
 * coarse first pass — this guard is authoritative because it is driven by the
 * actual GET /api/me verdict.
 */
export function RouteGuard({
  children,
  requireKycLevel,
  requirePin = false,
}: RouteGuardProps) {
  const { status, user, refetch } = useAuth();
  const router = useRouter();

  const needsKyc =
    status === "authenticated" &&
    requireKycLevel !== undefined &&
    user !== null &&
    user.kyc_level < requireKycLevel;

  useEffect(() => {
    if (status === "guest") {
      // Preserve the deep-link destination so login can return the user here,
      // mirroring middleware.ts's `?next=` behavior.
      const next =
        typeof window === "undefined" ? "/" : window.location.pathname;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    if (needsKyc) {
      router.replace("/profile/kyc");
    }
  }, [status, needsKyc, router]);

  // Placeholder for the future PIN gate (see requirePin doc above).
  void requirePin;

  if (status === "loading") return <AuthLoading />;
  if (status === "error") {
    return <AuthError onRetry={() => void refetch()} />;
  }
  if (status !== "authenticated") return null;
  if (needsKyc) return null;

  return <>{children}</>;
}
