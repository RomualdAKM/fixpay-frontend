import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { useAuth } from "@/lib/auth";
import { queryKeys } from "@/lib/query/keys";
import { envelope, errorEnvelope, testUser } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderWithAuth } from "@/test/utils";

const BASE = "http://localhost:8000";

/** Minimal probe exposing auth state and actions to the test. */
function Probe() {
  const { status, user, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="email">{user?.email ?? "none"}</span>
      <button
        type="button"
        onClick={() => {
          void login({ email: "jean.dupont@email.com", password: "secret" });
        }}
      >
        login
      </button>
      <button type="button" onClick={() => void logout()}>
        logout
      </button>
    </div>
  );
}

describe("AuthProvider", () => {
  it("bootstraps to guest when GET /me returns 401", async () => {
    renderWithAuth(<Probe />);

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("guest"),
    );
    expect(screen.getByTestId("email")).toHaveTextContent("none");
  });

  it("becomes authenticated after a successful login", async () => {
    renderWithAuth(<Probe />);
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("guest"),
    );

    await userEvent.click(screen.getByText("login"));

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated"),
    );
    expect(screen.getByTestId("email")).toHaveTextContent(testUser.email);
  });

  it("returns to guest and clears the cache on logout", async () => {
    const { client } = renderWithAuth(<Probe />);
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("guest"),
    );

    await userEvent.click(screen.getByText("login"));
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated"),
    );
    // Seed an unrelated cache entry to prove logout clears everything.
    client.setQueryData(queryKeys.wallet, { marker: true });

    // After logout the server reports the session is gone.
    server.use(
      http.post(`${BASE}/api/logout`, () =>
        HttpResponse.json(envelope(null, "logged_out")),
      ),
    );

    await userEvent.click(screen.getByText("logout"));

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("guest"),
    );
    expect(client.getQueryData(queryKeys.wallet)).toBeUndefined();
  });

  it("drops to guest and clears the cache even when logout fails (dead session)", async () => {
    const { client } = renderWithAuth(<Probe />);
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("guest"),
    );

    await userEvent.click(screen.getByText("login"));
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated"),
    );
    client.setQueryData(queryKeys.wallet, { marker: true });

    // The session already expired server-side: POST /api/logout rejects (401).
    // The client purge must still run so the user is never left authenticated.
    server.use(
      http.post(`${BASE}/api/logout`, () =>
        HttpResponse.json(errorEnvelope("Unauthenticated."), { status: 401 }),
      ),
    );

    await userEvent.click(screen.getByText("logout"));

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("guest"),
    );
    expect(client.getQueryData(queryKeys.wallet)).toBeUndefined();
  });
});
