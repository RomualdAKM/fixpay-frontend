"use client";

import { useMemo, useState } from "react";

import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { AmountFigure } from "@/components/ui/AmountText";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { formatFcfa, formatSigned } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  homeTransactions,
  statTiles,
  walletMovements,
  type Transaction,
  type TxIcon,
} from "@/lib/mock-data";

/**
 * Dernier jour couvert par le jeu de démonstration (`MOCK_NOW` = 14 avril
 * 2026). Écrit ici parce que `mock-data` n'exporte pas encore sa constante ;
 * voir la note de livraison. Il est FIGÉ, comme le reste des données : une
 * période calculée sur `new Date()` produirait deux rendus différents entre
 * le serveur et le client.
 */
const PERIOD_END = new Date(2026, 3, 14);

/**
 * Sélecteur de période. La plage n'est pas une phrase figée : c'est un état,
 * et TOUT en dérive (le libellé de la plage, le total, la moyenne journalière,
 * l'histogramme, la répartition, le nombre de mouvements listés).
 *
 * DÉFAUT PAR DÉFAUT : 7 jours, et non plus 14. Le reproche « le graphique est
 * à ~85 % vide, 3 barres pour 14 emplacements » n'était pas un défaut de
 * dessin mais de FENÊTRE : les trois dépenses du jeu tiennent toutes dans les
 * 7 derniers jours (10, 12 et 14 avril).
 */
const PERIODS = [
  { id: "7j", label: "7 jours", days: 7 },
  { id: "14j", label: "14 jours", days: 14 },
  { id: "30j", label: "30 jours", days: 30 },
] as const;

type Period = (typeof PERIODS)[number];

/**
 * Catégorie de dépense déduite du type de mouvement. Les mouvements INTERNES
 * (alimentation de carte, retrait vers Mobile Money) n'ont pas de catégorie :
 * ce sont des transferts entre les comptes de l'utilisateur, pas des
 * dépenses — les compter contredirait le total affiché.
 */
const CATEGORY_BY_ICON: Partial<Record<TxIcon, string>> = {
  plane: "Voyage",
  shopping: "Shopping",
  music: "Abonnements",
};

/**
 * TEINTE PAR CATÉGORIE — TROIS TOKENS DU PRODUIT, ZÉRO HEXADÉCIMAL.
 *
 * La version précédente posait bleu / moutarde / ROSE en valeurs arbitraires
 * (`#c2569b`, `#b1478a`). Le reproche des DA est juste et il est double : le
 * rose n'existe nulle part ailleurs dans FixPay — ni token, ni composant, ni
 * écran — et une palette de dataviz inventée pour un seul graphique est, par
 * définition, arbitraire. La justification écrite au-dessus (ΔE, protan,
 * contrastes) validait la lisibilité des couleurs ; elle ne pouvait pas
 * justifier leur EXISTENCE.
 *
 * Les trois teintes sont donc prises dans la palette, telle qu'elle est
 * déclarée dans les deux thèmes de `globals.css` :
 *   Voyage      `--c-primary`  le bleu de marque
 *   Shopping    `--c-gold`     l'or mat (fidélité, lettrage de carte)
 *   Abonnements `--c-orange`   l'orange (pastille Mastercard)
 * Aucune variable nouvelle, donc rien à ajouter dans les deux blocs, et la
 * bascule de thème est prise en charge par les tokens eux-mêmes (le bloc clair
 * assombrit déjà l'or et l'orange pour tenir le contraste).
 *
 * La couleur reste doublée, comme avant : chaque segment est repris par une
 * pastille, un libellé ET un pourcentage dans la liste juste dessous. Elle
 * n'est jamais le seul canal — c'est ce qui rend la paire or/orange
 * acceptable pour une vision protanope.
 */
const CATEGORY_COLOR: Record<string, string> = {
  Voyage: "bg-primary",
  Shopping: "bg-gold",
  Abonnements: "bg-orange",
};

