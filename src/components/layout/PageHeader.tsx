import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { StatusDot } from "@/components/ui/StatusDot";

interface PageHeaderProps {
  title: string;
  backHref: string;
  /** Chat variant: 16px title + status line (7px dot + 11px label). */
  status?: { label: string; dotClass?: string };
  /** Two-line 19px title (screen 04) — back button stays vertically centered. */
  multiline?: boolean;
}

/**
 * Standard sub-page header: 38px glass back button + DM Sans bold title.
 * `status` switches to the chat layout, `multiline` allows the title to
 * wrap on two lines.
 */
export function PageHeader({
  title,
  backHref,
  status,
  multiline = false,
}: PageHeaderProps) {
  return (
    <header className="flex items-center gap-3.5">
      <Link
        href={backHref}
        aria-label="Retour"
        className="border-border bg-surface-2 hover:bg-surface-3 focus-visible:ring-primary/60 flex size-[38px] shrink-0 items-center justify-center rounded-sm border transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <ChevronLeft size={17} aria-hidden="true" className="text-text" />
      </Link>
      {status ? (
        <div className="flex min-w-0 flex-col gap-[3px]">
          <h1 className="text-text text-[16px] leading-[21px] font-bold">
            {title}
          </h1>
          <span className="flex items-center gap-[5px]">
            <StatusDot size={7} colorClass={status.dotClass ?? "bg-success"} />
            <span className="text-text-muted text-[11px] leading-[14px]">
              {status.label}
            </span>
          </span>
        </div>
      ) : (
        <h1
          className={cn(
            "text-text min-w-0 text-[19px] font-bold",
            // Desktop: slightly larger page title, back button unchanged.
            "lg:text-[22px]",
            multiline ? "leading-[25px]" : "truncate leading-tight",
          )}
        >
          {title}
        </h1>
      )}
    </header>
  );
}
