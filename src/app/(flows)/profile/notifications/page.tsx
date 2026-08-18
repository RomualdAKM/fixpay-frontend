"use client";

import { useState } from "react";
import { ChevronDown, Lock } from "lucide-react";

import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { SettingsToggleRow } from "@/components/ui/SettingsToggleRow";
import { useAuth } from "@/lib/auth";

/** Seuils proposés — au-dessous, l'opération n'entraîne aucune alerte. */
const DEFAULT_THRESHOLD = "≥ 1 000 FCFA";
const THRESHOLDS: string[] = [
  "Toutes les opérations",
  DEFAULT_THRESHOLD,
  "≥ 10 000 FCFA",
  "≥ 50 000 FCFA",
];

/**
 * En-tête de section : libellé + phrase qui dit ce que le réglage change
 * RÉELLEMENT. L'audit reprochait à l'écran trois booléens sans regroupement
 * ni explication — « une liste plate qui ne demande aucune décision de
 * conception ».
 *
 * Le titre est un vrai en-tête (15px semi-bold sur --c-text), pas un
 * SectionLabel : en 13px w500 text-secondary il passait SOUS les titres de
 * ligne (14px) et se confondait avec sa propre phrase d'aide — sur un écran
 * devenu long et défilant, il ne restait aucun point d'ancrage au balayage.
 */
function SettingsSection({
  title,
  help,
  className,
}: {
  title: string;
  help: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {/* 16px à lg : l'écart d'un pixel avec le titre de ligne (14px) faisait
          tenir le repère de section au seul gap qui le précédait. Le repère
          est maintenant typographique ET spatial. */}
      <h2 className="text-text text-[15px] leading-[20px] font-semibold lg:text-[16px] lg:leading-[21px]">
        {title}
      </h2>
      <p className="text-text-muted mt-1 text-[12.5px] leading-[18px] lg:max-w-[560px]">
        {help}
      </p>
    </div>
  );
}

/**
 * Ligne de réglage NON modifiable : même gabarit que SettingsToggleRow, mais
 * l'état est une mention et non un interrupteur. Les codes de confirmation ne
 * peuvent pas être coupés depuis un écran de préférences.
 */
function RequiredSettingRow({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    /* Même correction de gabarit que la ligne « Seuil d'alerte » : hauteur
       minimale et non fixe, mention non tronquée — un numéro de téléphone
       coupé par un `truncate` n'informe personne. */
    <div className="flex min-h-[69px] items-start justify-between gap-4 py-[14px]">
      <div className="min-w-0">
        <p className="text-text text-[14px] leading-[20px] font-medium">
          {title}
        </p>
        <p className="text-text-muted mt-[2px] text-[12px] leading-[16px]">
          {subtitle}
        </p>
      </div>
      <span className="text-text-muted inline-flex h-5 shrink-0 items-center gap-1.5 text-[12px] font-medium">
        <Lock
          size={12}
          strokeWidth={2}
          absoluteStrokeWidth
          aria-hidden="true"
        />
        Requis
      </span>
    </div>
  );
}

/**
 * Écran 14 · Notifications — trois groupes (alertes, canaux, heures
 * silencieuses), chacun introduit par une phrase qui décrit sa conséquence.
 *
 * Recomposition post-audit : les lignes restent posées À PLAT sur le fond
 * (la bonne décision de la maquette, conservée), mais l'écran expose enfin la
 * granularité attendue d'un centre de notifications — type d'opération, seuil
 * de montant, destinataire visible par canal, heures silencieuses — et ne
 * propose plus de couper la réception des codes de confirmation.
 *
 * ÉTAPE 11 (composition) — RÈGLE DE RYTHME DES ÉCRANS DE RÉGLAGES (14/15/16) :
 *   le filet est le séparateur INTRA-groupe, et rien d'autre ;
 *   entre deux groupes il n'y a pas de filet, il y a 48px d'air.
 * L'écran se lisait comme une liste continue parce que les deux séparations
 * avaient la même force : 24px entre deux sections contre un filet entre deux
 * lignes. En portant l'inter-groupe à 48px et en gardant 16px entre l'en-tête
 * de section et sa première ligne, le groupe redevient l'unité de lecture.
 * Le sous-titre du seuil est en outre ramené à une ligne : sa césure prématurée
 * (avec ~200px libres à sa droite) se lisait comme un accident de gabarit.
 */
