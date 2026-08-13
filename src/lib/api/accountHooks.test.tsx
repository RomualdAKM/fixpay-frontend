import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { PinPromptDialog } from "@/components/auth/PinPromptDialog";
import { buildKycFormData } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/keys";
import { makeTestClient, renderWithClient } from "@/test/utils";
import { envelope, xof } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";

import {
  useKyc,
  useMarkNotificationRead,
  useNotifications,
  usePayoutReferral,
  useReferral,
  useSubmitKyc,
} from "./accountHooks";
import { PinTicketAction } from "./types";

const BASE = "http://localhost:8000";

function makeWrapper() {
  const client = makeTestClient();
  const Wrap = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  Wrap.displayName = "TestWrapper";
  return { client, wrapper: Wrap };
}

describe("KYC", () => {
  it("useKyc reads the profile status", async () => {
    server.use(
      http.get(`${BASE}/api/kyc`, () =>
        HttpResponse.json(
          envelope({
            uuid: "k1",
            status: "rejected",
            level: 0,
            submitted_at: "2026-04-14T16:20:00+00:00",
            reviewed_at: "2026-04-15T09:00:00+00:00",
            rejection_reason: "Pièce illisible",
          }),
        ),
      ),
    );
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useKyc(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.status).toBe("rejected");
    expect(result.current.data?.rejection_reason).toBe("Pièce illisible");
  });

  it("builds a multipart FormData carrying the three named files", () => {
    const body = buildKycFormData({
      id_front: new File(["front"], "front.jpg", { type: "image/jpeg" }),
      id_back: new File(["back"], "back.jpg", { type: "image/jpeg" }),
      selfie: new File(["me"], "selfie.jpg", { type: "image/jpeg" }),
    });
    expect(body).toBeInstanceOf(FormData);
    expect(body.get("id_front")).toBeInstanceOf(File);
    expect(body.get("id_back")).toBeInstanceOf(File);
    expect(body.get("selfie")).toBeInstanceOf(File);
    expect((body.get("id_front") as File).name).toBe("front.jpg");
  });

  it("useSubmitKyc POSTs multipart and re-reads the profile as pending", async () => {
    let contentType: string | null = null;
    server.use(
      // The body is intentionally NOT read here: undici's multipart parse over a
      // jsdom File hangs in this env. The multipart contract is asserted by the
      // buildKycFormData unit test above; here we assert the wire method,
      // multipart Content-Type, and that the fresh status is re-read.
      http.post(`${BASE}/api/kyc`, ({ request }) => {
        contentType = request.headers.get("Content-Type");
        return HttpResponse.json(
          envelope(
            {
              uuid: "k1",
              status: "pending",
              level: 0,
              submitted_at: "2026-04-14T16:20:00+00:00",
              reviewed_at: null,
              rejection_reason: null,
            },
            "kyc_submitted",
          ),
          { status: 201 },
        );
      }),
    );

    const { client, wrapper } = makeWrapper();
    const { result } = renderHook(() => useSubmitKyc(), { wrapper });

    const profile = await result.current.mutateAsync({
      id_front: new File(["front"], "front.jpg", { type: "image/jpeg" }),
      id_back: new File(["back"], "back.jpg", { type: "image/jpeg" }),
      selfie: new File(["me"], "selfie.jpg", { type: "image/jpeg" }),
    });

    expect(contentType).toMatch(/^multipart\/form-data/);
    expect(profile.status).toBe("pending");
    expect(client.getQueryData(queryKeys.kyc)).toMatchObject({
      status: "pending",
    });
  });
});

