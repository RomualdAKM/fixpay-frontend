import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import ApprovalsPage from "./page";
import { envelope, errorEnvelope } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { ADMIN_BASE, adminUser, seedMe } from "@/test/admin";
import { renderWithAuth } from "@/test/utils";

function pendingItem(uuid: string, requestedBy: number) {
  return {
    uuid,
    type: "config_change",
    status: "pending",
    operation: "fx_rate_create",
    target_uuid: null,
    requested_by: requestedBy,
    approved_by: null,
    decided_at: null,
    reason: null,
  };
}

describe("ApprovalsPage — separation of duties", () => {
  it("blocks self-approval: the requester's Approve is refused, disabled and explained", async () => {
    seedMe(adminUser(["config.approve"], ["security_officer"]));
    server.use(
      http.get(`${ADMIN_BASE}/api/admin/approvals/config`, () =>
        HttpResponse.json(envelope({ items: [pendingItem("a1", 5)] })),
      ),
      http.post(
        `${ADMIN_BASE}/api/admin/approvals/config/a1/approve`,
        () =>
          HttpResponse.json(
            errorEnvelope("self_approval_forbidden", {
              code: "self_approval_forbidden",
            }),
            { status: 422 },
          ),
      ),
    );

    const user = userEvent.setup();
    renderWithAuth(<ApprovalsPage />);

    const approveBtn = await screen.findByRole("button", { name: "Approuver" });
    expect(approveBtn).toBeEnabled();

    await user.click(approveBtn);

    await waitFor(() =>
      expect(screen.getByText(/Vous êtes le demandeur/i)).toBeInTheDocument(),
    );
    // The button is now disabled — a maker can never decide their own request.
    expect(
      screen.getByRole("button", { name: "Approuver" }),
    ).toBeDisabled();
  });

  it("approving refreshes the list (the decided item disappears)", async () => {
    let listCalls = 0;
    seedMe(adminUser(["config.approve"], ["security_officer"]));
    server.use(
      http.get(`${ADMIN_BASE}/api/admin/approvals/config`, () => {
        listCalls += 1;
        const items = listCalls === 1 ? [pendingItem("a2", 9)] : [];
        return HttpResponse.json(envelope({ items }));
      }),
      http.post(
        `${ADMIN_BASE}/api/admin/approvals/config/a2/approve`,
        () =>
          HttpResponse.json(
            envelope(
              { ...pendingItem("a2", 9), status: "approved", approved_by: 1 },
              "approval_approved",
            ),
          ),
      ),
    );

    const user = userEvent.setup();
    renderWithAuth(<ApprovalsPage />);

    await user.click(await screen.findByRole("button", { name: "Approuver" }));

    await waitFor(() =>
      expect(
        screen.getByText("Aucune demande en attente."),
      ).toBeInTheDocument(),
    );
    expect(listCalls).toBeGreaterThanOrEqual(2);
  });

  it("shows an honest empty state when the user holds no approval permission", async () => {
    seedMe(adminUser(["audit.read"], ["auditor"]));

    renderWithAuth(<ApprovalsPage />);

    await waitFor(() =>
      expect(
        screen.getByText(/aucune section d'approbation/i),
      ).toBeInTheDocument(),
    );
    // Neither approval section rendered its table.
    expect(
      screen.queryByText("Modifications de configuration"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Approvisionnements marchands"),
    ).not.toBeInTheDocument();
  });

  it("rejecting with a reason refreshes the list", async () => {
    let listCalls = 0;
    let sentReason: string | null = null;
    seedMe(adminUser(["config.approve"], ["security_officer"]));
    server.use(
      http.get(`${ADMIN_BASE}/api/admin/approvals/config`, () => {
        listCalls += 1;
        const items = listCalls === 1 ? [pendingItem("a3", 9)] : [];
        return HttpResponse.json(envelope({ items }));
      }),
      http.post(
        `${ADMIN_BASE}/api/admin/approvals/config/a3/reject`,
        async ({ request }) => {
          const body = (await request.json()) as { reason?: string };
          sentReason = body.reason ?? null;
          return HttpResponse.json(
            envelope(
              { ...pendingItem("a3", 9), status: "rejected", reason: body.reason ?? null },
              "approval_rejected",
            ),
          );
        },
      ),
    );

    const user = userEvent.setup();
    renderWithAuth(<ApprovalsPage />);

    await user.click(await screen.findByRole("button", { name: "Rejeter" }));
    const dialog = await screen.findByRole("dialog");
    await user.type(
      within(dialog).getByLabelText(/Motif/i),
      "Taux erroné",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Confirmer le rejet" }),
    );

    await waitFor(() =>
      expect(
        screen.getByText("Aucune demande en attente."),
      ).toBeInTheDocument(),
    );
    expect(sentReason).toBe("Taux erroné");
    expect(listCalls).toBeGreaterThanOrEqual(2);
  });
});
