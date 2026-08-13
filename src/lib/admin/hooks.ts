"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";

import { ApiError } from "@/lib/api/ApiError";

import * as admin from "./endpoints";
import { adminKeys } from "./keys";
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
 * React Query hooks over the admin endpoints. Reads surface loading/error
 * uniformly through React Query; writes return the honest `WriteOutcome` and
 * invalidate their list (and the overview, whose config_version a direct apply
 * bumps) so the table reflects reality after a decision.
 */

// ---- Overview ----------------------------------------------------------

export function useOverview(): UseQueryResult<AdminOverview, ApiError> {
  return useQuery<AdminOverview, ApiError>({
    queryKey: adminKeys.overview,
    queryFn: () => admin.fetchOverview(),
  });
}

// ---- Reads -------------------------------------------------------------

export function usePricingRules(): UseQueryResult<
  AdminList<PricingRule>,
  ApiError
> {
  return useQuery<AdminList<PricingRule>, ApiError>({
    queryKey: adminKeys.pricingRules,
    queryFn: () => admin.fetchPricingRules(),
  });
}

export function useProviderCosts(): UseQueryResult<
  AdminList<ProviderCost>,
  ApiError
> {
  return useQuery<AdminList<ProviderCost>, ApiError>({
    queryKey: adminKeys.providerCosts,
    queryFn: () => admin.fetchProviderCosts(),
  });
}

export function useFxRates(): UseQueryResult<AdminList<FxRate>, ApiError> {
  return useQuery<AdminList<FxRate>, ApiError>({
    queryKey: adminKeys.fxRates,
    queryFn: () => admin.fetchFxRates(),
  });
}

export function useLimits(): UseQueryResult<AdminList<Limit>, ApiError> {
  return useQuery<AdminList<Limit>, ApiError>({
    queryKey: adminKeys.limits,
    queryFn: () => admin.fetchLimits(),
  });
}

export function useBins(): UseQueryResult<AdminList<Bin>, ApiError> {
  return useQuery<AdminList<Bin>, ApiError>({
    queryKey: adminKeys.bins,
    queryFn: () => admin.fetchBins(),
  });
}

export function useOperators(): UseQueryResult<
  AdminList<AdminOperator>,
  ApiError
> {
  return useQuery<AdminList<AdminOperator>, ApiError>({
    queryKey: adminKeys.operators,
    queryFn: () => admin.fetchOperators(),
  });
}

export function useConfigs(): UseQueryResult<AdminConfigList, ApiError> {
  return useQuery<AdminConfigList, ApiError>({
    queryKey: adminKeys.configs,
    queryFn: () => admin.fetchConfigs(),
  });
}

// ---- Write helpers -----------------------------------------------------

/**
 * Build a write mutation that, on success, invalidates its own list and the
 * overview. A pending (202) result leaves the list unchanged on the backend but
 * we still refetch so a fresh read reflects the truth; a direct apply updates
 * the row and bumps the version shown on the overview.
 */
function useWriteMutation<TVars, TResource>(
  mutationFn: (vars: TVars) => Promise<WriteOutcome<TResource>>,
  listKey: readonly unknown[],
): UseMutationResult<WriteOutcome<TResource>, ApiError, TVars> {
  const queryClient = useQueryClient();
  return useMutation<WriteOutcome<TResource>, ApiError, TVars>({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: listKey });
      void queryClient.invalidateQueries({ queryKey: adminKeys.overview });
    },
  });
}

// ---- Pricing rules -----------------------------------------------------

export function useCreatePricingRule() {
  return useWriteMutation<CreatePricingRuleInput, PricingRule>(
    (input) => admin.createPricingRule(input),
    adminKeys.pricingRules,
  );
}

export function useUpdatePricingRule() {
  return useWriteMutation<
    { uuid: string; input: UpdatePricingRuleInput },
    PricingRule
  >(
    ({ uuid, input }) => admin.updatePricingRule(uuid, input),
    adminKeys.pricingRules,
  );
}

export function useDeactivatePricingRule() {
  return useWriteMutation<string, PricingRule>(
    (uuid) => admin.deactivatePricingRule(uuid),
    adminKeys.pricingRules,
  );
}

