import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { makeTestClient } from "@/test/utils";
import { envelope, errorEnvelope, xof } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";

import { ApiError } from "./ApiError";
import {
  MAX_POLL_ATTEMPTS,
  POLL_INTERVAL_MS,
  pollInterval,
  useCreateDeposit,
  useCreateWithdrawal,
  useDeposit,
  useLinkMobileMoneyAccount,
  useMobileMoneyAccounts,
  useSetPrimaryMobileMoneyAccount,
  useUnlinkMobileMoneyAccount,
  useWallet,
  useWalletTransactions,
  useWithdrawal,
  useWithdrawalQuote,
} from "./moneyHooks";
import { isDepositFinal, isWithdrawalFinal } from "./status";
import { PinTicketAction } from "./types";

const BASE = "http://localhost:8000";

function wrapper() {
  const client = makeTestClient();
  const Wrap = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  Wrap.displayName = "TestWrapper";
  return Wrap;
}

describe("useWallet", () => {
  it("unwraps the balance envelope", async () => {
    server.use(
      http.get(`${BASE}/api/wallet`, () =>
        HttpResponse.json(
          envelope({ uuid: "w1", status: "active", balance: xof(1_866_252) }),
        ),
      ),
    );

    const { result } = renderHook(() => useWallet(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.balance.amount_minor).toBe(1_866_252);
    // XOF is scale 0: the amount is an integer, never a float.
    expect(Number.isInteger(result.current.data?.balance.amount_minor)).toBe(
      true,
    );
  });
});

describe("useWalletTransactions", () => {
  it("unwraps and paginates across pages", async () => {
    server.use(
      http.get(`${BASE}/api/wallet/transactions`, ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get("page")) || 1;
        return HttpResponse.json(
          envelope({
            items: [
              {
                side: page === 1 ? "credit" : "debit",
                amount: xof(page * 1000),
                type: "deposit",
                transaction_uuid: `t${page}`,
                posted_at: "2026-04-14T16:20:00+00:00",
              },
            ],
            pagination: {
              current_page: page,
              per_page: 15,
              total: 2,
              last_page: 2,
            },
          }),
        );
      }),
    );

    const { result } = renderHook(() => useWalletTransactions(), {
      wrapper: wrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages).toHaveLength(1);
    expect(result.current.hasNextPage).toBe(true);

    await result.current.fetchNextPage();
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.data?.pages[1]?.items[0]?.transaction_uuid).toBe("t2");
  });
});

describe("deposit flow", () => {
  it("POSTs then polls the deposit until success", async () => {
    let created = false;
    let getCalls = 0;

    server.use(
      http.post(`${BASE}/api/deposits`, () => {
        created = true;
        return HttpResponse.json(
          envelope(
            {
              uuid: "d1",
              operator: "wave",
              status: "pending",
              amount: xof(50_000),
              amount_charged_minor: 50_000,
              fee_percent: null,
              checkout_url: null,
              failure_reason: null,
              processed_at: null,
              created_at: "2026-04-14T16:20:00+00:00",
            },
            "deposit_initiated",
          ),
          { status: 201 },
        );
      }),
      http.get(`${BASE}/api/deposits/d1`, () => {
        getCalls += 1;
        // First poll still pending, then it settles to success.
        const status = getCalls >= 2 ? "success" : "pending";
        return HttpResponse.json(
          envelope({
            uuid: "d1",
            operator: "wave",
            status,
            amount: xof(50_000),
            amount_charged_minor: 50_000,
            fee_percent: null,
            checkout_url: null,
            failure_reason: null,
            processed_at:
              status === "success" ? "2026-04-14T16:21:00+00:00" : null,
            created_at: "2026-04-14T16:20:00+00:00",
          }),
        );
      }),
    );

    const create = renderHook(() => useCreateDeposit(), { wrapper: wrapper() });
    await create.result.current.mutateAsync({
      operator: "wave",
      amount_minor: 50_000,
      currency: "XOF",
      phone: "+2250700000041",
    });
    expect(created).toBe(true);

    const poll = renderHook(() => useDeposit("d1"), { wrapper: wrapper() });
    await waitFor(
      () => expect(poll.result.current.data?.status).toBe("success"),
      { timeout: 8000 },
    );
    expect(getCalls).toBeGreaterThanOrEqual(2);
  }, 12000);
});

