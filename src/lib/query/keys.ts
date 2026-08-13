/**
 * Centralized React Query keys. One place to invalidate from, so a cache reset
 * on logout and a targeted refetch after a mutation never drift out of sync.
 */
export const queryKeys = {
  me: ["me"] as const,
  wallet: ["wallet"] as const,
  walletTransactions: ["wallet", "transactions"] as const,
  cards: ["cards"] as const,
  cardTransactions: (uuid: string) => ["cards", uuid, "transactions"] as const,
  referral: ["referral"] as const,
  notifications: ["notifications"] as const,
  mobileMoneyAccounts: ["mobile-money-accounts"] as const,
} as const;
