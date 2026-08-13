"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsToggleRow } from "@/components/ui/SettingsToggleRow";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface Device {
  id: string;
  name: string;
  detail: string;
  /** L'appareil courant ne peut pas être déconnecté depuis lui-même. */
  current?: boolean;
}

const INITIAL_DEVICES: Device[] = [
  {
    id: "iphone-13",
    name: "iPhone 13 · Abidjan",
    detail: "Cet appareil · actif maintenant",
    current: true,
  },
  {
    id: "chrome-dakar",
    name: "Chrome · Dakar",
    detail: "Dernière activité le 11 avr.",
  },
  {
    id: "chrome-abidjan",
    name: "Chrome · Abidjan",
    detail: "Dernière activité le 2 avr.",
  },
];

/**
 * En-tête de section : le libellé seul ne dit pas ce que le réglage change.
 * L'audit relevait deux interrupteurs sans regroupement, sans explication et
 * sans aucun des contenus qu'un écran Confidentialité doit porter.
 *
 * Le titre est un vrai en-tête (15px semi-bold sur --c-text) : en 13px w500
 * text-secondary il était au même niveau typographique que sa phrase d'aide
 * ET sous les titres de ligne — sur un écran long, plus aucune section
 * n'était repérable au balayage.
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
 * Ligne d'action de réglage. La hauteur est MINIMALE et non fixe : les copies
 * de la refonte tiennent sur deux lignes en mobile et débordaient la boîte de
 * 69px, écrasant le filet suivant. `gap`, `min-w-0` et `shrink-0` empêchent le
 * texte de venir toucher l'action.
 *
 * `actionTone` sépare deux natures d'action qui portaient le même bleu :
 * « Demander » un export (bénin, réversible) reste un lien, « Déconnecter »
 * un appareil (irréversible sur la session) devient un bouton bordé.
 */
function SettingsActionRow({
  title,
  subtitle,
  href,
  action,
  actionTone = "link",
  onAction,
  divider = false,
}: {
  title: string;
  subtitle: string;
  href?: string;
  action?: string;
  actionTone?: "link" | "outline";
  onAction?: () => void;
  divider?: boolean;
}) {
  /*
   * Le filet est porté par un CONTENEUR, jamais par la ligne interactive.
   * Posé sur le <Link>, qui est arrondi (`rounded-sm` pour son anneau de
   * focus), le `border-b` épouse le rayon et se recourbe vers le haut à ses
   * deux extrémités : il cesse de se lire comme un séparateur pour se lire
   * comme le bas d'une carte inachevée — c'est la seconde morphologie de
   * séparateur relevée sur l'écran 16, produite par la même mécanique.
   */
  const rowClass =
    "flex min-h-[69px] w-full items-start justify-between gap-4 py-[14px] text-left";
  const dividerClass = divider ? "border-border border-b" : undefined;

  const body = (
    <span className="min-w-0">
      <span className="text-text block text-[14px] leading-[20px] font-medium">
        {title}
      </span>
      <span className="text-text-muted mt-[2px] block text-[12px] leading-[16px]">
        {subtitle}
      </span>
    </span>
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
          <ChevronRight
            size={16}
            strokeWidth={2}
            absoluteStrokeWidth
            aria-hidden="true"
            className="text-icon-muted mt-[2px] shrink-0"
          />
        </Link>
      </div>
    );
  }

  return (
    <div className={cn(rowClass, dividerClass)}>
      {body}
      {action &&
        (actionTone === "outline" ? (
          <button
            type="button"
            onClick={onAction}
            disabled={!onAction}
            className="border-border bg-surface text-text-secondary hover:bg-surface-2 hover:text-text focus-visible:ring-primary/60 inline-flex h-8 shrink-0 items-center rounded-sm border px-3 text-[12px] font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-default"
          >
            {action}
          </button>
        ) : (
          <button
            type="button"
            onClick={onAction}
            disabled={!onAction}
            className={cn(
              "inline-flex h-5 shrink-0 items-center text-[12.5px] font-medium disabled:cursor-default",
              onAction ? "text-primary" : "text-text-muted",
            )}
          >
            {action}
          </button>
        ))}
    </div>
  );
}

/**
 * Écran 15 · Confidentialité — affichage, consentements datés, appareils
 * connectés, export et clôture de compte, mentions légales.
 *
 * Recomposition post-audit : la structure à plat sur le fond est conservée
 * (c'était la bonne décision), mais le filet sous la DERNIÈRE ligne disparaît
 * (règle désormais identique à l'écran 14), le consentement analytique passe
 * en opt-in avec un libellé qui nomme le destinataire, et l'écran porte enfin
 * ce qu'une fintech régulée doit y mettre.
 *
 * ÉTAPE 11 (composition) : même règle de rythme que les écrans 14 et 16 — le
 * filet sépare deux lignes d'un groupe, 48px d'air séparent deux groupes,
 * 16px séparent l'en-tête de section de sa première ligne. Les cinq groupes
 * de l'écran ne sont plus rendus à 24px les uns des autres, c'est-à-dire à
 * peine plus que la hauteur d'une ligne.
 */
