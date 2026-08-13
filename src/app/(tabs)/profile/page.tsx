import Link from "next/link";
import type { ReactNode } from "react";
import {
  BadgeCheck,
  Bell,
  ChevronRight,
  Gift,
  LifeBuoy,
  Lock,
  Plus,
  Star,
  User,
  type LucideIcon,
} from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { CardRow, CardRowList } from "@/components/ui/CardRow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatFcfa } from "@/lib/format";
import { cards, loyalty, referral, user, wallet } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const metadata = { title: "Profil" };

/** Ancienneté du compte — donnée d'identité, absente de `mock-data`. */
const MEMBER_SINCE = "mars 2024";

/**
 * Relevés du compte. Ce sont des ENREGISTREMENTS, pas des destinations : ils
 * n'ont ni chevron ni surface cliquable tant qu'aucune route ne les sert. Une
 * ligne qui ne mène nulle part ne porte pas l'affordance de celles qui mènent
 * quelque part — c'est le reproche fait à la ligne WhatsApp de l'écran 26,
 * appliqué ici à l'envers.
 */
const STATEMENTS = [
  { label: "Relevé de compte · avril 2026", state: "En cours" },
  { label: "Relevé de compte · mars 2026", state: "PDF" },
  { label: "Attestation de compte", state: "PDF" },
];

/**
 * Glyphe de tête d'une entrée de menu : l'icône NUE, jamais une tuile teintée.
 * La reco [G] demandait « l'icône nue ou rien » ; la colonne de six carrés
 * bleus identiques ne portait aucune information, seul le glyphe en porte.
 * La gouttière, elle, est conservée : les titres restent alignés.
 */
function MenuGlyph({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <Icon
      size={18}
      strokeWidth={1.5}
      absoluteStrokeWidth
      aria-hidden="true"
      className="text-icon-muted w-[22px] shrink-0"
    />
  );
}

/**
 * Cadre de liste du Profil : une paire de filets pour le groupe, un filet
 * entre les rangées, AUCUNE surface. C'est exactement `CardRowList`, dont les
 * listes de l'Accueil et du Portefeuille tirent leur cadre — repris ici à la
 * main parce que les rangées ne sont pas des cartes.
 */
function MenuList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("border-border divide-border divide-y border-y", className)}
    >
      {children}
    </div>
  );
}

/**
 * Rangée de menu, posée À MÊME LA PAGE.
 *
 * Le sous-titre est passé À DROITE, en méta : « Code FP-JD2024 » et
 * « 240 points » sont des VALEURS d'un réglage, pas la description d'une
 * destination. Sur deux lignes ils imposaient 65px de haut pour dire 12
 * caractères ; en colonne droite la rangée tombe à 52px et le bloc gagne la
 * densité que la re-notation réclame — sans rien retirer.
 */
function MenuRow({
  icon,
  title,
  meta,
  href,
}: {
  icon: LucideIcon;
  title: string;
  meta?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="focus-visible:ring-primary/60 flex h-[52px] items-center gap-[13px] transition-opacity focus-visible:ring-2 focus-visible:outline-none lg:hover:opacity-80"
    >
      <MenuGlyph icon={icon} />
      <span className="text-text min-w-0 flex-1 truncate text-[13.5px] font-medium">
        {title}
      </span>
      {meta ? (
        <span className="text-text-muted shrink-0 text-[12px] leading-[16px]">
          {meta}
        </span>
      ) : null}
      <ChevronRight
        size={16}
        strokeWidth={2}
        absoluteStrokeWidth
        aria-hidden="true"
        className="text-icon-muted -mr-[4px] shrink-0"
      />
    </Link>
  );
}