// ---- Provider costs ----------------------------------------------------

export function useCreateProviderCost() {
  return useWriteMutation<CreateProviderCostInput, ProviderCost>(
    (input) => admin.createProviderCost(input),
    adminKeys.providerCosts,
  );
}

export function useUpdateProviderCost() {
  return useWriteMutation<
    { uuid: string; input: UpdateProviderCostInput },
    ProviderCost
  >(
    ({ uuid, input }) => admin.updateProviderCost(uuid, input),
    adminKeys.providerCosts,
  );
}

export function useDeactivateProviderCost() {
  return useWriteMutation<string, ProviderCost>(
    (uuid) => admin.deactivateProviderCost(uuid),
    adminKeys.providerCosts,
  );
}

// ---- FX rates ----------------------------------------------------------

export function useCreateFxRate() {
  return useWriteMutation<CreateFxRateInput, FxRate>(
    (input) => admin.createFxRate(input),
    adminKeys.fxRates,
  );
}

// ---- Limits ------------------------------------------------------------

export function useCreateLimit() {
  return useWriteMutation<CreateLimitInput, Limit>(
    (input) => admin.createLimit(input),
    adminKeys.limits,
  );
}

export function useUpdateLimit() {
  return useWriteMutation<{ uuid: string; input: UpdateLimitInput }, Limit>(
    ({ uuid, input }) => admin.updateLimit(uuid, input),
    adminKeys.limits,
  );
}

// ---- BINs --------------------------------------------------------------

export function useCurateBin() {
  return useWriteMutation<{ uuid: string; input: CurateBinInput }, Bin>(
    ({ uuid, input }) => admin.curateBin(uuid, input),
    adminKeys.bins,
  );
}

// ---- Operators ---------------------------------------------------------

export function useCurateOperator() {
  return useWriteMutation<
    { code: string; input: CurateOperatorInput },
    AdminOperator
  >(({ code, input }) => admin.curateOperator(code, input), adminKeys.operators);
}

// ---- Admin configs -----------------------------------------------------

export function useUpdateConfig() {
  return useWriteMutation<
    { key: string; input: UpdateAdminConfigInput },
    AdminConfig
  >(({ key, input }) => admin.updateConfig(key, input), adminKeys.configs);
}

// ---- Approvals ---------------------------------------------------------

export function useConfigApprovals(): UseQueryResult<
  AdminList<ApprovalRequest>,
  ApiError
> {
  return useQuery<AdminList<ApprovalRequest>, ApiError>({
    queryKey: adminKeys.approvalsConfig,
    queryFn: () => admin.fetchConfigApprovals(),
  });
}

export function useTopupApprovals(): UseQueryResult<
  AdminList<ApprovalRequest>,
  ApiError
> {
  return useQuery<AdminList<ApprovalRequest>, ApiError>({
    queryKey: adminKeys.approvalsTopups,
    queryFn: () => admin.fetchTopupApprovals(),
  });
}

interface DecisionVars {
  uuid: string;
  reason?: string;
}

function useDecisionMutation(
  mutationFn: (vars: DecisionVars) => Promise<ApprovalRequest>,
  listKey: readonly unknown[],
): UseMutationResult<ApprovalRequest, ApiError, DecisionVars> {
  const queryClient = useQueryClient();
  return useMutation<ApprovalRequest, ApiError, DecisionVars>({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: listKey });
      void queryClient.invalidateQueries({ queryKey: adminKeys.overview });
    },
  });
}

export function useApproveConfig() {
  return useDecisionMutation(
    ({ uuid }) => admin.approveConfigApproval(uuid),
    adminKeys.approvalsConfig,
  );
}

export function useRejectConfig() {
  return useDecisionMutation(
    ({ uuid, reason }) => admin.rejectConfigApproval(uuid, reason),
    adminKeys.approvalsConfig,
  );
}

export function useApproveTopup() {
  return useDecisionMutation(
    ({ uuid }) => admin.approveTopupApproval(uuid),
    adminKeys.approvalsTopups,
  );
}

export function useRejectTopup() {
  return useDecisionMutation(
    ({ uuid, reason }) => admin.rejectTopupApproval(uuid, reason),
    adminKeys.approvalsTopups,
  );
}
