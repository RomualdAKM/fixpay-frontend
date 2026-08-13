import { cn } from "@/lib/utils";

type LogoVariant = "full" | "mark" | "wordmark";
type LogoTone = "default" | "gold" | "white" | "ink";

interface FixPayLogoProps {
  /**
   * 'full' = écusson + wordmark ; 'mark' = écusson seul (tuiles, avatar chat) ;
   * 'wordmark' = lettrage seul, sans écusson.
   */
  variant?: LogoVariant;
  /** 'gold' pour la face de carte, 'white' sur dégradé, 'ink' en une seule encre. */
  tone?: LogoTone;
  /** Rendered width in px; height follows the intrinsic aspect ratio. */
  width?: number;
  className?: string;
}

interface Palette {
  /** Aplat du bouclier extérieur (audit : plus de dégradé sur l'objet de marque). */
  shield: string;
  shieldOpacity?: number;
  /** Aplat du bouclier intérieur, plus clair — le seul contraste de la forme. */
  inner: string;
  innerOpacity?: number;
  fix: string;
  pay: string;
}

/**
 * Les couleurs passent par les variables `--c-*` et non par des classes : le
 * logo doit suivre le thème de son sous-arbre (un mark posé dans une surface
 * épinglée `data-theme="dark"` reste sur la palette sombre).
 * Les deux clairs (`#dbeafe`, `#fef3c7`) sont volontairement fixes : ils sont
 * posés SUR le bouclier, dont la teinte est identique dans les deux thèmes.
 *
 * `ink` — UNE SEULE ENCRE. Ajouté pour l'écran 01 : la face de carte porte le
 * lockup en or, l'en-tête portait le même lockup en bleu, soit deux colorways
 * du même logotype à 250px d'écart (re-notation). Le lettrage bicolore
 * « Fix » + « Pay » est la signature de l'APPLICATION ; il ne peut pas
 * cohabiter avec sa transposition dorée sur le même écran. `ink` compose le
 * wordmark en une seule encre `--c-text`, ce qui rend au passage l'écran
 * conforme à la règle « une seule zone bleue, le point d'action ».
 */
const PALETTES: Record<LogoTone, Palette> = {
  default: {
    shield: "var(--c-primary)",
    inner: "#dbeafe",
    innerOpacity: 0.9,
    fix: "var(--c-text)",
    pay: "var(--c-primary)",
  },
  gold: {
    shield: "var(--c-gold)",
    inner: "#fef3c7",
    innerOpacity: 0.9,
    fix: "#fef3c7",
    pay: "var(--c-warning)",
  },
  white: {
    shield: "#ffffff",
    shieldOpacity: 0.9,
    inner: "#ffffff",
    innerOpacity: 0.55,
    fix: "#ffffff",
    pay: "#ffffff",
  },
  ink: {
    shield: "var(--c-text)",
    inner: "var(--c-bg)",
    innerOpacity: 0.9,
    fix: "var(--c-text)",
    pay: "var(--c-text)",
  },
};

/** Shield outline drawn in a 21×25 box (rounded top corners, tapered base). */
const SHIELD_PATH =
  "M10.5 0.5 C7.6 1.9 4.5 2.7 2.4 3 C1.6 3.1 1 3.8 1 4.6 V11 " +
  "C1 17.7 4.9 22.6 9.9 24.9 C10.3 25.05 10.7 25.05 11.1 24.9 " +
  "C16.1 22.6 20 17.7 20 11 V4.6 C20 3.8 19.4 3.1 18.6 3 " +
  "C16.5 2.7 13.4 1.9 10.5 0.5 Z";

/**
 * Fenêtre de dessin par variante — même espace utilisateur pour les trois, on
 * ne fait que recadrer. `wordmark` est en outre recadré EN HAUTEUR sur les
 * hampes du lettrage : conservé sur 25 unités, il aurait traîné ~25 % de vide
 * au-dessus et au-dessous, c'est-à-dire un faux rythme dans tout bloc qui le
 * coiffe.
 */
const VIEWBOX: Record<
  LogoVariant,
  { x: number; y: number; w: number; h: number }
> = {
  full: { x: 0, y: 0, w: 78, h: 25 },
  mark: { x: 0, y: 0, w: 21, h: 25 },
  wordmark: { x: 26, y: 5.5, w: 52, h: 17.5 },
};

/**
 * FixPay brand logo, recreated as pure inline SVG (the Figma fills are
 * bitmaps): bouclier en APLAT + bouclier intérieur clair, plus le wordmark
 * bicolore 'Fix'/'Pay'. Les deux `linearGradient` d'origine ont été supprimés
 * (audit : le dégradé 135° est réservé à la carte bancaire).
 *
 * RÈGLE DE MARQUE — UN SEUL TRAITEMENT PAR ÉCRAN. Le lockup complet (écusson +
 * lettrage) ne doit apparaître qu'une fois par vue. Quand un écran porte déjà
 * un lockup gravé sur un objet (la face de carte, en `gold`), la signature
 * d'application se compose en `variant="wordmark" tone="ink"` : deux objets de
 * nature différente, deux expressions distinctes, aucun colorway concurrent.
 */
export function FixPayLogo({
  variant = "full",
  tone = "default",
  width = 78,
  className,
}: FixPayLogoProps) {
  const palette = PALETTES[tone];
  const box = VIEWBOX[variant];
  const height = Math.round((width * box.h * 100) / box.w) / 100;

  return (
    <svg
      role="img"
      aria-label="FixPay"
      width={width}
      height={height}
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      fill="none"
      className={cn("block shrink-0", className)}
    >
      {variant !== "wordmark" ? (
        <>
          <path
            d={SHIELD_PATH}
            fill={palette.shield}
            fillOpacity={palette.shieldOpacity ?? 1}
          />
          <path
            d={SHIELD_PATH}
            fill={palette.inner}
            fillOpacity={palette.innerOpacity ?? 1}
            transform="translate(4.2 5.1) scale(0.6)"
          />
        </>
      ) : null}
      {variant !== "mark" ? (
        <text
          x={26}
          y={18.75}
          fontSize={17.5}
          fontWeight={700}
          letterSpacing={-0.3}
          fontFamily="inherit"
        >
          <tspan fill={palette.fix}>Fix</tspan>
          <tspan fill={palette.pay}>Pay</tspan>
        </text>
      ) : null}
    </svg>
  );
}
