import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import { envelope, usd, xof } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderPage } from "@/test/utils";

const BASE = "http://localhost:8000";

// L'Accueil rend BottomNav (usePathname). Il ne lit aucun searchParam.
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

import HomePage from "@/app/(tabs)/page";

function seedWallet() {
  server.use(
    http.get(`${BASE}/api/wallet`, () =>
      HttpResponse.json(
        envelope({ uuid: "w1", status: "active", balance: xof(1_866_252) }),
      ),
    ),
    http.get(`${BASE}/api/wallet/transactions`, () =>
      HttpResponse.json(
        envelope({
          items: [],
          pagination: { current_page: 1, per_page: 20, total: 0, last_page: 1 },
        }),
      ),
    ),
  );
}

function seedCards() {
  server.use(
    http.get(`${BASE}/api/cards`, () =>
      HttpResponse.json(
        envelope([
          {
            uuid: "card-uuid-1",
            status: "active",
            channel: "vcc",
            brand: "Visa",
            pan_last4: "4242",
            expiry_month: 12,
            expiry_year: 2028,
            cardholder_name: "JEAN DUPONT",
            currency: "USD",
            balance: usd(12_345),
            created_at: "2026-04-01T10:00:00+00:00",
          },
        ]),
      ),
    ),
  );
}

function seedKyc(status: string) {
  server.use(
    http.get(`${BASE}/api/kyc`, () =>
      HttpResponse.json(
        envelope({
          uuid: "k1",
          status,
          level: status === "approved" ? 1 : 0,
          submitted_at: null,
          reviewed_at: null,
          rejection_reason: status === "rejected" ? "Pièce illisible" : null,
        }),
      ),
    ),
  );
}

describe("Home — real account data", () => {
  it("hides the KYC line when the real status is approved, and shows the real card", async () => {
    seedWallet();
    seedCards();
    seedKyc("approved");

    renderPage(<HomePage />);

    // La vraie carte (masquée depuis pan_last4) apparaît, pas une carte mock.
    await waitFor(() =>
      expect(
        screen.getByText("•••• •••• •••• 4242"),
      ).toBeInTheDocument(),
    );
    // Solde réel de la carte, en USD (jamais un montant fabriqué).
    expect(screen.getByText(/123\.45/)).toBeInTheDocument();
    // KYC approuvé -> aucune invite de vérification.
    expect(screen.queryByText(/Vérification d'identité/)).not.toBeInTheDocument();
  });

  it("shows the KYC line adapted to a rejected status", async () => {
    seedWallet();
    seedCards();
    seedKyc("rejected");

    renderPage(<HomePage />);

    await waitFor(() =>
      expect(screen.getByText(/Vérification d'identité/)).toBeInTheDocument(),
    );
    expect(screen.getByText("À corriger")).toBeInTheDocument();
    // Aucun libellé mock d'« étape » fabriquée.
    expect(screen.queryByText(/Étape\s/)).not.toBeInTheDocument();
  });
});
