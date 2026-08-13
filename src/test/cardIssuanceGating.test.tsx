import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import { envelope, xof } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderWithClient } from "@/test/utils";

const BASE = "http://localhost:8000";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/cards/new",
  useSearchParams: () => new URLSearchParams(),
}));

import CreateCardPage from "@/app/(flows)/cards/new/page";

/** offer + wallet resolvent toujours ; seule la liste des cartes varie. */
function withOffersAndWallet() {
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
    http.get(`${BASE}/api/wallet`, () =>
      HttpResponse.json(
        envelope({ uuid: "w1", status: "active", balance: xof(100_000) }),
      ),
    ),
  );
}

describe("card issuance — confirmation gated on a loaded card list", () => {
  it("keeps « Créer la carte » disabled while GET /api/cards has not resolved", async () => {
    // Régression finding 3 : sans la liste des cartes chargée, l'instantané
    // knownUuids pris à la confirmation pourrait être `[]` alors que des cartes
    // existent, faisant passer une carte préexistante pour la nouvelle (faux
    // succès, le débit d'émission étant déjà prélevé). L'émission ne doit donc
    // pas être confirmable tant que la liste n'est pas réellement chargée.
    withOffersAndWallet();
    server.use(
      http.get(`${BASE}/api/cards`, () =>
        HttpResponse.json(envelope(null), { status: 500 }),
      ),
    );

    renderWithClient(<CreateCardPage />);

    await userEvent.click(
      await screen.findByRole("button", { name: /Visa/ }),
    );

    // Le solde et l'offre sont là, mais la liste des cartes a échoué : le CTA
    // reste verrouillé au lieu de laisser lancer une émission non traçable.
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Créer la carte" }),
      ).toBeDisabled(),
    );
  });

  it("enables « Créer la carte » once the card list is loaded", async () => {
    withOffersAndWallet();
    server.use(
      http.get(`${BASE}/api/cards`, () => HttpResponse.json(envelope([]))),
    );

    renderWithClient(<CreateCardPage />);

    await userEvent.click(
      await screen.findByRole("button", { name: /Visa/ }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Créer la carte" }),
      ).toBeEnabled(),
    );
  });
});
