import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import type { User } from "@/lib/api/types";
import { envelope } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderWithAuth } from "@/test/utils";

const BASE = "http://localhost:8000";

// PrivacyPage rend BottomNav (usePathname).
vi.mock("next/navigation", () => ({
  usePathname: () => "/profile/privacy",
}));

import PrivacyPage from "@/app/(flows)/profile/privacy/page";

const REAL_USER: User = {
  uuid: "u-real",
  name: "Amina Koné",
  email: "real.user@example.com",
  referral_code: "FP-AK2026",
  kyc_level: 1,
  status: "active",
  pin_set: true,
  email_verified: true,
  roles: ["user"],
  permissions: [],
};

describe("Privacy — data export recipient", () => {
  it("addresses the export to the real authenticated e-mail, not a mock literal", async () => {
    server.use(
      http.get(`${BASE}/api/me`, () => HttpResponse.json(envelope(REAL_USER))),
    );

    renderWithAuth(<PrivacyPage />);

    await waitFor(() =>
      expect(
        screen.getByText(/real\.user@example\.com/),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByText(/jean\.dupont@email\.com/),
    ).not.toBeInTheDocument();
  });
});
