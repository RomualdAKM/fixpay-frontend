import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { envelope, errorEnvelope } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { makeTestClient } from "@/test/utils";

import { ApiError } from "./ApiError";
import { useForgotPassword, useResetPassword } from "./hooks";

const BASE = "http://localhost:8000";

function wrapper() {
  const client = makeTestClient();
  const Wrap = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  Wrap.displayName = "TestWrapper";
  return Wrap;
}

describe("useForgotPassword", () => {
  it("posts the email and resolves neutrally for a known address", async () => {
    let received: unknown;
    server.use(
      http.post(`${BASE}/api/forgot-password`, async ({ request }) => {
        received = await request.json();
        return HttpResponse.json(envelope(null, "password_reset_link_sent"));
      }),
    );

    const { result } = renderHook(() => useForgotPassword(), {
      wrapper: wrapper(),
    });
    await result.current.mutateAsync("jean.dupont@email.com");

    expect(received).toEqual({ email: "jean.dupont@email.com" });
  });

  it("still resolves neutrally when the address is unknown (anti-enumeration)", async () => {
    server.use(
      http.post(`${BASE}/api/forgot-password`, () =>
        HttpResponse.json(envelope(null, "password_reset_link_sent")),
      ),
    );

    const { result } = renderHook(() => useForgotPassword(), {
      wrapper: wrapper(),
    });

    // The backend answers identically whether or not the account exists, so the
    // mutation resolves — it never rejects — and the UI shows one message.
    await expect(
      result.current.mutateAsync("ghost@nowhere.test"),
    ).resolves.toBeNull();
  });
});

describe("useResetPassword", () => {
  it("posts token, email and password and resolves on success", async () => {
    let received: unknown;
    server.use(
      http.post(`${BASE}/api/reset-password`, async ({ request }) => {
        received = await request.json();
        return HttpResponse.json(envelope(null, "password_reset"));
      }),
    );

    const { result } = renderHook(() => useResetPassword(), {
      wrapper: wrapper(),
    });
    await result.current.mutateAsync({
      token: "tok-123",
      email: "jean.dupont@email.com",
      password: "Sup3rSecret!Pwd",
    });

    expect(received).toEqual({
      token: "tok-123",
      email: "jean.dupont@email.com",
      password: "Sup3rSecret!Pwd",
    });
  });

  it("surfaces an ApiError with the invalid_reset_token code on a bad token", async () => {
    server.use(
      http.post(`${BASE}/api/reset-password`, () =>
        HttpResponse.json(
          errorEnvelope("invalid_reset_token", { code: "invalid_reset_token" }),
          { status: 422 },
        ),
      ),
    );

    const { result } = renderHook(() => useResetPassword(), {
      wrapper: wrapper(),
    });

    await expect(
      result.current.mutateAsync({
        token: "expired",
        email: "jean.dupont@email.com",
        password: "Sup3rSecret!Pwd",
      }),
    ).rejects.toBeInstanceOf(ApiError);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.code).toBe("invalid_reset_token");
  });
});
