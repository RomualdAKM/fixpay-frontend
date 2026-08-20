import { AlertCircle } from "lucide-react";

import { messageForError } from "@/lib/forms/errorMessage";

/** Bannière d'erreur de formulaire, au look des écrans d'auth (`.auth-error`). */
export function AuthError({ error }: { error?: unknown }) {
  const message = messageForError(error);
  if (message === null) return null;
  return (
    <div role="alert" className="auth-error">
      <AlertCircle size={16} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