export default function PrivacyPage() {
  const { user } = useAuth();
  const exportEmail = user?.email ?? "votre adresse";
  const [hideBalances, setHideBalances] = useState(false);
  const [hideAmountsInAlerts, setHideAmountsInAlerts] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [exportRequested, setExportRequested] = useState(false);
  /** Confirmation de clôture — jamais destructive au premier clic. */
  const [closing, setClosing] = useState(false);

  const otherDevices = devices.filter((device) => !device.current);

  return (
    <>
      <main className="px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[720px] lg:px-10 lg:pt-9 lg:pb-12">
        <PageHeader title="Confidentialité" backHref="/profile" />

        <SettingsSection
          className="mt-8"
          title="Affichage"
          help="Ces deux réglages ne concernent que cet appareil : ils changent ce qu'un regard par-dessus votre épaule peut lire."
        />
        <div className="mt-4">
          <SettingsToggleRow
            title="Masquer les soldes par défaut"
            subtitle="Les montants seront masqués à l'ouverture"
            checked={hideBalances}
            onChange={setHideBalances}
            divider
          />
          <SettingsToggleRow
            title="Masquer les montants dans les alertes"
            subtitle="Le titre reste visible, le montant devient •••"
            checked={hideAmountsInAlerts}
            onChange={setHideAmountsInAlerts}
          />
        </div>

        <SettingsSection
          className="mt-12"
          title="Consentements"
          help="Recueillis le 5 avr. Vous pouvez revenir sur chacun de ces choix à tout moment ; un refus n'a aucun effet sur vos opérations."
        />
        <div className="mt-4">
          {/* Opt-in par défaut à false, et le destinataire est nommé : le
              libellé « Améliorer l'expérience utilisateur » ne disait ni ce
              qui est collecté, ni pour qui.
              La date de recueil est remontée dans la phrase d'aide de la
              section : en fin de sous-titre elle poussait la ligne à deux
              lignes en mobile, jusqu'à toucher l'interrupteur. */}
          <SettingsToggleRow
            title="Statistiques d'usage"
            subtitle="Données anonymisées transmises à FixPay"
            checked={analytics}
            onChange={setAnalytics}
            divider
          />
          <SettingsToggleRow
            title="Communications marketing"
            subtitle="Offres et nouveautés FixPay"
            checked={marketing}
            onChange={setMarketing}
          />
        </div>

        <SettingsSection
          className="mt-12"
          title="Appareils connectés"
          help="Déconnectez tout appareil que vous ne reconnaissez pas : sa session est fermée immédiatement."
        />
        <div className="mt-4">
          {devices.map((device, index) => (
            <SettingsActionRow
              key={device.id}
              title={device.name}
              subtitle={device.detail}
              action={device.current ? undefined : "Déconnecter"}
              actionTone="outline"
              onAction={
                device.current
                  ? undefined
                  : () =>
                      setDevices((prev) =>
                        prev.filter((item) => item.id !== device.id),
                      )
              }
              divider={index < devices.length - 1}
            />
          ))}
          {otherDevices.length === 0 && (
            <p className="text-text-muted py-4 text-[12.5px] leading-[18px]">
              Aucun autre appareil n&apos;est connecté à votre compte.
            </p>
          )}
        </div>

        <SettingsSection
          className="mt-12"
          title="Vos données"
          help="L'export contient vos opérations, vos cartes et vos justificatifs KYC."
        />
        <div className="mt-4">
          <SettingsActionRow
            title="Exporter mes données"
            subtitle={
              exportRequested
                ? `Demande enregistrée · archive envoyée à ${exportEmail} sous 48 h`
                : `Archive JSON envoyée à ${exportEmail} sous 48 h`
            }
            action={exportRequested ? "Demandé" : "Demander"}
            onAction={
              exportRequested ? undefined : () => setExportRequested(true)
            }
            divider
          />

          {/* Clôture de compte : l'action la plus destructive du produit était
              une ligne de navigation neutre à chevron, strictement identique à
              « Exporter mes données », et sans confirmation. Elle porte
              désormais son registre (danger) et une confirmation explicite qui
              énonce les conséquences avant de renvoyer vers l'assistance. */}
          <div className="min-h-[69px] py-[14px]">
            <div className="flex items-start justify-between gap-4">
              <span className="min-w-0">
                <span className="text-danger block text-[14px] leading-[20px] font-medium">
                  Fermer mon compte
                </span>
                <span className="text-text-muted mt-[2px] block text-[12px] leading-[16px]">
                  Retirez d&apos;abord vos fonds ; la clôture est définitive
                  après 30 jours
                </span>
              </span>
              {!closing && (
                <button
                  type="button"
                  onClick={() => setClosing(true)}
                  className="border-danger/50 text-danger hover:bg-danger/10 focus-visible:ring-danger/60 inline-flex h-8 shrink-0 items-center rounded-sm border px-3 text-[12px] font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  Fermer
                </button>
              )}
            </div>

            {closing && (
              <div className="border-danger/40 bg-danger/[0.06] mt-3.5 rounded-md border p-3.5">
                <p className="text-text text-[12.5px] leading-[18px]">
                  La clôture ferme définitivement vos cartes FixPay et supprime
                  vos données 30 jours après validation. Votre solde doit être à
                  zéro : virez-le vers Mobile Money avant de poursuivre.
                </p>
                <div className="mt-3.5 flex items-center gap-2">
                  <Link
                    href="/support"
                    className="border-danger text-danger hover:bg-danger/10 focus-visible:ring-danger/60 inline-flex h-9 items-center rounded-md border px-3.5 text-[12.5px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    Poursuivre avec l&apos;assistance
                  </Link>
                  <button
                    type="button"
                    onClick={() => setClosing(false)}
                    className="text-text-secondary hover:text-text inline-flex h-9 items-center px-2 text-[12.5px] font-medium transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-text-muted mt-12 text-[11.5px] leading-[17px]">
          Politique de confidentialité et conditions générales — version du 12
          mars 2026, consultables depuis l&apos;
          <Link href="/support" className="text-primary">
            espace support
          </Link>
          . Vos données sont hébergées en zone UEMOA.
        </p>
      </main>

      <BottomNav />
    </>
  );
}
