import Link from "next/link";
import { Suspense } from "react";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata = { title: "Réinitialiser le mot de passe" };

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Nouveau mot de passe"
      subtitle="Choisissez un nouveau mot de passe pour votre compte FixPay."
      footer={
        <>
          Retour à la{" "}
          <Link
            href="/login"
            className="text-primary-light font-semibold underline-offset-4 hover:underline"
          >
            connexion
          </Link>
        </>
      }
    >
      {/* ResetPasswordForm reads `?token=` and `?email=` via useSearchParams —
          needs a Suspense boundary so the route can still be prerendered. */}
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
