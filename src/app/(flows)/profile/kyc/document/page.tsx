"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Camera, Check, FileText, Upload, X } from "lucide-react";

import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { SelectableRow } from "@/components/ui/SelectableRow";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { cn } from "@/lib/utils";

type DocTypeId = "cni" | "passport";

interface DocType {
  id: DocTypeId;
  title: string;
  subtitle: string;
}

interface UploadZone {
  id: string;
  label: string;
  /** Position dans la pièce (« 1 sur 2 ») — remplace l'icône « recharger ». */
  hint: string;
}

interface ZoneState {
  file?: { name: string; size: number };
  /**
   * Aperçu RÉEL de la face importée (objet URL). C'est le seul retour qui
   * prouve à l'utilisateur qu'il a photographié la bonne face ; un nom de
   * fichier et un poids ne le prouvent pas. Absent pour un PDF, qui n'est pas
   * rendu par un `<img>`.
   */
  previewUrl?: string;
  error?: string;
}

/**
 * En-tête de section de l'écran. 15px semi-bold sur --c-text : en 13px w500
 * text-secondary (SectionLabel), un en-tête de section était rigoureusement
 * du même style que le paragraphe d'introduction juste au-dessus.
 */
function SectionTitle({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "text-text text-[15px] leading-[20px] font-semibold",
        className,
      )}
    >
      {children}
    </h2>
  );
}

/* Données locales (absentes de mock-data.ts) */
const DOC_TYPES: DocType[] = [
  {
    id: "cni",
    title: "Carte nationale d'identité",
    subtitle: "Recto + verso requis",
  },
  {
    id: "passport",
    title: "Passeport",
    subtitle: "Page d'identité uniquement (photo + infos)",
  },
];

/**
 * Zones d'import — les libellés s'adaptent au type de document choisi.
 * L'icône « RotateCw » du verso a disparu : une flèche de rechargement pour
 * désigner la face arrière d'une carte était une attribution automatique par
 * proximité de mot. Les deux faces portent le glyphe de la pièce et se
 * distinguent par leur rang (1 sur 2 / 2 sur 2).
 */
const UPLOAD_ZONES: Record<DocTypeId, UploadZone[]> = {
  cni: [
    { id: "cni-recto", label: "Recto", hint: "1 sur 2" },
    { id: "cni-verso", label: "Verso", hint: "2 sur 2" },
  ],
  passport: [
    { id: "passport-page", label: "Page d'identité", hint: "1 sur 1" },
  ],
};

/**
 * Conditions d'acceptation. Elles étaient une SECTION à part (en-tête + quatre
 * puces, ~124px) posée en fin d'écran, donc exactement là où la barre d'action
 * la guillotinait en plein glyphe. Ce sont des contraintes de prise de vue :
 * leur place est sous les zones d'import, en une ligne de service compacte.
 */
const CHECKLIST = [
  "Document en cours de validité",
  "photo nette et non recadrée",
  "toutes les mentions visibles",
  "JPG, PNG ou PDF, 10 Mo max",
].join(" · ");

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_BYTES = 10 * 1024 * 1024;

