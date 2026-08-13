import { Bell } from "lucide-react";

import { FixPayLogo } from "@/components/brand/FixPayLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  /** 19px bold title shown when the logo is hidden ('Mon portefeuille'). */
  title?: string;
  /** Show the 78×25 FixPay logo instead of the title (Home). */
  showLogo?: boolean;
  showBell?: boolean;
  /** 6px blue notification dot on the bell. */
  bellDot?: boolean;
  /**
   * Desktop (≥lg) heading replacing the mobile logo/title, which would
   * duplicate the sidebar brand. When omitted the header is unchanged.
   */
  desktopTitle?: string;
}

/**
 * Root-tab header (Home / Wallet / Profil) : logo ou titre de page à gauche,
 * actions à droite.
 *
 * UNE SEULE BASCULE DE THÈME PAR VIEWPORT. En desktop, la sidebar en porte
 * déjà une (x=222) : celle de l'en-tête (x=1291) était le même soleil, au même
 * corps, à 1069px d'écart, visible en même temps sur les écrans 02, 03 et 19.
 * Le réglage appartient au châssis de navigation ; en desktop c'est la
 * sidebar, en mobile — où il n'y a pas de sidebar — c'est l'en-tête. La
 * bascule est donc coupée à `lg`, une fois, dans le composant partagé.
 */
export function AppHeader({
  title,
  showLogo = false,
  showBell = true,
  bellDot = false,
  desktopTitle,
}: AppHeaderProps) {
  // Opt-in: only a provided desktopTitle swaps the left slot at ≥lg.
  const swapOnDesktop = desktopTitle !== undefined;

  return (
    <header className="flex items-center justify-between">
      {showLogo ? (
        <FixPayLogo
          width={78}
          className={swapOnDesktop ? "lg:hidden" : undefined}
        />
      ) : (
        <h1
          className={cn(
            "text-text text-[19px] leading-tight font-bold",
            swapOnDesktop && "lg:hidden",
          )}
        >
          {title}
        </h1>
      )}
      {swapOnDesktop ? (
        /* `hidden` keeps it out of the mobile flex flow entirely. */
        <h1 className="text-text hidden lg:block lg:text-[24px] lg:font-bold">
          {desktopTitle}
        </h1>
      ) : null}
      <div className="flex items-center gap-[9px]">
        <span className="flex lg:hidden">
          <ThemeToggle />
        </span>
        {showBell ? (
          <IconButton
            icon={Bell}
            href="/notifications"
            badge={bellDot}
            ariaLabel="Notifications"
          />
        ) : null}
      </div>
    </header>
  );
}
