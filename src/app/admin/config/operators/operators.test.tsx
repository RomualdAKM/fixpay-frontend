import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import OperatorsPage from "./page";
import { envelope, errorEnvelope } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { ADMIN_BASE, adminUser, seedMe } from "@/test/admin";
import { renderWithAuth } from "@/test/utils";

function operator(code: string, name: string, enabled: boolean) {
  return {
    code,
    name,
    currency: "XOF",
    country: "CI",
    supports_payin: true,
    supports_payout: true,
    fixpay_enabled: enabled,
    synced_at: null,
  };
}

function seedList() {
  server.use(
    http.get(`${ADMIN_BASE}/api/admin/operators`, () =>
      HttpResponse.json(
        envelope({
          items: [
            operator("MTN", "MTN", false),
            operator("ORANGE", "Orange", false),
          ],
        }),
      ),
    ),
  );
}

describe("OperatorsPage — write honesty", () => {
  it("shows the direct-apply banner after a successful toggle", async () => {
    seedMe(adminUser(["config.read", "config.write"]));
    seedList();
    server.use(
      http.patch(`${ADMIN_BASE}/api/admin/operators/MTN`, () =>
        HttpResponse.json(
          envelope(operator("MTN", "MTN", true), "operator_curated"),
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithAuth(<OperatorsPage />);

    await user.click(await screen.findByRole("switch", { name: "Activer MTN" }));

    await waitFor(() =>
      expect(screen.getByText(/Modification appliquée/i)).toBeInTheDocument(),
    );
  });

  it("a failed toggle clears the prior success banner and surfaces an error", async () => {
    seedMe(adminUser(["config.read", "config.write"]));
    seedList();
    server.use(
      http.patch(`${ADMIN_BASE}/api/admin/operators/MTN`, () =>
        HttpResponse.json(
          envelope(operator("MTN", "MTN", true), "operator_curated"),
        ),
      ),
      http.patch(`${ADMIN_BASE}/api/admin/operators/ORANGE`, () =>
        HttpResponse.json(errorEnvelope("forbidden"), { status: 403 }),
      ),
    );

    const user = userEvent.setup();
    renderWithAuth(<OperatorsPage />);

    // First toggle succeeds → green "appliquée" banner.
    await user.click(await screen.findByRole("switch", { name: "Activer MTN" }));
    await waitFor(() =>
      expect(screen.getByText(/Modification appliquée/i)).toBeInTheDocument(),
    );

    // A distinct toggle then fails: the stale success banner must be gone and an
    // honest error shown instead. "Les données ne mentent pas."
    await user.click(screen.getByRole("switch", { name: "Activer Orange" }));

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
