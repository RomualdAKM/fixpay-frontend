import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderResult } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

import { AuthProvider } from "@/lib/auth";

/** A QueryClient with retries off, for deterministic tests. */
export function makeTestClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

/** Render wrapped in a fresh QueryClientProvider only. */
export function renderWithClient(ui: ReactElement): RenderResult & {
  client: QueryClient;
} {
  const client = makeTestClient();
  const result = render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
  return { ...result, client };
}

/** Render wrapped in QueryClientProvider + AuthProvider. */
export function renderWithAuth(ui: ReactElement): RenderResult & {
  client: QueryClient;
} {
  const client = makeTestClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
  const result = render(ui, { wrapper });
  return { ...result, client };
}
