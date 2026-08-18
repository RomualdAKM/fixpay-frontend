import {
  ChevronRight,
  CreditCard,
  Lock,
  Phone,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/layout/PageHeader";
import { ChatAvatar } from "@/components/ui/ChatBubble";
import { SectionLabel } from "@/components/ui/SectionLabel";

/* -------------------------------------------------------------------------
   ÉCRAN SANS BACKEND — ASSISTANT AUTOMATISÉ, HONNÊTE.

   Il n'existe AUCUNE API de chat ni de fil rattaché au compte. L'écran ne
   simule donc plus une conversation avec un humain : la version précédente
   affichait une frappe factice puis une réponse canned affirmant qu'« un
   conseiller vous répond dans cette conversation dès que possible » — un
   conseiller qui ne répond jamais. On retire cette mise en scène.

   Ce que l'écran fait DE RÉEL : il amène l'utilisateur au bon flux existant
   (recharge → /wallet/deposit, carte → /cards/new, blocage → /cards) et, pour
   parler à un humain, il renvoie vers le WhatsApp réel du support — le même
   numéro que celui de src/app/(flows)/support/page.tsx. Tant qu'aucun backend
   de messagerie n'est raccordé, on ne fabrique ni fil, ni frappe, ni réponse
   d'un conseiller.
   ------------------------------------------------------------------------- */

export const metadata = { title: "Aide rapide" };

/**
 * Accueil de l'assistant. Il DIT ce qu'il est — automatisé, pas un humain en
 * ligne — et où joindre un conseiller. Rendu comme une bulle pour garder la
 * texture de messagerie de l'écran, mais sans horodatage : ce n'est pas un
 * message d'un fil, c'est une notice d'accueil.
 */
const INTRO =
  "Bonjour, je suis l'assistant automatisé de FixPay. Je ne suis pas un conseiller en ligne : je vous amène directement au bon écran. Pour parler à un conseiller, écrivez-nous sur WhatsApp.";

/**
 * Rappel de sécurité — la ligne que porte tout support bancaire réel, la seule
 * information vraiment utile avant d'agir.
 */
const SAFETY_NOTE =
  "FixPay ne vous demandera jamais votre code PIN ni le cryptogramme de votre carte.";

/**
 * Les raccourcis. Chacun NAVIGUE vers un flux qui existe pour de vrai — plus
 * de puce qui envoie une question dans le vide. Les sous-titres décrivent le
 * flux d'arrivée sans rien inventer sur le compte.
 */
const SHORTCUTS: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  href: string;
}[] = [
  {
    icon: Wallet,
    title: "Recharger mon portefeuille",
    subtitle: "Dépôt Mobile Money, crédité sous 2 minutes",
    href: "/wallet/deposit",
  },
  {
    icon: CreditCard,
    title: "Créer une carte",
    subtitle: "Une carte virtuelle, émise immédiatement",
    href: "/cards/new",
  },
  {
    icon: Lock,
    title: "Bloquer une carte",
    subtitle: "Choisissez la carte à geler depuis vos cartes",
    href: "/cards",
  },
];

/**
 * Le canal humain RÉEL — repris à l'identique de l'écran Support pour qu'un
 * numéro ne dépende pas de l'écran d'où on le lit.
 */
const WHATSAPP = {
  href: "https://wa.me/221786304122",
  subtitle: "+221 78 630 41 22 · disponible 24h/24",
};

/**
 * Rangée d'action posée à même la page : filet, glyphe nu, chevron. Même
 * grammaire de liste que l'écran Support (écran 26). `external` ouvre WhatsApp
 * dans un nouvel onglet avec `rel` durci.
 */
