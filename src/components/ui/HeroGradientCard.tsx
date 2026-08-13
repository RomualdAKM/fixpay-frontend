import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface HeroGradientCardProps {
  align?: "left" | "center";
  className?: string;
  children: ReactNode;
}

/**
 * Bandeau hero secondaire à dégradé (KYC, Parrainage, Fidélité, Support).
 * Contenu libre via `children` ; le padding `p-5` par défaut se surcharge par
 * `className`.
 *
 * Une seule surface, un seul rayon (`rounded-lg`), aucune élévation : l'audit
 * réserve le niveau « raised » à la carte bancaire et au hero portefeuille, et
 * ce bandeau est de niveau 0. Le cercle blanc débordant est remplacé par le
 * liseré spéculaire haut.
 */
export function HeroGradientCard({
  align = "left",
  className,
  children,
}: HeroGradientCardProps) {
  return (
    <div
      // Pinned dark: the blue gradient stays dark under the light theme.
      data-theme="dark"
      className={cn(
        "gradient-card shadow-specular relative overflow-hidden rounded-lg p-5",
        align === "center" && "text-center",
        className,
      )}
    >
      <div className="relative">{children}</div>
    </div>
  );
}
