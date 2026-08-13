/**
 * TypeScript mirrors of the Laravel API resources.
 *
 * Every shape here was read from the backend (app/Http/Controllers/**,
 * app/Http/Resources/**, app/Support/MoneyPresenter.php,
 * app/Domain/**). Where a shape diverges from the existing mock interfaces in
 * `src/lib/mock-data.ts`, the divergence is called out in a comment so the
 * eventual swap is deliberate, not silent.
 */

/**
 * Money is transported as an integer minor amount plus its currency and scale
 * (App\Support\MoneyPresenter::fromMinor). XOF has scale 0 (no subdivision),
 * USD has scale 2. The frontend formats to display via `@/lib/format`.
 *
 * MOCK DIVERGENCE: the mock stores amounts as plain signed `number` in major
 * units (e.g. `1_866_252` FCFA, `-59.99` EUR). The API never sends EUR and
 * never sends decimals for XOF; a debit/credit direction is not encoded on the
 * amount but on the surrounding row (`side`, or the resource type).
 */
export interface Money {
  amount_minor: number;
  currency: CurrencyCode;
  scale: number;
}

/** App\Domain\Money\Currency — the only two currencies the backend knows. */
export type CurrencyCode = "XOF" | "USD";

/** App\Domain\User\UserStatus. */
export type UserStatus = "active" | "suspended";

/**
 * The current user, as returned by GET /api/me and inside POST /api/login's
 * `data.user` (AuthController::userPayload).
 *
 * MOCK DIVERGENCE vs `UserProfile`: the mock carries display-only literals
 * (`initial`, `verified: true`, `stats`). The API instead exposes `uuid`,
 * `referral_code`, numeric `kyc_level`, `status`, and `email_verified`. The
 * initial is derived on the client; verification is `kyc_level`/`email_verified`.
 */
export interface User {
  uuid: string;
  name: string;
  email: string;
  referral_code: string | null;
  kyc_level: number;
  status: UserStatus;
  email_verified: boolean;
}

/** POST /api/login `data`. */
export interface LoginResult {
  /**
   * Sanctum personal-access token returned by the backend. In stateful SPA
   * cookie mode this is intentionally IGNORED and never persisted (see
   * docs and the auth foundation). Kept in the type only to describe the wire.
   */
  token: string;
  user: User;
}

/** GET /api/wallet `data` (WalletController::show). */
export interface Wallet {
  uuid: string | null;
  status: string | null;
  balance: Money;
}

/** One ledger-entry row of GET /api/wallet/transactions. */
export interface WalletTransaction {
  side: "debit" | "credit";
  amount: Money;
  type: string | null;
  transaction_uuid: string | null;
  posted_at: string | null;
}

/** Generic pagination envelope used by GET /api/wallet/transactions. */
export interface Paginated<T> {
  items: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

/**
 * A linked Mobile Money account (MobileMoneyAccountController::payload).
 *
 * MOCK DIVERGENCE vs `MobileMoneyAccount`: the API uses `is_primary` +
 * `linked_at` (ISO 8601) and does not send the pre-computed `linkedLabel`;
 * the client derives the label with `formatDate`.
 */
export interface MobileMoneyAccount {
  uuid: string;
  operator: string;
  masked_number: string;
  is_primary: boolean;
  linked_at: string;
}

/** App\Http\Resources\CardResource. */
export interface Card {
  uuid: string;
  status: string;
  channel: string;
  pan_last4: string;
  expiry_month: number;
  expiry_year: number;
  cardholder_name: string;
  currency: CurrencyCode;
  created_at: string | null;
}

/** App\Http\Resources\CardTransactionResource. */
export interface CardTransaction {
  uuid: string;
  type: string;
  status: string;
  amount: Money;
  fee: Money | null;
  merchant_name: string | null;
  occurred_at: string | null;
}

/** Revealed card secrets (POST /api/cards/{uuid}/reveal). Never persisted. */
export interface CardReveal {
  pan: string;
  cvv: string;
  expiry: string;
  cardholder_name: string;
}

/** App\Http\Resources\DepositResource. */
export interface Deposit {
  uuid: string;
  operator: string;
  status: string;
  amount: Money;
  amount_charged_minor: number | null;
  fee_percent: number | null;
  checkout_url: string | null;
  failure_reason: string | null;
  processed_at: string | null;
  created_at: string | null;
}

/** App\Http\Resources\WithdrawalResource. */
export interface Withdrawal {
  uuid: string;
  operator: string;
  status: string;
  recipient_masked_phone: string;
  amount: Money;
  client_debit: Money;
  fixpay_fee: Money;
  provider_cost: Money;
  cost_variance_minor: number;
  failure_reason: string | null;
  processed_at: string | null;
  created_at: string | null;
}

/** One referee row inside the referral payload. */
export interface Referee {
  uuid: string | null;
  name: string | null;
}

/** GET /api/referral `data` (ReferralController::show). */
export interface Referral {
  code: string;
  link: string;
  referees: Array<{
    uuid: string;
    status: string;
    referee: Referee;
    created_at: string | null;
  }>;
  commission_balance: Money;
}

/**
 * A notification row (NotificationResource / DatabaseNotification).
 *
 * MOCK DIVERGENCE vs `AppNotification`: the API row carries an opaque `data`
 * bag and `read_at`/`created_at` timestamps rather than the mock's presentation
 * fields (`icon`, `tone`, `title`, `description`, `unread`). Named
 * `NotificationItem` here to avoid colliding with the mock's `AppNotification`.
 */
export interface NotificationItem {
  id: string;
  type: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string | null;
}

/** GET /api/notifications `data`. */
export interface NotificationList {
  notifications: NotificationItem[];
  unread_count: number;
}

/**
 * App\Domain\Pin\PinTicketAction — the exact enum accepted by
 * POST /api/pin/verify and required by the `pin.ticket:*` route middleware.
 */
export enum PinTicketAction {
  Withdraw = "withdraw",
  CardIssue = "card_issue",
  CardRecharge = "card_recharge",
  CardCashout = "card_cashout",
  RevealPan = "reveal_pan",
  ReferralPayout = "referral_payout",
  LinkMmAccount = "link_mm_account",
}

/** POST /api/pin/verify `data` — a single-use, short-lived ticket. */
export interface PinTicket {
  ticket: string;
  action: PinTicketAction;
  /** TTL in seconds (config pin.ticket_ttl_seconds, ~120). */
  expires_in: number;
}

/** Input for POST /api/pin/verify (VerifyPinRequest). */
export interface VerifyPinInput {
  pin: string;
  action: PinTicketAction;
  resource_type?: string;
  resource_uuid?: string;
  amount_minor?: number;
  currency?: CurrencyCode;
}

/** Input for POST /api/register (RegisterRequest). */
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  referral_code?: string;
}

/** Input for POST /api/login (LoginRequest). */
export interface LoginInput {
  email: string;
  password: string;
}