function ActionRow({
  icon: Icon,
  title,
  subtitle,
  href,
  external = false,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  href: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      {...(external
        ? { target: "_blank", rel: "noreferrer noopener" }
        : undefined)}
      className="focus-visible:ring-primary/60 flex items-center gap-[13px] py-[13px] transition-opacity focus-visible:ring-2 focus-visible:outline-none lg:hover:opacity-80"
    >
      <Icon
        size={18}
        strokeWidth={2}
        absoluteStrokeWidth
        aria-hidden="true"
        className="text-icon-muted w-[18px] shrink-0"
      />
      <span className="min-w-0 flex-1">
        <span className="text-text block truncate text-[13.5px] leading-[18px] font-medium">
          {title}
        </span>
        <span className="text-text-muted mt-[2px] block truncate text-[11.5px] leading-[15px]">
          {subtitle}
        </span>
      </span>
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
 * Écran 27 · Aide rapide — assistant automatisé honnête. Retour → /support.
 *
 * Faute d'API de chat, l'écran ne joue pas la conversation : il aiguille. Un
 * accueil qui se présente comme automatisé, trois raccourcis qui ouvrent les
 * vrais flux, et une escalade vers le WhatsApp réel pour joindre un humain. Le
 * rappel anti-hameçonnage reste en pied de colonne et dans le rail.
 */
export default function ChatSupportPage() {
  return (
    <main className="flex-1 px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[1040px] lg:px-10 lg:pt-9 lg:pb-12">
      <PageHeader
        title="Aide rapide"
        backHref="/support"
        status={{ label: "Assistant automatisé · un conseiller sur WhatsApp" }}
      />

      <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start lg:gap-10">
        <div>
          {/* Accueil : une bulle qui dit ce qu'elle est, sans horodatage ni
              simulation de frappe. */}
          <div className="flex items-end gap-[10px]">
            <ChatAvatar from="agent" />
            <div className="bg-surface-2 max-w-[300px] rounded-lg rounded-bl-sm px-[15px] pt-3.5 pb-[13px]">
              <p className="text-text text-[13px] leading-[20.8px] text-balance">
                {INTRO}
              </p>
            </div>
          </div>

          <section className="mt-8">
            <SectionLabel>Que voulez-vous faire ?</SectionLabel>
            <div className="border-border divide-border mt-2 divide-y border-y">
              {SHORTCUTS.map((item) => (
                <ActionRow
                  key={item.href}
                  icon={item.icon}
                  title={item.title}
                  subtitle={item.subtitle}
                  href={item.href}
                />
              ))}
            </div>
          </section>

          <section className="mt-8">
            <SectionLabel>Parler à un conseiller</SectionLabel>
            <div className="border-border divide-border mt-2 divide-y border-y">
              <ActionRow
                icon={Phone}
                title="Discuter sur WhatsApp"
                subtitle={WHATSAPP.subtitle}
                href={WHATSAPP.href}
                external
              />
            </div>
            <p className="text-text-muted mt-3 text-[11.5px] leading-[16px]">
              Des conseillers du lundi au dimanche, 8h – 22h. En dehors de ces
              heures, votre message est traité au matin.
            </p>
          </section>

          <p className="text-text-muted border-border mt-8 border-t pt-6 text-[11.5px] leading-[16px] lg:hidden">
            {SAFETY_NOTE}
          </p>
        </div>

        {/* Rail desktop : qui répond, et le rappel de sécurité. Aucune donnée du
            compte, aucun conseiller nommé qui n'existe pas. */}
        <aside className="mt-8 hidden lg:sticky lg:top-0 lg:mt-0 lg:block lg:self-start lg:pt-1">
          <SectionLabel>Votre interlocuteur</SectionLabel>
          <div className="mt-2.5 flex items-center gap-2.5">
            <ChatAvatar from="agent" />
            <span className="min-w-0">
              <span className="text-text block text-[13px] leading-[17px] font-medium">
                Assistant FixPay
              </span>
              <span className="text-text-muted block text-[11.5px] leading-[15px]">
                automatisé · conseiller sur WhatsApp
              </span>
            </span>
          </div>
          <p className="text-text-muted mt-3 text-[11.5px] leading-[16px]">
            L&apos;assistant vous oriente vers le bon écran. Pour un échange avec
            un conseiller, passez par WhatsApp — du lundi au dimanche, 8h – 22h.
          </p>

          <p className="text-text-muted border-border mt-6 border-t pt-6 text-[11.5px] leading-[16px]">
            {SAFETY_NOTE}
          </p>
        </aside>
      </div>
    </main>
  );
}
