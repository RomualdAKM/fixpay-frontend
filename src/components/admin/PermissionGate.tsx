"use client";

import type { ReactNode } from "react";

import { useAuth } from "@/lib/auth";
import { hasPermission, type PermissionSlug } from "@/lib/admin/permissions";

interface PermissionGateProps {
  permission: PermissionSlug;
  children: ReactNode;
  /** Rendered instead when the user lacks the permission (default: nothing). */
  fallback?: ReactNode;
}

/**
 * Renders `children` only when the current user holds `permission`. The default
 * fallback is nothing — a write action the user cannot perform is simply not
 * shown, per "chaque action masquée/désactivée sans la permission".
 */
export function PermissionGate({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { user } = useAuth();
  return <>{hasPermission(user, permission) ? children : fallback}</>;
}