describe("withdrawal flow", () => {
  it("shows the exact quote, then sends X-Pin-Ticket and handles pending_approval", async () => {
    let sentTicket: string | null = null;
    let sentBody: unknown = null;

    server.use(
      http.get(`${BASE}/api/withdrawals/quote`, () =>
        HttpResponse.json(
          envelope({
            amount: xof(30_000),
            provider_cost: xof(200),
            fixpay_fee: xof(300),
            client_debit: xof(30_500),
          }),
        ),
      ),
      http.post(`${BASE}/api/withdrawals`, async ({ request }) => {
        sentTicket = request.headers.get("X-Pin-Ticket");
        sentBody = await request.json();
        return HttpResponse.json(
          envelope(
            {
              uuid: "wd1",
              operator: "wave",
              status: "pending_approval",
              recipient_masked_phone: "+225******41",
              amount: xof(30_000),
              client_debit: xof(30_500),
              fixpay_fee: xof(300),
              provider_cost: xof(200),
              cost_variance_minor: 0,
              failure_reason: null,
              processed_at: null,
              created_at: "2026-04-14T16:05:00+00:00",
            },
            "withdrawal_initiated",
          ),
          { status: 201 },
        );
      }),
    );

    const quote = renderHook(() => useWithdrawalQuote("wave", 30_000), {
      wrapper: wrapper(),
    });
    await waitFor(() => expect(quote.result.current.isSuccess).toBe(true));
    // The debit shown to the user is the exact client_debit from the quote.
    expect(quote.result.current.data?.client_debit.amount_minor).toBe(30_500);
    expect(quote.result.current.data?.fixpay_fee.amount_minor).toBe(300);

    const create = renderHook(() => useCreateWithdrawal(), {
      wrapper: wrapper(),
    });
    const withdrawal = await create.result.current.mutateAsync({
      input: {
        operator: "wave",
        amount_minor: 30_000,
        currency: "XOF",
        recipient: {
          phone: "+2250700000041",
          first_name: "Jean",
          last_name: "Dupont",
        },
      },
      pinTicket: "one-time-ticket-abc",
    });

    expect(sentTicket).toBe("one-time-ticket-abc");
    expect(sentBody).toMatchObject({
      operator: "wave",
      amount_minor: 30_000,
      currency: "XOF",
      recipient: { first_name: "Jean", last_name: "Dupont" },
    });
    expect(withdrawal.status).toBe("pending_approval");
  });

  it("maps a 422 into ApiError.fieldErrors", async () => {
    server.use(
      http.post(`${BASE}/api/withdrawals`, () =>
        HttpResponse.json(
          errorEnvelope("The given data was invalid.", {
            amount_minor: ["Le montant dépasse le plafond autorisé."],
          }),
          { status: 422 },
        ),
      ),
    );

    const create = renderHook(() => useCreateWithdrawal(), {
      wrapper: wrapper(),
    });
    const error = await create.result.current
      .mutateAsync({
        input: {
          operator: "wave",
          amount_minor: 99_999_999,
          currency: "XOF",
          recipient: {
            phone: "+2250700000041",
            first_name: "Jean",
            last_name: "Dupont",
          },
        },
        pinTicket: "t",
      })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    const apiError = error as ApiError;
    expect(apiError.status).toBe(422);
    expect(apiError.fieldErrors).toEqual({
      amount_minor: "Le montant dépasse le plafond autorisé.",
    });
  });

  it("polls a withdrawal to a final status", async () => {
    server.use(
      http.get(`${BASE}/api/withdrawals/wd2`, () =>
        HttpResponse.json(
          envelope({
            uuid: "wd2",
            operator: "wave",
            status: "success",
            recipient_masked_phone: "+225******41",
            amount: xof(30_000),
            client_debit: xof(30_500),
            fixpay_fee: xof(300),
            provider_cost: xof(200),
            cost_variance_minor: 0,
            failure_reason: null,
            processed_at: "2026-04-14T16:06:00+00:00",
            created_at: "2026-04-14T16:05:00+00:00",
          }),
        ),
      ),
    );

    const poll = renderHook(() => useWithdrawal("wd2"), { wrapper: wrapper() });
    await waitFor(() => expect(poll.result.current.data?.status).toBe("success"));
  });
});

