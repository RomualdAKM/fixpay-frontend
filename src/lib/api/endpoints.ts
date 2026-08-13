import { apiFetch } from "./client";
import type {
  Card,
  CardTransaction,
  CreateDepositInput,
  CreateWithdrawalInput,
  Deposit,
  LinkMobileMoneyAccountInput,
  LoginInput,
  LoginResult,
  MobileMoneyAccount,
  NotificationList,
  Operator,
  OperatorPurpose,
  Paginated,
  PinTicket,
  Referral,
  RegisterInput,
  User,
  VerifyPinInput,
  Wallet,
  WalletTransaction,
  Withdrawal,
  WithdrawalQuote,
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

export function fetchWalletTransactions(
  page = 1,
): Promise<Paginated<WalletTransaction>> {
  return apiFetch<Paginated<WalletTransaction>>(
    `/wallet/transactions?page=${page}`,
  );
}

/** GET /api/operators — curated Mobile Money operators, optionally by purpose. */
export function fetchOperators(purpose?: OperatorPurpose): Promise<Operator[]> {
  const query = purpose ? `?purpose=${purpose}` : "";
  return apiFetch<Operator[]>(`/operators${query}`);
}

// ---- Mobile Money accounts ---------------------------------------------

/**
 * POST /api/mobile-money-accounts — link an account. Guarded by
 * `pin.ticket:link_mm_account`, so a fresh PIN ticket is required.
 */
export function linkMobileMoneyAccount(
  input: LinkMobileMoneyAccountInput,
  pinTicket: string,
): Promise<MobileMoneyAccount> {
  return apiFetch<MobileMoneyAccount>("/mobile-money-accounts", {
    method: "POST",
    body: input,
    pinTicket,
  });
}

/** DELETE /api/mobile-money-accounts/{uuid} — unlink an account. */
export function unlinkMobileMoneyAccount(uuid: string): Promise<null> {
  return apiFetch<null>(`/mobile-money-accounts/${uuid}`, { method: "DELETE" });
}

/** PUT /api/mobile-money-accounts/{uuid}/primary — mark as the primary account. */
export function setPrimaryMobileMoneyAccount(
  uuid: string,
): Promise<MobileMoneyAccount> {
  return apiFetch<MobileMoneyAccount>(
    `/mobile-money-accounts/${uuid}/primary`,
    { method: "PUT" },
  );
}

// ---- Deposits ----------------------------------------------------------

/** POST /api/deposits — initiate a Mobile Money pay-in. */
export function createDeposit(input: CreateDepositInput): Promise<Deposit> {
  return apiFetch<Deposit>("/deposits", { method: "POST", body: input });
}

/** GET /api/deposits/{uuid} — poll a deposit until a final status. */
export function fetchDeposit(uuid: string): Promise<Deposit> {
  return apiFetch<Deposit>(`/deposits/${uuid}`);
}

// ---- Withdrawals -------------------------------------------------------

/** GET /api/withdrawals/quote — fee breakdown and real wallet debit. */
export function fetchWithdrawalQuote(params: {
  operator: string;
  amount_minor: number;
}): Promise<WithdrawalQuote> {
  const query = new URLSearchParams({
    operator: params.operator,
    amount_minor: String(params.amount_minor),
  });
  return apiFetch<WithdrawalQuote>(`/withdrawals/quote?${query.toString()}`);
}

/**
 * POST /api/withdrawals — initiate a payout. Guarded by `pin.ticket:withdraw`,
 * so the caller must pass the ticket issued for the `withdraw` action.
 */
export function createWithdrawal(
  input: CreateWithdrawalInput,
  pinTicket: string,
): Promise<Withdrawal> {
  return apiFetch<Withdrawal>("/withdrawals", {
    method: "POST",
    body: input,
    pinTicket,
  });
}

/** GET /api/withdrawals/{uuid} — poll a withdrawal until a final status. */
export function fetchWithdrawal(uuid: string): Promise<Withdrawal> {
  return apiFetch<Withdrawal>(`/withdrawals/${uuid}`);
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
