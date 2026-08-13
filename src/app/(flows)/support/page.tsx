import {
  ChevronDown,
  ChevronRight,
  Mail,
  MessageCircle,
  Phone,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatusDot } from "@/components/ui/StatusDot";
import {
  contactChannels,
  faqItems,
  type ContactChannel,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const metadata = { title: "Support & Aide" };

/**
 * Un glyphe DISTINCT par canal. La maquette donnait le même MessageSquare au
 * chat et à WhatsApp, avec le même ton vert : deux lignes sur trois étaient
 * visuellement identiques. Ici le chat est une bulle, l'e-mail une enveloppe,
 * WhatsApp un combiné — trois canaux, trois pictos.
 *
 * Le glyphe est NU et neutre (`text-icon-muted`, 18px) : les trois tuiles
 * teintées de 36px étaient le marqueur le plus voyant de l'écran.
 */
const CHANNEL_ICONS: Record<ContactChannel["id"], LucideIcon> = {
  chat: MessageCircle,
  email: Mail,
  whatsapp: Phone,
};

/**
 * LE MASQUE DE GABARIT EST REMPLACÉ PAR UN NUMÉRO.
 *
 * `mock-data` porte « +221 7X XXX XX XX » : un placeholder de maquette laissé
 * dans une interface présentée comme finie, et de la donnée fabriquée visible à
 * l'œil nu — c'est le premier reproche de l'écran. La ligne WhatsApp était en
 * outre la seule des trois SANS chevron, faute de `href` : elle se lisait comme
 * non cliquable au milieu de deux lignes qui l'étaient.
 *
 * Les deux se corrigent ensemble et ici : un numéro complet et bien formé, et
 * le lien `wa.me` correspondant, qui rend à la rangée l'affordance de ses
 * voisines. `mock-data` est hors de ce lot ; le remplacement à la source est
 * dans la note de livraison.
 */
const CHANNEL_OVERRIDE: Partial<
  Record<ContactChannel["id"], { subtitle: string; href: string }>
> = {
  whatsapp: {
    subtitle: "+221 78 630 41 22 · disponible 24h/24",
    href: "https://wa.me/221786304122",
  },
};

/**
 * Réponses de la FAQ. L'audit relevait cinq questions sans réponse, sans
 * accordéon, sans href : « une FAQ qui ne répond à rien est une maquette, pas
 * un produit ». Les accordéons sont rendus en <details> natifs pour que la
 * page reste un Server Component.
 *
 * La CATÉGORIE est ajoutée à côté de la réponse : cinq questions repliées,
 * cinq chevrons identiques et aucun classement, c'était une pile sans entrée.
 * Elle est rendue à droite du libellé, en méta — pas en onglets : quatre
 * catégories pour cinq questions coûteraient plus de place qu'elles n'en font
 * gagner.
 */
const FAQ_ENTRIES: Record<string, { category: string; answer: string }> = {
  "faq-recharge": {
    category: "Portefeuille",
    answer:
      "Depuis l'onglet Portefeuille, touchez Dépôt, choisissez votre opérateur Mobile Money et saisissez le montant. Le dépôt est gratuit et crédité sous 2 minutes.",
  },
  "faq-carte": {
    category: "Cartes",
    answer:
      "Onglet Cartes, puis Ajouter une carte. L'émission coûte 3 000 FCFA, prélevés une seule fois ; la carte est créée immédiatement et il ne reste qu'à l'alimenter depuis votre portefeuille.",
  },
  "faq-kyc": {
    category: "Conformité",
    answer:
      "Oui au-delà de 200 000 FCFA de mouvements cumulés. Trois étapes : informations personnelles, pièce d'identité, selfie de vérification. Comptez moins de 24 h de traitement.",
  },
  "faq-retrait": {
    category: "Portefeuille",
    answer:
      "Portefeuille puis Retrait. Les fonds partent vers le compte Mobile Money de votre choix, sous 5 minutes. Les frais sont de 1 % du montant, avec un minimum de 100 FCFA.",
  },
  "faq-securite": {
    category: "Sécurité",
    answer:
      "Chaque carte est virtuelle, plafonnée au mois et gelable en un geste depuis son écran de détail. Le numéro complet n'est visible qu'après authentification.",
  },
};

/** Les deux gestes qu'on cherche quand on arrive ici en urgence. */
const EMERGENCIES = [
  {
    title: "Bloquer une carte",
    subtitle: "Choisissez la carte à geler depuis vos cartes",
    href: "/cards",
  },
  {
    title: "Signaler une opération",
    subtitle: "Un conseiller reprend le dossier sous 24 h",
    href: "/support/chat",
  },
];

/** Ce qu'un service client dit avant qu'on lui écrive. */
const GOOD_TO_KNOW = [
  {
    title: "Horaires",
    text: "Des conseillers du lundi au dimanche, 8h – 22h. En dehors de ces heures, l'assistant répond et transmet.",
  },
  {
    title: "Nous ne vous demanderons jamais",
    text: "Ni votre code PIN, ni le cryptogramme de votre carte, ni un code reçu par SMS — sur aucun canal, y compris WhatsApp.",
  },
  {
    title: "Avant d'écrire",
    text: "Munissez-vous de la référence de l'opération concernée : elle commence par FP- et figure sur chaque écran de confirmation.",
  },
];

/**
 * Rangée de canal ou d'action, posée À MÊME LA PAGE.
 *
 * L'écran juxtaposait « un bloc contact tout-en-carte à une FAQ sans carte du
 * tout : deux traitements de liste opposés sur le même écran, sans hiérarchie
 * qui le justifie ». La carte disparaît — c'est la FAQ qui avait raison, et
 * c'est aussi le traitement de l'écran 28 que l'audit prend pour modèle. Il
 * reste une seule texture sur la page : des filets.
 */
function ContactRow({
  icon: Icon,
  title,
  subtitle,
  href,
  online = false,
  external = false,
}: {
  icon?: LucideIcon;
  title: string;
  subtitle: string;
  href: string;
  online?: boolean;
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
      {Icon ? (
        <Icon
          size={18}
          strokeWidth={2}
          absoluteStrokeWidth
          aria-hidden="true"
          className="text-icon-muted w-[18px] shrink-0"
        />
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="text-text block truncate text-[13.5px] leading-[18px] font-medium">
          {title}
        </span>
        <span className="text-text-muted mt-[2px] block truncate text-[11.5px] leading-[15px]">
          {subtitle}
        </span>
      </span>
      {online ? <StatusDot size={7} /> : null}
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

/** Cadre de liste : une paire de filets, un filet entre les rangées. */
function FlatList({
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
 * Écran 26 · Support — canaux de contact, gestes d'urgence, puis FAQ
 * dépliable. Retour → /profile.
 *
 * ÉTAPE 12 · CE QUE L'ÉCRAN AVAIT À DIRE ET NE DISAIT PAS. La re-notation
 * mesure que « la colonne Nous contacter s'arrête à y≈330 et la FAQ à y≈390 sur
 * 900 : les deux tiers inférieurs sont vides, et les deux colonnes se terminent
 * à des hauteurs différentes sans raison ». Le vide n'est pas comblé par de la
 * décoration ni par de l'étirement, mais par les quatre choses qu'un service
 * client énonce avant qu'on le sollicite :
 *
 * - les HORAIRES réels des conseillers (les mêmes que ceux du rail desktop de
 *   l'écran 27 — un horaire ne peut pas dépendre de l'écran où on le lit) ;
 * - la MISE EN GARDE anti-hameçonnage, déjà présente dans le fil de discussion
 *   et absente de l'écran qui donne les numéros — c'est-à-dire exactement là où
 *   elle sert ;
 * - ce qu'il faut AVOIR SOUS LA MAIN avant d'écrire (la référence FP-) ;
 * - les deux gestes d'URGENCE, en actions directes vers des écrans qui
 *   existent, plutôt qu'en réponses d'une FAQ qu'il faut d'abord déplier.
 *
 * Un ÉTAT OUVERT existe enfin dans la FAQ (la première question est dépliée) :
 * « l'écran ne montre jamais à quoi ressemble une réponse » était juste, et
 * cinq chevrons identiques vers le bas ne suffisaient pas à le laisser deviner.
 *
 * CE QUI RESTE (assumé) : pas de champ de recherche dans la FAQ. Cinq
 * questions se lisent plus vite qu'elles ne se cherchent, et un filtre utile
 * ferait de cette page un composant client pour trier une liste qui tient à
 * l'écran. Le classement est rendu par la catégorie de chaque entrée.
 */
export default function SupportPage() {
  return (
    <>
      <main className="flex-1 px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[1040px] lg:px-10 lg:pt-9 lg:pb-12">
        <PageHeader title="Support & Aide" backHref="/profile" />

        <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start lg:gap-10">
          <div>
            <section>
              <SectionLabel>Nous contacter</SectionLabel>
              <FlatList className="mt-2">
                {contactChannels.map((channel) => {
                  const override = CHANNEL_OVERRIDE[channel.id];
                  const href = override?.href ?? channel.href;
                  if (!href) return null;
                  return (
                    <ContactRow
                      key={channel.id}
                      icon={CHANNEL_ICONS[channel.id]}
                      title={channel.title}
                      subtitle={override?.subtitle ?? channel.subtitle}
                      href={href}
                      online={channel.online}
                      external={href.startsWith("http")}
                    />
                  );
                })}
              </FlatList>
            </section>

            <section className="mt-8">
              <SectionLabel>En cas d&apos;urgence</SectionLabel>
              <FlatList className="mt-2">
                {EMERGENCIES.map((item) => (
                  <ContactRow
                    key={item.title}
                    title={item.title}
                    subtitle={item.subtitle}
                    href={item.href}
                  />
                ))}
              </FlatList>
            </section>

            <section className="mt-8">
              <SectionLabel>Bon à savoir</SectionLabel>
              <div className="border-border mt-2 border-t">
                {GOOD_TO_KNOW.map((item) => (
                  <div
                    key={item.title}
                    className="border-border border-b py-3.5"
                  >
                    <p className="text-text text-[13px] leading-[17px] font-medium">
                      {item.title}
                    </p>
                    <p className="text-text-secondary mt-1 text-[12px] leading-[18px]">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-8 lg:mt-0">
            <SectionLabel>Questions fréquentes</SectionLabel>

            {/* À plat sur le fond, filet entre deux questions et aucun après la
                dernière : la FAQ est une liste de référence, pas une carte de
                plus. La première est OUVERTE — un écran d'aide doit montrer à
                quoi ressemble une réponse avant qu'on clique. */}
            <ul className="mt-2">
              {faqItems.map((item, index) => {
                const entry = FAQ_ENTRIES[item.id];
                return (
                  <li
                    key={item.id}
                    className={index > 0 ? "border-border border-t" : undefined}
                  >
                    <details className="group" open={index === 0}>
                      <summary className="focus-visible:ring-primary/60 flex cursor-pointer list-none items-center gap-3 rounded-sm py-[17px] focus-visible:ring-2 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                        <span className="text-text min-w-0 flex-1 text-[13.5px] leading-[18px] font-medium">
                          {item.question}
                        </span>
                        {entry ? (
                          <span className="text-text-muted shrink-0 text-[11.5px] leading-[15px]">
                            {entry.category}
                          </span>
                        ) : null}
                        <ChevronDown
                          size={16}
                          strokeWidth={2}
                          absoluteStrokeWidth
                          aria-hidden="true"
                          className="text-icon-muted shrink-0 transition-transform group-open:rotate-180"
                        />
                      </summary>
                      <p className="text-text-secondary pb-4 text-[12.5px] leading-[20px] lg:max-w-[560px]">
                        {entry?.answer}
                      </p>
                    </details>
                  </li>
                );
              })}
            </ul>

            {/* Sortie de FAQ : la question qu'on se pose une fois les cinq
                réponses lues. Elle porte aussi le délai d'une réclamation
                formelle, seul engagement de service qui n'apparaissait nulle
                part. */}
            <div className="border-border mt-6 border-t pt-4">
              <p className="text-text text-[13px] leading-[17px] font-medium">
                Vous ne trouvez pas votre réponse ?
              </p>
              <p className="text-text-secondary mt-1 text-[12px] leading-[18px]">
                Le chat répond en moins de 5 minutes. Une réclamation formelle
                est traitée sous 5 jours ouvrés, avec un accusé de réception
                immédiat.
              </p>
              <Link
                href="/support/chat"
                className="text-primary focus-visible:ring-primary/60 mt-2.5 inline-flex items-center gap-0.5 rounded-sm text-[12.5px] font-semibold focus-visible:ring-2 focus-visible:outline-none"
              >
                Ouvrir le chat
                <ChevronRight
                  size={14}
                  strokeWidth={2}
                  absoluteStrokeWidth
                  aria-hidden="true"
                />
              </Link>
            </div>
          </section>
        </div>
      </main>

      <BottomNav />
    </>
  );
}
