import { AlertCircle } from "lucide-react";

import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

interface InlineErrorProps {
  /** An `ApiError`, a plain `Error`, a string, or null/undefined (renders nothing). */
  error?: unknown;
  className?: string;
}

/**
 * Message produit par code métier (`errors.code`), vérifié AVANT le repli par
 * statut HTTP : un `kyc_required` arrive en 403 et doit dire « vérification
 * requise », pas le générique « vous n'avez pas accès à cette action ». Chaque
 * message explique le motif ET l'action à mener.
 */
const CODE_MESSAGES: Record<string, string> = {
  invalid_credentials: "E-mail ou mot de passe incorrect.",
  kyc_required:
    "Vérification d'identité requise. Complétez-la dans Profil › Vérification d'identité pour effectuer cette opération.",
  kyc_not_submittable:
    "Votre dossier de vérification n'est pas prêt à être soumis.",
  kyc_not_reviewable: "Ce dossier de vérification ne peut pas être examiné.",
  kyc_document_rejected:
    "Un de vos documents a été refusé. Renvoyez-le pour continuer.",
  limit_exceeded:
    "Plafond atteint. Réessayez plus tard ou faites relever vos limites.",
  insufficient_balance: "Solde insuffisant pour cette opération.",
  account_debit_blocked:
    "Votre compte est temporairement bloqué au débit pour régularisation. Contactez le support pour le rétablir.",
  card_insufficient_balance: "Solde de la carte insuffisant.",
  card_not_rechargeable: "Cette carte ne peut pas être rechargée pour le moment.",
  card_initial_amount_unsupported: "Ce montant initial n'est pas pris en charge.",
  card_not_actionable:
    "Cette carte n'est pas dans un état permettant cette action.",
  card_has_balance: "Videz d'abord le solde de la carte avant de l'annuler.",
  pan_reveal_not_allowed: "L'affichage des données de la carte n'est pas autorisé.",
  pin_invalid: "Code PIN incorrect.",
  pin_locked: "Code PIN bloqué après trop d'essais. Réessayez plus tard.",
  pin_not_configured: "Définissez d'abord votre code PIN dans Paramètres.",
  pin_ticket_invalid: "Votre validation a expiré. Recommencez l'opération.",
  no_referral_balance: "Aucun gain de parrainage à transférer.",
  provider_validation_failed:
    "Opération refusée par l'opérateur Mobile Money. Vérifiez le numéro et réessayez.",
};

/** Map an error to a human message, in French, matching the product. */
function messageFor(error: unknown): string | null {
  if (error === null || error === undefined) return null;
  if (typeof error === "string") return error;

  if (error instanceof ApiError) {
    // Le code métier porte la vraie raison actionnable : il prime sur le statut.
    const mapped = error.code !== null ? CODE_MESSAGES[error.code] : undefined;
    if (mapped !== undefined) return mapped;
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
