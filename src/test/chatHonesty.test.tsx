import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithClient } from "@/test/utils";

vi.mock("next/navigation", () => ({
  usePathname: () => "/support/chat",
}));

import ChatSupportPage from "@/app/(flows)/support/chat/page";

describe("Support chat — no fabricated account operation", () => {
  it("renders a generic welcome without any FP- reference, amount, or receipt", () => {
    renderWithClient(<ChatSupportPage />);

    // Accueil générique, honnête.
    expect(
      screen.getByText(/je suis l'assistant FixPay/),
    ).toBeInTheDocument();

    // Aucune opération de compte fabriquée présentée comme réelle.
    expect(screen.queryByText(/FP-\d/)).not.toBeInTheDocument();
    expect(screen.queryByText(/30\s*000/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Voir le reçu/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Total débité/)).not.toBeInTheDocument();
  });
});
