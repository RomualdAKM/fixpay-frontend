import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import { envelope, xof } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderWithClient } from "@/test/utils";

const BASE = "http://localhost:8000";

vi.mock("next/navigation", () => ({
  usePathname: () => "/profile/referral",
}));

import ReferralPage from "@/app/(flows)/profile/referral/page";

function seed(payoutStatus: string) {
  server.use(
    http.get(`${BASE}/api/referral`, () =>
      HttpResponse.json(
        envelope({
          code: "FP-AK2026",
          link: "https://fixpay.app/r/FP-AK2026",
          referees: [],
          commission_balance: xof(5000),
        }),
      ),
    ),
    http.post(`${BASE}/api/pin/verify`, () =>
      HttpResponse.json(
        envelope(
          { ticket: "payout-ticket", action: "referral_payout", expires_in: 120 },
          "pin_verified",
        ),
      ),
    ),
    http.post(`${BASE}/api/referral/payouts`, () =>
      HttpResponse.json(
        envelope(
          {
            uuid: "p1",
            status: payoutStatus,
            amount: xof(5000),
            approved_at: payoutStatus === "completed" ? "2026-04-14T16:21:00+00:00" : null,
            created_at: "2026-04-14T16:20:00+00:00",
          },
          "referral_payout",
        ),
        { status: 201 },
      ),
    ),
  );
}

async function runPayout() {
  const user = userEvent.setup();
  const cta = await waitFor(() => {
    const button = screen.getByRole("button", { name: /Transférer mes gains/ });
    expect(button).toBeEnabled();
    return button;
  });
  await user.click(cta);
  for (const digit of ["1", "2", "3", "4"]) {
    await user.click(await screen.findByRole("button", { name: digit }));
  }
  await user.click(screen.getByRole("button", { name: "Confirmer" }));
}

describe("Referral payout — result tone honesty", () => {
  it("shows a pending (awaiting-approval) payout in a warning tone, never green success", async () => {
    seed("pending");
    renderWithClient(<ReferralPage />);
    await runPayout();

    const message = await screen.findByText(/en attente de validation/);
    const box = message.closest("div");
    expect(box?.className).toContain("bg-warning/10");
    expect(box?.className).not.toContain("bg-success/10");
  });

  it("reserves the green success tone for a completed (settled) payout", async () => {
    seed("completed");
    renderWithClient(<ReferralPage />);
    await runPayout();

    const message = await screen.findByText(/transférés vers votre portefeuille/);
    const box = message.closest("div");
    expect(box?.className).toContain("bg-success/10");
    expect(box?.className).not.toContain("bg-warning/10");
  });
});
