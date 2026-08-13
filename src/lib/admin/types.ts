import type { CurrencyCode, Money } from "@/lib/api/types";

/**
 * TypeScript mirrors of the Admin API resources, requests and domain enums.
 * Every shape was read from d:/AKM/fixpay/backend-fixpay
 * (app/Http/Resources/Admin/**, app/Http/Requests/Admin/**, app/Domain/**).
 */

// ---- Domain enums ------------------------------------------------------

export type Provider = "vcc" | "zayono";
export type PricingChannel = "app" | "b2b";
export type PricingScopeType = "global" | "bin" | "operator" | "merchant";
export type PricingEventType =
  | "withdrawal"
  | "card_issue"
  | "card_recharge"
  | "card_cashout";
export type MarginType = "fixed" | "percent";
export type CostType = "fixed" | "percent";
export type FailureCostBearer = "fixpay" | "customer";
export type LimitType =
  | "daily_deposit"
  | "monthly_wallet"
  | "per_transaction_withdrawal"
  | "daily_withdrawal"
  | "max_cards"
  | "daily_card_issue";
export type ConfigValueType = "string" | "int" | "bool" | "decimal" | "json";

// ---- Pagination --------------------------------------------------------

/** The paginator meta ResolvesAdminActor::meta emits. */
export interface AdminPageMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

/** A page envelope: `{ items, meta }`. Some endpoints omit `meta` (full list). */
export interface AdminList<T> {
  items: T[];
  meta?: AdminPageMeta;
}

// ---- Approvals (maker-checker) -----------------------------------------

export type ApprovalStatus = "pending" | "approved" | "rejected";
export type ApprovalType =
  | "withdrawal"
  | "referral_payout"
  | "config_change"
  | "merchant_credit";

/** The maker of an approval request (ApprovalRequestResource `requested_by`). */
export interface ApprovalRequester {
  /** Numeric DB id of the maker (App\Models\User::id) — NOT the user uuid. */
  id: number | null;
  uuid: string | null;
  name: string | null;
}

/**
 * App\Http\Resources\Admin\ApprovalRequestResource (enriched).
 *
 * `proposed_values` is the DIFF to examine: the maker's input, with secret
 * fields already masked BY THE BACKEND (`••••••`). `is_own_request` is the
 * backend's own verdict that the current viewer is the maker — the Approve
 * button is pre-disabled on it (separation of duties), in addition to the
 * reactive self-approval guard that catches a stale list.
 */
export interface ApprovalRequest {
  uuid: string;
  type: ApprovalType;
  status: ApprovalStatus;
  operation: string | null;
  target_uuid: string | null;
  /** The maker's input, secret values masked server-side. May be absent/empty. */
  proposed_values: Record<string, unknown>;
  requested_by: ApprovalRequester;
  is_own_request: boolean;
  approved_by: number | null;
  created_at: string | null;
  decided_at: string | null;
  reason: string | null;
}

// ---- Pricing rules -----------------------------------------------------

export interface PricingRule {
  uuid: string;
  event_type: PricingEventType;
  channel: PricingChannel;
  scope_type: PricingScopeType;
  scope_value: string | null;
  margin_type: MarginType;
  margin_value: string;
  min_margin_minor: number | null;
  max_margin_minor: number | null;
  failure_cost_bearer: FailureCostBearer;
  currency: CurrencyCode;
  effective_from: string | null;
  effective_to: string | null;
}

export interface CreatePricingRuleInput {
  event_type: PricingEventType;
  channel: PricingChannel;
  scope_type: PricingScopeType;
  scope_value?: string | null;
  margin_type: MarginType;
  margin_value: number;
  min_margin_minor?: number | null;
  max_margin_minor?: number | null;
  failure_cost_bearer: FailureCostBearer;
  currency: CurrencyCode;
  effective_from?: string | null;
  effective_to?: string | null;
}

export interface UpdatePricingRuleInput {
  margin_type: MarginType;
  margin_value: number;
  min_margin_minor?: number | null;
  max_margin_minor?: number | null;
  failure_cost_bearer: FailureCostBearer;
  effective_to?: string | null;
}

// ---- Provider costs ----------------------------------------------------

export interface ProviderCost {
  uuid: string;
  provider: Provider;
  event_type: PricingEventType;
  scope_type: PricingScopeType;
  scope_value: string | null;
  cost_type: CostType;
  cost_value: string;
  failure_cost_minor: number | null;
  currency: CurrencyCode;
  source: string;
  synced_at: string | null;
  effective_from: string | null;
  effective_to: string | null;
}

export interface CreateProviderCostInput {
  provider: Provider;
  event_type: PricingEventType;
  scope_type: PricingScopeType;
  scope_value?: string | null;
  cost_type: CostType;
  cost_value: number;
  failure_cost_minor?: number | null;
  currency: CurrencyCode;
  effective_from?: string | null;
  effective_to?: string | null;
}

