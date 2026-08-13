import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { afterEach, describe, expect, it } from "vitest";

import MerchantsPage from "./page";
import { envelope } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { ADMIN_BASE, adminUser, seedMe } from "@/test/admin";
import { renderWithAuth } from "@/test/utils";

const MERCHANTS = `${ADMIN_BASE}/api/admin/b2b/merchants`;

function merchant(uuid = "m1") {
  return {
    uuid,
    name: "Acme SARL",
    contact_email: "ops@acme.test",
    status: "active",
    can_reveal_pan: false,
    webhook_url: null,
    created_at: "2026-08-01T00:00:00+00:00",
  };
}

const SECRET = "sk_live_SECRET_ONLY_ONCE_123";
const WEBHOOK_SECRET = "wh_SECRET_456";

describe("MerchantsPage — secrets, revoke, maker-checker credit", () => {
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("refuses a user with neither merchant.manage nor merchant.credit", async () => {
    seedMe(adminUser(["ledger.read"], ["auditor"]));
    renderWithAuth(<MerchantsPage />);
    await waitFor(() =>
      expect(screen.getByText("Accès refusé")).toBeInTheDocument(),
    );
  });

  it("admits a credit-only maker but shows ONLY their credit action", async () => {
    seedMe(adminUser(["merchant.credit"], ["merchant_maker"]));
    server.use(
      http.get(MERCHANTS, () =>
        HttpResponse.json(envelope({ items: [merchant()] })),
      ),
    );
    renderWithAuth(<MerchantsPage />);

    // The page is reachable (not fail-closed) and lists the merchant.
    expect(await screen.findByText("Acme SARL")).toBeInTheDocument();
    expect(screen.queryByText("Accès refusé")).not.toBeInTheDocument();

    // Their own action is offered...
    expect(
      screen.getByRole("button", { name: "Créditer le wallet" }),
    ).toBeInTheDocument();
    // ...but every merchant.manage affordance stays hidden.
    expect(
      screen.queryByRole("button", { name: "Nouveau marchand" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Émettre une clé" }),
    ).not.toBeInTheDocument();
  });

  it("shows an issued key secret ONCE and never stores it", async () => {
    seedMe(adminUser(["merchant.manage"], ["merchant_admin"]));
    server.use(
      http.get(MERCHANTS, () =>
        HttpResponse.json(envelope({ items: [merchant()] })),
      ),
      http.post(`${MERCHANTS}/m1/keys`, () =>
        HttpResponse.json(
          envelope(
            {
              key: {
                uuid: "key-1",
                public_key: "pk_live_abc",
                status: "active",
                last_used_at: null,
                expires_at: null,
                revoked_at: null,
                created_at: "2026-08-01T00:00:00+00:00",
              },
              secret: SECRET,
              webhook_secret: WEBHOOK_SECRET,
            },
            "b2b_api_key_issued",
          ),
          { status: 201 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithAuth(<MerchantsPage />);

    await user.click(
      await screen.findByRole("button", { name: "Émettre une clé" }),
    );

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(SECRET)).toBeInTheDocument();
    expect(within(dialog).getByText(WEBHOOK_SECRET)).toBeInTheDocument();

    // The secret is never persisted to web storage.
    expect(JSON.stringify(localStorage)).not.toContain(SECRET);
    expect(JSON.stringify(sessionStorage)).not.toContain(SECRET);

    // Once the reveal is dismissed, the secret is gone and cannot be re-shown.
    await user.click(
      within(dialog).getByRole("button", { name: /j'ai copié les secrets/i }),
    );
    await waitFor(() =>
      expect(screen.queryByText(SECRET)).not.toBeInTheDocument(),
    );
    // The public key remains listed; there is no affordance to re-reveal a secret.
    expect(screen.getByText("pk_live_abc")).toBeInTheDocument();
    expect(JSON.stringify(localStorage)).not.toContain(SECRET);
    expect(JSON.stringify(sessionStorage)).not.toContain(SECRET);
  });

  it("crediting a wallet is maker-checker: a 202 shows 'en attente d'approbation'", async () => {
    seedMe(
      adminUser(["merchant.manage", "merchant.credit"], ["merchant_admin"]),
    );
    server.use(
      http.get(MERCHANTS, () =>
        HttpResponse.json(envelope({ items: [merchant()] })),
      ),
      http.post(`${MERCHANTS}/m1/wallet/credit`, () =>
        HttpResponse.json(
          envelope(
            {
              uuid: "ap-1",
              type: "merchant_credit",
              status: "pending",
              operation: "merchant_credit",
              target_uuid: "m1",
              proposed_values: { amount_minor: 5000 },
              requested_by: { id: 1, uuid: "admin-uuid", name: "Admin Test" },
              is_own_request: true,
              approved_by: null,
              created_at: "2026-08-12T00:00:00+00:00",
              decided_at: null,
              reason: null,
            },
            "b2b_wallet_credit_requested",
          ),
          { status: 202 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithAuth(<MerchantsPage />);

    await user.click(
      await screen.findByRole("button", { name: "Créditer le wallet" }),
    );
    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText(/Montant/i), "5000");
    await user.type(within(dialog).getByLabelText(/Source/i), "banque");
    await user.type(within(dialog).getByLabelText(/Référence/i), "REF-1");
    await user.click(
      within(dialog).getByRole("button", { name: /Soumettre pour approbation/i }),
    );

    await waitFor(() =>
      expect(
        screen.getByText(/en attente d'approbation/i),
      ).toBeInTheDocument(),
    );
    // The banner states the change is NOT applied.
    expect(screen.getByText(/n'est PAS encore appliquée/i)).toBeInTheDocument();
  });
});