describe("referral payout", () => {
  it("useReferral exposes code, link and the available balance", async () => {
    server.use(
      http.get(`${BASE}/api/referral`, () =>
        HttpResponse.json(
          envelope({
            code: "FP-JD2024",
            link: "https://fixpay.app/r/FP-JD2024",
            referees: [],
            commission_balance: xof(5000),
          }),
        ),
      ),
    );
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useReferral(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.code).toBe("FP-JD2024");
    expect(result.current.data?.commission_balance.amount_minor).toBe(5000);
  });

  it("usePayoutReferral sends the X-Pin-Ticket and surfaces a pending (awaiting-approval) result", async () => {
    let sentTicket: string | null = null;
    server.use(
      http.post(`${BASE}/api/referral/payouts`, ({ request }) => {
        sentTicket = request.headers.get("X-Pin-Ticket");
        return HttpResponse.json(
          envelope(
            {
              uuid: "p1",
              status: "pending",
              amount: xof(5000),
              approved_at: null,
              created_at: "2026-04-14T16:20:00+00:00",
            },
            "referral_payout_requested",
          ),
          { status: 201 },
        );
      }),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => usePayoutReferral(), { wrapper });
    const payout = await result.current.mutateAsync({
      pinTicket: "payout-ticket",
    });

    expect(sentTicket).toBe("payout-ticket");
    expect(payout.status).toBe("pending");
  });

  it("the referral_payout PIN ticket is requested WITHOUT an amount", async () => {
    let verifyBody: Record<string, unknown> | null = null;
    server.use(
      http.post(`${BASE}/api/pin/verify`, async ({ request }) => {
        verifyBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          envelope(
            {
              ticket: "payout-ticket",
              action: "referral_payout",
              expires_in: 120,
            },
            "pin_verified",
          ),
        );
      }),
    );

    let received: string | null = null;
    renderWithClient(
      <PinPromptDialog
        open
        action={PinTicketAction.ReferralPayout}
        onTicket={(ticket) => {
          received = ticket;
        }}
        onCancel={() => {}}
      />,
    );

    const user = userEvent.setup();
    for (const digit of ["1", "2", "3", "4"]) {
      await user.click(screen.getByRole("button", { name: digit }));
    }
    await user.click(screen.getByRole("button", { name: "Confirmer" }));

    await waitFor(() => expect(received).toBe("payout-ticket"));
    const body = verifyBody as unknown as Record<string, unknown>;
    expect(body.action).toBe("referral_payout");
    // No amount is bound to the ticket — binding one would 403 at the guard.
    expect(body).not.toHaveProperty("amount_minor");
    expect(body).not.toHaveProperty("currency");
  });
});

describe("notifications", () => {
  it("useNotifications returns the list and the unread count", async () => {
    server.use(
      http.get(`${BASE}/api/notifications`, () =>
        HttpResponse.json(
          envelope({
            notifications: [
              {
                id: "n1",
                type: "deposit",
                data: { type: "deposit", title: "Dépôt reçu" },
                read_at: null,
                created_at: "2026-04-14T16:20:00+00:00",
              },
            ],
            unread_count: 1,
          }),
        ),
      ),
    );
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.unread_count).toBe(1);
    expect(result.current.data?.notifications).toHaveLength(1);
  });

  it("marking one read invalidates the list so the unread badge drops", async () => {
    let listCalls = 0;
    let markCalls = 0;
    server.use(
      http.get(`${BASE}/api/notifications`, () => {
        listCalls += 1;
        const unread = markCalls === 0 ? 1 : 0;
        return HttpResponse.json(
          envelope({
            notifications: [
              {
                id: "n1",
                type: "deposit",
                data: {},
                read_at: markCalls === 0 ? null : "2026-04-14T16:21:00+00:00",
                created_at: "2026-04-14T16:20:00+00:00",
              },
            ],
            unread_count: unread,
          }),
        );
      }),
      http.post(`${BASE}/api/notifications/n1/read`, () => {
        markCalls += 1;
        return HttpResponse.json(
          envelope({
            notification: {
              id: "n1",
              type: "deposit",
              data: {},
              read_at: "2026-04-14T16:21:00+00:00",
              created_at: "2026-04-14T16:20:00+00:00",
            },
          }),
        );
      }),
    );

    const { wrapper } = makeWrapper();
    const list = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(list.result.current.isSuccess).toBe(true));
    expect(list.result.current.data?.unread_count).toBe(1);

    const mark = renderHook(() => useMarkNotificationRead(), { wrapper });
    await mark.result.current.mutateAsync("n1");

    await waitFor(() =>
      expect(list.result.current.data?.unread_count).toBe(0),
    );
    expect(listCalls).toBeGreaterThanOrEqual(2);
  });
});
