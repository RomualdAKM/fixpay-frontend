import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { adminUser, seedMe } from "@/test/admin";
import { renderWithAuth } from "@/test/utils";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn(), prefetch: vi.fn() }),
}));

describe("AdminGuard", () => {
  it("refuses an authenticated user with NO admin permission", async () => {
    seedMe(adminUser([], ["user"]));

    renderWithAuth(
      <AdminGuard>
        <div>admin content</div>
      </AdminGuard>,
    );

    await waitFor(() =>
      expect(screen.getByText("Accès refusé")).toBeInTheDocument(),
    );
    expect(screen.queryByText("admin content")).not.toBeInTheDocument();
    // A permission-less admin visitor is refused in place, not bounced to login.
    expect(replace).not.toHaveBeenCalled();
  });

  it("admits a config_admin (config.read/write)", async () => {
    seedMe(adminUser(["config.read", "config.write"], ["config_admin"]));

    renderWithAuth(
      <AdminGuard>
        <div>admin content</div>
      </AdminGuard>,
    );

    await waitFor(() =>
      expect(screen.getByText("admin content")).toBeInTheDocument(),
    );
    expect(screen.queryByText("Accès refusé")).not.toBeInTheDocument();
  });
});
