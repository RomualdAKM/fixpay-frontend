import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import SettingsPage from "./page";
import { envelope } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { ADMIN_BASE, adminUser, seedMe } from "@/test/admin";
import { renderWithAuth } from "@/test/utils";

describe("SettingsPage — secret masking", () => {
  it("never renders an is_secret value in clear", async () => {
    seedMe(adminUser(["config.read", "config.write"]));
    server.use(
      http.get(`${ADMIN_BASE}/api/admin/config`, () =>
        HttpResponse.json(
          envelope({
            version: 7,
            items: [
              {
                key: "vcc.api_secret",
                value_type: "string",
                is_secret: true,
                value: null,
                label: "Secret API VCC",
                updated_at: null,
              },
              {
                key: "withdrawal.min_kyc_level",
                value_type: "int",
                is_secret: false,
                value: 1,
                label: "KYC minimum retrait",
                updated_at: null,
              },
            ],
          }),
        ),
      ),
    );

    renderWithAuth(<SettingsPage />);

    await waitFor(() =>
      expect(screen.getByText("vcc.api_secret")).toBeInTheDocument(),
    );
    // The secret is masked; the non-secret int value is shown plainly.
    expect(screen.getByText("••••••••")).toBeInTheDocument();
    expect(screen.getByText("secret")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    // The version is surfaced.
    expect(screen.getByText(/Version v7/)).toBeInTheDocument();
  });
});
