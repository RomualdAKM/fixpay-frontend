"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  House,
  User,
  WalletMinimal,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavTab = "home" | "cards" | "wallet" | "profile";

interface BottomNavProps {
  /**
   * Override de l'onglet actif — EXCEPTION documentée, pas la règle.
   * Par défaut l'onglet est dérivé du `pathname` (comme la Sidebar) : deux
   * écrans frères ne peuvent plus mettre deux onglets différents en avant,
   * et un écran hors onglet (statistiques, notifications, support) n'en
   * surligne aucun plutôt que d'en surligner un faux.
   */
  active?: NavTab;
}

const TABS: Array<{
  id: NavTab;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Préfixes de route qui allument l'onglet. */
  match: string[];
}> = [
  { id: "home", label: "Accueil", href: "/", icon: House, match: ["/"] },
  {
    id: "cards",
    label: "Cartes",
    href: "/cards",
    icon: CreditCard,
    match: ["/cards", "/payment"],
  },
  {
    id: "wallet",
    label: "Portefeuille",
    href: "/wallet",
    icon: WalletMinimal,
    match: ["/wallet"],
  },
  {
    id: "profile",
    label: "Profil",
    href: "/profile",
    icon: User,
    match: ["/profile"],
  },
];

/**
 * Onglet racine correspondant à la route, ou `null` sur les écrans qui n'ont
 * pas d'onglet (`/statistics`, `/notifications`, `/support`).
 */
function tabFromPathname(pathname: string): NavTab | null {
  if (pathname === "/") return "home";
  const hit = TABS.find((tab) =>
    tab.match.some(
      (m) => m !== "/" && (pathname === m || pathname.startsWith(`${m}/`)),
    ),
  );
  return hit?.id ?? null;
}

/**
 * Fixed bottom tab bar (74px, blurred glass), mobile/tablet only — from `lg`
 * up it is hidden and the desktop Sidebar takes over. Content scrolls BEHIND it.
 * Inactive tabs use the signature double attenuation: icon colored
 * icon-muted AND wrapped in an opacity-28 span, while the label keeps
 * text-muted with no extra opacity.
 */
export function BottomNav({ active }: BottomNavProps) {
  const pathname = usePathname();
  const current = active ?? tabFromPathname(pathname);

  return (
    <nav
      aria-label="Navigation principale"
      className="border-border bg-nav fixed inset-x-0 bottom-0 z-50 mx-auto h-[74px] w-full max-w-[430px] border-t backdrop-blur-[20px] lg:hidden"
    >
      <ul className="flex h-full">
        {TABS.map(({ id, label, href, icon: Icon }) => {
          const isActive = id === current;
          return (
            <li key={id} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className="flex h-full flex-col items-center gap-[3px] pt-4"
              >
                <span className={cn("shrink-0", !isActive && "opacity-[0.28]")}>
                  <Icon
                    size={21}
                    strokeWidth={1.75}
                    absoluteStrokeWidth
                    aria-hidden="true"
                    className={isActive ? "text-primary" : "text-icon-muted"}
                  />
                </span>
                <span
                  className={cn(
                    "text-[9.5px] leading-[12.4px] font-medium",
                    isActive ? "text-primary" : "text-text-muted",
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
