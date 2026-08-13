import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { PinPromptDialog } from "@/components/auth/PinPromptDialog";
import { queryKeys } from "@/lib/query/keys";
import { NBSP } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { makeTestClient, renderWithClient } from "@/test/utils";
import { envelope, xof } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";

import {
  useCancelCard,
  useCard,
  useCardCashoutQuote,
  useCardIssuanceResult,
  useCardOffers,
  useCardRechargeQuote,
  useCardTransactions,
  useCards,
  useCashoutCard,
  useEnableCard,
  useIssueCard,
  useRechargeCard,
  useRevealCard,
  useSuspendCard,
} from "./cardHooks";
import type { Card, CardIssuanceOrder, Money } from "./types";
import { PinTicketAction } from "./types";

const BASE = "http://localhost:8000";

/** USD money helper (scale 2 — cents, two decimals). */
function usd(amountMinor: number): Money {
  return { amount_minor: amountMinor, currency: "USD", scale: 2 };
}

function makeWrapper() {
  const client = makeTestClient();
  const Wrap = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  Wrap.displayName = "TestWrapper";
  return { client, wrapper: Wrap };
}

const CARD: Card = {
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

describe("card reads", () => {
  it("useCards unwraps the list", async () => {
    server.use(
      http.get(`${BASE}/api/cards`, () =>
        HttpResponse.json(envelope([CARD])),
      ),
    );
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCards(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([CARD]);
  });

  it("useCard fetches a single card", async () => {
    server.use(
      http.get(`${BASE}/api/cards/c1`, () =>
        HttpResponse.json(envelope(CARD)),
      ),
    );
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCard("c1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.uuid).toBe("c1");
  });

  it("useCardTransactions returns the flat list (no pagination envelope)", async () => {
    server.use(
      http.get(`${BASE}/api/cards/c1/transactions`, () =>
        HttpResponse.json(
          envelope([
            {
              uuid: "t1",
              type: "consumption",
              status: "settled",
              amount: usd(1299),
              fee: null,
              merchant_name: "Netflix",
              occurred_at: "2026-04-14T16:20:00+00:00",
            },
          ]),
        ),
      ),
    );
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCardTransactions("c1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0]?.amount.currency).toBe("USD");
  });

  it("useCardOffers unwraps issuable BINs", async () => {
    server.use(
      http.get(`${BASE}/api/card-offers`, () =>
        HttpResponse.json(
          envelope([
            {
              bin_uuid: "b1",
              brand: "Visa",
              currency: "USD",
              client_price: xof(3000),
            },
          ]),
        ),
      ),
    );
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCardOffers(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0]?.bin_uuid).toBe("b1");
    expect(result.current.data?.[0]?.client_price.amount_minor).toBe(3000);
  });
});

describe("card issuance (async)", () => {
  it("POSTs then follows the order to the new card via the card list", async () => {
    let listCalls = 0;
    const newCard: Card = { ...CARD, uuid: "card-new" };
    server.use(
      http.post(`${BASE}/api/cards`, () =>
        HttpResponse.json(
          envelope(
            {
              uuid: "o1",
              state: "pending",
              client_price: xof(3000),
              card_uuid: null,
              failure_reason: null,
              created_at: "2026-04-14T16:20:00+00:00",
            },
            "card_issuance_initiated",
          ),
          { status: 201 },
        ),
      ),
      http.get(`${BASE}/api/cards`, () => {
        listCalls += 1;
        // The card only appears on the second poll — the front must wait.
        return HttpResponse.json(envelope(listCalls >= 2 ? [newCard] : []));
      }),
    );

    const { wrapper } = makeWrapper();
    const issue = renderHook(() => useIssueCard(), { wrapper });
    const order = await issue.result.current.mutateAsync({
      input: { bin_uuid: "b1" },
      pinTicket: "issue-ticket",
    });
    expect(order.state).toBe("pending");

    const track = renderHook(() => useCardIssuanceResult(order, []), {
      wrapper,
    });
    await waitFor(
      () => expect(track.result.current.cardUuid).toBe("card-new"),
      { timeout: 9000 },
    );
    expect(listCalls).toBeGreaterThanOrEqual(2);
  }, 12000);

  it("invalidates wallet and cards on issuance (the price is debited immediately)", async () => {
    server.use(
      http.post(`${BASE}/api/cards`, () =>
        HttpResponse.json(
          envelope(
            {
              uuid: "o3",
              state: "pending",
              client_price: xof(3000),
              card_uuid: null,
              failure_reason: null,
              created_at: "2026-04-14T16:20:00+00:00",
            },
            "card_issuance_initiated",
          ),
          { status: 201 },
        ),
      ),
    );

    const { client, wrapper } = makeWrapper();
    // Snapshots présumés frais avant l'émission.
    client.setQueryData(queryKeys.wallet, {
      uuid: "w1",
      status: "active",
      balance: xof(100_000),
    });
    client.setQueryData(queryKeys.cards, [CARD]);

    const issue = renderHook(() => useIssueCard(), { wrapper });
    await issue.result.current.mutateAsync({
      input: { bin_uuid: "b1" },
      pinTicket: "issue-ticket",
    });

    expect(client.getQueryState(queryKeys.wallet)?.isInvalidated).toBe(true);
    expect(client.getQueryState(queryKeys.cards)?.isInvalidated).toBe(true);
  });

  it("surfaces a failed order without polling", async () => {
    const order: CardIssuanceOrder = {
      uuid: "o2",
      state: "failed",
      client_price: xof(3000),
      card_uuid: null,
      failure_reason: "vcc_open_failed",
      created_at: null,
    };
    const { wrapper } = makeWrapper();
    const track = renderHook(() => useCardIssuanceResult(order, []), {
      wrapper,
    });
    expect(track.result.current.failed).toBe(true);
    expect(track.result.current.cardUuid).toBeNull();
    expect(track.result.current.failureReason).toBe("vcc_open_failed");
  });
});

describe("card recharge", () => {
  it("shows the quote, sends the X-Pin-Ticket, and caches the result", async () => {
    let sentTicket: string | null = null;
    let sentBody: Record<string, unknown> | null = null;
    server.use(
      http.get(`${BASE}/api/cards/c1/recharge/quote`, ({ request }) => {
        const amount = new URL(request.url).searchParams.get(
          "amount_usd_minor",
        );
        expect(amount).toBe("5000");
        return HttpResponse.json(
          envelope({
            credit_usd: usd(5000),
            client_price: xof(30_000),
            rate_applied: "600",
            indicative: true,
          }),
        );
      }),
      http.post(`${BASE}/api/cards/c1/recharge`, async ({ request }) => {
        sentTicket = request.headers.get("X-Pin-Ticket");
        sentBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          envelope(
            {
              uuid: "r1",
              state: "success",
              card_uuid: "c1",
              credit_usd: usd(5000),
              client_price: xof(30_000),
              failure_reason: null,
              created_at: "2026-04-14T16:20:00+00:00",
            },
            "card_recharge_initiated",
          ),
          { status: 201 },
        );
      }),
    );

    const { client, wrapper } = makeWrapper();
    const quote = renderHook(() => useCardRechargeQuote("c1", 5000), {
      wrapper,
    });
    await waitFor(() => expect(quote.result.current.isSuccess).toBe(true));
    expect(quote.result.current.data?.credit_usd.amount_minor).toBe(5000);
    expect(quote.result.current.data?.client_price.amount_minor).toBe(30_000);

    const recharge = renderHook(() => useRechargeCard(), { wrapper });
    const result = await recharge.result.current.mutateAsync({
      uuid: "c1",
      input: { amount_minor: 5000, currency: "USD" },
      pinTicket: "recharge-ticket",
    });

    expect(sentTicket).toBe("recharge-ticket");
    expect(sentBody).toEqual({ amount_minor: 5000, currency: "USD" });
    expect(result.state).toBe("success");
    // The success screen reads the result from the cache the mutation wrote.
    expect(client.getQueryData(queryKeys.cardRecharge("r1"))).toMatchObject({
      uuid: "r1",
      state: "success",
    });
  });
});

describe("card cashout", () => {
  it("shows the quote, sends the X-Pin-Ticket, and caches the result", async () => {
    let sentTicket: string | null = null;
    server.use(
      http.get(`${BASE}/api/cards/c1/cashout/quote`, () =>
        HttpResponse.json(
          envelope({
            amount_usd: usd(5000),
            credited_xof: xof(29_000),
            rate_applied: "580",
            indicative: true,
          }),
        ),
      ),
      http.post(`${BASE}/api/cards/c1/cashout`, ({ request }) => {
        sentTicket = request.headers.get("X-Pin-Ticket");
        return HttpResponse.json(
          envelope(
            {
              uuid: "co1",
              state: "success",
              card_uuid: "c1",
              amount_usd: usd(5000),
              credited_xof: xof(29_000),
              failure_reason: null,
              created_at: "2026-04-14T16:20:00+00:00",
            },
            "card_cashout_initiated",
          ),
          { status: 201 },
        );
      }),
    );

    const { client, wrapper } = makeWrapper();
    const quote = renderHook(() => useCardCashoutQuote("c1", 5000), {
      wrapper,
    });
    await waitFor(() => expect(quote.result.current.isSuccess).toBe(true));
    expect(quote.result.current.data?.credited_xof.amount_minor).toBe(29_000);

    const cashout = renderHook(() => useCashoutCard(), { wrapper });
    const result = await cashout.result.current.mutateAsync({
      uuid: "c1",
      input: { amount_minor: 5000, currency: "USD" },
      pinTicket: "cashout-ticket",
    });
    expect(sentTicket).toBe("cashout-ticket");
    expect(result.state).toBe("success");
    expect(client.getQueryData(queryKeys.cardCashout("co1"))).toMatchObject({
      uuid: "co1",
    });
  });
});

describe("card reveal — secrets are never persisted", () => {
  it("returns PAN/CVV once, then leaves no trace in storage or the cache", async () => {
    server.use(
      http.post(`${BASE}/api/cards/c1/reveal`, () =>
        HttpResponse.json(
          envelope(
            {
              pan: "4291123456784291",
              cvv: "321",
              expiry: "12/28",
              cardholder_name: "JEAN DUPONT",
            },
            "card_revealed",
          ),
        ),
      ),
    );

    const { client, wrapper } = makeWrapper();
    const { result } = renderHook(() => useRevealCard(), { wrapper });
    const revealed = await result.current.mutateAsync({
      uuid: "c1",
      pinTicket: "reveal-ticket",
    });
    expect(revealed.pan).toBe("4291123456784291");
    expect(revealed.cvv).toBe("321");

    // Never written to web storage.
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);

    // Never landed in the React Query cache (a mutation, not a query).
    const cacheDump = JSON.stringify(
      client.getQueryCache().getAll().map((q) => ({
        key: q.queryKey,
        data: q.state.data,
      })),
    );
    expect(cacheDump).not.toContain("4291123456784291");
    expect(cacheDump).not.toContain("JEAN DUPONT");

    // Closing (reset) drops the secrets from the mutation state too.
    await act(async () => {
      result.current.reset();
    });
    await waitFor(() => expect(result.current.data).toBeUndefined());
  });
});

describe("card lifecycle", () => {
  it("suspend, enable and cancel each return the updated card", async () => {
    server.use(
      http.post(`${BASE}/api/cards/c1/suspend`, () =>
        HttpResponse.json(
          envelope({ ...CARD, status: "frozen" }, "card_suspended"),
        ),
      ),
      http.post(`${BASE}/api/cards/c1/enable`, () =>
        HttpResponse.json(
          envelope({ ...CARD, status: "active" }, "card_enabled"),
        ),
      ),
      http.post(`${BASE}/api/cards/c1/cancel`, () =>
        HttpResponse.json(
          envelope({ ...CARD, status: "cancelled" }, "card_cancelled"),
        ),
      ),
    );

    const { wrapper } = makeWrapper();
    const suspend = renderHook(() => useSuspendCard(), { wrapper });
    expect((await suspend.result.current.mutateAsync("c1")).status).toBe(
      "frozen",
    );

    const enable = renderHook(() => useEnableCard(), { wrapper });
    expect((await enable.result.current.mutateAsync("c1")).status).toBe(
      "active",
    );

    const cancel = renderHook(() => useCancelCard(), { wrapper });
    expect((await cancel.result.current.mutateAsync("c1")).status).toBe(
      "cancelled",
    );
  });
});

describe("money formatting per currency", () => {
  it("formats USD with two decimals and XOF with none", () => {
    expect(formatMoney(usd(5999))).toBe(`59.99${NBSP}USD`);
    expect(formatMoney(usd(123456))).toBe(`1${NBSP}234.56${NBSP}USD`);
    expect(formatMoney(usd(100))).toBe(`1.00${NBSP}USD`);
    expect(formatMoney(xof(1_866_252))).toBe(
      `1${NBSP}866${NBSP}252${NBSP}FCFA`,
    );
  });
});

describe("card PIN ticket contract", () => {
  it("card_recharge verifies WITHOUT amount_minor and WITH the card resource", async () => {
    let sentBody: Record<string, unknown> | null = null;
    server.use(
      http.post(`${BASE}/api/pin/verify`, async ({ request }) => {
        sentBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          envelope(
            { ticket: "card-ticket", action: "card_recharge", expires_in: 120 },
            "pin_verified",
          ),
        );
      }),
    );

    const onTicket = vi.fn();
    renderWithClient(
      <PinPromptDialog
        open
        action={PinTicketAction.CardRecharge}
        resourceType="card"
        resourceUuid="c1"
        onTicket={onTicket}
        onCancel={vi.fn()}
      />,
    );

    for (const digit of "1234") {
      await userEvent.click(screen.getByRole("button", { name: digit }));
    }
    await userEvent.click(screen.getByRole("button", { name: "Confirmer" }));

    await waitFor(() =>
      expect(onTicket).toHaveBeenCalledWith("card-ticket"),
    );
    expect(sentBody).toEqual({
      pin: "1234",
      action: "card_recharge",
      resource_type: "card",
      resource_uuid: "c1",
    });
    expect(sentBody).not.toHaveProperty("amount_minor");
    expect(sentBody).not.toHaveProperty("currency");
  });
});
