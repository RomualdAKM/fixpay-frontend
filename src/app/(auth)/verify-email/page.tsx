import { Suspense } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { VerifyEmailPanel } from "@/components/auth/VerifyEmailPanel";

export const metadata = { title: "Vérifier l'e-mail" };

export default function VerifyEmailPage() {
  return (
    <AuthShell title="Vérifiez votre e-mail">
      {/* Reads `?email=` via useSearchParams — Suspense keeps the route
          prerenderable. */}
      <Suspense fallback={null}>
        <VerifyEmailPanel />
      </Suspense>
    </AuthShell>
  );
}
