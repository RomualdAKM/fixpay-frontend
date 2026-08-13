import { apiFetch, apiFetchResult, type ApiResult } from "@/lib/api/client";

import type {
  AdminConfig,
  AdminConfigList,
  AdminList,
  AdminOperator,
  AdminOverview,
  ApprovalRequest,
  Bin,
  CreateFxRateInput,
  CreateLimitInput,
  CreatePricingRuleInput,
  CreateProviderCostInput,
  CurateBinInput,
  CurateOperatorInput,
  FxRate,
  Limit,
  PricingRule,
  ProviderCost,
  UpdateAdminConfigInput,
  UpdateLimitInput,
  UpdatePricingRuleInput,
  UpdateProviderCostInput,
  WriteOutcome,
} from "./types";

/**
 * Typed admin endpoint functions. Reads return the unwrapped `data`; writes
 * return an `ApiResult` (data + HTTP status + message) so the caller can tell a
 * direct apply from a 202 maker-checker approval without a second guess.
 */

// ---- Overview ----------------------------------------------------------

export function fetchOverview(): Promise<AdminOverview> {
  return apiFetch<AdminOverview>("/admin/overview");
}

// ---- Write-outcome coercion -------------------------------------------

/**
 * Turn a raw write result into the honest `WriteOutcome`. A 202 means the
 * mutation is parked behind approval and the `data` is an `ApprovalRequest`;
 * anything else (200/201) means it was applied and `data` is the resource.
 */
function toOutcome<T>(result: ApiResult<T | ApprovalRequest>): WriteOutcome<T> {
  if (result.status === 202) {
    return {
      kind: "pending",
      status: result.status,
      message: result.message,
      approval: result.data as ApprovalRequest,
    };
  }
  return {
    kind: "applied",
    status: result.status,
    message: result.message,
    resource: result.data as T,
  };
}

// ---- Pricing rules (SENSITIVE → 202) -----------------------------------

export function fetchPricingRules(): Promise<AdminList<PricingRule>> {
  return apiFetch<AdminList<PricingRule>>("/admin/pricing-rules");
}

export async function createPricingRule(
  input: CreatePricingRuleInput,
): Promise<WriteOutcome<PricingRule>> {
  return toOutcome<PricingRule>(
    await apiFetchResult<PricingRule | ApprovalRequest>("/admin/pricing-rules", {
      method: "POST",
      body: input,
    }),
  );
}

export async function updatePricingRule(
  uuid: string,
  input: UpdatePricingRuleInput,
): Promise<WriteOutcome<PricingRule>> {
  return toOutcome<PricingRule>(
    await apiFetchResult<PricingRule | ApprovalRequest>(
      `/admin/pricing-rules/${uuid}`,
      { method: "PATCH", body: input },
    ),
  );
}

export async function deactivatePricingRule(
  uuid: string,
): Promise<WriteOutcome<PricingRule>> {
  return toOutcome<PricingRule>(
    await apiFetchResult<PricingRule | ApprovalRequest>(
      `/admin/pricing-rules/${uuid}/deactivate`,
      { method: "POST" },
    ),
  );
}

// ---- Provider costs (DIRECT → 200/201) ---------------------------------

export function fetchProviderCosts(): Promise<AdminList<ProviderCost>> {
  return apiFetch<AdminList<ProviderCost>>("/admin/provider-costs");
}

export async function createProviderCost(
  input: CreateProviderCostInput,
): Promise<WriteOutcome<ProviderCost>> {
  return toOutcome<ProviderCost>(
    await apiFetchResult<ProviderCost | ApprovalRequest>(
      "/admin/provider-costs",
      { method: "POST", body: input },
    ),
  );
}

export async function updateProviderCost(
  uuid: string,
  input: UpdateProviderCostInput,
): Promise<WriteOutcome<ProviderCost>> {
  return toOutcome<ProviderCost>(
    await apiFetchResult<ProviderCost | ApprovalRequest>(
      `/admin/provider-costs/${uuid}`,
      { method: "PATCH", body: input },
    ),
  );
}

export async function deactivateProviderCost(
  uuid: string,
): Promise<WriteOutcome<ProviderCost>> {
  return toOutcome<ProviderCost>(
    await apiFetchResult<ProviderCost | ApprovalRequest>(
      `/admin/provider-costs/${uuid}/deactivate`,
      { method: "POST" },
    ),
  );
}

// ---- FX rates (SENSITIVE → 202, append-only) ---------------------------

