import Link from "next/link";
import type { ReactNode } from "react";

import { FixPayLogo } from "@/components/brand/FixPayLogo";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Ligne secondaire sous le formulaire (ex. le lien vers l'autre écran). */
  footer?: ReactNode;
  /**
   * `"landing"` = design des pages auth du landing (carte claire, marque),
   * utilisé pour login/register/forgot/reset. `"app"` (défaut) = shell
   * mobile-first cohérent avec le reste de l'app (verify-email, PIN).
   */
  variant?: "app" | "landing";
}

/** Shell auth reprenant le design du landing (scopé sous `.fp-auth`). */
function LandingShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="fp-auth">
      <a className="skip-link" href="#main">
        Aller au contenu principal
      </a>
      <div className="auth-shell">
        <header className="auth-top">
          <Link href="/" className="brand" aria-label="FixPay, retour à l'accueil">
            <FixPayLogo variant="wordmark" tone="ink" width={116} />
          </Link>
        </header>
        <main id="main" className="auth-main">
          <div className="auth-card">
            <h1>{title}</h1>
            {subtitle && <p className="auth-sub">{subtitle}</p>}
            {children}
            {footer && <p className="auth-alt">{footer}</p>}
          </div>
        </main>
        <footer className="auth-foot">
          <span>© 2026 FixPay</span>
          <a href="https://fixpay.me/conditions">Conditions</a>
          <a href="https://fixpay.me/confidentialite">Confidentialité</a>
          <a href="https://fixpay.me/aide">Aide</a>
        </footer>
      </div>
    </div>
  );
}

/** Shell auth mobile-first, cohérent avec le reste de l'app. */
function AppShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="bg-bg flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-[390px] flex-1 flex-col px-6 pt-14 pb-10 lg:max-w-[420px] lg:justify-center lg:pt-10">
        <header className="flex flex-col items-start">
          <FixPayLogo variant="wordmark" tone="ink" width={120} />
          <h1 className="text-text mt-8 text-[26px] leading-[30px] font-bold tracking-[-0.5px]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-text-secondary mt-2 text-[14px] leading-[20px]">
              {subtitle}
            </p>
          )}
        </header>

        <div className="mt-8">{children}</div>

        {footer && (
          <div className="text-text-secondary mt-8 text-[14px] leading-[20px]">
            {footer}
          </div>
        )}
      </div>
    </main>
  );
}

/**
 * Coquille des écrans d'authentification. Deux variantes : `landing` (design du
 * site vitrine) pour les écrans publics, `app` (défaut) pour les écrans
 * internes.
 */
export function AuthShell(props: AuthShellProps) {
  return props.variant === "landing" ? (
    <LandingShell {...props} />
  ) : (
    <AppShell {...props} />
  );
}
