"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { InlineError } from "@/components/feedback/InlineError";
import { ApiError, api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

/**
 * "Verify your email" panel. Shows the address the link was sent to and lets an
 * authenticated-but-unverified user resend it (POST
 * /api/email/verification-notification is behind auth:sanctum). A guest is
 * pointed at login, since resending requires a session.
 */
export function VerifyEmailPanel() {
  const searchParams = useSearchParams();
  const { status, user, refetch } = useAuth();
  const email = user?.email ?? searchParams.get("email") ?? "votre adresse";
  const [sent, setSent] = useState(false);

  const resend = useMutation<null, ApiError, void>({
    mutationFn: () => api.resendVerificationEmail(),
    onSuccess: () => setSent(true),
  });

  const alreadyVerified = status === "authenticated" && user?.email_verified;

  if (alreadyVerified) {
    return (
      <div className="flex flex-col gap-5">
        <p className="text-text-secondary text-[14px] leading-[21px]">
          Votre adresse <span className="text-text font-medium">{email}</span>{" "}
          est vérifiée.
        </p>
        <Button variant="primary" href="/">
          Accéder à mon compte
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-text-secondary text-[14px] leading-[21px]">
        Nous avons envoyé un lien de vérification à{" "}
        <span className="text-text font-medium break-all">{email}</span>.
        Ouvrez-le pour activer votre compte.
      </p>

      {resend.isError && <InlineError error={resend.error} />}

      {status === "guest" ? (
        <p className="text-text-muted text-[13px] leading-[19px]">
          Connectez-vous pour renvoyer le lien si vous ne l&apos;avez pas reçu.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <Button
            variant="glass"
            onClick={() => {
              setSent(false);
              resend.mutate();
            }}
            disabled={resend.isPending}
          >
            {resend.isPending ? "Envoi…" : "Renvoyer le lien"}
          </Button>
          {sent && (
            <p className="text-success text-[13px] leading-[18px]" aria-live="polite">
              Lien renvoyé. Vérifiez votre boîte de réception.
            </p>
          )}
          <button
            type="button"
            onClick={() => refetch()}
            className="text-primary-light text-[13px] font-medium underline-offset-4 hover:underline"
          >
            J&apos;ai vérifié mon e-mail
          </button>
        </div>
      )}

      <p className="text-text-secondary text-[14px] leading-[20px]">
        <Link
          href="/login"
          className="text-primary-light font-semibold underline-offset-4 hover:underline"
        >
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
