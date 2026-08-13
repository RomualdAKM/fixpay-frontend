import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithClient } from "@/test/utils";

// SupportPage rend BottomNav (usePathname).
vi.mock("next/navigation", () => ({
  usePathname: () => "/support",
}));

import SupportPage from "@/app/(flows)/support/page";

describe("Support — emergency navigation", () => {
  it("routes 'Bloquer une carte' to the cards list, not a dead mock id", () => {
    renderWithClient(<SupportPage />);

    const block = screen.getByRole("link", { name: /Bloquer une carte/ });
    expect(block).toHaveAttribute("href", "/cards");
    // L'ancien id mock 404 ne doit plus être ciblé nulle part.
    expect(block).not.toHaveAttribute("href", "/cards/visa-4291");
  });
});