function categoryColor(label: string): string {
  return CATEGORY_COLOR[label] ?? "bg-surface-4";
}

const MONTHS_FR = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
] as const;

const SHORT_MONTHS_FR = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
] as const;

/** « 1er » / « 8 » — la seule irrégularité ordinale du français. */
function dayOrdinal(d: Date): string {
  return d.getDate() === 1 ? "1er" : String(d.getDate());
}

/** « 8 avr. » — étiquette d'axe, au format court du produit. */
function shortDay(d: Date): string {
  return `${d.getDate()} ${SHORT_MONTHS_FR[d.getMonth()]}`;
}

/** « Du 8 au 14 avril 2026 », « Du 16 mars au 14 avril 2026 ». */
function rangeLabel(start: Date, end: Date): string {
  const endPart = `${dayOrdinal(end)} ${MONTHS_FR[end.getMonth()]} ${end.getFullYear()}`;
  if (
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    return `Du ${dayOrdinal(start)} au ${endPart}`;
  }
  return `Du ${dayOrdinal(start)} ${MONTHS_FR[start.getMonth()]} au ${endPart}`;
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function inPeriod(at: string, start: Date, end: Date): boolean {
  const t = startOfDay(new Date(at));
  return t >= startOfDay(start) && t <= startOfDay(end);
}

function shiftDays(from: Date, delta: number): Date {
  return new Date(from.getFullYear(), from.getMonth(), from.getDate() + delta);
}

/**
 * Palier « rond » immédiatement au-dessus du pic — la valeur haute de l'axe.
 * Un axe qui s'arrête exactement sur le pic ne se lit pas : la barre la plus
 * haute touche le plafond et le graphe n'a plus de graduation utile.
 */
function niceCeiling(value: number): number {
  if (value <= 0) return 0;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 7.5]) {
    const candidate = step * magnitude;
    if (candidate >= value) return candidate;
  }
  return 10 * magnitude;
}

/**
 * « 250 k », « 1,2 M » — ÉTIQUETTE D'AXE uniquement, jamais un montant de
 * lecture : tout ce qui se lit comme une somme passe par `formatFcfa`.
 */
function compactAmount(value: number): string {
  if (value === 0) return "0";
  if (value >= 1_000_000) {
    const millions = Math.round((value / 1_000_000) * 10) / 10;
    return `${String(millions).replace(".", ",")} M`;
  }
  if (value >= 1_000) return `${Math.round(value / 1_000)} k`;
  return String(Math.round(value));
}

interface PeriodData {
  start: Date;
  end: Date;
  label: string;
  /** Mouvements de dépense (hors transferts internes) de la période. */
  spending: Transaction[];
  total: number;
  dailyAverage: number;
  /** Total des crédits du portefeuille sur la période. */
  deposits: number;
  depositCount: number;
  /** Une entrée par jour de la fenêtre — les jours vides comptent. */
  days: { date: Date; total: number }[];
  max: number;
  /** Nombre de jours de la fenêtre portant au moins une dépense. */
  spendDays: number;
  /** La plus grosse dépense unitaire de la période. */
  biggest?: Transaction;
  /** Même durée, juste avant : le seul point de comparaison honnête. */
  previousTotal: number;
  previousLabel: string;
  categories: { label: string; amount: number; percent: number }[];
}

