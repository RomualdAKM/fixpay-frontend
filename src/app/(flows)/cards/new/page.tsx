"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { AmountInput } from "@/components/ui/AmountInput";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SelectableRow } from "@/components/ui/SelectableRow";
import { StepProgress } from "@/components/ui/StepProgress";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { TransactionFacts } from "@/components/ui/TransactionFacts";
import { VirtualCard } from "@/components/ui/VirtualCard";
import { formatFcfa } from "@/lib/format";
import { cn } from "@/lib/utils";
import { countries, type CardBrand, type Country } from "@/lib/mock-data";

/** Le wizard n'est plus 5 barres anonymes : chaque étape porte son nom. */
const STEP_TITLES = [
  "Type de carte",
  "Pays",
  "Opérateur",
  "Numéro Mobile Money",
  "Confirmation",
];

/**
 * Indicatifs téléphoniques des pays desservis. Ils remplacent le carré bleu
 * vide qui tenait lieu de drapeau (audit : « la tuile est carrément vide »)
 * et alimentent le champ de l'étape 4.
 */
const DIAL_CODES: Record<string, string> = {
  BJ: "+229",
  BF: "+226",
  CI: "+225",
  ML: "+223",
  SN: "+221",
  TG: "+228",
};

/**
 * Opérateurs Mobile Money réellement disponibles par pays. La liste unique de
 * 4 opérateurs partageant le même sous-titre (« Paiement instantané ») et la
 * même icône était le gabarit à l'état pur : le choix dépend maintenant de
 * l'étape précédente, et chaque nom se suffit à lui-même.
 */
const MOBILE_MONEY: Record<string, string[]> = {
  BJ: ["MTN MoMo", "Moov Money", "Celtiis Cash"],
  BF: ["Orange Money", "Moov Money"],
  CI: ["Orange Money", "MTN MoMo", "Moov Money", "Wave"],
  ML: ["Orange Money", "Moov Money"],
  SN: ["Orange Money", "Wave", "Free Money"],
  TG: ["T-Money", "Flooz"],
};

function operatorsFor(code: string): string[] {
  return MOBILE_MONEY[code] ?? [];
}

/** Bénin — premier pays de la liste. */
const DEFAULT_COUNTRY = countries[0]!;

/**
 * Catalogue des deux cartes achetables.
 *
 * CE BLOC EST DU CONTENU DE CATALOGUE : sa place est dans `lib/mock-data`
 * (aux côtés de `cards`), pas dans la page. Il y est écrit ici parce que
 * `mock-data` n'est pas modifiable dans ce lot ; voir la note de livraison.
 *
 * Le reproche bloquant de l'écran 09 portait sur deux slots symétriques
 * remplis à l'identique : même prix (3 000 / 3 000) et même ligne de specs mot
 * pour mot. Les deux offres se distinguent maintenant sur les QUATRE critères
 * qui décident réellement d'un achat de carte virtuelle en zone UEMOA — prix
 * d'émission, plafond mensuel, frais de conversion, couverture du réseau — et
 * chaque critère est rendu sur la même ligne des deux fiches, donc comparable
 * d'un coup d'œil.
 */
interface CardOffer {
  brand: CardBrand;
  title: string;
  subtitle: string;
  /** Prix d'émission, prélevé une fois, en FCFA. */
  price: number;
  /** Plafond de dépense mensuel, en FCFA. */
  monthlyLimit: number;
  /** Frais appliqués à un paiement libellé dans une autre devise. */
  fxFee: string;
  /** Couverture du réseau, formulée comme un critère de choix. */
  acceptance: string;
  recommended?: boolean;
}

/*
 * COPIE CALIBRÉE SUR LA BOÎTE, et non écrite puis subie. Les deux fiches sont
 * lues côte à côte à ≥lg : chaque valeur y dispose d'environ 195px. « La plus
 * large en Afrique de l'Ouest » y passait à la ligne et laissait « l'Ouest »
 * orphelin, ferré à droite, sur la seule fiche sélectionnée — ce qui suffisait
 * à décaler tout son tableau et à rompre l'alignement ligne à ligne des deux
 * offres. Les sous-titres, eux, tenaient sur deux lignes en mobile : c'est
 * ~17px par fiche, pris sur un premier viewport où la seconde offre était déjà
 * tranchée par la barre de récap.
 */
