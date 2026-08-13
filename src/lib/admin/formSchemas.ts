import { z } from "zod";

import type {
  CreateFxRateInput,
  CreateLimitInput,
  CreateMerchantInput,
  CreatePricingRuleInput,
  CreateProviderCostInput,
  CreditWalletInput,
  CurateBinInput,
  CurateOperatorInput,
  UpdateLimitInput,
  UpdatePricingRuleInput,
  UpdateProviderCostInput,
} from "./types";

/**
 * Zod schemas for the admin config forms. Fields are kept as the raw strings a
 * form yields (selects, text inputs) plus booleans (checkboxes), so the RHF
 * form type is stable and the resolver needs no input/output split. Each schema
 * has a `toInput` mapper that converts the validated form into the typed API
 * payload. The rules here mirror the backend FormRequests' shape rules
 * (required enums, non-negative numbers); the backend's cross-field and
 * consistency rules (currency-must-match, effectivity overlap, scope existence)
 * are returned as 422 field errors and mapped back with `applyApiErrors`.
 */

const REQUIRED = "Ce champ est requis.";
const BAD_NUMBER = "Nombre invalide.";
const BAD_INT = "Entier positif attendu.";

/** Required number ≥ 0 (or > 0 when `gt0`). */
function numberField(gt0 = false) {
  return z.string().refine((v) => {
    if (v === "") return false;
    const n = Number(v);
    return !Number.isNaN(n) && (gt0 ? n > 0 : n >= 0);
  }, gt0 ? "Nombre strictement positif attendu." : BAD_NUMBER);
}

/** Optional number ≥ 0; "" allowed. */
const optNumber = z
  .string()
  .refine((v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0), BAD_NUMBER);

/** Optional integer ≥ 0; "" allowed. */
const optInt = z
  .string()
  .refine((v) => v === "" || /^\d+$/.test(v), BAD_INT);

/** Parse an optional numeric string to a number, or null when empty. */
function num(v: string): number | null {
  return v === "" ? null : Number(v);
}

/** Trim an optional string to itself, or null when empty. */
function str(v: string): string | null {
  return v === "" ? null : v;
}

const currency = z.enum(["XOF", "USD"]);
const scopeType = z.enum(["global", "bin", "operator", "merchant"]);
const eventType = z.enum([
  "withdrawal",
  "card_issue",
  "card_recharge",
  "card_cashout",
]);

// ---- Pricing rules -----------------------------------------------------

export const pricingRuleCreateSchema = z.object({
  event_type: eventType,
  channel: z.enum(["app", "b2b"]),
  scope_type: scopeType,
  scope_value: z.string(),
  margin_type: z.enum(["fixed", "percent"]),
  margin_value: numberField(),
  min_margin_minor: optInt,
  max_margin_minor: optInt,
  failure_cost_bearer: z.enum(["fixpay", "customer"]),
  currency,
  effective_from: z.string(),
  effective_to: z.string(),
});
export type PricingRuleCreateForm = z.infer<typeof pricingRuleCreateSchema>;

export function toCreatePricingRule(
  f: PricingRuleCreateForm,
): CreatePricingRuleInput {
  return {
    event_type: f.event_type,
    channel: f.channel,
    scope_type: f.scope_type,
    scope_value: str(f.scope_value),
    margin_type: f.margin_type,
    margin_value: Number(f.margin_value),
    min_margin_minor: num(f.min_margin_minor),
    max_margin_minor: num(f.max_margin_minor),
    failure_cost_bearer: f.failure_cost_bearer,
    currency: f.currency,
    effective_from: str(f.effective_from),
    effective_to: str(f.effective_to),
  };
}

export const pricingRuleUpdateSchema = z.object({
  margin_type: z.enum(["fixed", "percent"]),
  margin_value: numberField(),
  min_margin_minor: optInt,
  max_margin_minor: optInt,
  failure_cost_bearer: z.enum(["fixpay", "customer"]),
  effective_to: z.string(),
});
export type PricingRuleUpdateForm = z.infer<typeof pricingRuleUpdateSchema>;

export function toUpdatePricingRule(
  f: PricingRuleUpdateForm,
): UpdatePricingRuleInput {
  return {
    margin_type: f.margin_type,
    margin_value: Number(f.margin_value),
    min_margin_minor: num(f.min_margin_minor),
    max_margin_minor: num(f.max_margin_minor),
    failure_cost_bearer: f.failure_cost_bearer,
    effective_to: str(f.effective_to),
  };
}

// ---- Provider costs ----------------------------------------------------

export const providerCostCreateSchema = z.object({
  provider: z.enum(["vcc", "zayono"]),
  event_type: eventType,
  scope_type: scopeType,
  scope_value: z.string(),
  cost_type: z.enum(["fixed", "percent"]),
  cost_value: numberField(),
  failure_cost_minor: optInt,
  currency,
  effective_from: z.string(),
  effective_to: z.string(),
});
export type ProviderCostCreateForm = z.infer<typeof providerCostCreateSchema>;

