/**
 * Centralized React Query keys. One place to invalidate from, so a cache reset
 * on logout and a targeted refetch after a mutation never drift out of sync.
 */
export const queryKeys = {
  me: ["me"] as const,
  wallet: ["wallet"] as const,
  walletTransactions: ["wallet", "transactions"] as const,
  cards: ["cards"] as const,
  card: (uuid: string) => ["cards", uuid] as const,
  cardTransactions: (uuid: string) => ["cards", uuid, "transactions"] as const,
  cardOffers: ["card-offers"] as const,
  cardRechargeQuote: (uuid: string, amountUsdMinor: number) =>
    ["cards", uuid, "recharge", "quote", amountUsdMinor] as const,
  cardCashoutQuote: (uuid: string, amountUsdMinor: number) =>
    ["cards", uuid, "cashout", "quote", amountUsdMinor] as const,
  cardRecharge: (uuid: string) => ["card-recharges", uuid] as const,
  cardCashout: (uuid: string) => ["card-cashouts", uuid] as const,
  referral: ["referral"] as const,
  notifications: ["notifications"] as const,
  mobileMoneyAccounts: ["mobile-money-accounts"] as const,
  operators: (purpose?: string) => ["operators", purpose ?? "all"] as const,
  deposit: (uuid: string) => ["deposits", uuid] as const,
  withdrawal: (uuid: string) => ["withdrawals", uuid] as const,
  withdrawalQuote: (operator: string, amountMinor: number) =>
    ["withdrawals", "quote", operator, amountMinor] as const,
} as const;
