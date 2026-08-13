import type { User } from "@/lib/api/types";

/**
 * The admin permission slugs, mirroring App\Domain\Authorization\Permission.
 * Every admin route and action is gated on the exact slug the backend checks
 * with `permission:*`, so the UI never offers an action the API would reject.
 */
export const Permission = {
  KycReview: "kyc.review",
  PayoutApprove: "payout.approve",
  ConfigRead: "config.read",
  ConfigWrite: "config.write",
  ConfigApprove: "config.approve",
  MerchantManage: "merchant.manage",
  MerchantCredit: "merchant.credit",
  MerchantCreditApprove: "merchant.credit.approve",
  CardRevealPan: "card.reveal_pan",
  UserManage: "user.manage",
  LedgerRead: "ledger.read",
  AuditRead: "audit.read",
} as const;

export type PermissionSlug = (typeof Permission)[keyof typeof Permission];

/**
 * Permissions that grant access to SOME part of the back-office. A user holding
 * none of these has no business on `/admin` and is refused by `AdminGuard`.
 * (Deliberately the union across every admin section — this lot ships config +
 * approvals + overview; ledger/kyc/merchant screens are a later lot but their
 * bearers still belong in the shell.)
 *
 * `card.reveal_pan` and `user.manage` are intentionally EXCLUDED: no admin
 * screen consumes either yet, so a would-be holder is fail-closed out of the
 * shell rather than dropped into an empty, 403-erroring back-office. Add each
 * here in the same lot that ships its landing screen, never before.
 */
export const ADMIN_PERMISSIONS: readonly PermissionSlug[] = [
  Permission.ConfigRead,
  Permission.ConfigWrite,
  Permission.ConfigApprove,
  Permission.MerchantCreditApprove,
  Permission.MerchantManage,
  Permission.MerchantCredit,
  Permission.KycReview,
  Permission.LedgerRead,
  Permission.AuditRead,
  Permission.PayoutApprove,
];

/** True when the user holds the given permission slug. Null-safe (guest → false). */
export function hasPermission(
  user: User | null | undefined,
  permission: PermissionSlug,
): boolean {
  return user?.permissions?.includes(permission) ?? false;
}

/** True when the user holds AT LEAST ONE of the given permission slugs. */
export function hasAnyPermission(
  user: User | null | undefined,
  permissions: readonly PermissionSlug[],
): boolean {
  return permissions.some((permission) => hasPermission(user, permission));
}

/** True when the user may enter the back-office at all (any admin permission). */
export function hasAnyAdminPermission(user: User | null | undefined): boolean {
  return hasAnyPermission(user, ADMIN_PERMISSIONS);
}