/**
 * Écran 19 · Profil.
 *
 * ÉTAPE 12 · L'ÉCRAN CESSE D'AVOIR SON PROPRE VOCABULAIRE. Quatre reproches de
 * la re-notation portaient tous sur la même faute — Profil composait à sa façon
 * ce que ses écrans frères composent déjà :
 *
 * 1. « Troisième représentation du même objet carte dans le même lot : ligne
 *    monospace nue sur Accueil, ligne monospace nue sur Portefeuille, vignette
 *    dégradée dans un conteneur carte ici. » Corrigé à la racine : l'écran
 *    utilise `CardRow` / `CardRowList`, le composant partagé par 02 et 03. Il
 *    n'y a plus qu'UN modèle de rangée de carte dans le produit, et Profil ne
 *    dessine plus le sien. La vignette Mastercard à dégradé bordeaux — « logo
 *    réduit à un seul cercle orange », un rendu à 25 % d'un composant conçu
 *    pour 348px — disparaît avec elle, ainsi que le carré en tirets d'« Ajouter
 *    une carte », qui était une vignette de carte sans carte.
 *
 * 2. « En mobile, tout est mis en carte (Mes cartes, Avantages, Compte) alors
 *    qu'Accueil et Portefeuille utilisent des filets pleine largeur pour des
 *    listes équivalentes. » Les trois `ListGroup` sont remplacés par des listes
 *    à filets. Il ne reste aucune surface sur l'écran, hors la bannière KYC —
 *    qui en est une parce qu'elle est un ÉTAT à traiter, pas une liste.
 *
 * 3. « L'en-tête mobile perd la cloche de notifications présente sur Accueil et
 *    Portefeuille, sans raison fonctionnelle. » Elle est rétablie, avec sa
 *    pastille : trois notifications non lues attendent, et Profil est le
 *    troisième onglet racine — un élément persistant ne s'absente pas d'un
 *    onglet sur trois.
 *
 * 4. « Membre depuis mars 2024 · 24 transactions flotte à ~55 px sous l'email
 *    en mobile, serré à 8 px en desktop. » La ligne de contexte est calée une
 *    fois pour toutes (10px, sur la colonne de texte), identique aux deux
 *    largeurs : le rythme vertical est le même objet d'un breakpoint à l'autre.
 *
 * DENSITÉ DESKTOP — deux blocs ajoutés, tous deux propres au Profil et absents
 * partout ailleurs :
 * - PALIER ET PLAFONDS (colonne A) : ce que la bannière KYC ne dit pas, c'est
 *   à quoi sert la vérification. Les trois lignes lisent `wallet.monthlyLimit`
 *   et `cards[].monthlyLimit` — donc les mêmes nombres que les écrans 02, 03 et
 *   10 — et lèvent au passage le doute relevé sur l'écran 28 (un blocage KYC
 *   coexistant avec 1,8 M FCFA de solde : c'est un palier, il est nommé).
 * - DOCUMENTS ET RELEVÉS (colonne B) : le seul endroit du produit où un relevé
 *   de compte a sa place. Aucune jauge, aucun chiffre repris d'un autre écran.
 */