describe("mobile money accounts", () => {
  const account = {
    uuid: "mm1",
    operator: "wave",
    masked_number: "+225****41",
    is_primary: true,
    linked_at: "2026-04-10T10:04:00+00:00",
  };

  it("unwraps the items list", async () => {
    server.use(
      http.get(`${BASE}/api/mobile-money-accounts`, () =>
        HttpResponse.json(envelope({ items: [account] })),
      ),
    );

    const { result } = renderHook(() => useMobileMoneyAccounts(), {
      wrapper: wrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([account]);
  });

  it("links an account with a PIN ticket in the header", async () => {
    let sentTicket: string | null = null;
    server.use(
      http.post(`${BASE}/api/mobile-money-accounts`, ({ request }) => {
        sentTicket = request.headers.get("X-Pin-Ticket");
        return HttpResponse.json(envelope(account, "mobile_money_linked"), {
          status: 201,
        });
      }),
    );

    const link = renderHook(() => useLinkMobileMoneyAccount(), {
      wrapper: wrapper(),
    });
    await link.result.current.mutateAsync({
      input: { operator: "wave", phone_e164: "+2250700000041" },
      pinTicket: "link-ticket",
    });
    expect(sentTicket).toBe("link-ticket");
  });

  it("unlinks and sets primary", async () => {
    let deleted = false;
    let madePrimary = false;
    server.use(
      http.delete(`${BASE}/api/mobile-money-accounts/mm1`, () => {
        deleted = true;
        return HttpResponse.json(envelope(null, "mobile_money_unlinked"));
      }),
      http.put(`${BASE}/api/mobile-money-accounts/mm1/primary`, () => {
        madePrimary = true;
        return HttpResponse.json(
          envelope({ ...account, is_primary: true }, "mobile_money_primary_set"),
        );
      }),
    );

    const unlink = renderHook(() => useUnlinkMobileMoneyAccount(), {
      wrapper: wrapper(),
    });
    await unlink.result.current.mutateAsync("mm1");
    expect(deleted).toBe(true);

    const primary = renderHook(() => useSetPrimaryMobileMoneyAccount(), {
      wrapper: wrapper(),
    });
    await primary.result.current.mutateAsync("mm1");
    expect(madePrimary).toBe(true);
  });
});

describe("pollInterval (polling cap)", () => {
  it("keeps polling while the status is non-final and under the cap", () => {
    expect(pollInterval(0, undefined, isDepositFinal)).toBe(POLL_INTERVAL_MS);
    expect(pollInterval(5, "pending", isDepositFinal)).toBe(POLL_INTERVAL_MS);
    expect(pollInterval(5, "pending_approval", isWithdrawalFinal)).toBe(
      POLL_INTERVAL_MS,
    );
  });

  it("stops immediately on a final status", () => {
    expect(pollInterval(1, "success", isDepositFinal)).toBe(false);
    expect(pollInterval(1, "failed", isDepositFinal)).toBe(false);
    expect(pollInterval(1, "rejected", isWithdrawalFinal)).toBe(false);
  });

  it("stops once the attempt cap is reached, even while non-final", () => {
    // Regression: a deposit stuck in `initiated` or a withdrawal awaiting
    // hours-long approval must not poll the network forever.
    expect(pollInterval(MAX_POLL_ATTEMPTS - 1, "pending", isDepositFinal)).toBe(
      POLL_INTERVAL_MS,
    );
    expect(pollInterval(MAX_POLL_ATTEMPTS, "pending", isDepositFinal)).toBe(
      false,
    );
    expect(
      pollInterval(MAX_POLL_ATTEMPTS + 10, "pending_approval", isWithdrawalFinal),
    ).toBe(false);
  });
});

// PinTicketAction.Withdraw is the exact enum value the withdraw route guards on.
describe("PinTicketAction", () => {
  it("uses the backend action strings", () => {
    expect(PinTicketAction.Withdraw).toBe("withdraw");
    expect(PinTicketAction.LinkMmAccount).toBe("link_mm_account");
  });
});
