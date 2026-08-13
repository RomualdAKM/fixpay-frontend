import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import ReconciliationPage from "./page";
import { envelope, xof } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { ADMIN_BASE, adminUser, seedMe } from "@/test/admin";
import { renderWithAuth } from "@/test/utils";

const RECON = `${ADMIN_BASE}/api/admin/reconciliation`;

function seedAll(driftMinor: number) {
  server.use(
    http.get(`${RECON}/floats`, () =>
      HttpResponse.json(
        envelope({
          items: [
            {
              uuid: "f1",
              provider: "zayono",
              currency: "XOF",
              ledger_balance: xof(1_000_000),
              provider_balance: xof(1_000_000 - driftMinor),
              drift_minor: driftMinor,
              status: driftMinor === 0 ? "ok" : "drift",
              captured_at: "2026-08-12T08:00:00+00:00",
            },
          ],
        }),
      ),
    ),
    http.get(`${RECON}/runs`, () => HttpResponse.json(envelope({ items: [] }))),
    http.get(`${RECON}/ticks`, () => HttpResponse.json(envelope({ items: [] }))),
    http.get(`${RECON}/tasks`, () => HttpResponse.json(envelope({ items: [] }))),
  );
}

describe("ReconciliationPage — drift visibility", () => {
  it("refuses a user without ledger.read", async () => {
    seedMe(adminUser(["audit.read"], ["auditor"]));
    renderWithAuth(<ReconciliationPage />);
    await waitFor(() =>
      expect(screen.getByText("Accès refusé")).toBeInTheDocument(),
    );
  });

  it("surfaces a non-zero float drift as an alert", async () => {
    seedMe(adminUser(["ledger.read"], ["auditor"]));
    seedAll(25_000);
    renderWithAuth(<ReconciliationPage />);

    // The drifting provider row is shown with its 'drift' status.
    expect(await screen.findByText("zayono")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getAllByText(/drift/i).length).toBeGreaterThan(0),
    );
  });

  it("keeps the DIRECTION of a XOF drift (a negative shows a minus sign)", async () => {
    seedMe(adminUser(["ledger.read"], ["auditor"]));
    // Provider holds MORE than the ledger records: a negative drift.
    seedAll(-3000);
    renderWithAuth(<ReconciliationPage />);

    expect(await screen.findByText("zayono")).toBeInTheDocument();
    // The magnitude keeps its sign — it must not read like a positive +3 000.
    await waitFor(() =>
      expect(screen.getByText(/^-\s*3\s*000\s*FCFA$/)).toBeInTheDocument(),
    );
    expect(screen.queryByText(/^\+?\s*3\s*000\s*FCFA$/)).not.toBeInTheDocument();
  });

  it("shows a failed scheduler tick's error message", async () => {
    seedMe(adminUser(["ledger.read"], ["auditor"]));
    server.use(
      http.get(`${RECON}/floats`, () =>
        HttpResponse.json(envelope({ items: [] })),
      ),
      http.get(`${RECON}/runs`, () => HttpResponse.json(envelope({ items: [] }))),
      http.get(`${RECON}/ticks`, () =>
        HttpResponse.json(
          envelope({
            items: [
              {
                id: 1,
                trigger: "schedule:run",
                status: "failed",
                duration_ms: 1200,
                steps: null,
                error: "SQLSTATE[HY000]: connection refused",
                started_at: "2026-08-12T08:00:00+00:00",
                finished_at: "2026-08-12T08:00:01+00:00",
              },
            ],
          }),
        ),
      ),
      http.get(`${RECON}/tasks`, () => HttpResponse.json(envelope({ items: [] }))),
    );
    renderWithAuth(<ReconciliationPage />);

    await waitFor(() =>
      expect(
        screen.getByText(/SQLSTATE\[HY000\]: connection refused/),
      ).toBeInTheDocument(),
    );
  });
});
