import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import PricingRulesPage from "./page";
import { envelope, errorEnvelope } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { ADMIN_BASE, adminUser, seedMe } from "@/test/admin";
import { renderWithAuth } from "@/test/utils";

function seedEmptyList() {
  server.use(
    http.get(`${ADMIN_BASE}/api/admin/pricing-rules`, () =>
      HttpResponse.json(envelope({ items: [], meta: undefined })),
    ),
  );
}

const pendingApproval = {
  uuid: "appr-1",
  type: "config_change",
  status: "pending",
  operation: "pricing_rule_create",
  target_uuid: null,
  requested_by: 5,
  approved_by: null,
  decided_at: null,
  reason: null,
};

describe("PricingRulesPage — config.write gating", () => {
  it("hides the write action without config.write", async () => {
    seedMe(adminUser(["config.read"]));
    seedEmptyList();

    renderWithAuth(<PricingRulesPage />);

    await waitFor(() =>
      expect(
        screen.getByText("Aucune règle de tarification."),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("button", { name: /Nouvelle règle/ }),
    ).not.toBeInTheDocument();
  });

  it("shows the write action with config.write", async () => {
    seedMe(adminUser(["config.read", "config.write"]));
    seedEmptyList();

    renderWithAuth(<PricingRulesPage />);

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /Nouvelle règle/ }),
      ).toBeInTheDocument(),
    );
  });
});

const existingRule = {
  uuid: "rule-1",
  event_type: "withdrawal",
  channel: "app",
  scope_type: "global",
  scope_value: null,
  margin_type: "fixed",
  margin_value: "100",
  min_margin_minor: null,
  max_margin_minor: null,
  failure_cost_bearer: "fixpay",
  currency: "XOF",
  effective_from: null,
  effective_to: null,
};

describe("PricingRulesPage — deactivate error honesty", () => {
  it("surfaces an error when a Désactiver mutation fails, without a success banner", async () => {
    seedMe(adminUser(["config.read", "config.write"]));
    server.use(
      http.get(`${ADMIN_BASE}/api/admin/pricing-rules`, () =>
        HttpResponse.json(envelope({ items: [existingRule] })),
      ),
      http.post(
        `${ADMIN_BASE}/api/admin/pricing-rules/rule-1/deactivate`,
        () => HttpResponse.json(errorEnvelope("forbidden"), { status: 403 }),
      ),
    );

    const user = userEvent.setup();
    renderWithAuth(<PricingRulesPage />);

    await user.click(
      await screen.findByRole("button", { name: "Désactiver" }),
    );

    await waitFor(() =>
      expect(
        screen.getByText(/Vous n'avez pas accès à cette action/i),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByText(/Modification appliquée/i),
    ).not.toBeInTheDocument();
  });
});

describe("PricingRulesPage — maker-checker honesty", () => {
  it("a sensitive write returning 202 says 'en attente d'approbation', NOT 'appliquée'", async () => {
    seedMe(adminUser(["config.read", "config.write"]));
    seedEmptyList();
    server.use(
      http.post(`${ADMIN_BASE}/api/admin/pricing-rules`, () =>
        HttpResponse.json(
          envelope(pendingApproval, "pricing_rule_change_requested"),
          { status: 202 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithAuth(<PricingRulesPage />);

    await user.click(
      await screen.findByRole("button", { name: /Nouvelle règle/ }),
    );
    await user.type(screen.getByLabelText("Valeur de marge"), "100");
    await user.click(
      screen.getByRole("button", { name: "Soumettre pour approbation" }),
    );

    await waitFor(() =>
      expect(
        screen.getByText(/en attente d'approbation/i),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByText(/Modification appliquée/i)).not.toBeInTheDocument();
  });

  it("maps a 422 back onto the offending field", async () => {
    seedMe(adminUser(["config.read", "config.write"]));
    seedEmptyList();
    server.use(
      http.post(`${ADMIN_BASE}/api/admin/pricing-rules`, () =>
        HttpResponse.json(
          errorEnvelope("validation_failed", {
            margin_value: ["overlapping_pricing_rule_effectivity"],
          }),
          { status: 422 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithAuth(<PricingRulesPage />);

    await user.click(
      await screen.findByRole("button", { name: /Nouvelle règle/ }),
    );
    await user.type(screen.getByLabelText("Valeur de marge"), "100");
    await user.click(
      screen.getByRole("button", { name: "Soumettre pour approbation" }),
    );

    await waitFor(() =>
      expect(
        screen.getByText("overlapping_pricing_rule_effectivity"),
      ).toBeInTheDocument(),
    );
    // Still on the form (no success/pending banner).
    expect(
      screen.queryByText(/en attente d'approbation/i),
    ).not.toBeInTheDocument();
  });
});
