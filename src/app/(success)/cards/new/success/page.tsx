import Link from "next/link";
import type { ReactNode } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { GradientIconBadge } from "@/components/ui/GradientIconBadge";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatusDot } from "@/components/ui/StatusDot";
import { VirtualCard } from "@/components/ui/VirtualCard";
import { formatFcfa } from "@/lib/format";
import { primaryCard } from "@/lib/mock-data";

export const metadata = { title: "Succès Carte" };

/**
 * Écran 20 · Succès Carte — page custom (pas le template SuccessScreen, mais
 * EXACTEMENT sa grille : les six confirmations du produit partagent désormais
 * une seule boîte de 744px, deux colonnes 348 | 340, centrée dans le viewport).
 *
 * Acquis conservés : un seul titre, la carte porte les données réelles du
 * porteur, le panneau « Informations de la carte » est une liste de définition
 * à plat, la face est bornée à sa géométrie ISO, l'axe de composition est le
 * fer à gauche, et il n'y a ni bottom nav ni bouton retour — le flux est fini.
 *
 * Étape 11 · composition :
 *
 * - LA PAGE NE PEND PLUS PAR LE HAUT. Le contenu s'arrêtait à y=566 sur 900,
 *   soit 37 % de page vide, tout entier sous le bloc. La composition est
 *   centrée dans la hauteur (`lg:justify-center`) : le mou se répartit
 *   au-dessus et au-dessous, il cesse d'être une bande morte de fin de page.
 * - LES DEUX COLONNES FINISSENT ENSEMBLE. Le CTA de 348px flottait à gauche
 *   SOUS la grille, et la colonne droite s'arrêtait 56 % plus haut que la
 *   gauche. Le CTA passe DANS la colonne de la carte — il agit sur elle — et
 *   se cale en pied de colonne (`self-end`) ; la fiche gagne deux lignes
 *   réelles (type de carte, date d'émission). L'écart de pied entre les deux
 *   colonnes tombe d'environ 165px à moins de 90.
 * - LA SOUS-LIGNE DISPARAÎT. « Créée le 14 avr. · •••• 4291 » réimprimait le
 *   dernier groupe du numéro gravé 60px plus bas. La date, elle, est une
 *   information : elle rejoint la fiche, où elle est nommée. Le bloc de tête se
 *   réduit à ce qu'il annonce.
 * - RYTHME. Intervalles pris dans 6 / 16 / 32, appliqués par rôle : 16 dans le
 *   bloc de tête (badge → titre), 6 entre un en-tête de section et sa liste,
 *   32 entre deux groupes.
 *
 * Acquis antérieurs conservés : ratio ISO de la face, colonne label/valeur
 * bornée, InfoBanner de bas de page remplacée par la sortie secondaire
 * (« Alimenter ma carte » est une ACTION, pas une information), conversion de
 * devise explicitée, séparateur de milliers rouvert au `word-spacing`.
 */
const cardFacts: Array<{ label: string; value: ReactNode }> = [
  { label: "Type de carte", value: primaryCard.type },
  { label: "Émise le", value: "14 avr. 2026" },
  { label: "Plafond mensuel", value: formatFcfa(primaryCard.monthlyLimit) },
  { label: "Devise de règlement", value: "EUR — converti en FCFA" },
  { label: "Frais d'émission", value: "Gratuit" },
  {
    label: "Statut",
    value: (
      <span className="inline-flex items-center gap-1.5">
        <StatusDot size={7} />
        {primaryCard.status}
      </span>
    ),
  },
];

export default function CardCreationSuccessPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-6 pt-12 pb-10 lg:max-w-[824px] lg:justify-center lg:px-10 lg:py-16">
      {/* Groupe 1 — l'annonce. */}
      <div>
        <GradientIconBadge icon={Check} tone="success" size={56} />
        <h1 className="text-text mt-4 text-[24px] leading-[30px] font-bold">
          Votre carte Visa est prête
        </h1>
      </div>

      {/* Groupe 2 — l'objet et sa fiche. L'ordre du DOM (carte, fiche, action)
          est l'ordre de lecture mobile ; la grille desktop replace l'action
          sous la carte sans le changer. */}
      <div className="mt-8 lg:mt-9 lg:grid lg:grid-cols-[348px_minmax(0,340px)] lg:grid-rows-[auto_1fr] lg:gap-x-14">
        <div className="w-full max-w-[348px] lg:col-start-1 lg:row-start-1">
          <VirtualCard
            size="lg"
            brand={primaryCard.brand}
            number={primaryCard.maskedNumber}
            holder={primaryCard.holder}
            expiry={primaryCard.expiry}
          />
        </div>

        <div className="mt-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0">
          <SectionLabel>Informations de la carte</SectionLabel>
          <dl className="border-border divide-border mt-1.5 divide-y border-t">
            {cardFacts.map(({ label, value }) => (
              <div
                key={label}
                className="flex items-baseline justify-between gap-4 py-2.5"
              >
                <dt className="text-text-muted shrink-0 text-[11.5px] leading-[15px]">
                  {label}
                </dt>
                <dd className="text-text text-right text-[13px] leading-[18px] font-semibold [word-spacing:0.16em]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Groupe 3 — la sortie, calée en pied de la colonne de la carte. */}
        <div className="mt-8 w-full max-w-[348px] lg:col-start-1 lg:row-start-2 lg:mt-0 lg:self-end lg:pt-8">
          <Button href={`/cards/${primaryCard.id}`}>Voir ma carte</Button>
          {/* Le conseil de l'ancien bandeau, rendu à sa nature : une action. */}
          <p className="mt-4 text-center">
            <Link
              href="/cards/top-up"
              className="text-primary-light text-[13.5px] leading-[18px] font-medium underline-offset-4 hover:underline"
            >
              Alimenter ma carte
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
