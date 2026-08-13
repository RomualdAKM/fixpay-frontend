import Link from "next/link";
import { Fragment } from "react";
import { ChevronDown } from "lucide-react";

import { FixPayLogo } from "@/components/brand/FixPayLogo";
import { Button } from "@/components/ui/Button";
import { VirtualCard } from "@/components/ui/VirtualCard";
import { formatFcfa } from "@/lib/format";
import { cards } from "@/lib/mock-data";

export const metadata = { title: "Onboarding" };

/**
 * Rails de rechargement réellement pris en charge. Ils étaient cités en texte
 * courant au milieu du paragraphe (« …rechargez-la depuis Orange Money, Wave ou
 * MTN… ») : la preuve locale, qui est LA raison d'ouvrir un compte ici, était
 * noyée dans une phrase de vente. Elle est dessinée, à sa place dans le
 * parcours — juste avant le CTA.
 */
const RAILS = ["Orange Money", "Wave", "MTN"];

/**
 * LA CONTREPARTIE CHIFFRÉE (re-notation, défaut de finition n° 5 : « aucune
 * friction annoncée : ni frais d'émission, ni délai, ni plafond, alors que
 * l'écran promet en quelques minutes »).
 *
 * Les trois nombres ne sont pas inventés pour l'occasion : ce sont ceux que le
 * produit tient déjà ailleurs — 3 000 FCFA est le total facturé par l'écran 09
 * (Créer une carte), le plafond est celui des cartes du compte
 * (`monthlyLimit`, repris tel quel par les écrans 02, 10 et 24), et le délai
 * est celui qu'annonce la FAQ de l'écran 26. Une promesse commerciale et son
 * coût sont donc lus dans le même viewport, avant le bouton, et pas après.
 */
const FACTS = [
  { label: "Émission", value: "3 000 FCFA" },
  { label: "Délai", value: "sous 5 min" },
  { label: "Plafond mensuel", value: formatFcfa(cards[0]!.monthlyLimit) },
];

/**
 * Écran 01 · Onboarding — plein écran sans navigation.
 *
 * ÉTAPE 12 · LE THÈME, L'ÉCHELLE ET LA CONTREPARTIE. Trois défauts « notable »
 * relevés sur les captures, tous traités ici :
 *
 * 1. LE THÈME CLAIR N'EXISTAIT PAS SUR CET ÉCRAN. La capture mobile-light
 *    était rigoureusement identique à la sombre : l'écran portait
 *    `data-theme="dark"` en dur, seul de tout le produit. L'exception avait été
 *    argumentée (pré-auth, aucune préférence connue), mais elle ne tient pas :
 *    le sélecteur de thème du produit retombe sur `prefers-color-scheme` tant
 *    qu'aucun compte n'existe (voir docs/THEMING.md) — une préférence EST donc
 *    connue avant l'authentification, et c'est même le seul moment où elle ne
 *    peut venir que du système. L'épinglage est retiré : l'écran suit le thème
 *    comme les 27 autres. Ce qui devait rester bleu nuit le reste sans lui —
 *    la carte s'épingle elle-même (`VirtualCard`), c'est sa livrée d'objet.
 *    Le reste de l'écran n'utilise que des tokens (`bg-bg`, `text-text`,
 *    `text-tagline`, `border-border`, `text-primary-light`), tous définis dans
 *    les deux palettes : rien à corriger pour la lisibilité en clair.
 *
 * 2. LA TYPOGRAPHIE MONTE AVEC LE VIEWPORT. Elle DESCENDAIT : le titre héros
 *    perdait du corps relatif en passant de 390 à 1440 de large, et la mention
 *    légale tombait à la limite du lisible. Le contraste typographique gagné en
 *    mobile était perdu au grand format, exactement à l'inverse de ce que fait
 *    une échelle. Le titre passe de 44 à 56px en `lg`, le paragraphe de 15 à
 *    17, la mention légale de 12 à 13 : chaque niveau grandit, et l'écart entre
 *    les niveaux grandit avec lui.
 *
 * 3. LA COMPOSITION DESKTOP EST TENUE PAR TROIS ANCRAGES, PLUS PAR UN SEUL.
 *    Le contenu occupait une bande centrale de ~400px dans 900 de haut, avec
 *    ~200px de vide sous le logo et ~250px sous le bloc légal : une seule masse
 *    flottant au milieu. La page a maintenant un HAUT (marque et pays), un
 *    MILIEU (le hero, seul élément centré dans la hauteur restante) et un BAS
 *    (le pied de page, collé en bas par le `lg:flex-1` du hero). Les deux vides
 *    ne sont pas comblés par de la décoration : le bas de page porte les deux
 *    questions qu'un onboarding fintech doit trancher — ce qu'il faut pour
 *    ouvrir un compte, et où sont gardés les fonds — et le bandeau de faits
 *    porte le prix, le délai et le plafond. Le mou résiduel se répartit à
 *    parts égales au-dessus et au-dessous du hero, où il ne sépare rien.
 *
 * CE QUI RESTE (assumé) : la face de la carte est un aplat dégradé sans
 * matière ni gravure. `VirtualCard` est un composant partagé par sept écrans,
 * hors de ce lot ; le traiter ici en produirait une huitième variante.
 *
 * Rappel des décisions antérieures conservées : une seule échelle d'intervalles
 * (8/12/16/24/32), un seul rail gauche (la carte prend la mesure exacte du
 * contenu), un seul traitement de marque (lettrage `ink` pour l'application, le
 * lockup gravé restant à la carte), et le porteur « VOTRE NOM » — convention de
 * spécimen sur un écran où l'utilisateur n'a pas encore de carte.
 */