/** Poids du fichier en Mo, virgule française. */
function formatSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} Mo`;
}

/**
 * Écran 13 · KYC Document — choix du type de pièce, zones d'import à ÉTATS
 * (vide / rempli / erreur), conditions à plat, CTA épinglé et inactif tant
 * que les faces requises ne sont pas importées.
 *
 * Recomposition post-audit : la zone d'import était le cœur fonctionnel de
 * l'écran et n'avait qu'un seul état ; le CTA était pleinement actif alors
 * qu'aucun fichier n'existait ; les coches vertes validaient des exigences
 * non encore vérifiées ; et le bleu de marque, posé sur chaque glyphe, ne
 * désignait plus la sélection.
 *
 * ÉTAPE 11 (composition) :
 * - le paragraphe d'introduction disparaît : « Assurez-vous que votre document
 *   est en cours de validité » redisait mot pour mot la première condition,
 *   54px plus haut. Un doublon en tête d'écran qui poussait tout le reste ;
 * - la section « Conditions » (en-tête + 4 puces) devient une ligne de service
 *   sous les zones d'import, où elle qualifie ce qu'elle décrit. Avec le
 *   doublon supprimé, l'écran ENTIER tient au-dessus de la barre d'action en
 *   390×780 : plus rien n'est guillotiné en plein glyphe ;
 * - le glyphe des zones d'import n'est plus `CreditCard`. Une icône de carte
 *   bancaire pour une carte nationale d'identité était une attribution par
 *   proximité de mot, et c'était en outre le glyphe exact de l'onglet
 *   « Cartes » de la BottomNav, 550px plus bas. C'est l'action qui est
 *   figurée — photographier —, la même pour les deux types de pièce ;
 * - desktop : la colonne passe de 720 à 840px, ce qui ramène la bande morte
 *   sidebar/contenu de ~270 à ~210px.
 */
export default function KycDocumentPage() {
  const [docType, setDocType] = useState<DocTypeId>("cni");
  const [zones, setZones] = useState<Record<string, ZoneState>>({});

  const currentZones = UPLOAD_ZONES[docType];
  const ready = currentZones.every((zone) => zones[zone.id]?.file);

  /* Les objets URL des aperçus sont révoqués au remplacement, au retrait et
     au démontage : sans cela chaque photo importée reste en mémoire. */
  const zonesRef = useRef(zones);
  useEffect(() => {
    zonesRef.current = zones;
  }, [zones]);
  useEffect(
    () => () => {
      Object.values(zonesRef.current).forEach((state) => {
        if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
      });
    },
    [],
  );

  const replaceZone = (zoneId: string, next: ZoneState) => {
    setZones((prev) => {
      const previous = prev[zoneId]?.previewUrl;
      if (previous) URL.revokeObjectURL(previous);
      return { ...prev, [zoneId]: next };
    });
  };

  const handleFile = (zoneId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Permet de réimporter le même fichier après une suppression.
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      replaceZone(zoneId, {
        error: "Format refusé — JPG, PNG ou PDF uniquement.",
      });
      return;
    }
    if (file.size > MAX_BYTES) {
      replaceZone(zoneId, {
        error: `Fichier trop lourd (${formatSize(file.size)}) — 10 Mo maximum.`,
      });
      return;
    }
    replaceZone(zoneId, {
      file: { name: file.name, size: file.size },
      previewUrl: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined,
    });
  };

  const clearZone = (zoneId: string) => {
    setZones((prev) => {
      const previous = prev[zoneId]?.previewUrl;
      if (previous) URL.revokeObjectURL(previous);
      const next = { ...prev };
      delete next[zoneId];
      return next;
    });
  };

  return (
    <>
      <main className="flex-1 px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[840px] lg:px-10 lg:pt-9 lg:pb-12">
        <PageHeader title="Pièce d'identité" backHref="/profile/kyc" />

        <SectionTitle className="mt-8">Type de document</SectionTitle>
        <div className="mt-3 space-y-2.5">
          {DOC_TYPES.map((doc) => (
            /* Plus d'IconTile : le même carré bleu devant deux lignes ne
               distinguait pas une CNI d'un passeport — le libellé le fait. */
            <SelectableRow
              key={doc.id}
              title={doc.title}
              subtitle={doc.subtitle}
              radioSize={20}
              selected={docType === doc.id}
              selectedVariant="outline"
              height={66}
              onSelect={() => setDocType(doc.id)}
            />
          ))}
        </div>

        <SectionTitle className="mt-8">Photos du document</SectionTitle>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {currentZones.map((zone) => {
            const state = zones[zone.id] ?? {};
            const inputId = `upload-${zone.id}`;
            const single = currentZones.length === 1;

            return (
              <div key={zone.id} className={cn(single && "col-span-2")}>
                <input
                  id={inputId}
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  className="peer sr-only"
                  onChange={(event) => handleFile(zone.id, event)}
                />

                {state.file ? (
                  /* État rempli : APERÇU de la face importée (le seul retour
                     qui prouve que la bonne face a été photographiée), puis
                     nom et poids, puis les deux actions. */
                  <div className="border-border bg-surface flex h-[118px] flex-col justify-between rounded-md border p-3.5">
                    <div className="flex items-start gap-2.5">
                      {state.previewUrl ? (
                        <span className="border-border relative h-10 w-14 shrink-0 overflow-hidden rounded-sm border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={state.previewUrl}
                            alt={`Aperçu — ${zone.label}`}
                            className="h-full w-full object-cover"
                          />
                          <span className="bg-success absolute right-0 bottom-0 flex size-[15px] items-center justify-center rounded-full">
                            <Check
                              size={9}
                              strokeWidth={3}
                              aria-hidden="true"
                              className="text-white"
                            />
                          </span>
                        </span>
                      ) : (
                        /* PDF : pas d'aperçu possible, le glyphe du format
                           tient lieu de vignette. */
                        <span className="bg-surface-2 border-border flex h-10 w-14 shrink-0 items-center justify-center rounded-sm border">
                          <FileText
                            size={16}
                            strokeWidth={1.5}
                            absoluteStrokeWidth
                            aria-hidden="true"
                            className="text-icon-muted"
                          />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="text-text block text-[12.5px] leading-[16px] font-medium">
                          {zone.label}
                        </span>
                        <span className="text-text-muted mt-[3px] block truncate text-[11.5px] leading-[15px]">
                          {state.file.name}
                        </span>
                        <span className="text-text-muted block text-[11.5px] leading-[15px]">
                          {formatSize(state.file.size)}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor={inputId}
                        className="text-primary cursor-pointer text-[12px] leading-[16px] font-medium"
                      >
                        Remplacer
                      </label>
                      <button
                        type="button"
                        onClick={() => clearZone(zone.id)}
                        className="text-text-muted hover:text-text inline-flex items-center gap-1 text-[12px] leading-[16px] font-medium transition-colors"
                      >
                        <X size={12} strokeWidth={2} aria-hidden="true" />
                        Retirer
                      </button>
                    </div>
                  </div>
                ) : (
                  /* État vide / erreur : filet 1px pointillé, fond au survol
                     pour signaler la zone cliquable. */
                  <label
                    htmlFor={inputId}
                    className={cn(
                      "hover:bg-surface flex h-[118px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-4 transition-colors",
                      // Desktop : la zone fait 320px de large — le contenu s'y
                      // aligne en ligne plutôt que de flotter au centre d'un
                      // rectangle presque vide.
                      "lg:flex-row lg:justify-start lg:gap-4 lg:px-6",
                      "peer-focus-visible:ring-primary/60 peer-focus-visible:ring-2",
                      state.error ? "border-danger" : "border-border-strong",
                    )}
                  >
                    {state.error ? (
                      <Upload
                        size={24}
                        strokeWidth={1.5}
                        aria-hidden="true"
                        className="text-danger shrink-0"
                      />
                    ) : (
                      <Camera
                        size={24}
                        strokeWidth={1.5}
                        aria-hidden="true"
                        className="text-icon-muted shrink-0"
                      />
                    )}
                    <span className="mt-2.5 flex flex-col items-center lg:mt-0 lg:items-start">
                      <span className="text-text text-[12.5px] leading-[16px] font-medium">
                        {zone.label}
                      </span>
                      {/* Le format accepté n'est plus redit ici : il est dans
                          la ligne de conditions, sous la grille. Une mention
                          qui n'existait qu'à lg faisait en outre de la zone
                          deux objets différents selon la largeur. */}
                      <span className="text-text-muted mt-[3px] text-[11.5px] leading-[15px]">
                        {zone.hint} · Importer
                      </span>
                    </span>
                  </label>
                )}

                {state.error && (
                  <p className="text-danger mt-1.5 text-[11.5px] leading-[15px]">
                    {state.error}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Conditions de prise de vue : rattachées aux zones qu'elles
            qualifient (8px), pas érigées en section de fin d'écran. */}
        <p className="text-text-secondary mt-2 text-[12px] leading-[18px]">
          {CHECKLIST}
        </p>

        {!ready && (
          <p className="text-text-muted mt-8 text-[12px] leading-[16px]">
            {docType === "cni"
              ? "Importez le recto et le verso pour pouvoir soumettre."
              : "Importez la page d'identité pour pouvoir soumettre."}
          </p>
        )}

        {/* L'état inactif n'est plus une opacité posée sur le CTA : c'est un
            bouton désactivé À PART ENTIÈRE (surface neutre, libellé muted),
            donc lisible. `opacity-45` sur un aplat bleu descendait le libellé
            blanc sous tout seuil de contraste — exactement le raccourci que
            l'audit a fait supprimer sur l'écran 12. */}
        <StickyActionBar>
          <div className="lg:mt-10">
            {ready ? (
              <Button href="/profile/kyc" className="lg:max-w-[320px]">
                Soumettre le document
              </Button>
            ) : (
              <button
                type="button"
                disabled
                className="border-border bg-surface-2 text-text-muted inline-flex h-[50px] w-full cursor-not-allowed items-center justify-center rounded-md border text-[15px] font-semibold lg:max-w-[320px]"
              >
                Soumettre le document
              </button>
            )}
          </div>
        </StickyActionBar>
      </main>

      <BottomNav />
    </>
  );
}
