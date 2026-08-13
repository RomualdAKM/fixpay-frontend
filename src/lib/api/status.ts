/**
 * Terminal-state helpers for the money flows, mirroring the backend enums
 * App\Domain\Zayono\DepositStatus and WithdrawalStatus (`isFinal()`). The front
 * polls a deposit/withdrawal until its status reaches one of these, then stops.
 */

/** Deposit states past which no further transition happens. */
export const DEPOSIT_FINAL_STATUSES = [
  "success",
  "failed",
  "cancelled",
  "refunded",
] as const;

/** Withdrawal states past which no further transition happens. */
export const WITHDRAWAL_FINAL_STATUSES = [
  "success",
  "failed",
  "cancelled",
  "rejected",
] as const;

export function isDepositFinal(status: string): boolean {
  return (DEPOSIT_FINAL_STATUSES as readonly string[]).includes(status);
}

export function isWithdrawalFinal(status: string): boolean {
  return (WITHDRAWAL_FINAL_STATUSES as readonly string[]).includes(status);
}

/** A withdrawal awaiting maker-checker approval (not yet dispatched). */
export function isWithdrawalPendingApproval(status: string): boolean {
  return status === "pending_approval";
}

/**
 * Terminal states of an async card order (issuance, recharge, cashout),
 * mirroring App\Domain\Card\Card*State::isFinal(). `pending` is the only
 * non-final state.
 */
export const CARD_ORDER_FINAL_STATES = ["success", "failed"] as const;

export function isCardOrderFinal(state: string): boolean {
  return (CARD_ORDER_FINAL_STATES as readonly string[]).includes(state);
}

/**
 * Referral payout states, mirroring App\Domain\Referral\ReferralPayoutStatus.
 * `completed` means the balance reached the wallet; `pending` means the payout
 * is awaiting maker-checker approval (referral.payout_requires_approval).
 */
export function isReferralPayoutSettled(status: string): boolean {
  return status === "completed";
}

export function isReferralPayoutPendingApproval(status: string): boolean {
  return status === "pending";
}
