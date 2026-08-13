import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

import { queryKeys } from "@/lib/query/keys";
import type { Card, CardCashout, CardRecharge, Money } from "@/lib/api/types";
import { envelope, xof } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderWithClient } from "@/test/utils";

const BASE = "http://localhost:8000";

// The success pages read the operation id from the query string. The card
// creation page reads `card=`, the recharge/cashout pages read `uuid=`.
const { queryRef } = vi.hoisted(() => ({ queryRef: { current: "" } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(queryRef.current),
}));

import CardCreationSuccessPage from "@/app/(success)/cards/new/success/page";
import CardTopUpSuccessPage from "@/app/(success)/cards/top-up/success/page";
import CardWithdrawSuccessPage from "@/app/(success)/cards/withdraw/success/page";

function usd(amountMinor: number): Money {
  return { amount_minor: amountMinor, currency: "USD", scale: 2 };
}

/** Render with a client pre-seeded with a terminal resource (no GET endpoint). */
function renderSeeded(ui: ReactElement, seed: (client: QueryClient) => void) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, staleTime: Infinity },
    },
  });
  seed(client);
  render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

const ISSUED_CARD: Card = {
  uuid: "op-1",
  status: "active",
  channel: "app",
  pan_last4: "4291",
  expiry_month: 12,
  expiry_year: 2028,
  cardholder_name: "JEAN DUPONT",
  currency: "USD",
  created_at: "2026-04-14T16:20:00+00:00",
};

function recharge(state: string): CardRecharge {
  return {
    uuid: "op-1",
    state: state as CardRecharge["state"],
    card_uuid: "c1",
    credit_usd: usd(5000),
    client_price: xof(30_000),
    failure_reason: state === "success" ? null : "vcc_recharge_failed",
    created_at: "2026-04-14T16:20:00+00:00",
  };
}

function cashout(state: string): CardCashout {
  return {
    uuid: "op-1",
    state: state as CardCashout["state"],
    card_uuid: "c1",
    amount_usd: usd(5000),
    credited_xof: xof(29_000),
    failure_reason: state === "success" ? null : "vcc_cashout_failed",
    created_at: "2026-04-14T16:20:00+00:00",
  };
}

describe("card creation success gating", () => {
  it("renders the issued card only when it really exists", async () => {
    queryRef.current = "card=op-1";
    server.use(
      http.get(`${BASE}/api/cards/op-1`, () =>
        HttpResponse.json(envelope(ISSUED_CARD)),
      ),
    );
    renderWithClient(<CardCreationSuccessPage />);
    await waitFor(() =>
      expect(screen.getByText("Carte créée")).toBeInTheDocument(),
    );
  });

  it("renders a non-success state when the card is not found", async () => {
    queryRef.current = "card=op-1";
    server.use(
      http.get(`${BASE}/api/cards/op-1`, () =>
        HttpResponse.json(envelope(null), { status: 404 }),
      ),
    );
    renderWithClient(<CardCreationSuccessPage />);
    await waitFor(() =>
      expect(screen.getByText("Création non aboutie")).toBeInTheDocument(),
    );
    expect(screen.queryByText("Carte créée")).not.toBeInTheDocument();
  });
});

describe("card recharge success gating", () => {
  it("renders the confirmed receipt only for a `success` recharge", async () => {
    queryRef.current = "uuid=op-1";
    renderSeeded(<CardTopUpSuccessPage />, (client) =>
      client.setQueryData(queryKeys.cardRecharge("op-1"), recharge("success")),
    );
    expect(screen.getByText("Carte alimentée")).toBeInTheDocument();
    // USD amount, two decimals (shown in both the hero and the receipt row).
    expect(screen.getAllByText(/50\.00/).length).toBeGreaterThan(0);
  });

  it("renders a non-success state for a `failed` recharge", async () => {
    queryRef.current = "uuid=op-1";
    renderSeeded(<CardTopUpSuccessPage />, (client) =>
      client.setQueryData(queryKeys.cardRecharge("op-1"), recharge("failed")),
    );
    expect(screen.getByText("Alimentation non aboutie")).toBeInTheDocument();
    expect(screen.queryByText("Carte alimentée")).not.toBeInTheDocument();
  });

  it("shows a terminal « Reçu indisponible » (never a stuck spinner) when the cache is empty", () => {
    // Régression : useCardRechargeResult est enabled:false et ne fetche JAMAIS.
    // Un uuid présent sans résultat en cache (rechargement, URL rouverte) doit
    // rendre l'état terminal, pas un spinner mort qui bloque l'écran.
    queryRef.current = "uuid=op-1";
    renderSeeded(<CardTopUpSuccessPage />, () => {});
    expect(screen.getByText("Reçu indisponible")).toBeInTheDocument();
    expect(document.querySelector(".animate-spin")).toBeNull();
  });
});

describe("card cashout success gating", () => {
  it("renders the confirmed receipt only for a `success` cashout", async () => {
    queryRef.current = "uuid=op-1";
    renderSeeded(<CardWithdrawSuccessPage />, (client) =>
      client.setQueryData(queryKeys.cardCashout("op-1"), cashout("success")),
    );
    expect(screen.getByText("Retrait effectué")).toBeInTheDocument();
  });

  it("renders a non-success state for a `failed` cashout", async () => {
    queryRef.current = "uuid=op-1";
    renderSeeded(<CardWithdrawSuccessPage />, (client) =>
      client.setQueryData(queryKeys.cardCashout("op-1"), cashout("failed")),
    );
    expect(screen.getByText("Retrait non abouti")).toBeInTheDocument();
    expect(screen.queryByText("Retrait effectué")).not.toBeInTheDocument();
  });

  it("shows a terminal « Reçu indisponible » (never a stuck spinner) when the cache is empty", () => {
    queryRef.current = "uuid=op-1";
    renderSeeded(<CardWithdrawSuccessPage />, () => {});
    expect(screen.getByText("Reçu indisponible")).toBeInTheDocument();
    expect(document.querySelector(".animate-spin")).toBeNull();
  });
});
