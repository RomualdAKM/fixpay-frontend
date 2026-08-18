import { apiFetch } from "./client";
import type {
  Card,
  CardCashout,
  CardCashoutQuote,
  CardIssuanceOrder,
  CardOffer,
  CardRecharge,
  CardRechargeQuote,
  CardReveal,
  CardTransaction,
  CashoutCardInput,
  CreateDepositInput,
  IssueCardInput,
  RechargeCardInput,
  CreateWithdrawalInput,
  Deposit,
  KycProfile,
  LinkMobileMoneyAccountInput,
  LoginInput,
  LoginResult,
  MobileMoneyAccount,
  NotificationItem,
  NotificationList,
  Operator,
  OperatorPurpose,
  Paginated,
  PinTicket,
  Referral,
  ReferralPayout,
  RegisterInput,
  ResetPasswordInput,
  SubmitKycInput,
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
export async function login(input: LoginInput): Promise<LoginResult> {
  const { user } = await apiFetch<{ token: string; user: User }>("/login", {
    method: "POST",
    body: input,
  });
  return { user };
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

/**
 * POST /api/forgot-password — request a reset link. The backend ALWAYS answers
 * neutrally (anti-enumeration), so this never reveals whether the address is
 * registered; the caller shows the same confirmation either way.
 */
export function forgotPassword(email: string): Promise<null> {
  return apiFetch<null>("/forgot-password", { method: "POST", body: { email } });
}

/** POST /api/reset-password — set a new password from the emailed token. */
export function resetPassword(input: ResetPasswordInput): Promise<null> {
  return apiFetch<null>("/reset-password", { method: "POST", body: input });
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

// ---- Cards -------------------------------------------------------------

/** GET /api/cards — the user's cards (newest first). */
export function fetchCards(): Promise<Card[]> {
  return apiFetch<Card[]>("/cards");
}

/** GET /api/cards/{uuid} — a single card (404 when not owned). */
export function fetchCard(uuid: string): Promise<Card> {
  return apiFetch<Card>(`/cards/${uuid}`);
}

/** GET /api/cards/{uuid}/transactions — a FLAT array of card transactions. */
export function fetchCardTransactions(uuid: string): Promise<CardTransaction[]> {
  return apiFetch<CardTransaction[]>(`/cards/${uuid}/transactions`);
}

/** GET /api/card-offers — issuable BINs with their XOF issuance price. */
export function fetchCardOffers(): Promise<CardOffer[]> {
  return apiFetch<CardOffer[]>("/card-offers");
}

/**
 * POST /api/cards — start an asynchronous card issuance. Guarded by
 * `pin.ticket:card_issue`, so the caller passes the `card_issue` ticket.
 */
export function issueCard(
  input: IssueCardInput,
  pinTicket: string,
): Promise<CardIssuanceOrder> {
  return apiFetch<CardIssuanceOrder>("/cards", {
    method: "POST",
    body: input,
    pinTicket,
  });
}

/** GET /api/cards/{uuid}/recharge/quote — USD credit and XOF wallet debit. */
export function fetchCardRechargeQuote(
  uuid: string,
  amountUsdMinor: number,
): Promise<CardRechargeQuote> {
  const query = new URLSearchParams({
    amount_usd_minor: String(amountUsdMinor),
  });
  return apiFetch<CardRechargeQuote>(
    `/cards/${uuid}/recharge/quote?${query.toString()}`,
  );
}

/**
 * POST /api/cards/{uuid}/recharge — fund a card from the XOF wallet. Guarded by
 * `pin.ticket:card_recharge,card,uuid`; the ticket is scoped to the card.
 */
export function rechargeCard(
  uuid: string,
  input: RechargeCardInput,
  pinTicket: string,
): Promise<CardRecharge> {
  return apiFetch<CardRecharge>(`/cards/${uuid}/recharge`, {
    method: "POST",
    body: input,
    pinTicket,
  });
}

/** GET /api/cards/{uuid}/cashout/quote — USD debit and XOF wallet credit. */
export function fetchCardCashoutQuote(
  uuid: string,
  amountUsdMinor: number,
): Promise<CardCashoutQuote> {
  const query = new URLSearchParams({
    amount_usd_minor: String(amountUsdMinor),
  });
  return apiFetch<CardCashoutQuote>(
    `/cards/${uuid}/cashout/quote?${query.toString()}`,
  );
}

/**
 * POST /api/cards/{uuid}/cashout — repatriate USD from a card to the XOF wallet.
 * Guarded by `pin.ticket:card_cashout,card,uuid`.
 */
export function cashoutCard(
  uuid: string,
  input: CashoutCardInput,
  pinTicket: string,
): Promise<CardCashout> {
  return apiFetch<CardCashout>(`/cards/${uuid}/cashout`, {
    method: "POST",
    body: input,
    pinTicket,
  });
}

/**
 * POST /api/cards/{uuid}/reveal — return the short-lived PAN/CVV/expiry. Guarded
 * by `pin.ticket:reveal_pan,card,uuid`. The response is `no-store`; the caller
 * MUST never persist, cache or log the secrets.
 */
export function revealCard(
  uuid: string,
  pinTicket: string,
): Promise<CardReveal> {
  return apiFetch<CardReveal>(`/cards/${uuid}/reveal`, {
    method: "POST",
    pinTicket,
  });
}

/** POST /api/cards/{uuid}/suspend — freeze a card. */
export function suspendCard(uuid: string): Promise<Card> {
  return apiFetch<Card>(`/cards/${uuid}/suspend`, { method: "POST" });
}

/** POST /api/cards/{uuid}/enable — unfreeze a card. */
export function enableCard(uuid: string): Promise<Card> {
  return apiFetch<Card>(`/cards/${uuid}/enable`, { method: "POST" });
}

/** POST /api/cards/{uuid}/cancel — cancel a card for good. */
export function cancelCard(uuid: string): Promise<Card> {
  return apiFetch<Card>(`/cards/${uuid}/cancel`, { method: "POST" });
}

/** GET /api/cards/{uuid}/recharges/{ruuid} — poll a recharge until a final state. */
export function fetchCardRechargeStatus(
  uuid: string,
  rechargeUuid: string,
): Promise<CardRecharge> {
  return apiFetch<CardRecharge>(`/cards/${uuid}/recharges/${rechargeUuid}`);
}

/** GET /api/cards/{uuid}/cashouts/{cuuid} — poll a cashout until a final state. */
export function fetchCardCashoutStatus(
  uuid: string,
  cashoutUuid: string,
): Promise<CardCashout> {
  return apiFetch<CardCashout>(`/cards/${uuid}/cashouts/${cashoutUuid}`);
}

// ---- KYC ---------------------------------------------------------------

/** GET /api/kyc — the current user's KYC profile status. */
export function fetchKyc(): Promise<KycProfile> {
  return apiFetch<KycProfile>("/kyc");
}

/** Build the multipart body POST /api/kyc expects (the three named files). */
export function buildKycFormData(input: SubmitKycInput): FormData {
  const form = new FormData();
  form.append("id_front", input.id_front);
  form.append("id_back", input.id_back);
  form.append("selfie", input.selfie);
  return form;
}

/**
 * POST /api/kyc — submit the identity documents as multipart FormData. The
 * status transitions to `pending`; the updated profile is returned.
 */
export function submitKyc(input: SubmitKycInput): Promise<KycProfile> {
  return apiFetch<KycProfile>("/kyc", {
    method: "POST",
    body: buildKycFormData(input),
  });
}

// ---- Referral ----------------------------------------------------------

/** GET /api/referral — code, link, referees and the available commission balance. */
export function fetchReferral(): Promise<Referral> {
  return apiFetch<Referral>("/referral");
}

/**
 * POST /api/referral/payouts — sweep the available referral balance to the
 * wallet. Guarded by `pin.ticket:referral_payout` (no amount bound), so the
 * caller passes the `referral_payout` ticket.
 */
export function payoutReferral(pinTicket: string): Promise<ReferralPayout> {
  return apiFetch<ReferralPayout>("/referral/payouts", {
    method: "POST",
    pinTicket,
  });
}

// ---- Notifications -----------------------------------------------------

/** GET /api/notifications — recent notifications and the unread count. */
export function fetchNotifications(limit?: number): Promise<NotificationList> {
  const query = limit ? `?limit=${limit}` : "";
  return apiFetch<NotificationList>(`/notifications${query}`);
}

/** POST /api/notifications/{id}/read — mark one notification as read. */
export function markNotificationRead(
  id: string,
): Promise<{ notification: NotificationItem }> {
  return apiFetch<{ notification: NotificationItem }>(
    `/notifications/${id}/read`,
    { method: "POST" },
  );
}

/** POST /api/notifications/read-all — mark every notification as read. */
export function markAllNotificationsRead(): Promise<{ unread_count: number }> {
  return apiFetch<{ unread_count: number }>("/notifications/read-all", {
    method: "POST",
  });
}

export function fetchMobileMoneyAccounts(): Promise<{
  items: MobileMoneyAccount[];
}> {
  return apiFetch<{ items: MobileMoneyAccount[] }>("/mobile-money-accounts");
}