function buildPeriod(period: Period): PeriodData {
  const end = PERIOD_END;
  const start = shiftDays(end, -(period.days - 1));
  const previousEnd = shiftDays(start, -1);
  const previousStart = shiftDays(previousEnd, -(period.days - 1));

  const isSpending = (m: Transaction) =>
    m.direction === "debit" && CATEGORY_BY_ICON[m.icon] !== undefined;

  const spending = homeTransactions.filter(
    (m) => isSpending(m) && inPeriod(m.at, start, end),
  );
  const total = spending.reduce((sum, m) => sum + Math.abs(m.amount), 0);

  const previousTotal = homeTransactions
    .filter((m) => isSpending(m) && inPeriod(m.at, previousStart, previousEnd))
    .reduce((sum, m) => sum + Math.abs(m.amount), 0);

  const credits = walletMovements.filter(
    (m) => m.direction === "credit" && inPeriod(m.at, start, end),
  );

  const days = Array.from({ length: period.days }, (_, i) => {
    const date = shiftDays(start, i);
    const dayTotal = spending
      .filter((m) => startOfDay(new Date(m.at)) === startOfDay(date))
      .reduce((sum, m) => sum + Math.abs(m.amount), 0);
    return { date, total: dayTotal };
  });

  const byCategory = new Map<string, number>();
  for (const movement of spending) {
    const key = CATEGORY_BY_ICON[movement.icon]!;
    byCategory.set(key, (byCategory.get(key) ?? 0) + Math.abs(movement.amount));
  }
  const categories = [...byCategory.entries()]
    .map(([label, amount]) => ({
      label,
      amount,
      percent: total > 0 ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    start,
    end,
    label: rangeLabel(start, end),
    spending,
    total,
    dailyAverage: Math.round(total / period.days),
    deposits: credits.reduce((sum, m) => sum + m.amount, 0),
    depositCount: credits.length,
    days,
    max: days.reduce((m, d) => Math.max(m, d.total), 0),
    spendDays: days.filter((d) => d.total > 0).length,
    biggest: [...spending].sort(
      (a, b) => Math.abs(b.amount) - Math.abs(a.amount),
    )[0],
    previousTotal,
    previousLabel: rangeLabel(previousStart, previousEnd),
    categories,
  };
}

const CHART_HEIGHT = 140;
/**
 * Largeur de la colonne d'étiquettes de l'axe. Une constante, parce que la
 * rangée de dates sous le tracé doit démarrer EXACTEMENT au même x que la
 * première barre : c'est ce décalage, quand il est approximé, qui décroche une
 * étiquette de sa colonne.
 */
const AXIS_WIDTH = 44;

/**
 * Histogramme des dépenses jour par jour.
 *
 * CE QUE LES DA ONT RELEVÉ, ET CE QUI EST FAIT :
 *
 * 1. « 4 jours sur 7 sont des traits de 2 px » — le repère de 2px posé sur les
 *    jours sans dépense était une invention : la ligne de zéro d'un axe DIT
 *    déjà qu'il ne s'est rien passé. Les jours vides ne portent plus de marque,
 *    ils gardent leur emplacement et leur étiquette de date. L'absence reste
 *    une donnée, elle n'est simplement plus dessinée deux fois.
 *
 * 2. « Aucune graduation verticale, aucun repère de lecture » — l'axe existe :
 *    trois graduations (0, moitié, plafond), leurs filets à travers la zone de
 *    tracé, et un plafond ARRONDI au palier supérieur (`niceCeiling`), pas le
 *    pic lui-même. Une barre ne touche donc jamais le haut du cadre.
 *
 * 3. « Aucune valeur au survol visible » — chaque barre non nulle porte sa
 *    valeur en clair : à l'intérieur quand elle est assez haute, juste au-dessus
 *    sinon. Le `title` reste pour la valeur exacte au survol, mais l'écran ne
 *    dépend plus d'un survol : c'est le reproche de fond.
 *
 * 4. « Une barre écrase tout » — c'est la donnée, pas le dessin : une dépense
 *    de 223 026 FCFA au milieu de deux dépenses à 39 341 et 6 554 EST un pic.
 *    Ce qu'un studio ajoute dans ce cas, et qui manquait, c'est de le DIRE :
 *    la ligne sous le tracé nomme le nombre de jours servis et prévient qu'une
 *    fenêtre à trois événements ne dessine pas une tendance. L'écran cesse de
 *    faire passer trois points pour une série.
 *
 * Série unique, donc une seule teinte et aucune légende : le titre nomme la
 * série (règle de dataviz du produit — la légende commence à deux séries).
 */
function DailySpendChart({ data }: { data: PeriodData }) {
  const { days, max, spendDays } = data;
  const ceiling = niceCeiling(max);
  const ticks = [ceiling, ceiling / 2, 0];
  const labelStep = days.length <= 7 ? 1 : days.length <= 14 ? 2 : 5;
  const sparse = spendDays > 0 && spendDays * 2 < days.length;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <SectionLabel>Dépenses jour par jour</SectionLabel>
        <span className="text-text-muted shrink-0 text-[11.5px] leading-[15px]">
          {max > 0 ? `Pic ${formatFcfa(max)}` : "Aucune dépense"}
        </span>
      </div>

      {max === 0 ? (
        <p className="text-text-secondary border-border mt-3 border-t py-8 text-[12.5px] leading-[18px]">
          Aucune dépense sur cette période : il n&apos;y a rien à tracer.
          Essayez une fenêtre plus longue.
        </p>
      ) : (
        <>
          <div
            role="img"
            aria-label={`Histogramme des dépenses quotidiennes ${data.label.toLowerCase()}. Total ${formatFcfa(
              data.total,
            )} sur ${spendDays} ${spendDays > 1 ? "jours" : "jour"}, moyenne ${formatFcfa(
              data.dailyAverage,
            )} par jour, pic ${formatFcfa(max)}.`}
            className="mt-3.5 flex"
          >
            {/* Axe des ordonnées : les étiquettes sont centrées SUR leur
                graduation, pas réparties dans la hauteur — sinon le « 0 » ne
                tombe pas sur la ligne de base. */}
            <div
              aria-hidden
              className="relative shrink-0"
              style={{ height: CHART_HEIGHT, width: AXIS_WIDTH }}
            >
              {ticks.map((tick) => (
                <span
                  key={tick}
                  className="text-text-muted absolute right-2 -translate-y-1/2 text-[10.5px] leading-[12px]"
                  style={{ top: `${(1 - tick / ceiling) * 100}%` }}
                >
                  {compactAmount(tick)}
                </span>
              ))}
            </div>

            <div className="relative flex-1" style={{ height: CHART_HEIGHT }}>
              {ticks.map((tick, index) => (
                <span
                  key={tick}
                  aria-hidden
                  className={cn(
                    "absolute inset-x-0 h-px",
                    index === ticks.length - 1
                      ? "bg-border-strong"
                      : "bg-border",
                  )}
                  style={{ top: `${(1 - tick / ceiling) * 100}%` }}
                />
              ))}

              <div className="absolute inset-0 flex items-end gap-[2px]">
                {days.map((day) => {
                  const percent = (day.total / ceiling) * 100;
                  // Au-delà de 35 % de la hauteur, la valeur tient DANS la
                  // barre ; en dessous elle se pose au-dessus. Une seule règle,
                  // aucun réglage par jeu de données.
                  const inside = percent >= 35;
                  return (
                    <div
                      key={day.date.toISOString()}
                      className="relative flex h-full flex-1 items-end"
                      title={`${shortDay(day.date)} · ${formatFcfa(day.total)}`}
                    >
                      {day.total > 0 && (
                        <>
                          <span
                            className={cn(
                              "absolute inset-x-0 text-center text-[10px] leading-[12px]",
                              inside
                                ? "font-medium text-white"
                                : "text-text-muted",
                            )}
                            style={{
                              bottom: inside
                                ? `calc(${percent}% - 16px)`
                                : `calc(${percent}% + 3px)`,
                            }}
                          >
                            {compactAmount(day.total)}
                          </span>
                          <div
                            className="bg-primary mx-auto w-full max-w-[40px] rounded-xs"
                            style={{ height: `${percent}%` }}
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Étiquettes de jours : calées sur la zone de tracé, une par
              emplacement. Les extrémités portent le mois, le reste le
              quantième — deux dates aux deux bouts ne suffisaient pas à
              rattacher une barre à un jour. */}
          <div
            aria-hidden
            className="mt-2 flex gap-[2px]"
            style={{ paddingLeft: AXIS_WIDTH }}
          >
            {days.map((day, index) => {
              const isEdge = index === 0 || index === days.length - 1;
              const shown = isEdge || index % labelStep === 0;
              return (
                <span
                  key={day.date.toISOString()}
                  className={cn(
                    "flex-1 truncate text-center text-[10.5px] leading-[14px]",
                    day.total > 0 ? "text-text-secondary" : "text-text-muted",
                  )}
                >
                  {shown
                    ? isEdge
                      ? shortDay(day.date)
                      : String(day.date.getDate())
                    : ""}
                </span>
              );
            })}
          </div>

          {sparse && (
            <p className="text-text-muted mt-2.5 text-[11.5px] leading-[16px]">
              {spendDays} {spendDays > 1 ? "jours servis" : "jour servi"} sur{" "}
              {days.length} : la fenêtre montre des dépenses isolées, pas une
              tendance.
            </p>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Rangée de « Dépenses de la période ».
 *
 * Métrique STRICTEMENT celle de `TransactionItem` (65px, filet bas, titre
 * 13,5px, méta 11,5px, montant 14px semibold à droite) : c'est la même liste
 * que sur 02, 03 et 10. Une seule chose change, et c'est le reproche des DA :
 * LE MONTANT N'EST PLUS PEINT EN ROUGE. Dans une section dont le titre est
 * « Dépenses », toutes les lignes sont des débits : la couleur n'y encode
 * rien, elle sature seulement.
 */
function SpendRow({
  transaction,
  last,
}: {
  transaction: Transaction;
  last: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-[65px] items-center gap-[13px]",
        !last && "border-border border-b",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-text truncate text-[13.5px] font-medium">
          {transaction.title}
        </p>
        <p className="text-text-muted mt-[2px] truncate text-[11.5px]">
          {transaction.date}
        </p>
      </div>
      <AmountFigure
        value={formatSigned(transaction)}
        className="text-text shrink-0 text-[14px] font-semibold"
      />
    </div>
  );
}

/**
 * Rangée d'un relevé : intitulé, sa précision en seconde ligne, sa valeur à
 * droite. C'est la métrique de `SpendRow` moins 8px de hauteur — les repères
 * et les soldes se lisent comme les mouvements, pas comme un panneau de KPI.
 */
function FactRow({
  label,
  detail,
  value,
  last = false,
}: {
  label: string;
  detail: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 py-[11px]",
        !last && "border-border border-b",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-text text-[13px] leading-[17px]">{label}</p>
        <p className="text-text-muted mt-[2px] truncate text-[11.5px] leading-[15px]">
          {detail}
        </p>
      </div>
      <AmountFigure
        value={value}
        className="text-text shrink-0 text-[14px] leading-[18px] font-semibold"
      />
    </div>
  );
}

/**
 * Écran 11 · Statistiques.
 *
 * DENSITÉ DESKTOP (re-notation) : « sous la bande de 3 chiffres qui s'arrête à
 * y≈520, toute la moitié basse gauche est vide sur 400 px ». La bande de trois
 * chiffres portait par ailleurs le second reproche — elle « mélange trois
 * natures de chiffres (un cumul de recharges, un solde de carte, un solde de
 * portefeuille) sans hiérarchie ». Les deux se traitent d'un coup, et par
 * SOUSTRACTION d'abord : la bande est supprimée.
 *
 * Ce qu'elle contenait est rendu à sa nature, et le vide est comblé par ce que
 * l'écran savait déjà calculer sans le dire :
 *
 * - REPÈRES DE LA PÉRIODE (colonne A, sous le graphe) — la plus grosse dépense
 *   et sa date, le nombre de jours sans dépense, le total de la MÊME durée
 *   juste avant (une statistique sans point de comparaison ne dit rien), et le
 *   cumul rechargé. Quatre lignes, toutes dérivées de la fenêtre choisie :
 *   changer de période les recalcule, comme le reste de l'écran.
 * - SOLDES ACTUELS (colonne B, en pied) — les deux soldes, isolés du groupe de
 *   la période, sous un titre qui dit ce qu'ils sont, avec la note qui manquait :
 *   ils ne dépendent pas du sélecteur. Un solde et un cumul ne sont plus
 *   alignés dans trois cellules identiques.
 *
 * RYTHME VERTICAL — une échelle, un rôle par pas :
 *   4 / 8   à l'intérieur d'un groupe (libellé → valeur → contexte) ;
 *   12 / 20 entre deux éléments d'un même groupe ;
 *   32      entre deux groupes, et lui seul.
 */
export function StatisticsView() {
  const [period, setPeriod] = useState<Period>(PERIODS[0]);
  const data = useMemo(() => buildPeriod(period), [period]);

  // Les deux derniers indicateurs de `statTiles` sont des SOLDES : ils ne
  // dépendent pas de la période, et c'est précisément ce que l'écran ne disait
  // pas quand ils partageaient une bande avec un cumul.
  const balances = statTiles.slice(2);

  return (
    <>
      <main className="flex-1 px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[1080px] lg:px-10 lg:pt-9 lg:pb-12">
        <PageHeader title="Statistiques" backHref="/" />

        {/* ---- Groupe 1 · période : collé à son titre (16px). ---- */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div
            role="group"
            aria-label="Période"
            className="bg-surface-2 border-border inline-flex rounded-md border p-[3px]"
          >
            {PERIODS.map((p) => {
              const active = p.id === period.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "focus-visible:ring-primary/60 h-8 rounded-sm px-3.5 text-[12.5px] font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                    active
                      ? "bg-primary text-white"
                      : "text-text-secondary hover:text-text",
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <p className="text-text-muted text-[12.5px] leading-[16px]">
            {data.label}
          </p>
        </div>

        {/* Desktop : colonne A = le chiffre, son graphique et ses repères ;
            colonne B = la répartition, les mouvements qui la composent, puis
            les soldes du jour. `contents` préserve le flux mobile à
            l'identique. */}
        <div className="contents lg:mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          <div className="contents lg:block">
            {/* ---- Groupe 2 · combien, et quand ---- */}
            <section className="mt-8 lg:mt-0">
              <SectionLabel>Dépenses sur la période</SectionLabel>
              {/* `AmountFigure` et non la chaîne brute : c'est le seul display
                  de l'écran composé en interlettrage négatif, donc le seul où
                  l'espace de milliers se réduit à presque rien. */}
              <AmountFigure
                value={formatFcfa(data.total)}
                className="text-text mt-1 block text-[32px] leading-[40px] font-bold tracking-[-0.02em]"
              />
              <p className="text-text-secondary mt-1 text-[12.5px] leading-[17px]">
                {data.spending.length} dépenses ·{" "}
                {formatFcfa(data.dailyAverage)} par jour en moyenne
              </p>

              <div className="mt-5">
                <DailySpendChart data={data} />
              </div>
            </section>

            {/* ---- Groupe 3 · les repères de la période ---- */}
            <section className="mt-8">
              <SectionHeader title="Repères de la période" />
              <div className="mt-2">
                {data.biggest ? (
                  <FactRow
                    label="Dépense la plus élevée"
                    detail={`${data.biggest.title} · ${data.biggest.date}`}
                    value={formatFcfa(Math.abs(data.biggest.amount))}
                  />
                ) : null}
                <FactRow
                  label="Jours sans dépense"
                  detail={`sur ${data.days.length} jours de la fenêtre`}
                  value={String(data.days.length - data.spendDays)}
                />
                <FactRow
                  label="Même durée, juste avant"
                  detail={data.previousLabel}
                  value={formatFcfa(data.previousTotal)}
                />
                <FactRow
                  label="Rechargé sur la période"
                  detail={`${data.depositCount} ${
                    data.depositCount > 1 ? "dépôts" : "dépôt"
                  } Mobile Money`}
                  value={formatFcfa(data.deposits)}
                  last
                />
              </div>
            </section>
          </div>

          {/* ---- Colonne B ---- */}
          <div className="contents lg:block">
            {/* ---- Groupe 4a · répartition ---- */}
            <div className="mt-8 lg:mt-0">
              <SectionHeader title="Répartition des dépenses" />
            </div>

            <GlassCard className="mt-3 p-[17px] lg:p-6">
              {data.categories.length === 0 ? (
                <p className="text-text-secondary text-[12.5px] leading-[17px]">
                  Aucune dépense sur cette période.
                </p>
              ) : (
                <>
                  {/* Bande empilée : une part de 2 % y reste un SEGMENT d'un
                      tout, alors qu'isolée sur sa propre piste elle se
                      réduisait à un point qu'on lisait comme un artefact. La
                      bande passe de 10 à 12px de haut : sous cette épaisseur,
                      un segment étroit se lit comme un trait de rendu et non
                      comme un bloc de couleur. */}
                  <div
                    role="img"
                    aria-label={`Répartition : ${data.categories
                      .map((c) => `${c.label} ${c.percent} %`)
                      .join(", ")}.`}
                    className="flex h-3 gap-[2px]"
                  >
                    {data.categories.map((category) => (
                      <span
                        key={category.label}
                        className={cn(
                          "h-full min-w-[6px] rounded-xs",
                          categoryColor(category.label),
                        )}
                        style={{ width: `${category.percent}%` }}
                      />
                    ))}
                  </div>

                  {/* La PART est le sujet d'une répartition : elle est à
                      droite, au poids de la valeur ; le montant est la ligne
                      de contexte, sous le libellé, comme dans toutes les
                      listes du produit. */}
                  <div className="border-border divide-border mt-3.5 divide-y border-t">
                    {data.categories.map((category) => (
                      <div
                        key={category.label}
                        className="flex items-center gap-2.5 py-2.5"
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "size-2.5 shrink-0 rounded-xs",
                            categoryColor(category.label),
                          )}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="text-text block truncate text-[13px] leading-[17px]">
                            {category.label}
                          </span>
                          <span className="text-text-muted mt-[2px] block text-[11.5px] leading-[15px]">
                            {formatFcfa(category.amount)}
                          </span>
                        </span>
                        <span className="text-text shrink-0 text-[15px] leading-[20px] font-semibold">
                          {category.percent} %
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </GlassCard>

            {/* ---- Groupe 4b · les mouvements derrière le total ---- */}
            <div className="mt-8">
              <SectionHeader title="Dépenses de la période" />
              <p className="text-text-muted mt-1 text-[11.5px] leading-[15px]">
                {data.spending.length} mouvements · hors transferts entre vos
                comptes
              </p>
              <div className="mt-2">
                {data.spending.length === 0 ? (
                  <p className="text-text-secondary py-6 text-[12.5px] leading-[17px]">
                    Rien à afficher sur cette période.
                  </p>
                ) : (
                  data.spending.map((movement, index) => (
                    <SpendRow
                      key={movement.id}
                      transaction={movement}
                      last={index === data.spending.length - 1}
                    />
                  ))
                )}
              </div>
            </div>

            {/* ---- Groupe 5 · les soldes, hors période ----
                    Ils étaient la 2e et la 3e cellule d'une bande de KPI dont
                    la 1re était un cumul de recharges : trois natures de
                    chiffres au même corps, dans trois cellules identiques.
                    Ils ont maintenant leur titre, leur libellé de compte et
                    la mention qui les distingue de tout le reste de l'écran —
                    ils ne bougent pas quand la période change. ---- */}
            <div className="mt-8">
              <SectionHeader title="Soldes actuels" />
              <div className="mt-2">
                {balances.map((stat, index) => (
                  <FactRow
                    key={stat.label}
                    label={stat.label}
                    detail={stat.note}
                    value={stat.value}
                    last={index === balances.length - 1}
                  />
                ))}
              </div>
              <p className="text-text-muted mt-2 text-[11.5px] leading-[15px]">
                Soldes du jour : ils ne dépendent pas de la période choisie.
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </>
  );
}
