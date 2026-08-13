import { apiFetch } from "./client";
import type {
  Card,
  CardTransaction,
  LoginInput,
  LoginResult,
  MobileMoneyAccount,
  NotificationList,
  Paginated,
  PinTicket,
  Referral,
  RegisterInput,
  User,
  VerifyPinInput,
  Wallet,
  WalletTransaction,
} from "./types";

/**
 * Typed endpoint functions. Each returns the unwrapped `data` of its envelope.
 * The auth + PIN endpoints are wired now; the read endpoints for the 24
 * business screens are declared here so the wiring lot only has to add hooks.
 */

// ---- Auth --------------------------------------------------------------

/** POST /api/register — 202, `data: null`. Fields per RegisterRequest. */
export function register(input: RegisterInput): Promise<null> {
  return apiFetch<null>("/register", { method: "POST", body: input });
}

/** POST /api/login — `data: { token, user }`. The token is not persisted. */
export function login(input: LoginInput): Promise<LoginResult> {
  return apiFetch<LoginResult>("/login", { method: "POST", body: input });
}

/** POST /api/logout — invalidates the session/token. */
export function logout(): Promise<null> {
  return apiFetch<null>("/logout", { method: "POST" });
}

/** GET /api/me — the current user (401 when unauthenticated). */
export function fetchMe(): Promise<User> {
  return apiFetch<User>("/me");
}

/** POST /api/email/verification-notification — resend the verification link. */
export function resendVerificationEmail(): Promise<null> {
  return apiFetch<null>("/email/verification-notification", { method: "POST" });
}

// ---- PIN ---------------------------------------------------------------

/** POST /api/pin — set the transactional PIN (4–6 digits). */
export function setPin(pin: string): Promise<null> {
  return apiFetch<null>("/pin", { method: "POST", body: { pin } });
}

/**
 * POST /api/pin/verify — exchange the PIN for a single-use, short-lived ticket
 * scoped to an action (and optionally a resource + amount). The returned
 * `ticket` is passed as `X-Pin-Ticket` on the subsequent money operation and is
 * never stored.
 */
export function verifyPin(input: VerifyPinInput): Promise<PinTicket> {
  return apiFetch<PinTicket>("/pin/verify", { method: "POST", body: input });
}

// ---- Wallet / user data (wired in the next lot) ------------------------

export function fetchWallet(): Promise<Wallet> {
  return apiFetch<Wallet>("/wallet");
}

export function fetchWalletTransactions(): Promise<
  Paginated<WalletTransaction>
> {
  return apiFetch<Paginated<WalletTransaction>>("/wallet/transactions");
}

export function fetchCards(): Promise<Card[]> {
  return apiFetch<Card[]>("/cards");
}

export function fetchCardTransactions(uuid: string): Promise<CardTransaction[]> {
  return apiFetch<CardTransaction[]>(`/cards/${uuid}/transactions`);
}

export function fetchReferral(): Promise<Referral> {
  return apiFetch<Referral>("/referral");
}

export function fetchNotifications(): Promise<NotificationList> {
  return apiFetch<NotificationList>("/notifications");
}

export function fetchMobileMoneyAccounts(): Promise<{
  items: MobileMoneyAccount[];
}> {
  return apiFetch<{ items: MobileMoneyAccount[] }>("/mobile-money-accounts");
}