export interface UpdateProviderCostInput {
  cost_type: CostType;
  cost_value: number;
  failure_cost_minor?: number | null;
  effective_to?: string | null;
}

// ---- FX rates (append-only) --------------------------------------------

export interface FxRate {
  uuid: string;
  base_currency: CurrencyCode;
  quote_currency: CurrencyCode;
  rate: string;
  margin_percent: string | null;
  effective_from: string;
  created_by: number | null;
  created_at: string | null;
}

export interface CreateFxRateInput {
  base_currency: CurrencyCode;
  quote_currency: CurrencyCode;
  rate: number;
  margin_percent?: number | null;
  effective_from: string;
}

// ---- Limits ------------------------------------------------------------

export interface Limit {
  uuid: string;
  kyc_level: number;
  limit_type: LimitType;
  measure: "amount" | "count";
  period: string;
  value_minor: number | null;
  currency: CurrencyCode | null;
  value_count: number | null;
  effective: boolean;
}

export interface CreateLimitInput {
  kyc_level: number;
  limit_type: LimitType;
  value_minor?: number | null;
  currency?: CurrencyCode | null;
  value_count?: number | null;
  effective?: boolean;
}

export interface UpdateLimitInput {
  value_minor?: number | null;
  currency?: CurrencyCode | null;
  value_count?: number | null;
  effective?: boolean;
}

// ---- BINs (curation) ---------------------------------------------------

export interface Bin {
  uuid: string;
  bin: string;
  organization: string | null;
  country: string | null;
  actual_open_card_price_minor: number | null;
  actual_recharge_fee_rate: string | null;
  provider_enabled: boolean;
  fixpay_enabled: boolean;
  requires_email: boolean;
  currency: CurrencyCode;
  synced_at: string | null;
}

export interface CurateBinInput {
  fixpay_enabled: boolean;
  requires_email: boolean;
}

// ---- Operators (curation) ----------------------------------------------

export interface AdminOperator {
  code: string;
  name: string;
  currency: string;
  country: string;
  supports_payin: boolean;
  supports_payout: boolean;
  fixpay_enabled: boolean;
  synced_at: string | null;
}

export interface CurateOperatorInput {
  fixpay_enabled: boolean;
}

// ---- Admin configs (key-value settings) --------------------------------

export interface AdminConfig {
  key: string;
  value_type: ConfigValueType;
  is_secret: boolean;
  /** `null` when `is_secret` — the backend never sends a secret's value. */
  value: unknown;
  label: string | null;
  updated_at: string | null;
}

export interface AdminConfigList {
  items: AdminConfig[];
  version: number;
}

export interface UpdateAdminConfigInput {
  value: unknown;
}

// ---- Overview ----------------------------------------------------------

/** GET /api/admin/overview — every section is gated on a permission. */
export interface AdminOverview {
  floats?: {
    vcc: Money;
    zayono: Money;
  };
  pending?: {
    deposits: number;
    withdrawals: number;
    card_issuance_orders: number;
  };
  reconciliation?: Array<{
    kind: string;
    status: string;
    started_at: string;
  }>;
  config_version?: number;
  audit?: {
    chain_intact: boolean;
  };
}

// ---- Write outcome (maker-checker honesty) -----------------------------

/**
 * The honest result of an admin write. A SENSITIVE mutation (fx_rates,
 * pricing_rules, limits, BIN curation, sensitive admin_configs) is NOT applied:
 * it returns 202 with a pending ApprovalRequest — the UI must say "en attente
 * d'approbation", never "appliqué". A non-sensitive write applies directly
 * (200/201) and bumps the config version.
 */
export type WriteOutcome<T> =
  | { kind: "applied"; status: number; message: string | null; resource: T }
  | { kind: "pending"; status: number; message: string | null; approval: ApprovalRequest };

// ---- KYC review (kyc.review) -------------------------------------------

export type KycReviewStatus = "pending" | "approved" | "rejected";
export type KycDocumentTypeSlug = "id_front" | "id_back" | "selfie";

/** One row of the KYC queue (KycReviewController::summary). */
export interface KycQueueItem {
  uuid: string;
  user_id: number;
  status: KycReviewStatus;
  submitted_at: string | null;
}

/** Document metadata inside a KYC detail — NEVER the file bytes or a public URL. */
export interface KycDocumentMeta {
  uuid: string;
  type: KycDocumentTypeSlug;
  mime: string;
  size: number;
  sha256: string;
  uploaded_at: string;
}

/** A KYC dossier (KycReviewController::detail). */
export interface KycReviewDetail {
  uuid: string;
  user_id: number;
  status: KycReviewStatus;
  level: number;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: number | null;
  rejection_reason: string | null;
  documents: KycDocumentMeta[];
}