const cardOffers: CardOffer[] = [
  {
    brand: "visa",
    title: "Visa Virtuelle",
    subtitle: "Le quotidien, au meilleur prix",
    price: 3_000,
    monthlyLimit: 500_000,
    fxFee: "1,5 % du montant",
    acceptance: "Partout en Afrique de l'Ouest",
    recommended: true,
  },
  {
    brand: "mastercard",
    title: "Mastercard Virtuelle",
    subtitle: "Gros paiements et sites étrangers",
    price: 5_000,
    monthlyLimit: 1_000_000,
    fxFee: "0,8 % du montant",
    acceptance: "Les sites qui refusent Visa",
  },
];

/** Les quatre lignes comparables d'une offre, dans le même ordre partout. */
function offerSpecs(offer: CardOffer): { label: string; value: string }[] {
  return [
    { label: "Prix d'émission", value: `${formatFcfa(offer.price)} une fois` },
    { label: "Plafond mensuel", value: formatFcfa(offer.monthlyLimit) },
    { label: "Paiement en devise", value: offer.fxFee },
    { label: "Acceptation", value: offer.acceptance },
  ];
}

/**
 * Fiche d'offre de l'étape 1.
 *
 * Trois corrections de composition par rapport à la version précédente :
 * - le titre n'est plus mis en balance avec le prix sur une seule ligne, donc
 *   il n'est plus tronqué (« Mastercard… », « Visa Vir… ») ni le sous-titre ;
 * - la sélection est portée par la bordure plus une coche de 16px posée
 *   contre le titre, à la place de la pastille de 20px qui flottait seule à
 *   droite en creusant un trou horizontal au milieu de la rangée ;
 * - les valeurs contractuelles (plafond, frais) sont en `text-text` plein et
 *   non plus en bleu-gris pâle sur la teinte de l'option sélectionnée.
 *
 * ALIGNEMENT LIGNE À LIGNE DES DEUX FICHES (reproche desktop) : « Prix
 * d'émission » tombait 56px plus bas à gauche qu'à droite, « Acceptation »
 * pareil, et les deux conteneurs n'avaient pas la même hauteur. La cause
 * n'était pas le tableau mais l'EN-TÊTE : le tag « Recommandé » était posé
 * SOUS le sous-titre, sur une fiche seulement, et poussait de 27px tout ce
 * qui le suivait. Il remonte sur la ligne du titre, où il ne coûte pas un
 * pixel de hauteur : les deux en-têtes mesurent alors exactement la hauteur
 * de la vignette (50px) et les deux tableaux démarrent sur la même ligne,
 * sans réservation d'espace vide ni hauteur imposée de l'extérieur.
 *
 * C'est ce qui a fixé la largeur desktop de l'écran (880 et non 720) : sous
 * 800px de colonne, titre + coche + tag ne tiennent pas sur une ligne dans
 * une fiche de deux colonnes, et le tag repassait dessous — donc le décalage
 * revenait. La largeur est ici une conséquence de la composition, pas un
 * réglage.
 */
function CardOfferCard({
  offer,
  selected,
  onSelect,
}: {
  offer: CardOffer;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "w-full rounded-md border p-4 text-left",
        "focus-visible:ring-primary/60 transition-colors focus-visible:ring-2 focus-visible:outline-none",
        selected
          ? "border-primary bg-primary-surface"
          : "border-border bg-surface hover:border-border-strong hover:bg-surface-2",
      )}
    >
      <span className="flex items-start gap-[13px]">
        <VirtualCard size="mini" brand={offer.brand} />
        <span className="min-w-0 flex-1">
          <span className="flex items-start gap-1.5">
            <span className="text-text text-[15px] leading-[20px] font-bold">
              {offer.title}
            </span>
            {selected && (
              <Check
                size={16}
                strokeWidth={2.5}
                absoluteStrokeWidth
                aria-hidden="true"
                className="text-primary mt-[3px] shrink-0"
              />
            )}
            {offer.recommended && (
              <span className="bg-primary-tint text-primary mt-[1px] inline-flex h-[19px] shrink-0 items-center rounded-full px-2 text-[10.5px] font-semibold">
                Recommandé
              </span>
            )}
          </span>
          <span className="text-text-secondary mt-[3px] block text-[12.5px] leading-[17px]">
            {offer.subtitle}
          </span>
        </span>
      </span>

      {/* Les 4 mêmes critères sur les 2 fiches, ligne à ligne : c'est le
          tableau comparatif qui manquait, pas une ligne de puces à recopier.
          `min-h` verrouille le pas des rangées : une valeur un peu plus longue
          d'un côté ne peut plus décaler la fiche voisine. */}
      <span className="border-border divide-border mt-3 block divide-y border-t">
        {offerSpecs(offer).map((spec) => (
          <span
            key={spec.label}
            className="flex min-h-[28px] items-baseline justify-between gap-4 py-1.5"
          >
            <span className="text-text-secondary shrink-0 text-[12px] leading-[16px]">
              {spec.label}
            </span>
            <span className="text-text text-right text-[12.5px] leading-[16px] font-medium">
              {spec.value}
            </span>
          </span>
        ))}
      </span>
    </button>
  );
}

