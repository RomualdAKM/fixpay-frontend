"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChartColumn,
  CircleHelp,
  CreditCard,
  House,
  Plus,
  User,
  WalletMinimal,
  type LucideIcon,
} from "lucide-react";

import { FixPayLogo } from "@/components/brand/FixPayLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { user } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface NavEntry {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Route prefixes that also light up this entry. */
  match: string[];
}

const PRIMARY: NavEntry[] = [
  { label: "Accueil", href: "/", icon: House, match: ["/"] },
  {
    label: "Cartes",
    href: "/cards/visa-4291",
    icon: CreditCard,
    match: ["/cards", "/payment"],
  },
  {
    label: "Portefeuille",
    href: "/wallet",
    icon: WalletMinimal,
    match: ["/wallet"],
  },
  { label: "Profil", href: "/profile", icon: User, match: ["/profile"] },
];

const SECONDARY: NavEntry[] = [
  {
    label: "Statistiques",
    href: "/statistics",
    icon: ChartColumn,
    match: ["/statistics"],
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    match: ["/notifications"],
  },
  { label: "Support", href: "/support", icon: CircleHelp, match: ["/support"] },
];

/** Longest-prefix match so /profile/kyc lights up "Profil", not "Accueil". */
function isActive(pathname: string, entry: NavEntry, all: NavEntry[]): boolean {
  const score = (e: NavEntry) =>
    Math.max(
      ...e.match.map((m) =>
        m === "/"
          ? pathname === "/"
            ? 1
            : -1
          : pathname === m || pathname.startsWith(`${m}/`)
            ? m.length
            : -1,
      ),
    );
  const own = score(entry);
  if (own < 0) return false;
  return all.every((e) => e === entry || score(e) <= own);
}

function NavList({ entries, all }: { entries: NavEntry[]; all: NavEntry[] }) {
  const pathname = usePathname();
  return (
    <ul className="mt-2.5 flex flex-col gap-1">
      {entries.map((entry) => {
        const active = isActive(pathname, entry, all);
        const Icon = entry.icon;
        return (
          <li key={entry.label}>
            <Link
              href={entry.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11 items-center gap-3 rounded-md px-3 text-[13.5px] font-medium transition-colors",
                active
                  ? "bg-primary-tint text-primary"
                  : "text-text-muted hover:bg-surface hover:text-text",
              )}
            >
              <Icon
                size={19}
                strokeWidth={1.75}
                absoluteStrokeWidth
                aria-hidden="true"
                className={active ? "text-primary" : "text-icon-muted"}
              />
              {entry.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Desktop-only navigation rail (≥1024px), replacing the mobile BottomNav.
 * 264px fixed column: brand, primary tabs, shortcuts, "create card" CTA and
 * the signed-in user block. Hidden below `lg`, where BottomNav takes over.
 */
export function Sidebar() {
  const all = [...PRIMARY, ...SECONDARY];

  return (
    <aside
      aria-label="Navigation principale"
      className="border-border bg-bg fixed inset-y-0 left-0 z-50 hidden w-[264px] flex-col overflow-y-auto border-r px-5 py-7 lg:flex"
    >
      <div className="flex items-center justify-between px-1">
        <Link href="/" aria-label="FixPay — accueil">
          <FixPayLogo width={104} />
        </Link>
        <ThemeToggle />
      </div>

      <nav className="mt-9">
        <SectionLabel className="px-3">Navigation</SectionLabel>
        <NavList entries={PRIMARY} all={all} />

        <div className="mt-7">
          <SectionLabel className="px-3">Raccourcis</SectionLabel>
          <NavList entries={SECONDARY} all={all} />
        </div>
      </nav>

      {/* Le rail se lit en DEUX groupes, pas en trois objets espacés au
          hasard : la navigation, puis le bloc « vous » (créer une carte, votre
          compte). Le `mt-auto` qui plaquait la carte utilisateur en pied
          ouvrait un trou de ~224px À L'INTÉRIEUR de la pile, entre « Créer une
          carte » (y=580) et elle : un vide interne, pas une marge de fin. Le
          groupe est refermé sur un pas de 12px ; ce qui reste sous le rail est
          du blanc de fin de colonne, ce qu'est n'importe quel rail de nav. */}
      <Link
        href="/cards/new"
        className="bg-primary mt-7 flex h-11 items-center justify-center gap-2 rounded-md text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90"
      >
        <Plus size={16} aria-hidden="true" />
        Créer une carte
      </Link>

      <Link
        href="/profile"
        className="border-border bg-surface hover:bg-surface-2 mt-3 flex items-center gap-3 rounded-md border p-3 transition-colors"
      >
        <span className="bg-surface-5 text-text flex size-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold">
          {user.initial}
        </span>
        <span className="min-w-0">
          <span className="text-text block truncate text-[13px] font-medium">
            {user.name}
          </span>
          <span className="text-text-muted block truncate text-[11px]">
            {user.email}
          </span>
        </span>
      </Link>
    </aside>
  );
}
