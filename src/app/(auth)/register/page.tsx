import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = { title: "Créer un compte" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Créer un compte"
      subtitle="Un numéro Mobile Money et une adresse e-mail suffisent pour démarrer."
      footer={
        <>
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="text-primary-light font-semibold underline-offset-4 hover:underline"
          >
            Se connecter
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
