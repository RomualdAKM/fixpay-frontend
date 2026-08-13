import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { AmountFigure } from "@/components/ui/AmountText";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatusDot } from "@/components/ui/StatusDot";
import { CURRENCY, NBSP, formatDate, formatFcfa } from "@/lib/format";
import { notificationIconMap } from "@/lib/icons";
import {
  notifications,
  wallet,
  type AppNotification,
  type NotificationTone,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const metadata = { title: "Notifications" };

/**
 * Horodatage du dépôt encore en compensation. C'est `MOCK_NOW` : l'écran 21
 * (Succès Dépôt) documente un dépôt reçu à cet instant précis, et
 * `wallet.pending` en porte le montant. La re-notation relève que « le flux
 * contredit le grand livre des écrans 21-25 » ; la moitié du décalage tient à
 * ce que le seul événement d'aujourd'hui n'avait PAS de notification, alors
 * qu'un dépôt en attente est exactement ce qu'une application bancaire
 * notifie. Il est reconstruit ici à partir de la donnée partagée, jamais d'un
 * chiffre réécrit — voir la note de livraison pour son passage dans
 * `mock-data`.
 */
const PENDING_AT = "2026-04-14T16:20:00";

/**
 * Référence de date de l'écran : l'instant du mouvement le plus récent. Les
 * libellés restent donc identiques entre le rendu serveur et le rendu client.
 */
const NOW_REF = PENDING_AT;

/**
 * Le dépôt en cours de compensation — le premier ÉTAT NON TERMINAL du produit.
 * L'audit relevait qu'aucune liste ne montre jamais autre chose que le cas
 * nominal, « alors que le mobile money en génère en permanence ». Il est en
 * tête de liste parce qu'il est le plus récent, et il ne porte pas de signe :
 * l'argent n'est pas encore sur le compte, l'écrire « + » serait faux.
 */
const pendingDeposit: AppNotification = {
  id: "notif-depot-attente",
  icon: "deposit",
  tone: "amber",
  title: "Dépôt en cours",
  at: PENDING_AT,
  body: `${formatFcfa(wallet.pending)} en cours de compensation`,
  description: `${formatFcfa(wallet.pending)} en cours de compensation · ${formatDate(
    PENDING_AT,
    NOW_REF,
  )}`,
  unread: true,
};

/**
 * LE BLOCAGE KYC SORT DE LA LISTE.
 *
 * « Vérification requise · Pièce d'identité à fournir pour continuer » était la
 * seule notification actionnable et la seule sans affordance : ni bouton, ni
 * chevron, ni couleur d'alerte, alignée comme une ligne d'historique passif.
 * Un blocage ne se présente pas comme un reçu — et il ne se présente pas non
 * plus au milieu de reçus, où il défile avec eux. Il est hoisté en bandeau
 * d'action au-dessus du flux, dans la grammaire déjà employée par le Profil
 * pour le même événement : surface teintée, verbe à l'infinitif, chevron.
 */
const KYC_ID = "notif-kyc";

const feed: AppNotification[] = [pendingDeposit, ...notifications]
  .filter((n) => n.id !== KYC_ID)
  .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

const kycNotification = notifications.find((n) => n.id === KYC_ID);

/** Sens du mouvement : dicte le signe, la couleur et rien d'autre. */
type Flow = "in" | "out" | "move" | "pending";

interface NotificationMeta {
  /**
   * Titre normalisé. La taxonomie d'origine mélangeait trois grammaires sur
   * sept lignes et donnait DEUX libellés au même événement. Une seule forme
   * ici : nom + résultat, invariable, un libellé par type d'événement.
   */
  title: string;
  /** Sous-ligne SANS le montant ni la date — les deux ont leur propre place. */
  context: string;
  flow?: Flow;
  /** Écran concerné : une notification bancaire mène toujours quelque part. */
  href?: string;
}

/**
 * Présentation par événement. Le montant n'est PAS redonné ici : il est
 * extrait du `body` de la donnée (voir `amountOf`), pour qu'il n'existe qu'une
 * seule source de chiffres dans le produit.
 */
const META: Record<string, NotificationMeta> = {
  "notif-depot-attente": {
    title: "Dépôt en attente",
    context: "Portefeuille FixPay · crédité dès validation de l'opérateur",
    flow: "pending",
    href: "/wallet",
  },
  "notif-paiement": {
    title: "Paiement débité",
    context: "Amazon · Visa ••••4291",
    flow: "out",
    href: "/cards/visa-4291",
  },
  "notif-recharge-confirmee": {
    title: "Dépôt reçu",
    context: "Portefeuille FixPay",
    flow: "in",
    href: "/wallet",
  },
  "notif-alimentation": {
    title: "Carte alimentée",
    context: "Portefeuille → Visa ••••4291",
    flow: "move",
    href: "/cards/visa-4291",
  },
  "notif-recharge": {
    title: "Dépôt reçu",
    context: "Portefeuille FixPay",
    flow: "in",
    href: "/wallet",
  },
  "notif-retrait": {
    title: "Retrait envoyé",
    context: "Vers Wave",
    flow: "out",
    href: "/wallet",
  },
  "notif-compte": { title: "Compte créé", context: "Bienvenue sur FixPay !" },
};

/** Sens par défaut d'un événement non décrit ci-dessus. */
const DEFAULT_FLOW: Partial<Record<AppNotification["icon"], Flow>> = {
  deposit: "in",
  withdraw: "out",
  card: "out",
};

const FLOW_STYLE: Record<Flow, { sign: string; className: string }> = {
  in: { sign: `+${NBSP}`, className: "text-success" },
  // Un débit n'est pas une alerte : il est en couleur de texte, pas en rouge
  // saturé. Le rouge reste réservé aux états d'erreur.
  out: { sign: `-${NBSP}`, className: "text-text" },
  // Mouvement interne (portefeuille → carte) : aucun signe, l'argent ne
  // quitte pas le compte.
  move: { sign: "", className: "text-text-secondary" },
  // En attente : aucun signe non plus, et l'encre la plus faible des quatre —
  // le montant est annoncé, il n'est pas acquis.
  pending: { sign: "", className: "text-text-muted" },
};

/**
 * Couleur du glyphe, à la place de la tuile teintée. Sept carrés arrondis de
 * 40px empilés pour trois icônes distinctes faisaient un damier ; l'icône nue
 * rend ~22px de largeur au texte.
 */
const TONE_CLASSES: Record<NotificationTone, string> = {
  green: "text-success",
  blue: "text-primary-light",
  amber: "text-warning",
  neutral: "text-icon-muted",
};

/**
 * FILTRES — le compteur promettait une action qui n'existait pas.
 *
 * « 3 non lues » était affiché sans qu'aucun geste ne permette d'agir dessus,
 * et l'écran n'offrait ni onglet ni catégorie. Les quatre filtres ci-dessous
 * sont des LIENS : rendus par le serveur, ils fonctionnent sans JavaScript, ne
 * transforment pas la page en composant client et gardent l'état dans l'URL —
 * une liste de notifications filtrée se partage et se recharge.
 *
 * « Tout marquer comme lu » n'est délibérément PAS ajouté : sans couche de
 * persistance, ce serait un bouton qui ne fait rien, c'est-à-dire le défaut
 * d'origine avec une affordance en plus. Le compteur, lui, mène désormais
 * quelque part — c'est ce qu'un compteur doit faire.
 */
const MONEY_ICONS: string[] = ["deposit", "withdraw", "card"];

const FILTERS = [
  { id: "toutes", label: "Toutes" },
  { id: "non-lues", label: "Non lues" },
  { id: "argent", label: "Argent" },
  { id: "securite", label: "Sécurité" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

function matchesFilter(n: AppNotification, filter: FilterId): boolean {
  if (filter === "non-lues") return n.unread;
  if (filter === "argent") return MONEY_ICONS.includes(n.icon);
  if (filter === "securite") return !MONEY_ICONS.includes(n.icon);
  return true;
}

/**
 * Le montant est LU dans la donnée plutôt que redéclaré : « 39 341 FCFA » ne
 * doit exister qu'à un seul endroit du produit.
 */
const AMOUNT_RE = new RegExp(`([\\d${NBSP}]+)${NBSP}${CURRENCY}`);

function amountOf(body: string): string | undefined {
  return AMOUNT_RE.exec(body)?.[1];
}

/**
 * En-tête de section : libellé à gauche, décompte à droite. Les deux sections
 * portent la MÊME structure.
 */
function SectionHead({
  label,
  meta,
  className,
}: {
  label: string;
  meta: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-3", className)}>
      <SectionLabel>{label}</SectionLabel>
      <span className="text-text-muted shrink-0 text-[11.5px] leading-[15px]">
        {meta}
      </span>
    </div>
  );
}

/**
 * Rangée de notification. Le montant en colonne droite (signé, vert au crédit,
 * encre de texte au débit, atténué en attente), la date en colonne fixe à
 * partir de `lg`, le glyphe aligné sur la première ligne de texte, et la
 * pastille non-lue posée dans la gouttière en position absolue.
 */
function NotificationRow({ notification }: { notification: AppNotification }) {
  const Icon = notificationIconMap[notification.icon];
  const meta = META[notification.id];
  const flow = meta?.flow ?? DEFAULT_FLOW[notification.icon];
  const figure = amountOf(notification.body);
  const date = formatDate(notification.at, NOW_REF);
  const { unread } = notification;

  const content: ReactNode = (
    <>
      {unread && (
        <StatusDot
          size={6}
          colorClass="bg-primary"
          className="absolute top-6 left-[6px]"
        />
      )}
      <Icon
        size={18}
        strokeWidth={2}
        absoluteStrokeWidth
        aria-hidden="true"
        className={cn(
          "mt-[1px] mr-[13px] shrink-0",
          TONE_CLASSES[notification.tone],
        )}
      />
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "text-text block truncate text-[13.5px] leading-[18px]",
            unread ? "font-semibold" : "font-normal",
          )}
        >
          {meta?.title ?? notification.title}
        </span>
        <span className="text-text-muted mt-[3px] block text-[11.5px] leading-[15px]">
          {meta?.context ?? notification.body}
          <span className="lg:hidden">{` · ${date}`}</span>
        </span>
      </span>
      {figure && flow && (
        <AmountFigure
          value={`${FLOW_STYLE[flow].sign}${figure}${NBSP}${CURRENCY}`}
          className={cn(
            "ml-3 shrink-0 text-[13px] leading-[18px] font-semibold",
            FLOW_STYLE[flow].className,
          )}
        />
      )}
      <span className="text-text-muted ml-3 hidden w-[86px] shrink-0 text-right text-[11.5px] leading-[18px] lg:block">
        {date}
      </span>
    </>
  );

  const rowClass = cn(
    "relative -mx-3 flex items-start rounded-md px-3",
    // La hauteur de rangée reste un des signaux lu / non-lu.
    unread ? "py-[18px]" : "py-[13px]",
  );

  if (!meta?.href) {
    return <div className={rowClass}>{content}</div>;
  }

  return (
    <Link
      href={meta.href}
      className={cn(
        rowClass,
        "hover:bg-surface-2 focus-visible:ring-primary/60 transition-colors focus-visible:ring-2 focus-visible:outline-none",
      )}
    >
      {content}
    </Link>
  );
}

function NotificationList({ items }: { items: AppNotification[] }) {
  return (
    <ul className="mt-2">
      {items.map((notification, index) => (
        <li
          key={notification.id}
          className={index > 0 ? "border-border border-t" : undefined}
        >
          <NotificationRow notification={notification} />
        </li>
      ))}
    </ul>
  );
}

/** Réglages d'alerte en vigueur — l'état que le compteur ne disait pas. */
const ALERT_RULES = [
  { label: "Dépôts et retraits", value: "Push et e-mail" },
  { label: "Paiements par carte", value: "Push" },
  { label: "Seuil d'alerte", value: `à partir de ${formatFcfa(1_000)}` },
  { label: "Sécurité et connexions", value: "Push et e-mail" },
];

/**
 * Écran 28 · Notifications — le seul écran du produit à poser ses lignes
 * directement sur le fond, ce que l'audit prend pour modèle : filets internes
 * alignés sur la gouttière de 20px, aucun après la dernière ligne d'une
 * section, aucune carte englobante.
 *
 * ÉTAPE 12 — trois reproches, trois gestes :
 *
 * 1. LE BLOCAGE KYC SORT DU FLUX et devient un bandeau d'action au-dessus des
 *    sections (voir `KYC_ID`). Il n'est plus une ligne d'historique parmi des
 *    reçus, et il porte enfin un verbe.
 * 2. LES FILTRES EXISTENT (voir `FILTERS`), en liens serveur : le compteur
 *    « non lues » mène quelque part, et l'écran répond à « tout / transactions
 *    / sécurité » sans devenir un composant client.
 * 3. LA DENSITÉ DESKTOP est comblée par la seule information que cet écran
 *    puisse ajouter sans se répéter : les RÈGLES D'ALERTE en vigueur, qui
 *    expliquent pourquoi ces événements-là ont produit une notification. Le
 *    lien « Gérer mes alertes », qui flottait seul sous un filet orphelin,
 *    devient l'action de cette section — il n'est plus un vestige, il a une
 *    section à ouvrir.
 *
 * CE QUI RESTE (assumé) : le flux ne montre toujours pas les mouvements des
 * écrans 22 et 24, qui n'existent dans aucune source partagée — ils sont
 * écrits en dur dans les écrans de confirmation eux-mêmes, hors de ce lot. Ce
 * qui pouvait être réconcilié depuis ici l'a été (`wallet.pending`, ci-dessus).
 * Le correctif durable est un journal d'événements unique dont les écrans 21-25
 * et 28 seraient deux vues — voir la note de livraison.
 */
export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filtre?: string }>;
}) {
  const { filtre } = await searchParams;
  const active: FilterId = FILTERS.find((f) => f.id === filtre)?.id ?? "toutes";

  const visible = feed.filter((n) => matchesFilter(n, active));
  const unread = visible.filter((n) => n.unread);
  const read = visible.filter((n) => !n.unread);

  return (
    <>
      <main className="px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[860px] lg:px-10 lg:pt-9 lg:pb-12">
        <PageHeader title="Notifications" backHref="/" />

        {/* ---- Le blocage, hors flux ---- */}
        {kycNotification ? (
          <Link
            href="/profile/kyc"
            className="bg-warning-surface border-warning-border hover:bg-warning-tint focus-visible:ring-primary/60 mt-5 flex items-center gap-3 rounded-lg border px-4 py-3.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <span className="min-w-0 flex-1">
              <span className="text-text block text-[13.5px] leading-[18px] font-semibold">
                Vérification requise
              </span>
              <span className="text-text-secondary mt-[3px] block text-[11.5px] leading-[16px]">
                Pièce d&apos;identité à fournir pour conserver vos plafonds
                actuels · {formatDate(kycNotification.at, NOW_REF)}
              </span>
            </span>
            <span className="text-warning inline-flex shrink-0 items-center gap-0.5 text-[12.5px] font-semibold">
              Vérifier
              <ChevronRight
                size={14}
                strokeWidth={2}
                absoluteStrokeWidth
                aria-hidden="true"
              />
            </span>
          </Link>
        ) : null}

        {/* ---- Filtres ---- */}
        <nav
          aria-label="Filtrer les notifications"
          className="mt-5 flex flex-wrap gap-2"
        >
          {FILTERS.map((filter) => {
            const count = feed.filter((n) =>
              matchesFilter(n, filter.id),
            ).length;
            const on = filter.id === active;
            return (
              <Link
                key={filter.id}
                href={
                  filter.id === "toutes"
                    ? "/notifications"
                    : `/notifications?filtre=${filter.id}`
                }
                aria-current={on ? "true" : undefined}
                className={cn(
                  "focus-visible:ring-primary/60 inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  on
                    ? "bg-primary border-primary text-white"
                    : "border-border text-text-secondary hover:bg-surface-2 hover:text-text",
                )}
              >
                {filter.label}
                <span className={on ? "text-white/70" : "text-text-muted"}>
                  {count}
                </span>
              </Link>
            );
          })}
        </nav>

        {visible.length === 0 ? (
          <p className="text-text-secondary border-border mt-6 border-t py-10 text-[13px] leading-[19px]">
            Aucune notification dans ce filtre.
          </p>
        ) : (
          <>
            {unread.length > 0 && (
              <>
                <SectionHead
                  label="Nouvelles"
                  meta={`${unread.length} non lues`}
                  className="mt-6"
                />
                <NotificationList items={unread} />
              </>
            )}

            {read.length > 0 && (
              <>
                <SectionHead
                  label="Précédentes"
                  meta={`${read.length} déjà lues`}
                  className={unread.length > 0 ? "mt-8" : "mt-6"}
                />
                <NotificationList items={read} />
              </>
            )}
          </>
        )}

        {/* ---- Pourquoi ces alertes ----
                Le filet de pied portait un lien seul, sans rien pour le
                justifier. Il coiffe maintenant les règles en vigueur : la
                seule chose qu'un écran de notifications puisse ajouter sans
                répéter son propre flux. ---- */}
        <section className="border-border mt-8 border-t pt-5">
          <SectionHeader
            title="Vos règles d'alerte"
            actionLabel="Gérer mes alertes"
            actionHref="/profile/notifications"
          />
          <div className="mt-2">
            {ALERT_RULES.map((rule, index) => (
              <div
                key={rule.label}
                className={cn(
                  "flex items-baseline justify-between gap-4 py-[11px]",
                  index < ALERT_RULES.length - 1 && "border-border border-b",
                )}
              >
                <p className="text-text min-w-0 text-[13px] leading-[17px]">
                  {rule.label}
                </p>
                <p className="text-text-secondary shrink-0 text-[12.5px] leading-[17px]">
                  {rule.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </>
  );
}