export default function OnboardingPage() {
  return (
    <main className="bg-bg flex min-h-dvh flex-col">
      {/* Largeur de composition figée à 390px (canvas du spec) : les césures du
          bloc discours restent identiques sur le shell 430px. */}
      <div className="mx-auto flex w-full max-w-[390px] flex-1 flex-col px-6 pt-10 pb-8 lg:max-w-[1200px] lg:px-10 lg:pt-10 lg:pb-10">
        {/* Groupe 1 — marque. Le sélecteur pays/langue partage la ligne du
            wordmark : il ne coûte pas un intervalle de plus, et un onboarding
            fintech ouest-africain doit dire, avant tout, sur quel pays il
            ouvre le compte. */}
        <header className="flex items-start justify-between gap-4">
          <div>
            {/* La largeur est une PROP, pas une classe : le composant en
                déduit la hauteur intrinsèque et la pose en attribut. Un
                `lg:w-[…]` écraserait la largeur sans la hauteur et déformerait
                le lettrage. */}
            <FixPayLogo variant="wordmark" tone="ink" width={132} />
            <p className="text-tagline mt-2 text-[13px] leading-[17px] lg:mt-2.5 lg:text-[14px] lg:leading-[19px]">
              La carte virtuelle en FCFA
            </p>
          </div>
          <button
            type="button"
            className="border-border text-text-secondary hover:bg-surface inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] leading-[16px] transition-colors lg:px-3.5 lg:py-2 lg:text-[13px]"
          >
            Sénégal · Français
            <ChevronDown
              size={13}
              strokeWidth={1.5}
              absoluteStrokeWidth
              className="text-icon-muted"
              aria-hidden
            />
          </button>
        </header>

        {/* Hero : sur desktop, discours à gauche, carte à droite, centrés dans
            la hauteur restante. Sur mobile la carte reste en tête du DOM, donc
            juste sous la marque — c'est l'ordre de lecture voulu : on montre
            l'objet avant d'en parler. */}
        <div className="lg:grid lg:flex-1 lg:grid-cols-[minmax(0,1fr)_540px] lg:content-center lg:items-center lg:gap-x-20">
          {/* Groupe 2 — l'objet. Fluide : il prend la mesure exacte du contenu,
              donc le même rail gauche que tout le reste de l'écran. */}
          <div className="mt-8 lg:col-start-2 lg:row-start-1 lg:mt-0 lg:flex lg:h-[341px] lg:w-[540px] lg:items-center lg:justify-center">
            <div className="w-full lg:w-[348px] lg:scale-[1.552]">
              <VirtualCard size="lg" holder="VOTRE NOM" />
            </div>
          </div>

          <div className="mt-8 lg:col-start-1 lg:row-start-1 lg:mt-0">
            {/* Groupe 3 — le discours. L'échelle MONTE avec le viewport :
                32 → 56 sur le titre, 13,5 → 17 sur le paragraphe. */}
            <h1 className="text-text text-[32px] leading-[36px] font-bold tracking-[-0.8px] lg:max-w-[500px] lg:text-[56px] lg:leading-[60px] lg:tracking-[-1.6px]">
              Payez partout, en toute sécurité
            </h1>
            <p className="text-text-secondary mt-3 text-[13.5px] leading-[23px] lg:mt-4 lg:max-w-[470px] lg:text-[17px] lg:leading-[28px]">
              Créez votre carte Visa virtuelle en quelques minutes et payez sur
              tous les sites, sans compte bancaire.
            </p>

            {/* Ce que ça coûte, en combien de temps, jusqu'à quel montant —
                puis d'où l'on recharge. Un seul objet bordé pour les deux :
                ce sont les mêmes conditions d'usage, elles ne méritent pas
                deux bandeaux. Aucune tuile d'icône, aucune couleur
                d'opérateur : les marques sont nommées, la ligne reste dans la
                palette du produit. */}
            <div className="border-border mt-6 rounded-md border lg:mt-7 lg:max-w-[470px]">
              <dl className="divide-border grid grid-cols-3 divide-x">
                {FACTS.map((fact) => (
                  <div key={fact.label} className="px-3 py-2.5 lg:px-4 lg:py-3">
                    <dt className="text-text-muted text-[11px] leading-[15px]">
                      {fact.label}
                    </dt>
                    <dd className="text-text mt-[2px] text-[12.5px] leading-[16px] font-medium lg:text-[13.5px] lg:leading-[18px]">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="border-border flex flex-wrap items-center gap-x-2.5 gap-y-1.5 border-t px-3 py-2.5 lg:px-4 lg:py-3">
                <span className="text-text-muted text-[11.5px] leading-[16px]">
                  Rechargez depuis
                </span>
                {RAILS.map((rail, index) => (
                  <Fragment key={rail}>
                    {index > 0 ? (
                      <span
                        aria-hidden
                        className="bg-border-strong h-3 w-px shrink-0"
                      />
                    ) : null}
                    <span className="text-text-secondary text-[12.5px] leading-[16px] font-medium lg:text-[13px]">
                      {rail}
                    </span>
                  </Fragment>
                ))}
              </div>
            </div>

            {/* Groupe 4 — l'action. */}
            <div className="mt-8 lg:mt-9">
              <Button
                variant="primary"
                href="/"
                className="lg:h-[54px] lg:w-auto lg:px-12 lg:text-[16px]"
              >
                Commencer
              </Button>
              {/* Action secondaire : un lien, pas un second bouton de même masse. */}
              <p className="text-text-secondary mt-4 text-[15px] leading-[20px] lg:text-[16px] lg:leading-[22px]">
                Déjà un compte ?{" "}
                <Link
                  href="/"
                  className="text-primary-light font-semibold underline-offset-4 hover:underline"
                >
                  Se connecter
                </Link>
              </p>
              {/* Mention légale : obligation d'un onboarding fintech (audit [N]).
                  Rattachée au groupe d'action, à 16px — elle qualifie le geste
                  « Commencer », elle n'est pas un septième bloc de la page.
                  Elle grandit elle aussi en desktop : à 11px elle était à la
                  limite du lisible sur 1440 de large. */}
              <p className="text-text-secondary mt-4 max-w-[340px] text-[12px] leading-[18px] lg:max-w-[470px] lg:text-[13px] lg:leading-[20px]">
                En continuant, vous acceptez nos{" "}
                <Link
                  href="/"
                  className="text-primary-light underline-offset-4 hover:underline"
                >
                  Conditions générales
                </Link>{" "}
                et notre{" "}
                <Link
                  href="/"
                  className="text-primary-light underline-offset-4 hover:underline"
                >
                  Politique de confidentialité
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Pied de page — le troisième ancrage de la composition desktop, et
            les deux seules questions qu'un onboarding fintech laisse sans
            réponse quand il se contente d'un CTA : de quoi ai-je besoin pour
            ouvrir, et qui détient mon argent. Le seuil de 200 000 FCFA est
            celui de la FAQ (écran 26), la conservation 5 ans celle de l'écran
            12 : aucune donnée nouvelle n'est inventée ici. */}
        <footer className="border-border mt-10 grid gap-6 border-t pt-5 lg:mt-8 lg:grid-cols-2 lg:gap-x-16 lg:pt-6">
          <div>
            <p className="text-text text-[13px] leading-[18px] font-medium">
              Pour ouvrir un compte
            </p>
            <p className="text-text-secondary mt-1.5 text-[12px] leading-[18px] lg:text-[12.5px] lg:leading-[19px]">
              Un numéro Mobile Money et une adresse e-mail suffisent. Une pièce
              d&apos;identité n&apos;est demandée qu&apos;au-delà de 200 000
              FCFA de mouvements cumulés.
            </p>
          </div>
          <div>
            <p className="text-text text-[13px] leading-[18px] font-medium">
              Où sont vos fonds
            </p>
            <p className="text-text-secondary mt-1.5 text-[12px] leading-[18px] lg:text-[12.5px] lg:leading-[19px]">
              Sur un compte de cantonnement ouvert chez une banque partenaire de
              la zone UEMOA, distinct des comptes de FixPay. Vos pièces sont
              chiffrées et conservées 5 ans.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
