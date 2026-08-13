import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InlineError } from "@/components/feedback/InlineError";
import { ApiError } from "@/lib/api/ApiError";

describe("InlineError", () => {
  it("maps a 401 invalid_credentials login failure to a credential message", () => {
    const error = new ApiError(401, "invalid_credentials", {
      code: "invalid_credentials",
    });
    render(<InlineError error={error} />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "E-mail ou mot de passe incorrect.",
    );
  });

  it("keeps the session-expired copy for a bare 401 (no credential code)", () => {
    const error = new ApiError(401, "Unauthenticated.");
    render(<InlineError error={error} />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Session expirée. Reconnectez-vous.",
    );
  });

  it("renders nothing when there is no error", () => {
    const { container } = render(<InlineError error={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