export function fetchFxRates(): Promise<AdminList<FxRate>> {
  return apiFetch<AdminList<FxRate>>("/admin/fx-rates");
}

export async function createFxRate(
  input: CreateFxRateInput,
): Promise<WriteOutcome<FxRate>> {
  return toOutcome<FxRate>(
    await apiFetchResult<FxRate | ApprovalRequest>("/admin/fx-rates", {
      method: "POST",
      body: input,
    }),
  );
}

// ---- Limits (SENSITIVE → 202) ------------------------------------------

export function fetchLimits(): Promise<AdminList<Limit>> {
  return apiFetch<AdminList<Limit>>("/admin/limits");
}

export async function createLimit(
  input: CreateLimitInput,
): Promise<WriteOutcome<Limit>> {
  return toOutcome<Limit>(
    await apiFetchResult<Limit | ApprovalRequest>("/admin/limits", {
      method: "POST",
      body: input,
    }),
  );
}

export async function updateLimit(
  uuid: string,
  input: UpdateLimitInput,
): Promise<WriteOutcome<Limit>> {
  return toOutcome<Limit>(
    await apiFetchResult<Limit | ApprovalRequest>(`/admin/limits/${uuid}`, {
      method: "PATCH",
      body: input,
    }),
  );
}

// ---- BINs (SENSITIVE → 202, curation) ----------------------------------

export function fetchBins(): Promise<AdminList<Bin>> {
  return apiFetch<AdminList<Bin>>("/admin/bins");
}

export async function curateBin(
  uuid: string,
  input: CurateBinInput,
): Promise<WriteOutcome<Bin>> {
  return toOutcome<Bin>(
    await apiFetchResult<Bin | ApprovalRequest>(`/admin/bins/${uuid}`, {
      method: "PATCH",
      body: input,
    }),
  );
}

// ---- Operators (DIRECT → 200, curation) --------------------------------

export function fetchOperators(): Promise<AdminList<AdminOperator>> {
  return apiFetch<AdminList<AdminOperator>>("/admin/operators");
}

export async function curateOperator(
  code: string,
  input: CurateOperatorInput,
): Promise<WriteOutcome<AdminOperator>> {
  return toOutcome<AdminOperator>(
    await apiFetchResult<AdminOperator | ApprovalRequest>(
      `/admin/operators/${code}`,
      { method: "PATCH", body: input },
    ),
  );
}

// ---- Admin configs (key-value; sensitive keys → 202) -------------------

export function fetchConfigs(): Promise<AdminConfigList> {
  return apiFetch<AdminConfigList>("/admin/config");
}

export async function updateConfig(
  key: string,
  input: UpdateAdminConfigInput,
): Promise<WriteOutcome<AdminConfig>> {
  return toOutcome<AdminConfig>(
    await apiFetchResult<AdminConfig | ApprovalRequest>(
      `/admin/config/${encodeURIComponent(key)}`,
      { method: "PATCH", body: input },
    ),
  );
}

// ---- Approvals ---------------------------------------------------------

export function fetchConfigApprovals(): Promise<AdminList<ApprovalRequest>> {
  return apiFetch<AdminList<ApprovalRequest>>("/admin/approvals/config");
}

export function approveConfigApproval(uuid: string): Promise<ApprovalRequest> {
  return apiFetch<ApprovalRequest>(`/admin/approvals/config/${uuid}/approve`, {
    method: "POST",
  });
}

export function rejectConfigApproval(
  uuid: string,
  reason?: string,
): Promise<ApprovalRequest> {
  return apiFetch<ApprovalRequest>(`/admin/approvals/config/${uuid}/reject`, {
    method: "POST",
    body: reason ? { reason } : {},
  });
}

export function fetchTopupApprovals(): Promise<AdminList<ApprovalRequest>> {
  return apiFetch<AdminList<ApprovalRequest>>("/admin/approvals/topups");
}

export function approveTopupApproval(uuid: string): Promise<ApprovalRequest> {
  return apiFetch<ApprovalRequest>(`/admin/approvals/topups/${uuid}/approve`, {
    method: "POST",
  });
}

export function rejectTopupApproval(
  uuid: string,
  reason?: string,
): Promise<ApprovalRequest> {
  return apiFetch<ApprovalRequest>(`/admin/approvals/topups/${uuid}/reject`, {
    method: "POST",
    body: reason ? { reason } : {},
  });
}
