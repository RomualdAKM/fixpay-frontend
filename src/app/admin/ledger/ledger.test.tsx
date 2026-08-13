import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import LedgerPage from "./page";
import { envelope, xof } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { ADMIN_BASE, adminUser, seedMe } from "@/test/admin";
import { renderWithAuth } from "@/test/utils";

const ACCOUNTS = `${ADMIN_BASE}/api/admin/ledger/accounts`;

function account() {
  return {
    uuid: "acc-1",
    code: "WALLET:XOF",
    type: "liability",
    currency: "XOF",
    owner_type: "user",
    owner_id: 7,
    normal_side: "credit",
    balance: xof(1_500_000),
    debit_blocked: false,
    is_active: true,
  };
}

describe("LedgerPage — read-only", () => {
  it("refuses a user without ledger.read", async () => {
    seedMe(adminUser(["audit.read"], ["auditor"]));
    renderWithAuth(<LedgerPage />);
    await waitFor(() =>
      expect(screen.getByText("Accès refusé")).toBeInTheDocument(),
    );
  });

  it("lists accounts and exposes NO mutation affordance", async () => {
    seedMe(adminUser(["ledger.read"], ["auditor"]));
    server.use(
      http.get(ACCOUNTS, () =>
        HttpResponse.json(
          envelope({
            items: [account()],
            meta: { current_page: 1, per_page: 25, total: 1, last_page: 1 },
          }),
        ),
      ),
    );

    renderWithAuth(<LedgerPage />);
    expect(await screen.findByText("WALLET:XOF")).toBeInTheDocument();

    for (const name of [/Créer/i, /Modifier/i, /Supprimer/i, /Désactiver/i]) {
      expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
    }
  });
});
