import { FixPayLogo } from "@/components/brand/FixPayLogo";
import { cn } from "@/lib/utils";

type VirtualCardSize = "lg" | "onboarding" | "mini";
type VirtualCardBrand = "visa" | "mastercard";

interface VirtualCardProps {
  size?: VirtualCardSize;
  brand?: VirtualCardBrand;
  number?: string;
  holder?: string;
  expiry?: string;
}

/**
 * Échelle typographique des deux faces pleines.
 *
 * La face n'est plus composée en positions absolues : elle est une colonne
 * flex (marque en tête, numéro poussé en bas, ligne validité/porteur/réseau en
 * pied). Trois conséquences directes sur les reproches des DA :
 *
 * - `lg` prend le RATIO ISO 7810 ID-1 (1,586:1) au lieu de s'étirer en
 *   482 × 192 (2,5:1) sur desktop, ce qui supprime le vide central de ~250px ;
 * - le numéro porte le même interlettrage à tous les breakpoints — les deux
 *   viewports ne racontent plus deux histoires différentes ;
 * - `tracking` retombe à 2px et l'écart INTER-groupes est porté par
 *   `word-spacing` (les espaces du masque sont réelles) : « •••• •••• ••••
 *   4291 » se lit enfin en quatre groupes, et « 4291 » comme un nombre.
 */
const FACE = {
  lg: {
    root: "mx-auto aspect-[1.586/1] w-full max-w-[348px] p-5",
    logoWidth: 53,
    number: "text-[14px] leading-[18px] tracking-[2px] [word-spacing:7px]",
    caption: "text-[9px] leading-[12px]",
    value: "text-[11.5px] leading-[15px]",
    holder: "text-[11.5px] leading-[15px] tracking-[1.2px]",
    mark: "text-[17px] leading-[22px]",
    pastille: "size-3.5",
  },
  onboarding: {
    root: "h-[168px] w-[276px] p-[15px]",
    logoWidth: 44,
    number: "text-[11.5px] leading-[15px] tracking-[1.5px] [word-spacing:5px]",
    caption: "text-[8px] leading-[11px]",
    value: "text-[10px] leading-[13px]",
    holder: "text-[10px] leading-[13px] tracking-[1px]",
    mark: "text-[13px] leading-[17px]",
    pastille: "size-3",
  },
} as const;

/** VISA wordmark or the two overlapping Mastercard pastilles. */
function BrandMark({
  brand,
  className,
  pastille = "size-3.5",
}: {
  brand: VirtualCardBrand;
  className?: string;
  pastille?: string;
}) {
  if (brand === "visa") {
    return (
      <span
        className={cn(
          "font-extrabold tracking-[-0.5px] text-white italic",
          className,
        )}
      >
        VISA
      </span>
    );
  }
  return (
    <span className={cn("flex shrink-0", className)} aria-hidden>
      <span className={cn("bg-danger rounded-full opacity-90", pastille)} />
      <span
        className={cn("bg-orange -ml-1.5 rounded-full opacity-90", pastille)}
      />
    </span>
  );
}

/**
 * FixPay virtual bank card visual. `lg` (détail carte, activation réussie) et
 * `onboarding` rendent la face complète ; `mini` est la vignette 80×50 des
 * écrans 09 et 19.
 *
 * La carte est le seul objet identitaire du produit : elle garde
 * `gradient-card` et l'unique niveau d'élévation réel (`shadow-raised`). Le
 * relief interne vient d'un liseré spéculaire, plus de cercles blancs
 * débordants (audit [D]).
 *
 * PUCE SUPPRIMÉE (audit [M], reproche bloquant de l'écran 10). Les DA
 * divergeaient entre « vraie puce EMV mate » et « suppression » : on tranche
 * pour la suppression, parce qu'une carte VIRTUELLE n'a pas de plage de
 * contact — elle n'est jamais insérée dans un terminal. Un pavé doré y est du
 * mobilier de maquette recopié d'une carte physique, et c'est exactement le
 * genre d'objet décoratif que la refonte a retiré partout ailleurs. Le coin
 * haut-gauche ainsi libéré accueille la marque de l'émetteur — composition
 * standard d'une carte réelle (émetteur en haut à gauche, réseau en bas à
 * droite), qui a l'avantage de ne plus concentrer les deux marques sur le bord
 * droit, celui que le débord de l'écran 01 ampute.
 */
export function VirtualCard({
  size = "lg",
  brand = "visa",
  number = "•••• •••• •••• 4291",
  holder = "JEAN DUPONT",
  expiry = "12/28",
}: VirtualCardProps) {
  if (size === "mini") {
    return (
      <div
        data-theme="dark"
        className={cn(
          "shadow-surface relative h-[50px] w-20 overflow-hidden rounded-sm",
          brand === "visa" ? "gradient-card" : "gradient-card-mc",
        )}
      >
        <FixPayLogo
          tone="gold"
          width={25}
          className="absolute top-[5px] left-[7px] opacity-[0.85]"
        />
        <BrandMark
          brand={brand}
          pastille="size-2.5"
          className={
            brand === "visa"
              ? "absolute right-[7px] bottom-2 text-[8px] leading-[10px]"
              : "absolute right-2 bottom-2"
          }
        />
      </div>
    );
  }

  const face = FACE[size];

  return (
    <div
      // Pinned dark: a bank card keeps its blue gradient in both themes.
      data-theme="dark"
      className={cn(
        "gradient-card shadow-raised relative flex flex-col justify-between overflow-hidden rounded-lg",
        face.root,
        brand === "mastercard" && "gradient-card-mc",
      )}
    >
      {/* Liseré spéculaire haut : posé en calque pour cohabiter avec
          l'élévation (une seule classe `shadow-*` par élément). */}
      <span
        aria-hidden
        className="shadow-specular pointer-events-none absolute inset-0 rounded-lg"
      />

      <FixPayLogo
        tone="gold"
        width={face.logoWidth}
        className="relative opacity-[0.82]"
      />

      {/* Trois blocs répartis par `justify-between` : marque en tête, numéro
          au centre optique, pied de face en bas. La face n'a plus une seule
          respiration de ~100px au milieu (le vide que laissait la puce
          supprimée) mais deux intervalles égaux — le vide devient un rythme. */}
      <p className={cn("relative font-mono text-white/[0.9]", face.number)}>
        {number}
      </p>

      <div className="relative flex items-end justify-between gap-3">
        <div className="min-w-0">
          {/* Validité : remontée à 11,5px sur blanc à 0,85 — l'information
              la plus consultée après le numéro était rendue en 10px à faible
              opacité, soit la moins lisible de l'écran (régression 10.3). */}
          <p className="flex items-baseline gap-1.5">
            <span className={cn("text-white/55", face.caption)}>EXP</span>
            <span
              className={cn(
                "font-mono tracking-[0.5px] text-white/[0.85]",
                face.value,
              )}
            >
              {expiry}
            </span>
          </p>
          <p
            className={cn(
              "mt-1 truncate text-white/[0.82] uppercase",
              face.holder,
            )}
          >
            {holder}
          </p>
        </div>
        <BrandMark
          brand={brand}
          pastille={face.pastille}
          className={cn("shrink-0", brand === "visa" && face.mark)}
        />
      </div>
    </div>
  );
}
