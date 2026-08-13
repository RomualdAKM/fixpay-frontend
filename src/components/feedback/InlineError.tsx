import { AlertCircle } from "lucide-react";

import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

interface InlineErrorProps {
  /** An `ApiError`, a plain `Error`, a string, or null/undefined (renders nothing). */
  error?: unknown;
  className?: string;
}

/** Map common HTTP statuses to a human message, in French, matching the product. */
function messageFor(error: unknown): string | null {
  if (error === null || error === undefined) return null;
  if (typeof error === "string") return error;

  if (error instanceof ApiError) {
    // A failed login returns 401 with `code: "invalid_credentials"`. That is a
    // wrong-password/unknown-account case, not a lost session — do not tell a
    // user who is actively signing in that their session "expired".
    if (error.status === 401 && error.code === "invalid_credentials")
      return "E-mail ou mot de passe incorrect.";
    if (error.status === 401) return "Session expirée. Reconnectez-vous.";
    if (error.status === 403) return "Vous n'avez pas accès à cette action.";
    if (error.status === 429)
      return "Trop de tentatives. Réessayez dans un instant.";
    if (error.status >= 500)
      return "Le service est momentanément indisponible.";
    return error.message || "Une erreur est survenue.";
  }

  if (error instanceof Error) {
    // Network / fetch failures surface as generic TypeErrors.
    return "Connexion impossible. Vérifiez votre réseau.";
  }

  return "Une erreur est survenue.";
}

/**
 * Inline error banner for form and section-level failures. Neutral-danger
 * surface, hairline border, icon + message. Renders nothing when there is no
 * error, so callers can pass a query/mutation error unconditionally.
 */
export function InlineError({ error, className }: InlineErrorProps) {
  const message = messageFor(error);
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