export default function NotificationsSettingsPage() {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState(true);
  const [cardDebits, setCardDebits] = useState(true);
  const [withdrawals, setWithdrawals] = useState(true);
  const [failures, setFailures] = useState(true);
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);

  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);
  const [marketingSms, setMarketingSms] = useState(false);

  const [quietHours, setQuietHours] = useState(false);

  return (
    <>
      <main className="px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[720px] lg:px-10 lg:pt-9 lg:pb-12">
        <PageHeader title="Notifications" backHref="/profile" />

        <SettingsSection
          className="mt-8"
          title="Alertes de transaction"
          help="Ces alertes vous préviennent d'un mouvement sur votre portefeuille ou vos cartes. Elles sont envoyées sur les canaux activés plus bas."
        />
        <div className="mt-4">
          <SettingsToggleRow
            title="Dépôts reçus"
            subtitle="Mobile Money crédité sur le portefeuille"
            checked={deposits}
            onChange={setDeposits}
            divider
          />
          <SettingsToggleRow
            title="Débits carte"
            subtitle="Chaque paiement en ligne avec une carte FixPay"
            checked={cardDebits}
            onChange={setCardDebits}
            divider
          />
          <SettingsToggleRow
            title="Retraits Mobile Money"
            subtitle="Sortie du portefeuille vers un opérateur"
            checked={withdrawals}
            onChange={setWithdrawals}
            divider
          />
          <SettingsToggleRow
            title="Opérations refusées"
            subtitle="Plafond dépassé, solde insuffisant, carte bloquée"
            checked={failures}
            onChange={setFailures}
            divider
          />

          {/* Seuil réellement modifiable : un réglage qui n'ouvre rien serait
              une affordance morte de plus.
              La ligne n'a plus de hauteur FIXE : en mobile le sous-titre passe
              à deux lignes, débordait la boîte de 69px et venait buter sous la
              valeur. `min-h` + `items-start` laissent la ligne grandir, et la
              valeur s'aligne sur la ligne de base du TITRE (les deux boîtes
              font 20px et démarrent au même y). */}
          <div className="flex min-h-[69px] items-start justify-between gap-4 py-[14px]">
            <div className="min-w-0 flex-1">
              <p className="text-text text-[14px] leading-[20px] font-medium">
                Seuil d&apos;alerte
              </p>
              <p className="text-text-muted mt-[2px] text-[12px] leading-[16px]">
                Sous ce montant, aucune alerte
              </p>
            </div>
            <div className="relative flex h-5 shrink-0 items-center">
              <select
                aria-label="Seuil d'alerte"
                value={threshold}
                onChange={(event) => setThreshold(event.target.value)}
                className="text-text focus-visible:ring-primary/60 appearance-none rounded-sm bg-transparent pr-5 text-right text-[13px] leading-[20px] font-medium hover:cursor-pointer focus-visible:ring-2 focus-visible:outline-none"
              >
                {THRESHOLDS.map((option) => (
                  <option
                    key={option}
                    value={option}
                    className="bg-bg text-text"
                  >
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
        </div>

        <SettingsSection
          className="mt-12"
          title="Canaux de réception"
          help="Le canal détermine où arrive l'alerte, pas ce qu'elle contient."
        />
        <div className="mt-4">
          <SettingsToggleRow
            title="Notifications push"
            subtitle="Alertes directement sur cet appareil"
            checked={push}
            onChange={setPush}
            divider
          />
          <SettingsToggleRow
            title="Notifications e-mail"
            subtitle={user?.email ?? "Votre adresse e-mail"}
            checked={email}
            onChange={setEmail}
            divider
          />
          <SettingsToggleRow
            title="SMS promotionnels"
            subtitle="Offres et nouveautés FixPay par SMS"
            checked={marketingSms}
            onChange={setMarketingSms}
            divider
          />
          <RequiredSettingRow
            title="Codes de confirmation"
            subtitle="Toujours envoyés par SMS pour valider vos opérations"
          />

          {/* La conséquence d'un réglage appartient à SON groupe : l'avertis-
              sement est à l'intérieur des canaux, pas dans l'air qui sépare
              deux sections. */}
          {!push && (
            <div className="mt-4">
              <InfoBanner tone="warning">
                Les notifications push sont désactivées : aucun débit carte ne
                vous sera signalé en temps réel sur cet appareil.
              </InfoBanner>
            </div>
          )}
        </div>

        <SettingsSection
          className="mt-12"
          title="Heures silencieuses"
          help="Les alertes sont retenues et regroupées au réveil ; les alertes de sécurité passent toujours."
        />
        <div className="mt-4">
          <SettingsToggleRow
            title="Ne pas déranger la nuit"
            subtitle="Aucune alerte entre 22:00 et 07:00"
            checked={quietHours}
            onChange={setQuietHours}
          />
        </div>

        <p className="text-text-muted mt-12 text-[11.5px] leading-[17px]">
          Le réglage des notifications n&apos;est pas encore relié à votre
          compte : ces préférences arriveront bientôt.
        </p>
      </main>

      <BottomNav />
    </>
  );
}
