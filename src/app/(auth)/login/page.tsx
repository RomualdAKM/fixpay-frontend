import Link from "next/link";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <AuthShell
      variant="landing"
      title="Bon retour"
      subtitle="Connectez-vous pour accéder à votre portefeuille et vos cartes."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="text-primary-light font-semibold underline-offset-4 hover:underline"
          >
            Créer un compte
          </Link>
        </>
      }
    >
      {/* LoginForm reads `?next=` via useSearchParams — needs a Suspense
          boundary so the route can still be statically prerendered. */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
