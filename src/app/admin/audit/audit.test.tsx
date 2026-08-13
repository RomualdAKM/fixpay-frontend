import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import AuditPage from "./page";
import { envelope } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { ADMIN_BASE, adminUser, seedMe } from "@/test/admin";
import { renderWithAuth } from "@/test/utils";

const AUDIT = `${ADMIN_BASE}/api/admin/audit`;

function log(uuid = "log-1") {
  return {
    uuid,
    actor_type: "admin",
    actor_id: 3,
    action: "config.updated",
    subject_type: "AdminConfig",
    subject_id: 12,
    context: null,
    hash: "h1",
    previous_hash: "h0",
    created_at: "2026-08-12T10:00:00+00:00",
  };
}

function seedList() {
  server.use(
    http.get(AUDIT, () =>
      HttpResponse.json(
        envelope({
          items: [log()],
          meta: { current_page: 1, per_page: 25, total: 1, last_page: 1 },
        }),
      ),
    ),
  );
}

describe("AuditPage — chain integrity", () => {
  it("refuses a user without audit.read", async () => {
    seedMe(adminUser(["ledger.read"], ["auditor"]));
    renderWithAuth(<AuditPage />);
    await waitFor(() =>
      expect(screen.getByText("Accès refusé")).toBeInTheDocument(),
    );
  });

  it("reports an INTACT chain", async () => {
    seedMe(adminUser(["audit.read"], ["auditor"]));
    seedList();
    server.use(
      http.get(`${AUDIT}/verify`, () =>
        HttpResponse.json(
          envelope({ intact: true, broken_at_uuid: null, entries: 128 }),
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithAuth(<AuditPage />);
    await screen.findByText("config.updated");
    await user.click(
      screen.getByRole("button", { name: /Vérifier l'intégrité/i }),
    );
    await waitFor(() =>
      expect(screen.getByText(/Intègre/i)).toBeInTheDocument(),
    );
  });

  it("reports a BROKEN chain and names the break point", async () => {
    seedMe(adminUser(["audit.read"], ["auditor"]));
    seedList();
    server.use(
      http.get(`${AUDIT}/verify`, () =>
        HttpResponse.json(
          envelope({
            intact: false,
            broken_at_uuid: "log-77",
            entries: 128,
          }),
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithAuth(<AuditPage />);
    await screen.findByText("config.updated");
    await user.click(
      screen.getByRole("button", { name: /Vérifier l'intégrité/i }),
    );
    await waitFor(() =>
      expect(screen.getByText(/Rompue/i)).toBeInTheDocument(),
    );
    expect(screen.getByText("log-77")).toBeInTheDocument();
  });
});
