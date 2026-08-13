import { QueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api";

/**
 * Build a QueryClient with product-wide defaults.
 *
 * A factory (not a shared singleton) so tests get an isolated cache per case
 * and the client can be created fresh per browser tab without cross-talk.
 *
 * A 401 must never be retried: it means "not authenticated" and the auth layer
 * turns it into the guest state. Other errors get a single retry.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.status === 401) return false;
          return failureCount < 1;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
