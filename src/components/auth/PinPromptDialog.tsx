"use client";

import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { PinField } from "@/components/form/PinField";
import { Numpad } from "@/components/ui/Numpad";
import { InlineError } from "@/components/feedback/InlineError";
import { useVerifyPin } from "@/lib/api/hooks";
import type { CurrencyCode, PinTicketAction } from "@/lib/api/types";

const MIN_LENGTH = 4;
const MAX_LENGTH = 6;

interface PinPromptDialogProps {
  open: boolean;
  /** The PinTicketAction the resulting ticket authorizes. */
  action: PinTicketAction;
  resourceType?: string;
  resourceUuid?: string;
  amountMinor?: number;
  currency?: CurrencyCode;
  title?: string;
  description?: string;
  /**
   * Called with the freshly issued, single-use ticket. The dialog never stores
   * it: the caller must immediately pass it as `X-Pin-Ticket` on the money
   * operation. The dialog closes itself via `onCancel` after invoking this.
   */
  onTicket: (ticket: string) => void;
  onCancel: () => void;
}

function appendDigits(current: string, keys: string): string {
  const next = (current + keys).replace(/\D/g, "");
  return next.slice(0, MAX_LENGTH);
}

/**
 * Reusable PIN prompt. Verifies the PIN against POST /api/pin/verify for a
 * given action/resource/amount and hands the opaque ticket back to the caller.
 * Nothing is persisted — the ticket lives only in the callback's stack frame.
 */
export function PinPromptDialog({
  open,
  action,
  resourceType,
  resourceUuid,
  amountMinor,
  currency,
  title = "Confirmez avec votre code PIN",
  description,
  onTicket,
  onCancel,
}: PinPromptDialogProps) {
  const [pin, setPin] = useState("");
  const verify = useVerifyPin();
  const { reset } = verify;
  const dialogRef = useRef<HTMLDivElement>(null);

  // Clear all transient state whenever the dialog is opened or closed.
  useEffect(() => {
    if (!open) {
      setPin("");
      reset();
    }
  }, [open, reset]);

  // Move focus into the dialog on open so keyboard/screen-reader users land on
  // this security surface instead of leaving focus on the background trigger.
  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  // Complete the modal contract: Escape cancels, and Tab is trapped inside the
  // dialog so focus never wanders to the inert page behind the scrim.
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCancel();
        return;
      }
      if (event.key !== "Tab") return;
      const node = dialogRef.current;
      if (node === null) return;
      const focusables = node.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (first === undefined || last === undefined) return;
      const active = document.activeElement;
      if (event.shiftKey) {
        if (active === first || active === node) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onCancel],
  );

  const submit = useCallback(() => {
    if (pin.length < MIN_LENGTH) return;
    verify.mutate(
      {
        pin,
        action,
        ...(resourceType ? { resource_type: resourceType } : {}),
        ...(resourceUuid ? { resource_uuid: resourceUuid } : {}),
        ...(amountMinor !== undefined ? { amount_minor: amountMinor } : {}),
        ...(currency ? { currency } : {}),
      },
      {
        onSuccess: (ticket) => {
          setPin("");
          onTicket(ticket.ticket);
        },
        onError: () => setPin(""),
      },
    );
  }, [
    pin,
    action,
    resourceType,
    resourceUuid,
    amountMinor,
    currency,
    verify,
    onTicket,
  ]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 lg:items-center"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
        className="bg-bg-raised border-border w-full max-w-[430px] rounded-t-lg border px-5 pt-5 pb-8 focus:outline-none lg:rounded-lg"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-text text-[17px] leading-[22px] font-semibold">
              {title}
            </h2>
            {description && (
              <p className="text-text-secondary mt-1.5 text-[13.5px] leading-[19px]">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Annuler"
            className="text-icon-muted hover:text-text focus-visible:ring-primary/60 -mr-1 flex size-8 shrink-0 items-center justify-center rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <PinField
          value={pin}
          length={MAX_LENGTH}
          invalid={verify.isError}
          className="mt-7"
        />

        {verify.isError && (
          <InlineError error={verify.error} className="mt-4" />
        )}

        <div className="mt-7">
          <Numpad
            onKey={(key) => setPin((value) => appendDigits(value, key))}
            onDelete={() => setPin((value) => value.slice(0, -1))}
          />
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={pin.length < MIN_LENGTH || verify.isPending}
          className="bg-primary focus-visible:ring-primary/60 mt-6 flex h-[50px] w-full items-center justify-center rounded-md text-[15px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60"
        >
          {verify.isPending ? "Vérification…" : "Confirmer"}
        </button>
      </div>
    </div>
  );
}
