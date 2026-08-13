import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { afterEach, describe, expect, it } from "vitest";

import MerchantsPage from "./page";
import { envelope, xof } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { ADMIN_BASE, adminUser, seedMe } from "@/test/admin";
import { renderWithAuth } from "@/test/utils";

const MERCHANTS = `${ADMIN_BASE}/api/admin/b2b/merchants`;

/** One API-key metadata object as the resource emits it — never a secret. */
function apiKey(overrides: Record<string, unknown> = {}) {
  return {
    uuid: "key-1",
    public_key: "pk_live_abc",
    status: "active",
    last_used_at: null,
    expires_at: null,
    revoked_at: null,
    created_at: "2026-08-01T00:00:00+00:00",
    ...overrides,
  };
}

function merchant(overrides: Record<string, unknown> = {}) {
  return {
    uuid: "m1",
    name: "Acme SARL",
    contact_email: "ops@acme.test",
    status: "active",
    can_reveal_pan: false,
    webhook_url: null,
    wallet_balance: xof(1_866_252),
    api_keys: [],
    created_at: "2026-08-01T00:00:00+00:00",
    ...overrides,
  };
}

const SECRET = "sk_live_SECRET_ONLY_ONCE_123";
const WEBHOOK_SECRET = "wh_SECRET_456";

describe("MerchantsPage — balance, key listing, revoke, secrets", () => {
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

  it("shows the real merchant wallet balance (formatMoney, XOF)", async () => {
    seedMe(adminUser(["merchant.manage"], ["merchant_admin"]));
    server.use(
      http.get(MERCHANTS, () =>
        HttpResponse.json(
          envelope({ items: [merchant({ wallet_balance: xof(1_866_252) })] }),
        ),
      ),
    );
    renderWithAuth(<MerchantsPage />);

    expect(await screen.findByText(/1\s*866\s*252\s*FCFA/)).toBeInTheDocument();
  });

  it("lists the existing API keys (public key + status) and never a secret", async () => {
    seedMe(adminUser(["merchant.manage"], ["merchant_admin"]));
    server.use(
      http.get(MERCHANTS, () =>
        HttpResponse.json(
          envelope({
            items: [
              merchant({
                api_keys: [
                  apiKey({ status: "active" }),
                  apiKey({
                    uuid: "key-2",
                    public_key: "pk_live_old",
                    status: "revoked",
                    revoked_at: "2026-08-05T00:00:00+00:00",
                  }),
                ],
              }),
            ],
          }),
        ),
      ),
    );
    const user = userEvent.setup();
    renderWithAuth(<MerchantsPage />);

    await user.click(await screen.findByRole("button", { name: "Détail" }));
    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getByText("pk_live_abc")).toBeInTheDocument();
    expect(within(dialog).getByText("pk_live_old")).toBeInTheDocument();
    expect(within(dialog).getByText("Active")).toBeInTheDocument();
    expect(within(dialog).getByText("Révoquée")).toBeInTheDocument();

    // A listing is metadata only — no secret is ever present here.
    expect(within(dialog).queryByText(/sk_live/)).not.toBeInTheDocument();
    expect(within(dialog).queryByText(/wh_/)).not.toBeInTheDocument();
  });

  it("shows an empty state when the merchant has no API keys", async () => {
    seedMe(adminUser(["merchant.manage"], ["merchant_admin"]));
    server.use(
      http.get(MERCHANTS, () =>
        HttpResponse.json(envelope({ items: [merchant({ api_keys: [] })] })),
      ),
    );
    const user = userEvent.setup();
    renderWithAuth(<MerchantsPage />);

    await user.click(await screen.findByRole("button", { name: "Détail" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/Aucune clé API/i)).toBeInTheDocument();
  });

  it("revokes a listed key: calls the endpoint, refreshes, and marks it revoked", async () => {
    seedMe(adminUser(["merchant.manage"], ["merchant_admin"]));
    let revoked = false;
    let revokeCalled = false;
    server.use(
      http.get(MERCHANTS, () =>
        HttpResponse.json(
          envelope({
            items: [
              merchant({
                api_keys: [
                  apiKey({
                    status: revoked ? "revoked" : "active",
                    revoked_at: revoked ? "2026-08-12T00:00:00+00:00" : null,
                  }),
                ],
              }),
            ],
          }),
        ),
      ),
      http.post(`${MERCHANTS}/m1/keys/key-1/revoke`, () => {
        revoked = true;
        revokeCalled = true;
        return HttpResponse.json(
          envelope(
            apiKey({ status: "revoked", revoked_at: "2026-08-12T00:00:00+00:00" }),
            "b2b_api_key_revoked",
          ),
        );
      }),
    );
    const user = userEvent.setup();
    renderWithAuth(<MerchantsPage />);

    await user.click(await screen.findByRole("button", { name: "Détail" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Révoquer" }));

    // The right endpoint was hit...
    await waitFor(() => expect(revokeCalled).toBe(true));
    // ...and after the refresh the key is marked revoked, with no revoke action.
    await waitFor(() =>
      expect(within(dialog).getByText("Révoquée")).toBeInTheDocument(),
    );
    expect(
      within(dialog).queryByRole("button", { name: "Révoquer" }),
    ).not.toBeInTheDocument();
  });

  it("reveals an issued key secret ONCE, never stores it, lists only metadata after", async () => {
    seedMe(adminUser(["merchant.manage"], ["merchant_admin"]));
    let hasKey = false;
    server.use(
      http.get(MERCHANTS, () =>
        HttpResponse.json(
          envelope({
            items: [merchant({ api_keys: hasKey ? [apiKey()] : [] })],
          }),
        ),
      ),
      http.post(`${MERCHANTS}/m1/keys`, () => {
        hasKey = true;
        return HttpResponse.json(
          envelope(
            {
              key: apiKey(),
              secret: SECRET,
              webhook_secret: WEBHOOK_SECRET,
            },
            "b2b_api_key_issued",
          ),
          { status: 201 },
        );
      }),
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

    // Once dismissed, the secret is gone and cannot be re-shown.
    await user.click(
      within(dialog).getByRole("button", { name: /j'ai copié les secrets/i }),
    );
    await waitFor(() =>
      expect(screen.queryByText(SECRET)).not.toBeInTheDocument(),
    );

    // The key now appears in the real listing — as metadata only, no secret.
    await user.click(await screen.findByRole("button", { name: "Détail" }));
    const detail = await screen.findByRole("dialog");
    expect(within(detail).getByText("pk_live_abc")).toBeInTheDocument();
    expect(within(detail).queryByText(SECRET)).not.toBeInTheDocument();
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
