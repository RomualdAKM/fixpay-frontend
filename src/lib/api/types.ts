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
  /** Whether a transactional PIN has been set (AuthController::userPayload). */
  pin_set: boolean;
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

/** A curated Mobile Money operator (OperatorResource), GET /api/operators. */
export interface Operator {
  code: string;
  name: string;
  /** ISO-3166 alpha-2 country of the operator, e.g. "CI", "SN". */
  country: string;
  currency: CurrencyCode;
  supports_payin: boolean;
  supports_payout: boolean;
}

/** Query filter for GET /api/operators. */
export type OperatorPurpose = "payin" | "payout";

/**
 * GET /api/withdrawals/quote `data` (WithdrawalQuoteResource). Every leg is a
 * Money object; `client_debit` is what the wallet is actually debited.
 */
export interface WithdrawalQuote {
  amount: Money;
  provider_cost: Money;
  fixpay_fee: Money;
  client_debit: Money;
}

/** POST /api/deposits body (InitiateDepositRequest). Amount is in minor units. */
export interface CreateDepositInput {
  operator: string;
  amount_minor: number;
  currency: CurrencyCode;
  phone?: string;
  return_url?: string;
}

/** Beneficiary of a withdrawal (InitiateWithdrawalRequest `recipient`). */
export interface WithdrawalRecipient {
  phone: string;
  first_name: string;
  last_name: string;
  email?: string;
}

/** POST /api/withdrawals body (InitiateWithdrawalRequest). */
export interface CreateWithdrawalInput {
  operator: string;
  amount_minor: number;
  currency: CurrencyCode;
  recipient: WithdrawalRecipient;
}

/** POST /api/mobile-money-accounts body (LinkMobileMoneyAccountRequest). */
export interface LinkMobileMoneyAccountInput {
  operator: string;
  phone_e164: string;
  is_primary?: boolean;
}

/** App\Domain\Card\CardStatus. */
export type CardStatus = "pending" | "active" | "frozen" | "cancelled";

/**
 * App\Http\Resources\CardResource.
 *
 * The resource now exposes the card `balance` (Money, USD scale 2, sourced from
 * the ledger) and the network `brand` (the BIN organization, e.g. "Visa" /
 * "Mastercard"; null when the BIN carries none). Screens render the real
 * balance — no fabricated amount, and none omitted either.
 */
export interface Card {
  uuid: string;
  status: CardStatus;
  channel: string;
  /** Network organization from the BIN: "Visa", "Mastercard", or null. */
  brand: string | null;
  pan_last4: string;
  expiry_month: number;
  expiry_year: number;
  cardholder_name: string;
  currency: CurrencyCode;
  /** Available card balance in the card currency (USD, scale 2). */
  balance: Money;
  created_at: string | null;
}

/**
 * App\Http\Resources\CardTransactionResource. Amounts are in the card currency
 * (USD, scale 2). GET /api/cards/{uuid}/transactions returns a FLAT array
 * (CardController::transactions), not a paginated envelope.
 */
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

/**
 * Terminal-or-pending state shared by the async card orders
 * (App\Domain\Card\Card{Issuance,Recharge,Cashout}State).
 */
export type CardOrderState = "pending" | "success" | "failed";

/**
 * An issuable BIN (App\Http\Resources\CardOfferResource), GET /api/card-offers.
 * `client_price` is the one-off issuance price debited from the XOF wallet.
 */
export interface CardOffer {
  bin_uuid: string;
  brand: string;
  currency: CurrencyCode;
  client_price: Money;
}

/**
 * POST /api/cards result (CardIssuanceOrderResource). The order is asynchronous:
 * `state` starts `pending` and the `card_uuid` is filled once the card is
 * opened. There is no GET endpoint for the order — the front observes the new
 * card via GET /api/cards instead.
 */
export interface CardIssuanceOrder {
  uuid: string;
  state: CardOrderState;
  client_price: Money;
  card_uuid: string | null;
  failure_reason: string | null;
  created_at: string | null;
}

/** POST /api/cards/{uuid}/recharge result (CardRechargeResource). */
export interface CardRecharge {
  uuid: string;
  state: CardOrderState;
  card_uuid: string | null;
  credit_usd: Money;
  client_price: Money;
  failure_reason: string | null;
  created_at: string | null;
}

/** POST /api/cards/{uuid}/cashout result (CardCashoutResource). */
export interface CardCashout {
  uuid: string;
  state: CardOrderState;
  card_uuid: string | null;
  amount_usd: Money;
  credited_xof: Money;
  failure_reason: string | null;
  created_at: string | null;
}

/** GET /api/cards/{uuid}/recharge/quote (CardRechargeQuoteResource). */
export interface CardRechargeQuote {
  credit_usd: Money;
  client_price: Money;
  rate_applied: string | number | null;
  indicative: boolean;
}

/** GET /api/cards/{uuid}/cashout/quote (CardCashoutQuoteResource). */
export interface CardCashoutQuote {
  amount_usd: Money;
  credited_xof: Money;
  rate_applied: string | number | null;
  indicative: boolean;
}

/** POST /api/cards body (IssueCardRequest). Only the BIN is accepted. */
export interface IssueCardInput {
  bin_uuid: string;
}

/** POST /api/cards/{uuid}/recharge body (RechargeCardRequest). USD cents. */
export interface RechargeCardInput {
  amount_minor: number;
  currency: CurrencyCode;
}

/** POST /api/cards/{uuid}/cashout body (CashoutCardRequest). USD cents. */
export interface CashoutCardInput {
  amount_minor: number;
  currency: CurrencyCode;
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
 * App\Domain\Referral\ReferralPayoutStatus. A payout is created `pending` and
 * settles to `completed`; when `referral.payout_requires_approval` is on it
 * stays `pending` until a reviewer approves it (maker-checker), otherwise it is
 * settled synchronously and returns `completed`.
 */
export type ReferralPayoutStatus = "pending" | "completed" | "failed";

/**
 * POST /api/referral/payouts result (App\Http\Resources\ReferralPayoutResource).
 * The whole available referral balance is swept into one payout to the wallet.
 */
export interface ReferralPayout {
  uuid: string;
  status: ReferralPayoutStatus;
  amount: Money;
  approved_at: string | null;
  created_at: string | null;
}

/** App\Domain\Kyc\KycStatus — `none` is the never-submitted state. */
export type KycStatus = "none" | "pending" | "approved" | "rejected";

/** App\Domain\Kyc\KycDocumentType — the three files a submission requires. */
export type KycDocumentType = "id_front" | "id_back" | "selfie";

/**
 * GET /api/kyc `data` (KycController::payload). `level` mirrors User.kyc_level
 * (0 unverified, 1 after approval); `rejection_reason` is set only when
 * `status` is `rejected`.
 */
export interface KycProfile {
  uuid: string;
  status: KycStatus;
  level: number;
  submitted_at: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

/**
 * The three files POST /api/kyc expects (SubmitKycRequest: each `required`,
 * `mimetypes` per config/kyc.php, `max` KB). Sent as multipart FormData.
 */
export interface SubmitKycInput {
  id_front: File;
  id_back: File;
  selfie: File;
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
