import { apiFetch, apiFetchResult, type ApiResult } from "@/lib/api/client";
import { ApiError } from "@/lib/api/ApiError";
import { API_BASE } from "@/lib/env";

import type {
  AdminConfig,
  AdminConfigList,
  AdminList,
  AdminOperator,
  AdminOverview,
  ApprovalRequest,
  AuditFilters,
  AuditLog,
  AuditVerifyResult,
  B2bApiKey,
  B2bMerchant,
  Bin,
  CreateFxRateInput,
  CreateLimitInput,
  CreateMerchantInput,
  CreatePricingRuleInput,
  CreateProviderCostInput,
  CreditWalletInput,
  CurateBinInput,
  CurateOperatorInput,
  FloatSnapshot,
  FxRate,
  IssuedApiKey,
  KycQueueItem,
  KycReviewDetail,
  LedgerAccount,
  LedgerAccountFilters,
  LedgerTransaction,
  LedgerTransactionFilters,
  Limit,
  PricingRule,
  ProviderCost,
  ReconciliationRun,
  SchedulerTask,
  SchedulerTick,
  UpdateAdminConfigInput,
  UpdateLimitInput,
  UpdatePricingRuleInput,
  UpdateProviderCostInput,
  WriteOutcome,
} from "./types";

/** Build a `?a=b&c=d` query string, dropping empty/undefined values. */
function query(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

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

// ---- KYC review (kyc.review) -------------------------------------------

export function fetchKycQueue(page = 1): Promise<AdminList<KycQueueItem>> {
  return apiFetch<AdminList<KycQueueItem>>(`/admin/kyc${query({ page })}`);
}

export function fetchKycDetail(uuid: string): Promise<KycReviewDetail> {
  return apiFetch<KycReviewDetail>(`/admin/kyc/${uuid}`);
}

/**
 * Fetch a KYC document as a Blob over the AUTHENTICATED session (cookie), the
 * only way this stream is exposed — the backend serves it as an attachment
 * behind `permission:kyc.review`, never as a public URL. The caller turns the
 * Blob into a transient `blob:` object URL for preview and revokes it after use.
 */
export async function fetchKycDocument(
  uuid: string,
  docUuid: string,
): Promise<Blob> {
  const response = await fetch(
    `${API_BASE}/admin/kyc/${uuid}/documents/${docUuid}`,
    {
      method: "GET",
      credentials: "include",
      headers: { "X-Requested-With": "XMLHttpRequest" },
    },
  );
  if (!response.ok) {
    throw new ApiError(response.status, response.statusText || "document_error");
  }
  return response.blob();
}

export function approveKyc(uuid: string): Promise<KycReviewDetail> {
  return apiFetch<KycReviewDetail>(`/admin/kyc/${uuid}/approve`, {
    method: "POST",
  });
}

export function rejectKyc(
  uuid: string,
  reason: string,
): Promise<KycReviewDetail> {
  return apiFetch<KycReviewDetail>(`/admin/kyc/${uuid}/reject`, {
    method: "POST",
    body: { reason },
  });
}

// ---- B2B merchants (merchant.manage / merchant.credit) -----------------

export function fetchMerchants(): Promise<AdminList<B2bMerchant>> {
  return apiFetch<AdminList<B2bMerchant>>("/admin/b2b/merchants");
}

export function fetchMerchant(uuid: string): Promise<B2bMerchant> {
  return apiFetch<B2bMerchant>(`/admin/b2b/merchants/${uuid}`);
}

/**
 * Create a merchant. A plain merchant is applied directly (201); requesting a
 * PAN-reveal-capable merchant is SENSITIVE and returns 202 (maker-checker).
 */
export async function createMerchant(
  input: CreateMerchantInput,
): Promise<WriteOutcome<B2bMerchant>> {
  return toOutcome<B2bMerchant>(
    await apiFetchResult<B2bMerchant | ApprovalRequest>("/admin/b2b/merchants", {
      method: "POST",
      body: input,
    }),
  );
}

export function issueMerchantKey(uuid: string): Promise<IssuedApiKey> {
  return apiFetch<IssuedApiKey>(`/admin/b2b/merchants/${uuid}/keys`, {
    method: "POST",
  });
}

export function revokeMerchantKey(
  uuid: string,
  keyUuid: string,
): Promise<B2bApiKey> {
  return apiFetch<B2bApiKey>(
    `/admin/b2b/merchants/${uuid}/keys/${keyUuid}/revoke`,
    { method: "POST" },
  );
}

/**
 * Credit a merchant wallet. ALWAYS maker-checker: the backend returns 202 with a
 * pending ApprovalRequest — the credit is NOT applied until a second approver
 * decides it.
 */
export async function creditMerchantWallet(
  uuid: string,
  input: CreditWalletInput,
): Promise<WriteOutcome<B2bMerchant>> {
  return toOutcome<B2bMerchant>(
    await apiFetchResult<B2bMerchant | ApprovalRequest>(
      `/admin/b2b/merchants/${uuid}/wallet/credit`,
      { method: "POST", body: input },
    ),
  );
}

// ---- Ledger (ledger.read, READ-ONLY) -----------------------------------

export function fetchLedgerAccounts(
  filters: LedgerAccountFilters = {},
): Promise<AdminList<LedgerAccount>> {
  return apiFetch<AdminList<LedgerAccount>>(
    `/admin/ledger/accounts${query({
      type: filters.type,
      currency: filters.currency,
      owner_type: filters.owner_type,
      page: filters.page,
    })}`,
  );
}

export function fetchLedgerTransactions(
  filters: LedgerTransactionFilters = {},
): Promise<AdminList<LedgerTransaction>> {
  return apiFetch<AdminList<LedgerTransaction>>(
    `/admin/ledger/transactions${query({
      type: filters.type,
      account_uuid: filters.account_uuid,
      from: filters.from,
      to: filters.to,
      page: filters.page,
    })}`,
  );
}

export function fetchLedgerTransaction(
  uuid: string,
): Promise<LedgerTransaction> {
  return apiFetch<LedgerTransaction>(`/admin/ledger/transactions/${uuid}`);
}

// ---- Reconciliation (ledger.read) --------------------------------------

export function fetchFloats(
  page = 1,
): Promise<AdminList<FloatSnapshot>> {
  return apiFetch<AdminList<FloatSnapshot>>(
    `/admin/reconciliation/floats${query({ page })}`,
  );
}

export function fetchReconciliationRuns(
  page = 1,
): Promise<AdminList<ReconciliationRun>> {
  return apiFetch<AdminList<ReconciliationRun>>(
    `/admin/reconciliation/runs${query({ page })}`,
  );
}

export function fetchTicks(): Promise<AdminList<SchedulerTick>> {
  return apiFetch<AdminList<SchedulerTick>>("/admin/reconciliation/ticks");
}

export function fetchTasks(): Promise<AdminList<SchedulerTask>> {
  return apiFetch<AdminList<SchedulerTask>>("/admin/reconciliation/tasks");
}

// ---- Audit (audit.read) ------------------------------------------------

export function fetchAudit(
  filters: AuditFilters = {},
): Promise<AdminList<AuditLog>> {
  return apiFetch<AdminList<AuditLog>>(
    `/admin/audit${query({
      action: filters.action,
      actor_type: filters.actor_type,
      from: filters.from,
      to: filters.to,
      page: filters.page,
    })}`,
  );
}

export function verifyAudit(): Promise<AuditVerifyResult> {
  return apiFetch<AuditVerifyResult>("/admin/audit/verify");
}