export default function ProfilePage() {
  const cardLimit = cards[0]?.monthlyLimit ?? 0;

  return (
    <>
      <main className="flex-1 px-5 pt-[52px] pb-24 lg:mx-auto lg:w-full lg:max-w-[1080px] lg:px-10 lg:pt-9 lg:pb-12">
        {/* La cloche est RÉTABLIE (`showBell` par défaut) : l'en-tête mobile la
            perdait alors qu'Accueil et Portefeuille la portent, sur un élément
            persistant et sans raison fonctionnelle. Elle prend sa pastille,
            comme sur l'Accueil : trois notifications non lues attendent.

            Le contournement `lg:[&>header>div:last-child]:hidden` qui masquait
            la grappe de commandes en desktop a été retiré : il visait la
            deuxième bascule de thème, or `AppHeader` porte déjà `lg:hidden` sur
            la sienne depuis la refonte du composant. Maintenu, il aurait
            emporté la cloche avec lui sur ≥lg — le défaut d'origine, inversé. */}
        <AppHeader title="Profil" bellDot desktopTitle="Profil" />

        {/* Desktop : deux colonnes (identité + KYC + cartes + plafonds |
            avantages + compte + relevés), et un pied de page qui traverse les
            DEUX colonnes. `contents` garde le flux mobile strictement
            identique.

            RYTHME VERTICAL — trois valeurs, trois rôles, et rien entre :
              12  en-tête de section → liste qu'il coiffe ;
              20  identité → son état de vérification (un même sujet) ;
              32  entre deux sections ;
              40  avant le filet de pied de page. */}
        <div className="contents lg:mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* ---- Colonne A ---- */}
          <div className="contents lg:block">
            {/* ---- Identité : aucune surface, l'échelle typographique suffit.
                    L'avatar est un aplat `bg-primary` (convention du produit,
                    cf. avatar de chat) : il se détache dans les deux thèmes. */}
            <section className="mt-6 lg:mt-0">
              <div className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="bg-primary flex size-[58px] shrink-0 items-center justify-center rounded-full text-[21px] leading-none font-bold text-white"
                >
                  {user.initial}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-text truncate text-[20px] leading-[26px] font-bold">
                    {user.name}
                  </h2>
                  <p className="text-text-muted mt-[3px] truncate text-[12.5px] leading-[17px]">
                    {user.email}
                  </p>
                </div>
                {/* La seule action possible sur l'identité — elle manquait. */}
                <Link
                  href="/profile/settings"
                  className="border-border bg-surface text-text-secondary hover:bg-surface-2 hover:text-text focus-visible:ring-primary/60 inline-flex h-9 shrink-0 items-center rounded-md border px-3.5 text-[12.5px] font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  Modifier
                </Link>
              </div>
              {/* Ligne de contexte de l'identité. Calée sur le bloc de texte
                  (58px d'avatar + 16px de gouttière) et non sur le bord de
                  page : elle prolonge le nom, elle ne commence pas une
                  nouvelle colonne. Même valeur aux deux breakpoints. */}
              <p className="text-text-muted mt-2.5 ml-[74px] text-[11.5px] leading-[15px]">
                Membre depuis {MEMBER_SINCE} · {user.stats.transactions}{" "}
                transactions
              </p>
            </section>

            {/* ---- Bannière KYC : seul état de vérification de l'écran, et
                    seule surface de la page — parce qu'elle est un état à
                    traiter, pas une liste. ---- */}
            <Link
              href="/profile/kyc"
              className="bg-primary-surface border-primary-border hover:bg-primary-tint focus-visible:ring-primary/60 mt-5 flex h-16 items-center gap-3 rounded-lg border px-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <BadgeCheck
                size={18}
                strokeWidth={1.5}
                absoluteStrokeWidth
                className="text-primary shrink-0"
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="text-text block truncate text-[13px] leading-[16.9px] font-semibold">
                  Vérification KYC en cours
                </span>
                <span className="text-text-muted mt-[2px] block truncate text-[11.5px] leading-[15px]">
                  Étape 2 sur 3 · pièce d&apos;identité
                </span>
              </span>
              <span className="text-primary inline-flex shrink-0 items-center gap-0.5 text-[12.5px] font-semibold">
                Continuer
                <ChevronRight
                  size={14}
                  strokeWidth={2}
                  absoluteStrokeWidth
                  aria-hidden="true"
                />
              </span>
            </Link>

            {/* ---- Mes cartes : LE composant partagé, celui de 02 et 03 ---- */}
            <div className="mt-8">
              <SectionHeader title="Mes cartes" />
            </div>
            <CardRowList className="mt-2">
              {cards.map((card) => (
                <CardRow key={card.id} card={card} />
              ))}
              {/* Même cadre, même filet, même chevron que les rangées de carte :
                  l'ajout est une entrée de la liste, pas un objet d'un autre
                  genre posé dessous. */}
              <Link
                href="/cards/new"
                className="focus-visible:ring-primary/60 flex h-[52px] items-center gap-[13px] transition-opacity focus-visible:ring-2 focus-visible:outline-none lg:hover:opacity-80"
              >
                <Plus
                  size={18}
                  strokeWidth={1.5}
                  absoluteStrokeWidth
                  aria-hidden="true"
                  className="text-primary w-[22px] shrink-0"
                />
                <span className="text-primary min-w-0 flex-1 truncate text-[13.5px] font-medium">
                  Ajouter une carte
                </span>
                <span className="text-text-muted shrink-0 text-[12px] leading-[16px]">
                  {formatFcfa(3_000)}
                </span>
                <ChevronRight
                  size={16}
                  strokeWidth={2}
                  absoluteStrokeWidth
                  aria-hidden="true"
                  className="text-icon-muted -mr-[4px] shrink-0"
                />
              </Link>
            </CardRowList>

            {/* ---- Palier et plafonds ----
                    La bannière KYC dit qu'une vérification est en cours ; elle
                    ne dit pas ce qu'elle change. Ces trois lignes le disent, et
                    elles expliquent au passage comment un compte non vérifié
                    peut porter 1,8 M FCFA : c'est un palier, pas un oubli. ---- */}
            <section className="mt-8">
              <SectionHeader title="Palier et plafonds" />
              <MenuList className="mt-2">
                <div className="flex items-baseline justify-between gap-4 py-[11px]">
                  <p className="text-text min-w-0 text-[13px] leading-[17px]">
                    Mouvements du portefeuille
                  </p>
                  <p className="text-text shrink-0 text-[13px] leading-[17px] font-semibold">
                    {formatFcfa(wallet.monthlyLimit)}
                    <span className="text-text-muted font-normal"> / mois</span>
                  </p>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-[11px]">
                  <p className="text-text min-w-0 text-[13px] leading-[17px]">
                    Paiements par carte
                  </p>
                  <p className="text-text shrink-0 text-[13px] leading-[17px] font-semibold">
                    {formatFcfa(cardLimit)}
                    <span className="text-text-muted font-normal">
                      {" "}
                      / carte / mois
                    </span>
                  </p>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-[11px]">
                  <p className="text-text min-w-0 text-[13px] leading-[17px]">
                    Virement vers un compte bancaire
                  </p>
                  <p className="text-text-muted shrink-0 text-[13px] leading-[17px]">
                    après vérification
                  </p>
                </div>
              </MenuList>
              <p className="text-text-muted mt-2 text-[11.5px] leading-[15px]">
                Palier 1. La vérification d&apos;identité en cours lève ces
                plafonds et ouvre le virement bancaire.
              </p>
            </section>
          </div>

          {/* ---- Colonne B ---- */}
          <div className="contents lg:block">
            {/* ---- Avantages : la valeur du réglage passe à droite ---- */}
            <div className="mt-8 lg:mt-0">
              <SectionHeader title="Avantages" />
            </div>
            <MenuList className="mt-2">
              <MenuRow
                icon={Gift}
                title="Parrainage"
                meta={referral.code}
                href="/profile/referral"
              />
              <MenuRow
                icon={Star}
                title="Fidélité"
                meta={`${loyalty.points} points`}
                href="/profile/loyalty"
              />
            </MenuList>

            {/* ---- Compte ---- */}
            <div className="mt-8">
              <SectionHeader title="Compte" />
            </div>
            <MenuList className="mt-2">
              <MenuRow
                icon={User}
                title="Informations personnelles"
                href="/profile/settings"
              />
              <MenuRow
                icon={Lock}
                title="Sécurité et confidentialité"
                href="/profile/privacy"
              />
              <MenuRow
                icon={Bell}
                title="Notifications"
                href="/profile/notifications"
              />
              <MenuRow
                icon={LifeBuoy}
                title="Aide et support"
                href="/support"
              />
            </MenuList>

            {/* ---- Documents et relevés ---- */}
            <div className="mt-8">
              <SectionHeader title="Documents et relevés" />
            </div>
            <MenuList className="mt-2">
              {STATEMENTS.map((statement) => (
                <div
                  key={statement.label}
                  className="flex h-[46px] items-center justify-between gap-4"
                >
                  <p className="text-text min-w-0 truncate text-[13px] leading-[17px]">
                    {statement.label}
                  </p>
                  <p className="text-text-muted shrink-0 text-[12px] leading-[16px]">
                    {statement.state}
                  </p>
                </div>
              ))}
            </MenuList>
            <p className="text-text-muted mt-2 text-[11.5px] leading-[15px]">
              Générés le 1er de chaque mois et conservés 5 ans, comme vos pièces
              justificatives.
            </p>
          </div>

          {/* ---- Pied de page ----
              « Se déconnecter » était un lien texte rouge nu, seul élément
              rouge de la page, centré entre deux colonnes qui s'arrêtent à des
              hauteurs différentes. Il est posé sur un FILET qui traverse les
              deux colonnes — c'est ce filet qui ferme la page, et le bouton y
              est accroché, à gauche, sur l'axe de tout le reste du contenu. ---- */}
          <div className="border-border mt-10 border-t pt-5 lg:col-span-2 lg:mt-12 lg:flex lg:items-center lg:justify-between lg:gap-6">
            <Link
              href="/onboarding"
              className="border-border text-danger hover:border-danger focus-visible:ring-primary/60 inline-flex h-10 items-center rounded-md border px-4 text-[13.5px] font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              Se déconnecter
            </Link>
            <p className="text-text-muted mt-3 text-[11px] leading-[15px] lg:mt-0">
              CGU · Confidentialité · v1.4.2
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </>
  );
}