/**
 * Écran 09 · Créer Carte — « Acheter une carte », wizard 5 étapes
 * (1 Type · 2 Pays · 3 Opérateur · 4 Numéro · 5 Confirmation) dont chaque
 * étape est nommée. Le CTA est épinglé au-dessus de la nav avec le total.
 * Fin → /cards/new/success.
 */
export default function CreateCardPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [brand, setBrand] = useState<CardBrand>("visa");
  const [name, setName] = useState("");
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [operator, setOperator] = useState(
    operatorsFor(DEFAULT_COUNTRY.code)[0] ?? "",
  );
  const [phone, setPhone] = useState("");

  const offer = cardOffers.find((o) => o.brand === brand) ?? cardOffers[0]!;
  // Le total suit désormais l'offre choisie : les deux prix étant distincts,
  // le récap épinglé change quand on change de carte.
  const price = formatFcfa(offer.price);
  const dialCode = DIAL_CODES[country.code] ?? "";
  const phonePlaceholder = `${dialCode} 00 00 00 00`;

  /**
   * Sous-ligne de l'en-tête d'étape : elle n'existe que là où l'étape dépend
   * d'un choix déjà fait. La liste d'opérateurs est celle du pays retenu, et
   * c'est la seule chose que le titre « Opérateur » ne dit pas.
   */
  const stepHint = step === 3 ? `${country.name} · ${dialCode}` : null;

  /** Changer de pays change la liste d'opérateurs : le choix se réinitialise. */
  function selectCountry(next: Country) {
    setCountry(next);
    setOperator(operatorsFor(next.code)[0] ?? "");
  }

  function handleContinue() {
    if (step >= 5) {
      router.push("/cards/new/success");
      return;
    }
    setStep((s) => s + 1);
  }

  return (
    <>
      <main className="flex-1 px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[880px] lg:px-10 lg:pt-9 lg:pb-12">
        <PageHeader title="Acheter une carte" backHref="/profile" />

        {/* ---- En-tête de wizard ----
            « Étape 1 sur 5 · Type de carte » puis, 30px plus bas, un
            SectionLabel « Choisissez votre carte » : les deux disaient la même
            chose, et sur les étapes 4 et 5 le second recopiait le premier mot
            pour mot (« Numéro Mobile Money », « Confirmation »). Le nom de
            l'étape devient le TITRE de l'écran, le compteur passe à droite en
            atténué, et les libellés redondants sont supprimés — ~30px rendus
            au premier viewport, et une hiérarchie au lieu de deux étiquettes
            de même niveau. Le seul SectionLabel restant, « Nom sur la carte »,
            coiffe un second bloc à l'intérieur d'une étape : c'est son rôle. */}
        <div className="mt-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-text text-[15px] leading-[20px] font-semibold">
              {STEP_TITLES[step - 1]}
            </h2>
            <span className="text-text-muted shrink-0 text-[12.5px] leading-[16px]">
              Étape {step} sur 5
            </span>
          </div>
          {stepHint ? (
            <p className="text-text-muted mt-1 text-[11.5px] leading-[15px]">
              {stepHint}
            </p>
          ) : null}
          <div className="mt-2">
            <StepProgress steps={5} current={step} />
          </div>
        </div>

        {step === 1 && (
          <section className="mt-6">
            <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-4">
              {cardOffers.map((option) => (
                <CardOfferCard
                  key={option.brand}
                  offer={option}
                  selected={brand === option.brand}
                  onSelect={() => setBrand(option.brand)}
                />
              ))}
            </div>

            {/* Le champ ne porte plus de `max-w` : à ≥lg il s'arrêtait à
                420px quand la grille d'offres juste au-dessus courait sur
                640px — deux blocs empilés de la même colonne sans bord droit
                commun. Une colonne, un bord. */}
            <SectionLabel className="mt-8">Nom sur la carte</SectionLabel>
            <div className="mt-2">
              <AmountInput
                variant="text"
                value={name}
                onChange={setName}
                placeholder="Jean Dupont"
                ariaLabel="Nom sur la carte"
              />
            </div>
            <p className="text-text-muted mt-2 text-[11.5px] leading-[15px]">
              Tel qu&apos;il apparaîtra sur la face de la carte, en majuscules.
            </p>
          </section>
        )}

        {step === 2 && (
          <section className="mt-6">
            <div className="flex flex-col gap-2.5 lg:grid lg:grid-cols-2 lg:gap-3">
              {countries.map((c) => (
                <SelectableRow
                  key={c.code}
                  title={c.name}
                  height={64}
                  selected={country.code === c.code}
                  leading={
                    <span className="text-text-secondary w-[42px] shrink-0 font-mono text-[13px] leading-[17px] tracking-[0.5px]">
                      {DIAL_CODES[c.code]}
                    </span>
                  }
                  onSelect={() => selectCountry(c)}
                />
              ))}
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="mt-6">
            <div className="flex flex-col gap-2.5 lg:grid lg:grid-cols-2 lg:gap-3">
              {operatorsFor(country.code).map((op) => (
                <SelectableRow
                  key={op}
                  title={op}
                  height={56}
                  selected={operator === op}
                  onSelect={() => setOperator(op)}
                />
              ))}
            </div>
            <p className="text-text-muted mt-3 text-[11.5px] leading-[15px]">
              Le débit de {price} ({offer.title}) est immédiat, sans frais
              d&apos;opérateur.
            </p>
          </section>
        )}

        {step === 4 && (
          <section className="mt-6 lg:max-w-[520px]">
            <AmountInput
              variant="text"
              value={phone}
              onChange={setPhone}
              placeholder={phonePlaceholder}
              ariaLabel="Numéro Mobile Money"
            />
            <p className="text-text-secondary mt-2.5 text-[12.5px] leading-[20px]">
              Numéro {operator} ({country.name}, {dialCode}). Vous recevrez une
              demande de confirmation sur ce téléphone.
            </p>
          </section>
        )}

        {step === 5 && (
          <section className="mt-6">
            <GlassCard className="divide-border divide-y px-[17px] lg:max-w-[520px] lg:px-6">
              {[
                { label: "Type de carte", value: offer.title },
                {
                  label: "Nom sur la carte",
                  value: (name || "Jean Dupont").toUpperCase(),
                },
                {
                  label: "Plafond mensuel",
                  value: formatFcfa(offer.monthlyLimit),
                },
                { label: "Paiement en devise", value: offer.fxFee },
                { label: "Pays", value: country.name },
                { label: "Opérateur", value: operator },
                { label: "Numéro", value: phone || phonePlaceholder },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex h-[47px] items-center justify-between gap-3"
                >
                  <span className="text-text-secondary shrink-0 text-[12.5px]">
                    {row.label}
                  </span>
                  <span className="text-text min-w-0 truncate text-right text-[13.5px] font-medium">
                    {row.value}
                  </span>
                </div>
              ))}
              <div className="flex h-[47px] items-center justify-between">
                <span className="text-text-secondary text-[12.5px]">
                  Prix de la carte
                </span>
                <span className="text-text text-[14px] font-bold">{price}</span>
              </div>
            </GlassCard>

            {/* Frais et délai de l'achat, à plat, avant de payer. */}
            <div className="mt-4 lg:max-w-[520px]">
              <TransactionFacts fee="Gratuit" delay="Activation immédiate" />
            </div>
          </section>
        )}

        {/* CTA épinglé au-dessus de la nav sur mobile. Sur desktop la barre
            redevient statique : elle prend une marge haute et un filet, et
            récap et bouton partagent une seule rangée — donc un axe commun —
            au lieu d'un montant collé à droite d'une colonne de 640px face à
            un bouton de 150px aligné à gauche. */}
        <StickyActionBar>
          <div className="lg:border-border lg:mt-10 lg:flex lg:max-w-[520px] lg:items-center lg:justify-between lg:gap-6 lg:border-t lg:pt-5">
            <div className="mb-3 flex items-baseline justify-between gap-3 lg:mb-0 lg:block">
              <span className="text-text-secondary text-[12.5px] leading-[16px]">
                Total · payé via {step >= 3 ? operator : "Mobile Money"}
              </span>
              <span className="text-text block shrink-0 text-[14px] leading-[18px] font-semibold lg:mt-0.5 lg:text-[17px] lg:leading-[22px]">
                {price}
              </span>
            </div>
            <Button
              onClick={handleContinue}
              className="lg:w-auto lg:shrink-0 lg:px-10"
            >
              {step === 5 ? `Payer ${price}` : "Continuer"}
            </Button>
          </div>
        </StickyActionBar>
      </main>

      <BottomNav />
    </>
  );
}
