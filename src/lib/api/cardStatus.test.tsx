import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { queryKeys } from "@/lib/query/keys";
import { formatMoney } from "@/lib/money";
import { makeTestClient } from "@/test/utils";
import { envelope, usd, xof } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";

import { useCardCashoutStatus, useCardRechargeStatus, useCards } from "./cardHooks";
import { MAX_POLL_ATTEMPTS, pollInterval } from "./moneyHooks";
import { isCardOrderFinal } from "./status";
import type { Card, CardCashout, CardRecharge } from "./types";

const BASE = "http://localhost:8000";

function makeWrapper() {
  const client = makeTestClient();
  const Wrap = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  Wrap.displayName = "TestWrapper";
  return { client, wrapper: Wrap };
}

describe("card order polling stops at a final state", () => {
  it("pollInterval keeps polling while pending and stops once final or capped", () => {
    // Pending → keep polling.
    expect(pollInterval(0, "pending", isCardOrderFinal)).not.toBe(false);
    // Final → stop immediately.
    expect(pollInterval(0, "success", isCardOrderFinal)).toBe(false);
    expect(pollInterval(0, "failed", isCardOrderFinal)).toBe(false);
    // Attempt cap → stop even if still pending.
    expect(pollInterval(MAX_POLL_ATTEMPTS, "pending", isCardOrderFinal)).toBe(
      false,
    );
  });

  it("useCardRechargeStatus polls the status endpoint and resolves to the final state", async () => {
    const pending: CardRecharge = {
      uuid: "r1",
      state: "pending",
      card_uuid: "c1",
      credit_usd: usd(5000),
      client_price: xof(30_000),
      failure_reason: null,
      created_at: "2026-04-14T16:20:00+00:00",
    };
    let calls = 0;
    server.use(
      http.get(`${BASE}/api/cards/c1/recharges/r1`, () => {
        calls += 1;
        return HttpResponse.json(envelope({ ...pending, state: "success" }));
      }),
    );

    const { client, wrapper } = makeWrapper();
    // The mutation seeds the cache with the initiating card UUID.
    client.setQueryData(queryKeys.cardRecharge("r1"), pending);

    const { result } = renderHook(() => useCardRechargeStatus("r1"), {
      wrapper,
    });
    await waitFor(() => expect(result.current.data?.state).toBe("success"));
    // Reached a final state — no further polling beyond the resolving fetch.
    expect(calls).toBe(1);
  });

  it("useCardCashoutStatus resolves to the final state via the status endpoint", async () => {
    const pending: CardCashout = {
      uuid: "co1",
      state: "pending",
      card_uuid: "c1",
      amount_usd: usd(5000),
      credited_xof: xof(29_000),
      failure_reason: null,
      created_at: "2026-04-14T16:20:00+00:00",
    };
    server.use(
      http.get(`${BASE}/api/cards/c1/cashouts/co1`, () =>
        HttpResponse.json(envelope({ ...pending, state: "success" })),
      ),
    );

    const { client, wrapper } = makeWrapper();
    client.setQueryData(queryKeys.cardCashout("co1"), pending);

    const { result } = renderHook(() => useCardCashoutStatus("co1"), {
      wrapper,
    });
    await waitFor(() => expect(result.current.data?.state).toBe("success"));
  });
});

describe("card balance from the API", () => {
  it("exposes the real USD balance, formatted with two decimals", async () => {
    const card: Card = {
      uuid: "c1",
      status: "active",
      channel: "app",
      brand: "Visa",
      pan_last4: "4291",
      expiry_month: 12,
      expiry_year: 2028,
      cardholder_name: "JEAN DUPONT",
      currency: "USD",
      balance: usd(12_500),
      created_at: "2026-04-14T16:20:00+00:00",
    };
    server.use(
      http.get(`${BASE}/api/cards`, () => HttpResponse.json(envelope([card]))),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCards(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const only = result.current.data?.[0];
    expect(only?.balance.currency).toBe("USD");
    expect(only?.balance.scale).toBe(2);
    // 12 500 cents → "125.00 USD" (two decimals, never a wrong ×100).
    expect(formatMoney(only!.balance)).toBe(`125.00${" "}USD`);
  });
});
