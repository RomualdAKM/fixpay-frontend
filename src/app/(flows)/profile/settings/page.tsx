"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTheme } from "@/components/theme/ThemeProvider";
import { SettingsToggleRow } from "@/components/ui/SettingsToggleRow";
import { formatFcfa } from "@/lib/format";
import { settingsOptions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * Options des selects. La devise d'affichage suit celle du compte : proposer
 * l'euro en premier dans une application qui compte en FCFA était la trace la
 * plus nette du gabarit de fintech européenne (audit, écran 16).
 */
const LANGUE_OPTIONS: string[] = ["Français", "English"];
const DEVISE_OPTIONS: string[] = [
  "XOF — Franc CFA",
  "EUR — Euro",
  "USD — Dollar",
];
const THEME_OPTIONS: string[] = ["Sombre", "Clair"];

/** Plafond au-delà duquel le code PIN est exigé. */
const PIN_THRESHOLD = 50_000;

/**
 * En-tête de section : titre + ce que la section permet réellement.
 *
 * Le titre est un vrai en-tête (15px semi-bold sur --c-text, 16px à lg). En
 * SectionLabel (13px / w500 / text-secondary) il était le MÊME objet
 * typographique que le libellé de champ posé 20px plus bas : rien ne disait
 * que « Langue » était subordonné à « Préférences ». Les deux rôles fusionnés
 * par la refonte sont ici de nouveau distincts — sans réintroduire le
 * micro-label capitales.
 *
 * `trailing` accueille un accusé de prise en compte. Il était auparavant un
 * bloc de 32px INSÉRÉ entre le dernier réglage et la section suivante, ce qui
 * portait cet inter-groupe à ~123px quand les autres faisaient ~68px : le
 * rythme de l'écran dépendait de la présence ou non d'un accusé.
 */
function SettingsSection({
  title,
  help,
  trailing,
  className,
}: {
  title: string;
  help?: string;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex min-h-[21px] items-baseline justify-between gap-3">
        <h2 className="text-text text-[15px] leading-[20px] font-semibold lg:text-[16px] lg:leading-[21px]">
          {title}
        </h2>
        {trailing}
      </div>
      {help && (
        <p className="text-text-muted mt-1 text-[12.5px] leading-[18px]">
          {help}
        </p>
      )}
    </div>
  );
}

/**
 * Ligne de réglage : libellé à gauche, valeur à droite, chevron si la ligne
 * mène quelque part, bouton bordé si elle porte une action locale. C'est le
 * motif que l'audit oppose aux boîtes de formulaire empilées — il divise la
 * hauteur par deux et supprime une surface.
 *
 * LE FILET EST PORTÉ PAR UN CONTENEUR, jamais par la ligne interactive. Posé
 * sur le <Link>, qui est arrondi pour son anneau de focus, le `border-b`
 * épousait le rayon et se RECOURBAIT VERS LE HAUT à ses deux extrémités : la
 * section « Compte » séparait donc ses lignes avec un objet différent de celui
 * de « Préférences », à 120px d'intervalle, sur le même écran.
 */
function SettingsRow({
  title,
  value,
  href,
  action,
  onAction,
  divider = false,
}: {
  title: string;
  value: string;
  href?: string;
  action?: string;
  onAction?: () => void;
  divider?: boolean;
}) {
  const rowClass =
    "flex h-[58px] w-full items-center justify-between gap-4 text-left";
  const dividerClass = divider ? "border-border border-b" : undefined;

  const body = (
    <>
      <span className="text-text text-[14px] font-medium">{title}</span>
      <span className="flex min-w-0 items-center gap-2">
        <span className="text-text-muted truncate text-[13px]">{value}</span>
        {href && (
          <ChevronRight
            size={16}
            strokeWidth={2}
            absoluteStrokeWidth
            aria-hidden="true"
            className="text-icon-muted shrink-0"
          />
        )}
      </span>
    </>
  );

  if (href) {
    return (
      <div className={dividerClass}>
        <Link
          href={href}
          className={cn(
            rowClass,
            "focus-visible:ring-primary/60 rounded-sm focus-visible:ring-2 focus-visible:outline-none",
          )}
        >
          {body}
        </Link>
      </div>
    );
  }

  if (action) {
    return (
      <div className={cn(rowClass, dividerClass)}>
        <span className="min-w-0">
          <span className="text-text block text-[14px] font-medium">
            {title}
          </span>
          <span className="text-text-muted mt-[2px] block truncate text-[12px] leading-[16px]">
            {value}
          </span>
        </span>
        <button
          type="button"
          onClick={onAction}
          className="border-border bg-surface text-text-secondary hover:bg-surface-2 hover:text-text focus-visible:ring-primary/60 inline-flex h-8 shrink-0 items-center rounded-sm border px-3 text-[12px] font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          {action}
        </button>
      </div>
    );
  }

  return <div className={cn(rowClass, dividerClass)}>{body}</div>;
}

/**
 * Réglage à choix : MÊME ligne valeur-à-droite que le reste de l'écran, la
 * valeur étant portée par un `select` natif.
 *
 * Remplace les trois champs de formulaire de 48px : l'écran faisait cohabiter
 * deux motifs concurrents pour une même nature de réglage, et ces trois boîtes
 * étaient les seules à porter un chevron bleu sur un glyphe purement
 * fonctionnel.
 */
function SettingsSelectRow({
  title,
  value,
  options,
  onChange,
  divider = false,
}: {
  title: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  divider?: boolean;
}) {
  const id = useId();

  return (
    <div
      className={cn(
        "flex h-[58px] items-center justify-between gap-4",
        divider && "border-border border-b",
      )}
    >
      <label htmlFor={id} className="text-text text-[14px] font-medium">
        {title}
      </label>
      <div className="relative flex min-w-0 items-center">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="text-text focus-visible:ring-primary/60 w-full appearance-none truncate rounded-sm bg-transparent pr-5 text-right text-[13px] font-medium hover:cursor-pointer focus-visible:ring-2 focus-visible:outline-none"
        >
          {options.map((option) => (
            <option key={option} value={option} className="bg-bg text-text">
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          aria-hidden="true"
          className="text-icon-muted pointer-events-none absolute top-1/2 right-0 -translate-y-1/2"
        />
      </div>
    </div>
  );
}

/** Repère d'état : ce qui s'affiche mais ne se règle pas depuis cet écran. */
function StateFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-text-muted text-[12px] leading-[16px]">{label}</dt>
      <dd className="text-text mt-[2px] text-[13px] leading-[18px] font-medium">
        {value}
      </dd>
    </div>
  );
}

/**
 * Écran 16 · Paramètres — préférences appliquées à la volée, compte,
 * sécurité, comptes Mobile Money liés, à propos et déconnexion.
 *
 * Recomposition post-audit : le CTA « Sauvegarder » pleine largeur est
 * remplacé par une application immédiate assortie d'un accusé discret, un seul
 * motif de réglage pour tout l'écran, une hiérarchie section > ligne rétablie.
 *
 * ÉTAPE 11 (composition) :
 * - RYTHME. Une seule échelle, la même que sur 14 et 15 : filet entre deux
 *   lignes d'un groupe, 16px entre l'en-tête et sa première ligne, 48px entre
 *   deux groupes. Les inter-groupes mesurés à ~123px puis ~68px sur le même
 *   écran venaient d'un accusé de sauvegarde inséré dans l'un des deux ; il
 *   est remonté sur la ligne d'en-tête et ne déplace plus rien ;
 * - SÉPARATEURS. Une seule morphologie (voir `SettingsRow`) ;
 * - COLONNES DESKTOP. Elles finissaient à y≈560 et y≈790 sur 900. La sécurité
 *   remonte à gauche sous les préférences, le compte, les opérateurs liés et
 *   « À propos » forment la colonne de droite : les deux pieds de colonne
 *   tombent désormais à ~50px l'un de l'autre. L'ordre de lecture mobile en
 *   sort meilleur (Préférences → Sécurité → Compte), et la colonne passe de
 *   860 à 920px, ce qui ramène la bande morte sidebar/contenu de ~200 à
 *   ~170px ;
 * - DÉCONNEXION. Elle sort de la grille. Un bouton pleine largeur posé dans la
 *   SEULE colonne de droite n'est centré sur rien à l'échelle de la page :
 *   l'action terminale de l'écran est maintenant sous les deux colonnes, sur
 *   l'axe du contenu, et bornée en largeur comme tous les CTA du produit.
 */
export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [langue, setLangue] = useState(settingsOptions.langue);
  const [devise, setDevise] = useState(settingsOptions.devise);
  const [biometrics, setBiometrics] = useState(true);
  const [waveLinked, setWaveLinked] = useState(true);
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (savedTimer.current !== null) window.clearTimeout(savedTimer.current);
    },
    [],
  );

  /** Accusé de prise en compte — les réglages n'ont plus de bouton d'envoi. */
  const acknowledge = () => {
    setSaved(true);
    if (savedTimer.current !== null) window.clearTimeout(savedTimer.current);
    savedTimer.current = window.setTimeout(() => setSaved(false), 1600);
  };

  const savedFlag = (
    <span
      aria-live="polite"
      className={cn(
        "text-success inline-flex shrink-0 items-center gap-1.5 text-[12.5px] leading-[16px] transition-opacity",
        saved ? "opacity-100" : "opacity-0",
      )}
    >
      <Check size={13} strokeWidth={2.5} aria-hidden="true" />
      {saved ? "Enregistré" : ""}
    </span>
  );

  return (
    <>
      <main className="px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[920px] lg:px-10 lg:pt-9 lg:pb-12">
        <PageHeader title="Paramètres" backHref="/profile" />

        <div className="mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10">
          {/* ---- Colonne gauche : ce qui règle l'application et son accès ---- */}
          <div>
            <SettingsSection
              title="Préférences"
              help="Appliquées immédiatement sur cet appareil, sans validation."
              trailing={savedFlag}
            />
            <div className="mt-4">
              <SettingsSelectRow
                title="Langue"
                value={langue}
                options={LANGUE_OPTIONS}
                onChange={(value) => {
                  setLangue(value);
                  acknowledge();
                }}
                divider
              />
              <SettingsSelectRow
                title="Devise d'affichage"
                value={devise}
                options={DEVISE_OPTIONS}
                onChange={(value) => {
                  setDevise(value);
                  acknowledge();
                }}
                divider
              />
              <SettingsSelectRow
                title="Thème"
                value={theme === "light" ? "Clair" : "Sombre"}
                options={THEME_OPTIONS}
                onChange={(value) => {
                  setTheme(value === "Clair" ? "light" : "dark");
                  acknowledge();
                }}
              />
            </div>

            <SettingsSection
              className="mt-12"
              title="Sécurité"
              help={`Le code PIN est demandé à chaque paiement de plus de ${formatFcfa(PIN_THRESHOLD)}.`}
            />
            {/* État de la sécurité : ces deux valeurs s'AFFICHENT, elles ne se
                règlent pas depuis cet écran. Présentées en lignes tappables
                sans destination, elles étaient deux affordances mortes ; en
                repères d'état, elles disent ce qu'elles sont, et la ligne
                d'action juste dessous mène là où la modification se fait. */}
            <dl className="border-border mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-b pb-4">
              <StateFact label="Code PIN" value="Modifié le 12 mars" />
              <StateFact label="Double authentification" value="Par SMS" />
            </dl>
            <div>
              <SettingsRow
                title="Modifier mes codes"
                value="Assistance"
                href="/support"
                divider
              />
              <SettingsToggleRow
                title="Déverrouillage biométrique"
                subtitle="Ouvrir FixPay avec l'empreinte de cet appareil"
                checked={biometrics}
                onChange={(value) => {
                  setBiometrics(value);
                  acknowledge();
                }}
              />
            </div>
          </div>

          {/* ---- Colonne droite : ce qui décrit le compte ---- */}
          <div className="mt-12 lg:mt-0">
            <SettingsSection title="Compte" />
            <div className="mt-4">
              <SettingsRow
                title="Vérification d'identité"
                value="1 étape sur 3"
                href="/profile/kyc"
                divider
              />
              <SettingsRow
                title="Notifications"
                value="Push, e-mail"
                href="/profile/notifications"
                divider
              />
              <SettingsRow
                title="Confidentialité"
                value="2 consentements"
                href="/profile/privacy"
              />
            </div>

            <SettingsSection
              className="mt-12"
              title="Comptes Mobile Money"
              help="Un compte est lié lors de votre premier dépôt depuis cet opérateur."
            />
            <div className="mt-4">
              {waveLinked ? (
                /* Le compte lié porte enfin la seule action qui le concerne :
                   le délier. Il n'affichait qu'un numéro masqué inerte. */
                <SettingsRow
                  title="Wave"
                  value="+225 07 •• •• 41"
                  action="Délier"
                  onAction={() => {
                    setWaveLinked(false);
                    acknowledge();
                  }}
                  divider
                />
              ) : (
                <p className="text-text-muted border-border border-b py-4 text-[12.5px] leading-[18px]">
                  Aucun compte Mobile Money n&apos;est lié.
                </p>
              )}
              <SettingsRow
                title="Ajouter un opérateur"
                value="Orange Money, MTN"
                href="/wallet/deposit"
              />
            </div>

            <SettingsSection className="mt-12" title="À propos" />
            <div className="mt-4">
              <SettingsRow
                title="Version de l'application"
                value="1.4.0 (812)"
                divider
              />
              <SettingsRow
                title="Aide et documents légaux"
                value="Support"
                href="/support"
              />
            </div>
          </div>
        </div>

        {/* Déconnexion : hors grille, sur l'axe du contenu, bornée comme un CTA
            — danger discret, en bas, jamais en aplat de marque. Invalide la
            session (POST /api/logout) et vide le cache avant de rejoindre le
            login. */}
        <LogoutButton className="mt-12 lg:mx-auto lg:max-w-[320px]" />
      </main>

      <BottomNav />
    </>
  );
}
