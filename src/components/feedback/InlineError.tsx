import { AlertCircle } from "lucide-react";

import { messageForError } from "@/lib/forms/errorMessage";
import { cn } from "@/lib/utils";

interface InlineErrorProps {
  /** An `ApiError`, a plain `Error`, a string, or null/undefined (renders nothing). */
  error?: unknown;
  className?: string;
}

/**
 * Inline error banner for form and section-level failures. Neutral-danger
 * surface, hairline border, icon + message. Renders nothing when there is no
 * error, so callers can pass a query/mutation error unconditionally. The
 * error → message mapping lives in `@/lib/forms/errorMessage`.
 */
export function InlineError({ error, className }: InlineErrorProps) {
  const message = messageForError(error);
  if (message === null) return null;

  return (
    <div
      role="alert"
      className={cn(
        "border-danger/30 bg-danger/10 flex items-start gap-2.5 rounded-md border px-3.5 py-3",
        className,
      )}
    >
      <AlertCircle
        size={16}
        strokeWidth={2}
        absoluteStrokeWidth
        aria-hidden="true"
        className="text-danger mt-[1px] shrink-0"
      />
      <p className="text-danger text-[13px] leading-[18px]">{message}</p>
    </div>
  );
}
