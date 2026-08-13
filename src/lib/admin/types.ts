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

/** App\Http\Resources\Admin\ApprovalRequestResource. */
export interface ApprovalRequest {
  uuid: string;
  type: ApprovalType;
  status: ApprovalStatus;
  operation: string | null;
  target_uuid: string | null;
  /** Numeric DB id of the maker (App\Models\User::id) — NOT the user uuid. */
  requested_by: number | null;
  approved_by: number | null;
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
