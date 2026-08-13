import { setupServer } from "msw/node";

import { handlers } from "./handlers";

/** Shared MSW server for the test suite (Node request interception). */
export const server = setupServer(...handlers);
