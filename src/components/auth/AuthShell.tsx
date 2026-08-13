import type { ReactNode } from "react";

import { FixPayLogo } from "@/components/brand/FixPayLogo";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Secondary line under the form (e.g. the alternate auth link). */
  footer?: ReactNode;
}

/**
 * Centered shell for the authentication screens (login, register, verify,
 * PIN). Follows the product page gutter and the mobile canvas width, and lets
 * the content breathe on desktop without a sidebar (these routes sit outside
 * the app shell). Tokens only — the whole surface follows the active theme.
 */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
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