// ---- B2B merchants (merchant.manage / merchant.credit) -----------------

/** App\Http\Resources\B2bMerchantResource. */
export interface B2bMerchant {
  uuid: string;
  name: string;
  contact_email: string;
  status: string;
  can_reveal_pan: boolean;
  webhook_url: string | null;
  /** Merchant wallet balance (XOF, scale 0), sourced from the ledger. */
  wallet_balance: Money;
  /** The merchant's API keys — metadata only, NEVER a secret. */
  api_keys: B2bApiKey[];
  created_at: string | null;
}

/** App\Http\Resources\B2bApiKeyResource — metadata only, never a secret. */
export type B2bApiKeyStatus = "active" | "revoked";

export interface B2bApiKey {
  uuid: string;
  public_key: string;
  status: B2bApiKeyStatus;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string | null;
}

/**
 * The one-time payload of POST /{uuid}/keys. `secret` and `webhook_secret` are
 * returned ONLY here, at creation — they are shown once with a copy affordance
 * and never persisted, re-fetched or re-displayed.
 */
export interface IssuedApiKey {
  key: B2bApiKey;
  secret: string;
  webhook_secret: string;
}

export interface CreateMerchantInput {
  name: string;
  contact_email: string;
  can_reveal_pan?: boolean;
  webhook_url?: string | null;
  default_bin_uuid?: string | null;
}

/** POST /{uuid}/wallet/credit body (CreditMerchantWalletRequest). XOF only. */
export interface CreditWalletInput {
  amount_minor: number;
  currency: "XOF";
  source: string;
  reference: string;
}

// ---- Ledger (ledger.read, READ-ONLY) -----------------------------------

export type LedgerSide = "debit" | "credit";

/** App\Http\Resources\Admin\LedgerAccountResource. */
export interface LedgerAccount {
  uuid: string;
  code: string;
  type: string;
  currency: CurrencyCode;
  owner_type: string | null;
  owner_id: number | null;
  normal_side: LedgerSide;
  balance: Money;
  debit_blocked: boolean;
  is_active: boolean;
}

export interface LedgerEntry {
  account_id: number;
  side: LedgerSide;
  amount: Money;
}

/** App\Http\Resources\Admin\LedgerTransactionResource. */
export interface LedgerTransaction {
  uuid: string;
  type: string;
  reference_type: string | null;
  reference_id: number | null;
  idempotency_key: string | null;
  posted_at: string;
  created_by: number | null;
  reverses_transaction_id: number | null;
  /** Present only on the single-transaction read (`whenLoaded('entries')`). */
  entries?: LedgerEntry[];
}

export interface LedgerAccountFilters {
  type?: string;
  currency?: CurrencyCode | "";
  owner_type?: string;
  page?: number;
}

export interface LedgerTransactionFilters {
  type?: string;
  account_uuid?: string;
  from?: string;
  to?: string;
  page?: number;
}

// ---- Reconciliation (ledger.read) --------------------------------------

/** App\Http\Resources\Admin\FloatSnapshotResource. */
export interface FloatSnapshot {
  uuid: string;
  provider: Provider;
  currency: CurrencyCode;
  ledger_balance: Money;
  provider_balance: Money | null;
  /** Signed minor-unit drift (ledger − provider). Non-zero = a real gap. */
  drift_minor: number;
  status: string;
  captured_at: string;
}

/** App\Http\Resources\Admin\ReconciliationRunResource. */
export interface ReconciliationRun {
  uuid: string;
  kind: string;
  status: string;
  details: unknown;
  started_at: string;
  finished_at: string | null;
}

/** App\Http\Resources\Admin\SchedulerTickResource. */
export interface SchedulerTick {
  id: number;
  trigger: string;
  status: string;
  duration_ms: number | null;
  steps: unknown;
  error: string | null;
  started_at: string;
  finished_at: string | null;
}

/** A scheduled task's health (ReconciliationController::tasks). */
export interface SchedulerTask {
  task: string;
  last_run_at: string | null;
  next_due_at: string | null;
  last_status: string | null;
  last_duration_ms: number | null;
}

// ---- Audit (audit.read) ------------------------------------------------

/** App\Http\Resources\Admin\AuditLogResource — a chained log entry. */
export interface AuditLog {
  uuid: string;
  actor_type: string;
  actor_id: number | null;
  action: string;
  subject_type: string | null;
  subject_id: number | null;
  context: unknown;
  hash: string;
  previous_hash: string | null;
  created_at: string;
}

export interface AuditFilters {
  action?: string;
  actor_type?: string;
  from?: string;
  to?: string;
  page?: number;
}

/** GET /admin/audit/verify — the chain integrity verdict. */
export interface AuditVerifyResult {
  intact: boolean;
  broken_at_uuid: string | null;
  entries: number;
}
