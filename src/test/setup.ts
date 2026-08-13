import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "./msw/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
  // Clear any cookie/storage a test seeded, so cases stay isolated.
  document.cookie
    .split("; ")
    .filter(Boolean)
    .forEach((row) => {
      const name = row.split("=")[0];
      if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });
  localStorage.clear();
  sessionStorage.clear();
});

afterAll(() => server.close());
