import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RouteGuard } from "@/lib/auth";
import { envelope, errorEnvelope, testUser } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderWithAuth } from "@/test/utils";

const BASE = "http://localhost:8000";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn(), prefetch: vi.fn() }),
}));

describe("RouteGuard", () => {
  beforeEach(() => replace.mockClear());

  it("redirects a guest away from a protected route, preserving the attempted path", async () => {
    window.history.pushState({}, "", "/cards/abc");

    renderWithAuth(
      <RouteGuard>
        <div>secret content</div>
      </RouteGuard>,
    );

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(
        `/login?next=${encodeURIComponent("/cards/abc")}`,
      ),
    );
    expect(screen.queryByText("secret content")).not.toBeInTheDocument();

    window.history.pushState({}, "", "/");
  });

  it("shows a retry affordance (not a redirect) when GET /me fails transiently", async () => {
    server.use(
      http.get(`${BASE}/api/me`, () =>
        HttpResponse.json(errorEnvelope("server_error"), { status: 500 }),
      ),
    );

    renderWithAuth(
      <RouteGuard>
        <div>secret content</div>
      </RouteGuard>,
    );

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Réessayer" }),
      ).toBeInTheDocument(),
    );
    // A verification failure must never be conflated with a guest → no redirect.
    expect(replace).not.toHaveBeenCalled();
    expect(screen.queryByText("secret content")).not.toBeInTheDocument();
  });

  it("renders protected content for an authenticated user", async () => {
    server.use(
      http.get(`${BASE}/api/me`, () => HttpResponse.json(envelope(testUser))),
    );

    renderWithAuth(
      <RouteGuard>
        <div>secret content</div>
      </RouteGuard>,
    );

    await waitFor(() =>
      expect(screen.getByText("secret content")).toBeInTheDocument(),
    );
    expect(replace).not.toHaveBeenCalledWith("/login");
  });
});