export function toCreateProviderCost(
  f: ProviderCostCreateForm,
): CreateProviderCostInput {
  return {
    provider: f.provider,
    event_type: f.event_type,
    scope_type: f.scope_type,
    scope_value: str(f.scope_value),
    cost_type: f.cost_type,
    cost_value: Number(f.cost_value),
    failure_cost_minor: num(f.failure_cost_minor),
    currency: f.currency,
    effective_from: str(f.effective_from),
    effective_to: str(f.effective_to),
  };
}

export const providerCostUpdateSchema = z.object({
  cost_type: z.enum(["fixed", "percent"]),
  cost_value: numberField(),
  failure_cost_minor: optInt,
  effective_to: z.string(),
});
export type ProviderCostUpdateForm = z.infer<typeof providerCostUpdateSchema>;

export function toUpdateProviderCost(
  f: ProviderCostUpdateForm,
): UpdateProviderCostInput {
  return {
    cost_type: f.cost_type,
    cost_value: Number(f.cost_value),
    failure_cost_minor: num(f.failure_cost_minor),
    effective_to: str(f.effective_to),
  };
}

// ---- FX rates (append-only) --------------------------------------------

export const fxRateCreateSchema = z.object({
  base_currency: currency,
  quote_currency: currency,
  rate: numberField(true),
  margin_percent: optNumber,
  effective_from: z.string().min(1, REQUIRED),
});
export type FxRateCreateForm = z.infer<typeof fxRateCreateSchema>;

export function toCreateFxRate(f: FxRateCreateForm): CreateFxRateInput {
  return {
    base_currency: f.base_currency,
    quote_currency: f.quote_currency,
    rate: Number(f.rate),
    margin_percent: num(f.margin_percent),
    effective_from: f.effective_from,
  };
}

// ---- Limits ------------------------------------------------------------

const limitType = z.enum([
  "daily_deposit",
  "monthly_wallet",
  "per_transaction_withdrawal",
  "daily_withdrawal",
  "max_cards",
  "daily_card_issue",
]);

export const limitCreateSchema = z.object({
  kyc_level: z
    .string()
    .refine((v) => /^[0-5]$/.test(v), "Niveau KYC entre 0 et 5."),
  limit_type: limitType,
  value_minor: optInt,
  currency: z.union([currency, z.literal("")]),
  value_count: optInt,
  effective: z.boolean(),
});
export type LimitCreateForm = z.infer<typeof limitCreateSchema>;

export function toCreateLimit(f: LimitCreateForm): CreateLimitInput {
  return {
    kyc_level: Number(f.kyc_level),
    limit_type: f.limit_type,
    value_minor: num(f.value_minor),
    currency: f.currency === "" ? null : f.currency,
    value_count: num(f.value_count),
    effective: f.effective,
  };
}

export const limitUpdateSchema = z.object({
  value_minor: optInt,
  currency: z.union([currency, z.literal("")]),
  value_count: optInt,
  effective: z.boolean(),
});
export type LimitUpdateForm = z.infer<typeof limitUpdateSchema>;

export function toUpdateLimit(f: LimitUpdateForm): UpdateLimitInput {
  return {
    value_minor: num(f.value_minor),
    currency: f.currency === "" ? null : f.currency,
    value_count: num(f.value_count),
    effective: f.effective,
  };
}

// ---- BIN / Operator curation -------------------------------------------

export const binCurateSchema = z.object({
  fixpay_enabled: z.boolean(),
  requires_email: z.boolean(),
});
export type BinCurateForm = z.infer<typeof binCurateSchema>;

export function toCurateBin(f: BinCurateForm): CurateBinInput {
  return { fixpay_enabled: f.fixpay_enabled, requires_email: f.requires_email };
}

export const operatorCurateSchema = z.object({
  fixpay_enabled: z.boolean(),
});
export type OperatorCurateForm = z.infer<typeof operatorCurateSchema>;

export function toCurateOperator(f: OperatorCurateForm): CurateOperatorInput {
  return { fixpay_enabled: f.fixpay_enabled };
}

// ---- B2B merchant creation ---------------------------------------------

export const merchantCreateSchema = z.object({
  name: z.string().min(1, REQUIRED).max(255),
  contact_email: z.string().min(1, REQUIRED).email("E-mail invalide."),
  webhook_url: z.string(),
  default_bin_uuid: z.string(),
  can_reveal_pan: z.boolean(),
});
export type MerchantCreateForm = z.infer<typeof merchantCreateSchema>;

export function toCreateMerchant(f: MerchantCreateForm): CreateMerchantInput {
  return {
    name: f.name,
    contact_email: f.contact_email,
    can_reveal_pan: f.can_reveal_pan,
    webhook_url: str(f.webhook_url),
    default_bin_uuid: str(f.default_bin_uuid),
  };
}

// ---- Merchant wallet credit (maker-checker) ----------------------------

export const creditWalletSchema = z.object({
  amount_minor: numberField(true),
  source: z.string().min(1, REQUIRED).max(255),
  reference: z.string().min(1, REQUIRED).max(255),
});
export type CreditWalletForm = z.infer<typeof creditWalletSchema>;

export function toCreditWallet(f: CreditWalletForm): CreditWalletInput {
  return {
    amount_minor: Number(f.amount_minor),
    currency: "XOF",
    source: f.source,
    reference: f.reference,
  };
}
