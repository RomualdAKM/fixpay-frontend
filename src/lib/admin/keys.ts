/**
 * React Query keys for the admin section, kept apart from the app keys so an
 * admin refetch never collides with a user-facing cache entry.
 */
export const adminKeys = {
  overview: ["admin", "overview"] as const,
  pricingRules: ["admin", "pricing-rules"] as const,
  providerCosts: ["admin", "provider-costs"] as const,
  fxRates: ["admin", "fx-rates"] as const,
  limits: ["admin", "limits"] as const,
  bins: ["admin", "bins"] as const,
  operators: ["admin", "operators"] as const,
  configs: ["admin", "config"] as const,
  approvalsConfig: ["admin", "approvals", "config"] as const,
  approvalsTopups: ["admin", "approvals", "topups"] as const,
} as const;
