import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/ApiError";
import { apiFetch } from "@/lib/api/client";
import { api } from "@/lib/api";
import { envelope, errorEnvelope, testUser } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";

const BASE = "http://localhost:8000";

describe("apiFetch", () => {
  it("unwraps the envelope and returns data", async () => {
    server.use(
      http.get(`${BASE}/api/me`, () => HttpResponse.json(envelope(testUser))),
    );

    const user = await apiFetch("/me");
    expect(user).toEqual(testUser);
  });

  it("maps a 422 into ApiError.fieldErrors", async () => {
    server.use(
      http.post(`${BASE}/api/login`, () =>
        HttpResponse.json(
          errorEnvelope("The given data was invalid.", {
            email: ["The email field is required."],
            password: ["The password field is required."],
          }),
          { status: 422 },
        ),
      ),
    );

    const error = await apiFetch("/login", {
      method: "POST",
      body: { email: "", password: "" },
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    const apiError = error as ApiError;
    expect(apiError.status).toBe(422);
    expect(apiError.isValidation).toBe(true);
    expect(apiError.fieldErrors).toEqual({
      email: "The email field is required.",
      password: "The password field is required.",
    });
  });

  it("runs the CSRF handshake before a mutation when no XSRF cookie exists", async () => {
    let csrfCalls = 0;
    let sentXsrf: string | null = null;

    server.use(
      http.get(`${BASE}/sanctum/csrf-cookie`, () => {
        csrfCalls += 1;
        return new HttpResponse(null, { status: 204 });
      }),
      http.post(`${BASE}/api/login`, ({ request }) => {
        sentXsrf = request.headers.get("X-XSRF-TOKEN");
        return HttpResponse.json(
          envelope({ token: "t", user: testUser }, "authenticated"),
        );
      }),
    );

    await apiFetch("/login", {
      method: "POST",
      body: { email: "a@b.co", password: "x" },
    });

    // Cookie was absent → the CSRF cookie endpoint was fetched first.
    expect(csrfCalls).toBe(1);
    // No cookie present means no header could be echoed yet.
    expect(sentXsrf).toBeNull();
  });

  it("echoes the decoded XSRF-TOKEN cookie as X-XSRF-TOKEN and skips the handshake when present", async () => {
    document.cookie = "XSRF-TOKEN=tok%20123";
    let csrfCalls = 0;
    let sentXsrf: string | null = null;

    server.use(
      http.get(`${BASE}/sanctum/csrf-cookie`, () => {
        csrfCalls += 1;
        return new HttpResponse(null, { status: 204 });
      }),
      http.post(`${BASE}/api/logout`, ({ request }) => {
        sentXsrf = request.headers.get("X-XSRF-TOKEN");
        return HttpResponse.json(envelope(null, "logged_out"));
      }),
    );

    await apiFetch("/logout", { method: "POST" });

    expect(csrfCalls).toBe(0);
    expect(sentXsrf).toBe("tok 123");
  });

  it("re-seeds CSRF and retries once on 419", async () => {
    let attempts = 0;
    let csrfCalls = 0;

    server.use(
      http.get(`${BASE}/sanctum/csrf-cookie`, () => {
        csrfCalls += 1;
        return new HttpResponse(null, { status: 204 });
      }),
      http.post(`${BASE}/api/pin`, () => {
        attempts += 1;
        if (attempts === 1) {
          return HttpResponse.json(errorEnvelope("CSRF token mismatch."), {
            status: 419,
          });
        }
        return HttpResponse.json(envelope(null, "pin_set"));
      }),
    );

    await apiFetch("/pin", { method: "POST", body: { pin: "1234" } });

    expect(attempts).toBe(2);
    // Once for the initial handshake, once to re-seed after the 419.
    expect(csrfCalls).toBe(2);
  });

  it("attaches an X-Pin-Ticket header when provided", async () => {
    let sentTicket: string | null = null;
    server.use(
      http.post(`${BASE}/api/pin`, ({ request }) => {
        sentTicket = request.headers.get("X-Pin-Ticket");
        return HttpResponse.json(envelope(null, "ok"));
      }),
    );

    await apiFetch("/pin", {
      method: "POST",
      body: {},
      pinTicket: "one-time-ticket",
    });

    expect(sentTicket).toBe("one-time-ticket");
  });

  it("never writes the login token to storage", async () => {
    const result = await api.login({ email: "a@b.co", password: "x" });

    // The token is on the wire...
    expect(result.token).toBeTruthy();
    // ...but nothing is persisted anywhere the JS can read it back.
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(document.cookie).not.toContain(result.token);
  });
});
