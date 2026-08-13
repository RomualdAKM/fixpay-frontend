import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import { envelope } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderWithClient } from "@/test/utils";

const BASE = "http://localhost:8000";

vi.mock("next/navigation", () => ({
  usePathname: () => "/notifications",
}));

import NotificationsPage from "@/app/(flows)/notifications/page";

function unread(id: string) {
  return {
    id,
    type: "deposit",
    data: { title: `Dépôt ${id}` },
    read_at: null,
    created_at: "2026-04-14T16:20:00+00:00",
  };
}

describe("Notifications — per-row marking", () => {
  it("disables only the row being marked, never the whole list", async () => {
    server.use(
      http.get(`${BASE}/api/notifications`, () =>
        HttpResponse.json(
          envelope({
            notifications: [unread("n1"), unread("n2")],
            unread_count: 2,
          }),
        ),
      ),
      // Requête volontairement suspendue : la mutation reste `pending`, ce qui
      // révèle si le désactivé fuit sur les autres lignes.
      http.post(
        `${BASE}/api/notifications/n1/read`,
        () => new Promise<never>(() => {}),
      ),
    );

    renderWithClient(<NotificationsPage />);

    const buttons = await waitFor(() => {
      const found = screen.getAllByRole("button", { name: "Marquer lu" });
      expect(found).toHaveLength(2);
      return found;
    });
    const [first, second] = buttons;
    if (!first || !second) throw new Error("expected two mark-read buttons");

    await userEvent.click(first);

    await waitFor(() => expect(first).toBeDisabled());
    // La seconde ligne reste actionnable pendant que la première est marquée.
    expect(second).not.toBeDisabled();
  });
});
