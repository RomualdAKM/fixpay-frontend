import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Page title + optional description + right-aligned actions slot. */
export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-text text-[22px] leading-[28px] font-semibold">
          {title}
        </h1>
        {description ? (
          <p className="text-text-muted mt-1 max-w-[640px] text-[14px] leading-[20px]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** Neutral surface card, the container for tables and forms. */
export function AdminCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border bg-bg-raised overflow-hidden rounded-lg border",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Full-width horizontal-scroll container so a wide table never bleeds the page. */
export function TableScroll({ children }: { children: ReactNode }) {
  return <div className="w-full overflow-x-auto">{children}</div>;
}

type PillTone = "neutral" | "success" | "warning" | "danger" | "primary";

const PILL_TONE: Record<PillTone, string> = {
  neutral: "bg-surface-2 text-text-secondary",
  success: "bg-success-tint text-success",
  warning: "bg-warning-tint text-warning-deep",
  danger: "bg-danger/12 text-danger",
  primary: "bg-primary-tint text-primary",
};

/** Small status pill. Tone is chosen by the caller from the semantic tokens. */
export function StatusPill({
  tone = "neutral",
  children,
}: {
  tone?: PillTone;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-semibold whitespace-nowrap",
        PILL_TONE[tone],
      )}
    >
      {children}
    </span>
  );
}

/** Boolean cell: green "Oui" / neutral "Non". */
export function BoolPill({ value }: { value: boolean }) {
  return (
    <StatusPill tone={value ? "success" : "neutral"}>
      {value ? "Oui" : "Non"}
    </StatusPill>
  );
}

/** Loading skeleton row list for a section. */
export function AdminLoading({ label = "Chargement…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-3 px-6 py-14"
    >
      <span
        aria-hidden="true"
        className="border-border-strong border-t-primary size-6 animate-spin rounded-full border-2"
      />
      <span className="text-text-muted text-[14px]">{label}</span>
    </div>
  );
}

/** Empty state for a section with no rows. */
export function AdminEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="text-text-muted px-6 py-14 text-center text-[14px]">
      {children}
    </div>
  );
}
