import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import ApprovalsPage from "./page";
import { envelope } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { ADMIN_BASE, adminUser, seedMe } from "@/test/admin";
import { renderWithAuth } from "@/test/utils";

const CONFIG = `${ADMIN_BASE}/api/admin/approvals/config`;

function approval(uuid: string, isOwn: boolean, values: Record<string, unknown>) {
  return {
    uuid,
    type: "config_change",
    status: "pending",
    operation: "fx_rate_create",
    target_uuid: null,
    proposed_values: values,
    requested_by: { id: 9, uuid: "u-9", name: "Alice Maker" },
    is_own_request: isOwn,
    approved_by: null,
    created_at: "2026-08-12T09:00:00+00:00",
    decided_at: null,
    reason: null,
  };
}

describe("ApprovalsPage — enriched diff + pre-disabled self-approval", () => {
  it("pre-disables Approve for the maker's own request, enables it otherwise", async () => {
    seedMe(adminUser(["config.approve"], ["security_officer"]));
    server.use(
      http.get(CONFIG, () =>
        HttpResponse.json(
          envelope({
            items: [
              approval("own", true, { rate: "600" }),
              approval("other", false, { rate: "610" }),
            ],
          }),
        ),
      ),
    );

    renderWithAuth(<ApprovalsPage />);

    const approveButtons = await screen.findAllByRole("button", {
      name: "Approuver",
    });
    expect(approveButtons).toHaveLength(2);
    // Row order matches the payload: own request first (disabled), other second.
    expect(approveButtons[0]).toBeDisabled();
    expect(approveButtons[1]).toBeEnabled();
    expect(screen.getByText(/Vous êtes le demandeur/i)).toBeInTheDocument();
  });

  it("renders the proposed-values diff, with secret fields left masked", async () => {
    seedMe(adminUser(["config.approve"], ["security_officer"]));
    server.use(
      http.get(CONFIG, () =>
        HttpResponse.json(
          envelope({
            items: [
              approval("a1", false, {
                key: "vcc_api_secret",
                value: "••••••",
                amount_minor: 5000,
              }),
            ],
          }),
        ),
      ),
    );

    renderWithAuth(<ApprovalsPage />);

    // The maker and the human-readable diff are both shown.
    expect(await screen.findByText("Alice Maker")).toBeInTheDocument();
    expect(screen.getByText("amount_minor")).toBeInTheDocument();
    expect(screen.getByText("5000")).toBeInTheDocument();
    // The masked secret is rendered as-is; no clear secret ever appears.
    expect(screen.getByText("••••••")).toBeInTheDocument();
    await waitFor(() =>
      expect(document.body.innerHTML).not.toContain("vcc_api_secret_value"),
    );
  });
});
