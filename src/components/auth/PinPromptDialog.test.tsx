import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import { PinPromptDialog } from "@/components/auth/PinPromptDialog";
import { PinTicketAction } from "@/lib/api/types";
import { envelope, errorEnvelope } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderWithClient } from "@/test/utils";

const BASE = "http://localhost:8000";

async function typePin(digits: string) {
  for (const digit of digits) {
    await userEvent.click(screen.getByRole("button", { name: digit }));
  }
}

describe("PinPromptDialog", () => {
  it("verifies the PIN, returns the ticket, and persists nothing", async () => {
    const onTicket = vi.fn();
    const onCancel = vi.fn();

    renderWithClient(
      <PinPromptDialog
        open
        action={PinTicketAction.Withdraw}
        amountMinor={50000}
        currency="XOF"
        onTicket={onTicket}
        onCancel={onCancel}
      />,
    );

    await typePin("1234");
    await userEvent.click(screen.getByRole("button", { name: "Confirmer" }));

    await waitFor(() =>
      expect(onTicket).toHaveBeenCalledWith("one-time-ticket-abc"),
    );

    // The ticket is handed to the caller only — never written to storage.
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(document.cookie).not.toContain("one-time-ticket-abc");
  });

  // Regression for the withdraw pin-ticket contract: the withdraw route's
  // RequirePinTicket middleware consumes the ticket with amount = null, so the
  // guard `$ticket->amount_minor !== $amount?->amountMinor` rejects (403) any
  // ticket that carries an amount. The withdraw page therefore must NOT pass
  // amountMinor/currency, and the dialog must emit an unbound ticket request.
  it("omits amount_minor/currency from the verify body when unbound", async () => {
    let sentBody: Record<string, unknown> | null = null;
    server.use(
      http.post(`${BASE}/api/pin/verify`, async ({ request }) => {
        sentBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          envelope(
            { ticket: "unbound-ticket", action: "withdraw", expires_in: 120 },
            "pin_verified",
          ),
        );
      }),
    );

    renderWithClient(
      <PinPromptDialog
        open
        action={PinTicketAction.Withdraw}
        onTicket={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    await typePin("1234");
    await userEvent.click(screen.getByRole("button", { name: "Confirmer" }));

    await waitFor(() => expect(sentBody).not.toBeNull());
    expect(sentBody).toEqual({ pin: "1234", action: "withdraw" });
    expect(sentBody).not.toHaveProperty("amount_minor");
    expect(sentBody).not.toHaveProperty("currency");
  });

  // Complement: actions whose middleware re-checks the amount keep binding it.
  it("binds amount_minor/currency when provided", async () => {
    let sentBody: Record<string, unknown> | null = null;
    server.use(
      http.post(`${BASE}/api/pin/verify`, async ({ request }) => {
        sentBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          envelope(
            { ticket: "bound-ticket", action: "withdraw", expires_in: 120 },
            "pin_verified",
          ),
        );
      }),
    );

    renderWithClient(
      <PinPromptDialog
        open
        action={PinTicketAction.Withdraw}
        amountMinor={50_000}
        currency="XOF"
        onTicket={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    await typePin("1234");
    await userEvent.click(screen.getByRole("button", { name: "Confirmer" }));

    await waitFor(() => expect(sentBody).not.toBeNull());
    expect(sentBody).toMatchObject({ amount_minor: 50_000, currency: "XOF" });
  });

  it("shows an error and does not emit a ticket on a rejected PIN", async () => {
    server.use(
      http.post(`${BASE}/api/pin/verify`, () =>
        HttpResponse.json(errorEnvelope("pin_invalid", { code: "pin_invalid" }), {
          status: 422,
        }),
      ),
    );

    const onTicket = vi.fn();

    renderWithClient(
      <PinPromptDialog
        open
        action={PinTicketAction.Withdraw}
        onTicket={onTicket}
        onCancel={vi.fn()}
      />,
    );

    await typePin("0000");
    await userEvent.click(screen.getByRole("button", { name: "Confirmer" }));

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(onTicket).not.toHaveBeenCalled();
  });

  it("moves focus into the dialog on open and cancels on Escape", async () => {
    const onCancel = vi.fn();

    renderWithClient(
      <PinPromptDialog
        open
        action={PinTicketAction.Withdraw}
        onTicket={vi.fn()}
        onCancel={onCancel}
      />,
    );

    const dialog = screen.getByRole("dialog");
    await waitFor(() => expect(dialog).toHaveFocus());

    await userEvent.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
