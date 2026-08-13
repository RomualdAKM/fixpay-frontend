import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import { envelope, xof } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderWithClient } from "@/test/utils";

const BASE = "http://localhost:8000";

// The success pages read the operation uuid from the query string. A stale or
// hand-crafted link can point at a non-`success` uuid, so the pages must gate
// the confirmed receipt on the real terminal status.
const { uuidRef } = vi.hoisted(() => ({ uuidRef: { current: "op-1" } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(`uuid=${uuidRef.current}`),
}));

import DepositSuccessPage from "@/app/(success)/wallet/deposit/success/page";
import WithdrawSuccessPage from "@/app/(success)/wallet/withdraw/success/page";

function depositResource(status: string) {
  return {
    uuid: "op-1",
    operator: "wave",
    status,
    amount: xof(50_000),
    amount_charged_minor: status === "success" ? 50_000 : null,
    fee_percent: null,
    checkout_url: null,
    failure_reason: status === "success" ? null : "Refusé par l'opérateur.",
    processed_at: status === "success" ? "2026-04-14T16:21:00+00:00" : null,
    created_at: "2026-04-14T16:20:00+00:00",
  };
}

function withdrawalResource(status: string) {
  return {
    uuid: "op-1",
    operator: "wave",
    status,
    recipient_masked_phone: "+225******41",
    amount: xof(30_000),
    client_debit: xof(30_500),
    fixpay_fee: xof(300),
    provider_cost: xof(200),
    cost_variance_minor: 0,
    failure_reason: status === "success" ? null : "Retrait refusé.",
    processed_at: status === "success" ? "2026-04-14T16:06:00+00:00" : null,
    created_at: "2026-04-14T16:05:00+00:00",
  };
}

describe("deposit success gating", () => {
  it("renders a non-success state for a non-`success` deposit", async () => {
    server.use(
      http.get(`${BASE}/api/deposits/op-1`, () =>
        HttpResponse.json(envelope(depositResource("failed"))),
      ),
    );

    renderWithClient(<DepositSuccessPage />);

    await waitFor(() =>
      expect(screen.getByText("Dépôt non abouti")).toBeInTheDocument(),
    );
    expect(screen.queryByText("Dépôt confirmé")).not.toBeInTheDocument();
  });

  it("renders the confirmed receipt only for a `success` deposit", async () => {
    server.use(
      http.get(`${BASE}/api/deposits/op-1`, () =>
        HttpResponse.json(envelope(depositResource("success"))),
      ),
    );

    renderWithClient(<DepositSuccessPage />);

    await waitFor(() =>
      expect(screen.getByText("Dépôt confirmé")).toBeInTheDocument(),
    );
  });
});

describe("withdrawal success gating", () => {
  it("renders a non-success state for a non-`success` withdrawal", async () => {
    server.use(
      http.get(`${BASE}/api/withdrawals/op-1`, () =>
        HttpResponse.json(envelope(withdrawalResource("rejected"))),
      ),
    );

    renderWithClient(<WithdrawSuccessPage />);

    await waitFor(() =>
      expect(screen.getByText("Retrait non abouti")).toBeInTheDocument(),
    );
    expect(screen.queryByText("Retrait envoyé")).not.toBeInTheDocument();
  });

  it("renders the confirmed receipt only for a `success` withdrawal", async () => {
    server.use(
      http.get(`${BASE}/api/withdrawals/op-1`, () =>
        HttpResponse.json(envelope(withdrawalResource("success"))),
      ),
    );

    renderWithClient(<WithdrawSuccessPage />);

    await waitFor(() =>
      expect(screen.getByText("Retrait envoyé")).toBeInTheDocument(),
    );
  });
});
