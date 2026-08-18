import Link from "next/link";

import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Indiquez l’adresse e-mail de votre compte : nous vous enverrons un lien pour définir un nouveau mot de passe."
      footer={
        <>
          Vous vous en souvenez ?{" "}
          <Link
            href="/login"
            className="text-primary-light font-semibold underline-offset-4 hover:underline"
          >
            Se connecter
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
