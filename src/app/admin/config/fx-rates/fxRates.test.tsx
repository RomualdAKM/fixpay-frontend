import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import FxRatesPage from "./page";
import { envelope } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { ADMIN_BASE, adminUser, seedMe } from "@/test/admin";
import { renderWithAuth } from "@/test/utils";

const rate = {
  uuid: "fx-1",
  base_currency: "USD",
  quote_currency: "XOF",
  rate: "600",
  margin_percent: "1.5",
  effective_from: "2026-08-01T00:00:00+00:00",
  created_by: 3,
  created_at: "2026-08-01T00:00:00+00:00",
};

describe("FxRatesPage — append-only", () => {
  it("offers creation but NO per-row edit/deactivate (append-only)", async () => {
    seedMe(adminUser(["config.read", "config.write"]));
    server.use(
      http.get(`${ADMIN_BASE}/api/admin/fx-rates`, () =>
        HttpResponse.json(envelope({ items: [rate] })),
      ),
    );

    renderWithAuth(<FxRatesPage />);

    // The only write affordance is "Nouveau taux" (create).
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /Nouveau taux/ }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText("USD / XOF")).toBeInTheDocument();
    // No mutation of an existing rate exists.
    expect(
      screen.queryByRole("button", { name: "Modifier" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Désactiver" }),
    ).not.toBeInTheDocument();
  });
});
