"use client";

import { Check, Clock } from "lucide-react";

import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { useAuth } from "@/lib/auth";

/**
 * En-tête de section : libellé + phrase qui dit ce que le réglage change
 * RÉELLEMENT. Le titre est un vrai en-tête (15px semi-bold sur --c-text), pas
 * un SectionLabel : en 13px w500 text-secondary il passait SOUS les titres de
 * ligne (14px) et se confondait avec sa propre phrase d'aide.
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
 * Ligne d'un canal RÉELLEMENT actif : titre + destinataire, avec une mention
 * « Actif » (et non un interrupteur). On n'affiche ici que ce qui fonctionne
 * vraiment aujourd'hui — le fil de l'application et l'adresse e-mail du compte
 * — donc rien à couper : il n'y a pas de réglage à faire semblant d'appliquer.
 */
function ActiveChannelRow({
  title,
  subtitle,
  divider,
}: {
  title: string;
  subtitle: string;
  divider?: boolean;
}) {
  return (
    <div
      className={`flex min-h-[69px] items-start justify-between gap-4 py-[14px] ${
        divider ? "border-border border-b" : ""
      }`}
    >
      <div className="min-w-0">
        <p className="text-text text-[14px] leading-[20px] font-medium">
          {title}
        </p>
        <p className="text-text-muted mt-[2px] text-[12px] leading-[16px] break-words">
          {subtitle}
        </p>
      </div>
      <span className="text-success inline-flex h-5 shrink-0 items-center gap-1.5 text-[12px] font-medium">
        <Check size={13} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />
        Actif
      </span>
    </div>
  );
}

/**
 * Ligne d'un réglage PAS ENCORE branché : présentée en clair comme « Bientôt »,
 * non interactive et visiblement en retrait. Aucun interrupteur : un toggle qui
 * ne persiste pas laisserait croire qu'on a appliqué un choix. On annonce ce qui
 * arrive, sans le faire semblant fonctionner.
 */
function SoonSettingRow({
  title,
  subtitle,
  divider,
}: {
  title: string;
  subtitle: string;
  divider?: boolean;
}) {
  return (
    <div
      className={`flex min-h-[69px] items-start justify-between gap-4 py-[14px] opacity-70 ${
        divider ? "border-border border-b" : ""
      }`}
    >
      <div className="min-w-0">
        <p className="text-text text-[14px] leading-[20px] font-medium">
          {title}
        </p>
        <p className="text-text-muted mt-[2px] text-[12px] leading-[16px]">
          {subtitle}
        </p>
      </div>
      <span className="text-text-muted inline-flex h-5 shrink-0 items-center gap-1.5 text-[12px] font-medium">
        <Clock size={12} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />
        Bientôt
      </span>
    </div>
  );
}

/**
 * Écran 14 · Notifications — version HONNÊTE.
 *
 * L'écran précédent alignait une dizaine d'interrupteurs qui NE PERSISTAIENT
 * PAS (aucune route de préférences côté API — seul `/api/notifications` existe,
 * en lecture), affirmait faussement que « les codes de confirmation sont
 * toujours envoyés par SMS » (FixPay valide par code PIN, aucun fournisseur
 * SMS n'est branché) et proposait un toggle « SMS promotionnels » sans backend.
 *
 * On ne présente désormais comme actif QUE ce qui l'est réellement :
 *   - le fil de notifications de l'application (endpoint réel) ;
 *   - l'adresse e-mail du compte, en lecture (la vraie, via useAuth).
 * Le reste (choix par type d'opération, seuil, heures silencieuses) est annoncé
 * en « Bientôt » assumé, sans interrupteur et sans faux « appliqué ». La
 * validation par code PIN remplace le mensonge sur les SMS.
 */
export default function NotificationsSettingsPage() {
  const { user } = useAuth();
  const email = user?.email ?? "l'adresse de votre compte";

  return (
    <>
      <main className="px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[720px] lg:px-10 lg:pt-9 lg:pb-12">
        <PageHeader title="Notifications" backHref="/profile" />

        <SettingsSection
          className="mt-8"
          title="Où arrivent vos alertes"
          help="Aujourd'hui, vos alertes de transaction et les messages FixPay arrivent dans le fil de l'application. Les e-mails de compte et de sécurité vous parviennent à l'adresse de votre compte."
        />
        <div className="mt-4">
          <ActiveChannelRow
            title="Fil de l'application"
            subtitle="Alertes de transaction et messages FixPay"
            divider
          />
          <ActiveChannelRow
            title="E-mail du compte"
            subtitle={email}
          />
        </div>

        {/* Correction de l'affirmation trompeuse : FixPay ne confirme rien par
            SMS. On dit la vérité — validation par code PIN — et on en profite
            pour l'avertissement anti-hameçonnage qui va avec. */}
        <div className="mt-8">
          <InfoBanner tone="neutral">
            Vos opérations sont validées par votre code PIN, jamais par un code
            reçu par SMS. FixPay ne vous enverra jamais de code à saisir : un tel
            message est une tentative d&apos;hameçonnage.
          </InfoBanner>
        </div>

        <SettingsSection
          className="mt-12"
          title="Réglages à venir"
          help="Choisir quelles opérations vous alertent, fixer un seuil de montant et définir des heures silencieuses arrivera dans une prochaine version. Ces réglages ne sont pas encore actifs."
        />
        <div className="mt-4">
          <SoonSettingRow
            title="Alertes par type d'opération"
            subtitle="Dépôts, débits carte, retraits, opérations refusées"
            divider
          />
          <SoonSettingRow
            title="Seuil d'alerte"
            subtitle="Ne pas être alerté sous un certain montant"
            divider
          />
          <SoonSettingRow
            title="Heures silencieuses"
            subtitle="Regrouper les alertes non urgentes la nuit"
          />
        </div>
      </main>

      <BottomNav />
    </>
  );
}
