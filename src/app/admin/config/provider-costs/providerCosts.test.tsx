import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import ProviderCostsPage from "./page";
import { envelope, errorEnvelope } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { ADMIN_BASE, adminUser, seedMe } from "@/test/admin";
import { renderWithAuth } from "@/test/utils";

const createdCost = {
  uuid: "pc-1",
  provider: "zayono",
  event_type: "withdrawal",
  scope_type: "global",
  scope_value: null,
  cost_type: "fixed",
  cost_value: "100",
  failure_cost_minor: null,
  currency: "XOF",
  source: "manual",
  synced_at: null,
  effective_from: null,
  effective_to: null,
};

describe("ProviderCostsPage — deactivate error honesty", () => {
  it("surfaces an error when a Désactiver mutation fails, without a success banner", async () => {
    seedMe(adminUser(["config.read", "config.write"]));
    server.use(
      http.get(`${ADMIN_BASE}/api/admin/provider-costs`, () =>
        HttpResponse.json(envelope({ items: [createdCost] })),
      ),
      http.post(
        `${ADMIN_BASE}/api/admin/provider-costs/pc-1/deactivate`,
        () => HttpResponse.json(errorEnvelope("forbidden"), { status: 403 }),
      ),
    );

    const user = userEvent.setup();
    renderWithAuth(<ProviderCostsPage />);

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

describe("ProviderCostsPage — direct apply honesty", () => {
  it("a non-sensitive write applied (201) says 'appliquée'", async () => {
    seedMe(adminUser(["config.read", "config.write"]));
    server.use(
      http.get(`${ADMIN_BASE}/api/admin/provider-costs`, () =>
        HttpResponse.json(envelope({ items: [] })),
      ),
      http.post(`${ADMIN_BASE}/api/admin/provider-costs`, () =>
        HttpResponse.json(envelope(createdCost, "provider_cost_created"), {
          status: 201,
        }),
      ),
    );

    const user = userEvent.setup();
    renderWithAuth(<ProviderCostsPage />);

    await user.click(
      await screen.findByRole("button", { name: /Nouveau coût/ }),
    );
    await user.type(screen.getByLabelText("Valeur de coût"), "100");
    await user.click(screen.getByRole("button", { name: "Créer" }));

    await waitFor(() =>
      expect(screen.getByText(/Modification appliquée/i)).toBeInTheDocument(),
    );
    expect(
      screen.queryByText(/en attente d'approbation/i),
    ).not.toBeInTheDocument();
  });
});
