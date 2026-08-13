import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { AdminModal } from "./AdminModal";

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Ouvrir
      </button>
      <AdminModal open={open} title="Test" onClose={() => setOpen(false)}>
        <button type="button">Champ</button>
      </AdminModal>
    </>
  );
}

describe("AdminModal — focus management", () => {
  it("restores focus to the trigger when closed with Escape", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const trigger = screen.getByRole("button", { name: "Ouvrir" });
    trigger.focus();
    await user.click(trigger);

    // The dialog is open and has taken focus.
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    // Focus returns to the element that opened the dialog.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("keeps Tab focus inside the panel (focus trap)", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Ouvrir" }));

    const dialog = screen.getByRole("dialog");
    const field = screen.getByRole("button", { name: "Champ" });
    field.focus();

    // Tabbing from the last focusable wraps back to the first, never escaping
    // to the background behind an aria-modal dialog.
    await user.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
  });
});
