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
  kycQueue: (page: number) => ["admin", "kyc", "queue", page] as const,
  kycDetail: (uuid: string) => ["admin", "kyc", "detail", uuid] as const,
  merchants: ["admin", "merchants"] as const,
  merchant: (uuid: string) => ["admin", "merchants", uuid] as const,
  ledgerAccounts: (filters: unknown) =>
    ["admin", "ledger", "accounts", filters] as const,
  ledgerTransactions: (filters: unknown) =>
    ["admin", "ledger", "transactions", filters] as const,
  ledgerTransaction: (uuid: string) =>
    ["admin", "ledger", "transactions", uuid] as const,
  reconFloats: (page: number) => ["admin", "recon", "floats", page] as const,
  reconRuns: (page: number) => ["admin", "recon", "runs", page] as const,
  reconTicks: ["admin", "recon", "ticks"] as const,
  reconTasks: ["admin", "recon", "tasks"] as const,
  audit: (filters: unknown) => ["admin", "audit", filters] as const,
  auditVerify: ["admin", "audit", "verify"] as const,
} as const;
