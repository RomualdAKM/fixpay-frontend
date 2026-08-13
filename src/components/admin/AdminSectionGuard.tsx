"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useAuth } from "@/lib/auth";
import { hasAnyPermission, type PermissionSlug } from "@/lib/admin/permissions";

/**
 * Section-level access gate. A back-office section requires ONE of the given
 * permissions (the same slugs its API routes check with `permission:*`); a user
 * admitted to the shell by another permission but holding none of these sees an
 * honest "accès refusé", never a broken half-page. An array admits a section
 * whose per-action affordances are split across roles (e.g. a merchant-credit
 * maker who cannot manage merchants): the action-level `PermissionGate` still
 * hides each individual write affordance on top of this.
 */
export function AdminSectionGuard({
  permission,
  children,
}: {
  permission: PermissionSlug | readonly PermissionSlug[];
  children: ReactNode;
}) {
  const { user } = useAuth();
  const permissions =
    typeof permission === "string" ? [permission] : permission;

  if (!hasAnyPermission(user, permissions)) {
    return (
      <div
        role="alert"
        className="border-border bg-bg-raised flex flex-col items-center justify-center gap-2 rounded-lg border px-6 py-16 text-center"
      >
        <p className="text-text text-[16px] font-semibold">Accès refusé</p>
        <p className="text-text-muted max-w-[360px] text-[14px] leading-[20px]">
          Cette section requiert une permission que votre compte ne détient pas.
        </p>
        <Link
          href="/admin"
          className="text-primary mt-1 text-[14px] font-semibold hover:underline"
        >
          Retour à la vue d&apos;ensemble
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
