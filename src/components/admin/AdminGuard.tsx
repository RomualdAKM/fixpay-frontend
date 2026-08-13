"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/lib/auth";
import { hasAnyAdminPermission } from "@/lib/admin/permissions";

/** Full-viewport centered wait while GET /api/me is in flight. */
function AdminLoading() {
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

/** Retry affordance shown when GET /api/me could not be resolved (5xx/network). */
function AdminSessionError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="bg-bg flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <p className="text-text max-w-[320px] text-[15px] leading-[22px]">
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
 * The back-office is admin-only. A user carrying NO admin permission has no
 * business here: they see an honest "access refused" rather than a broken
 * shell. A guest is bounced to /login (carrying the deep link in `?next=`), a
 * session-verification failure offers a retry.
 */
function AdminForbidden() {
  return (
    <div
      role="alert"
      className="bg-bg flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center"
    >
      <p className="text-text text-[17px] font-semibold">Accès refusé</p>
      <p className="text-text-muted max-w-[340px] text-[14px] leading-[20px]">
        Votre compte n&apos;a aucune permission d&apos;administration. Cet espace
        est réservé aux équipes FixPay.
      </p>
      <Link
        href="/"
        className="text-primary mt-1 text-[14px] font-semibold hover:underline"
      >
        Retour à l&apos;application
      </Link>
    </div>
  );
}

/**
 * Authoritative client-side guard for `/admin`. Driven by the real GET /api/me
 * verdict (not the coarse middleware): loading → wait, guest → /login,
 * verification error → retry, authenticated-without-admin-permission → refused.
 * Only a user holding at least one admin permission reaches the shell.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { status, user, refetch } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "guest") {
      const next =
        typeof window === "undefined" ? "/admin" : window.location.pathname;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [status, router]);

  if (status === "loading") return <AdminLoading />;
  if (status === "error") return <AdminSessionError onRetry={() => void refetch()} />;
  if (status !== "authenticated") return null;
  if (!hasAnyAdminPermission(user)) return <AdminForbidden />;

  return <>{children}</>;
}
