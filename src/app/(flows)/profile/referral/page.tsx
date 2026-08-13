"use client";

import { useEffect, useRef, useState } from "react";

import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { HeroGradientCard } from "@/components/ui/HeroGradientCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { referral } from "@/lib/mock-data";
import { formatFcfa } from "@/lib/format";

/** Lien de parrainage dérivé du code — l'écran n'en exposait aucun. */
const SHARE_HOST = "fixpay.app/r";
const SHARE_URL = `https://${SHARE_HOST}/${referral.code}`;
const SHARE_TEXT = `J'utilise FixPay pour payer en ligne depuis mon Mobile Money. Inscrivez-vous avec mon code ${referral.code} et nous recevons chacun ${referral.reward} : ${SHARE_URL}`;
const WHATSAPP_URL = `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT)}`;

/** Compteur de parrainage — l'état vide de l'écran n'en portait aucun. */
const FUNNEL: Array<{ label: string; value: string }> = [
  { label: "Gagné", value: formatFcfa(0) },
  { label: "Invitations", value: "0" },
  { label: "Inscrits", value: "0" },
];

/**
 * Écran 17 · Parrainage — bandeau promotionnel, compteur de gains, code et
 * lien à plat sur le fond, funnel des filleuls, partage épinglé.
 *
 * Recomposition post-audit : la prime est libellée en FCFA (« €10 » collé
 * devant le nombre était une copie générée en anglais puis traduite), le code
 * et la liste quittent leurs cartes pour se poser à plat comme sur les écrans
 * 14/15, l'interlettrage du code redescend à 0,5px, le pavé bleu « Copier »
 * devient un bouton texte, et l'écran gagne enfin ce qui lui manquait : un
 * lien, un partage natif et WhatsApp en premier raccourci.
 */
export default function ReferralPage() {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const copyTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    },
    [],
  );

  const flash = (target: "code" | "link") => {
    setCopied(target);
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(null), 1600);
  };

  const copy = (value: string, target: "code" | "link") => {
    void navigator.clipboard?.writeText(value).catch(() => {});
    flash(target);
  };

  const handleShare = () => {
    // Partage natif quand la plateforme le propose, copie du lien sinon.
    const share = navigator.share?.bind(navigator);
    if (share) {
      void share({ title: "FixPay", text: SHARE_TEXT, url: SHARE_URL }).catch(
        () => {
          // Partage annulé par l'utilisateur : aucun repli nécessaire.
        },
      );
      return;
    }
    copy(SHARE_URL, "link");
  };

  return (
    <>
      <main className="px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[720px] lg:px-10 lg:pt-9 lg:pb-12">
        <PageHeader title="Parrainage" backHref="/profile" />

        <HeroGradientCard className="mt-3.5 lg:mt-6 lg:p-7">
          <h2 className="text-[16px] leading-[21px] font-bold text-white">
            Gagnez {referral.reward} par ami
          </h2>
          <p className="mt-[10px] max-w-[298px] text-[12.5px] leading-[20px] text-white/70 lg:max-w-[440px]">
            Votre filleul reçoit {referral.reward} à son inscription. Vous
            recevez {referral.reward} sur votre portefeuille dès sa première
            recharge de {formatFcfa(5_000)} ou plus.
          </p>
        </HeroGradientCard>

        {/* Compteur à plat, sans carte : trois chiffres séparés par un filet. */}
        <dl className="divide-border mt-5 grid grid-cols-3 divide-x">
          {FUNNEL.map((item) => (
            <div key={item.label} className="px-3.5 first:pl-0 last:pr-0">
              <dt className="text-text-muted text-[11.5px] leading-[15px]">
                {item.label}
              </dt>
              <dd className="text-text mt-[3px] text-[13.5px] leading-[18px] font-medium">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <SectionLabel className="mt-6">Votre code de parrainage</SectionLabel>
        <div className="border-border mt-2 flex items-center justify-between gap-4 border-y py-3.5">
          {/*
            La chasse fixe suffit à la lisibilité caractère par caractère :
            l'ancien tracking de 2px dissociait le code (« F P - J D 2 0 2 4 »).
          */}
          <span className="text-text font-mono text-[21px] leading-[27px] font-medium tracking-[0.5px]">
            {referral.code}
          </span>
          <button
            type="button"
            onClick={() => copy(referral.code, "code")}
            className="text-primary focus-visible:ring-primary/60 shrink-0 rounded-sm text-[13px] font-medium focus-visible:ring-2 focus-visible:outline-none"
          >
            {copied === "code" ? "Copié !" : "Copier"}
          </button>
        </div>
        <div className="border-border flex items-center justify-between gap-4 border-b py-3.5">
          <span className="text-text-secondary min-w-0 truncate font-mono text-[12.5px] leading-[17px]">
            {SHARE_HOST}/{referral.code}
          </span>
          <button
            type="button"
            onClick={() => copy(SHARE_URL, "link")}
            className="text-primary focus-visible:ring-primary/60 shrink-0 rounded-sm text-[13px] font-medium focus-visible:ring-2 focus-visible:outline-none"
          >
            {copied === "link" ? "Copié !" : "Copier le lien"}
          </button>
        </div>

        <SectionLabel className="mt-6">Mes parrainages</SectionLabel>
        <p className="text-text-muted mt-1.5 text-[12.5px] leading-[19px]">
          Aucun filleul pour l&apos;instant. Un ami est compté lorsqu&apos;il
          s&apos;inscrit avec votre code, valide sa vérification d&apos;identité
          et effectue une première recharge d&apos;au moins {formatFcfa(5_000)}.
          La prime est créditée sous 48 h.
        </p>

        <StickyActionBar>
          <div className="flex gap-2.5">
            <Button
              variant="glass"
              href={WHATSAPP_URL}
              className="w-auto shrink-0 px-5"
            >
              WhatsApp
            </Button>
            <Button onClick={handleShare} className="flex-1">
              Partager mon lien
            </Button>
          </div>
        </StickyActionBar>
      </main>

      <BottomNav />
    </>
  );
}
