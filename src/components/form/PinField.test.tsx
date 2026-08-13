import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PinField } from "@/components/form/PinField";

describe("PinField", () => {
  it("announces progress via a polite live region with correct agreement", () => {
    const { rerender } = render(<PinField value="" length={6} />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    // 0 and 1 take the singular.
    expect(status).toHaveTextContent("0 chiffre sur 6 saisi");

    rerender(<PinField value="1" length={6} />);
    expect(screen.getByRole("status")).toHaveTextContent("1 chiffre sur 6 saisi");

    // 2+ takes the plural on both the noun and the participle.
    rerender(<PinField value="123" length={6} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "3 chiffres sur 6 saisis",
    );
  });
});
