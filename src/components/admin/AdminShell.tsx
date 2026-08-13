"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeDollarSign,
  BookOpenCheck,
  CreditCard,
  Gauge,
  Landmark,
  Radio,
  Scale,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
  Store,
  Tags,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { FixPayLogo } from "@/components/brand/FixPayLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useAuth } from "@/lib/auth";
import {
  hasAnyPermission,
  Permission,
  type PermissionSlug,
} from "@/lib/admin/permissions";
import { cn } from "@/lib/utils";

interface NavEntry {
  label: string;
  href: string;
  icon: LucideIcon;
  /** The user must hold AT LEAST ONE of these to see the entry. */
  permissions: PermissionSlug[];
  /** Extra route prefixes that also light up this entry. */
  match?: string[];
}

interface NavGroup {
  label: string | null;
  entries: NavEntry[];
}

const NAV: NavGroup[] = [
  {
    label: null,
    entries: [
      {
        label: "Vue d'ensemble",
        href: "/admin",
        icon: Gauge,
        // Empty = visible to anyone already admitted by AdminGuard.
        permissions: [],
      },
    ],
  },
  {
    label: "Configuration",
    entries: [
      {
        label: "Règles de tarification",
        href: "/admin/config/pricing-rules",
        icon: Tags,
        permissions: [Permission.ConfigRead],
      },
      {
        label: "Coûts fournisseurs",
        href: "/admin/config/provider-costs",
        icon: BadgeDollarSign,
        permissions: [Permission.ConfigRead],
      },
      {
        label: "Taux de change",
        href: "/admin/config/fx-rates",
        icon: Landmark,
        permissions: [Permission.ConfigRead],
      },
      {
        label: "Limites",
        href: "/admin/config/limits",
        icon: SlidersHorizontal,
        permissions: [Permission.ConfigRead],
      },
      {
        label: "BIN cartes",
        href: "/admin/config/bins",
        icon: CreditCard,
        permissions: [Permission.ConfigRead],
      },
      {
        label: "Opérateurs",
        href: "/admin/config/operators",
        icon: Radio,
        permissions: [Permission.ConfigRead],
      },
      {
        label: "Réglages",
        href: "/admin/config/settings",
        icon: SlidersHorizontal,
        permissions: [Permission.ConfigRead],
      },
    ],
  },
  {
    label: "Opérations",
    entries: [
      {
        label: "Revue KYC",
        href: "/admin/kyc",
        icon: UserCheck,
        permissions: [Permission.KycReview],
      },
      {
        label: "Marchands B2B",
        href: "/admin/merchants",
        icon: Store,
        permissions: [Permission.MerchantManage, Permission.MerchantCredit],
      },
      {
        label: "Grand livre",
        href: "/admin/ledger",
        icon: BookOpenCheck,
        permissions: [Permission.LedgerRead],
      },
      {
        label: "Réconciliation",
        href: "/admin/reconciliation",
        icon: Scale,
        permissions: [Permission.LedgerRead],
      },
      {
        label: "Journal d'audit",
        href: "/admin/audit",
        icon: ScrollText,
        permissions: [Permission.AuditRead],
      },
    ],
  },
  {
    label: "Contrôle",
    entries: [
      {
        label: "Approbations",
        href: "/admin/approvals",
        icon: ShieldCheck,
        permissions: [
          Permission.ConfigApprove,
          Permission.MerchantCreditApprove,
        ],
      },
    ],
  },
];

function isActive(pathname: string, entry: NavEntry): boolean {
  if (entry.href === "/admin") return pathname === "/admin";
  const prefixes = [entry.href, ...(entry.match ?? [])];
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function NavLink({ entry, active }: { entry: NavEntry; active: boolean }) {
  const Icon = entry.icon;
  return (
    <Link
      href={entry.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-[14px] font-medium transition-colors",
        "focus-visible:ring-primary/60 focus-visible:ring-2 focus-visible:outline-none",
        active
          ? "bg-primary-tint text-primary"
          : "text-text-secondary hover:bg-surface hover:text-text",
      )}
    >
      <Icon
        size={18}
        strokeWidth={1.75}
        absoluteStrokeWidth
        aria-hidden="true"
        className="shrink-0"
      />
      <span className="truncate">{entry.label}</span>
    </Link>
  );
}

/**
 * The back-office shell: a persistent left rail of admin sections (each hidden
 * when the user holds none of its permissions) plus a header. On narrow
 * viewports the rail collapses into a horizontally scrollable strip so the
 * dense tables below get the full width. Reuses the product tokens and header
 * chrome — the admin is a section of the same app, not a different skin.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const groups = NAV.map((group) => ({
    ...group,
    entries: group.entries.filter(
      (entry) =>
        entry.permissions.length === 0 || hasAnyPermission(user, entry.permissions),
    ),
  })).filter((group) => group.entries.length > 0);

  return (
    <div className="bg-bg min-h-dvh">
      <aside className="border-border bg-bg-raised fixed inset-y-0 left-0 z-20 hidden w-[248px] flex-col border-r lg:flex">
        <div className="flex h-16 items-center gap-2 px-5">
          <FixPayLogo width={84} />
          <span className="text-text-muted text-[12px] font-semibold tracking-wide uppercase">
            Admin
          </span>
        </div>
        <nav
          aria-label="Navigation administration"
          className="flex-1 space-y-5 overflow-y-auto px-3 py-2"
        >
          {groups.map((group, index) => (
            <div key={group.label ?? `group-${index}`} className="space-y-1">
              {group.label ? (
                <p className="text-text-muted px-3 pb-1 text-[11px] font-semibold tracking-wide uppercase">
                  {group.label}
                </p>
              ) : null}
              {group.entries.map((entry) => (
                <NavLink
                  key={entry.href}
                  entry={entry}
                  active={isActive(pathname, entry)}
                />
              ))}
            </div>
          ))}
        </nav>
        <div className="border-border flex items-center justify-between gap-2 border-t px-4 py-3">
          <div className="min-w-0">
            <p className="text-text truncate text-[13px] font-semibold">
              {user?.name ?? "—"}
            </p>
            <p className="text-text-muted truncate text-[11px]">
              {user?.roles?.join(", ") || "—"}
            </p>
          </div>
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col lg:pl-[248px]">
        <header className="border-border bg-bg-raised sticky top-0 z-10 flex h-14 items-center gap-3 border-b px-4 lg:h-16 lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <FixPayLogo width={70} />
            <span className="text-text-muted text-[11px] font-semibold tracking-wide uppercase">
              Admin
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="lg:hidden">
              <ThemeToggle />
            </span>
            <LogoutButton className="h-9 w-auto px-3 text-[13px]" />
          </div>
        </header>

        <nav
          aria-label="Sections administration"
          className="border-border bg-bg-raised flex gap-1 overflow-x-auto border-b px-3 py-2 lg:hidden"
        >
          {groups.flatMap((group) =>
            group.entries.map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                aria-current={isActive(pathname, entry) ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors",
                  isActive(pathname, entry)
                    ? "bg-primary-tint text-primary"
                    : "text-text-secondary hover:bg-surface",
                )}
              >
                {entry.label}
              </Link>
            )),
          )}
        </nav>

        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
