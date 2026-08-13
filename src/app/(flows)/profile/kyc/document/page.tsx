"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, FileText, Loader2, Upload, X } from "lucide-react";

import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { InlineError } from "@/components/feedback/InlineError";
import { Button } from "@/components/ui/Button";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { useSubmitKyc } from "@/lib/api/accountHooks";
import type { KycDocumentType } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface UploadZone {
  id: KycDocumentType;
  label: string;
  hint: string;
  /** Selfie occupe la pleine largeur ; recto/verso partagent une rangée. */
  full?: boolean;
}

interface ZoneState {
  file?: File;
  /** Aperçu réel (objet URL) — absent pour un PDF, non rendu par `<img>`. */
  previewUrl?: string;
  error?: string;
}

/**
 * Les trois pièces EXIGÉES par SubmitKycRequest : `id_front`, `id_back`,
 * `selfie`. Les identifiants de zone sont exactement les champs multipart
 * attendus par POST /api/kyc.
 */
const UPLOAD_ZONES: UploadZone[] = [
  { id: "id_front", label: "Recto de la pièce", hint: "1 sur 2" },
  { id: "id_back", label: "Verso de la pièce", hint: "2 sur 2" },
  { id: "selfie", label: "Selfie de vérification", hint: "Visage bien visible", full: true },
];

/** config/kyc.php : `allowed_mimes` et `max_document_size_kb` (8 Mo). */
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_BYTES = 8 * 1024 * 1024;

const CHECKLIST = [
  "Document en cours de validité",
  "photo nette et non recadrée",
  "toutes les mentions visibles",
  "JPG, PNG, WebP ou PDF, 8 Mo max",
].join(" · ");

function formatSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} Mo`;
}

/**
 * Écran 13 · KYC Document — import réel des trois pièces (recto, verso, selfie)
 * avec validation type/taille côté client, puis soumission MULTIPART à
 * POST /api/kyc. Le statut repasse à `pending` et l'écran renvoie au suivi.
 */
export default function KycDocumentPage() {
  const router = useRouter();
  const submit = useSubmitKyc();
  const [zones, setZones] = useState<Record<string, ZoneState>>({});

  const ready = UPLOAD_ZONES.every((zone) => zones[zone.id]?.file);

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
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      replaceZone(zoneId, {
        error: "Format refusé — JPG, PNG, WebP ou PDF uniquement.",
      });
      return;
    }
    if (file.size > MAX_BYTES) {
      replaceZone(zoneId, {
        error: `Fichier trop lourd (${formatSize(file.size)}) — 8 Mo maximum.`,
      });
      return;
    }
    replaceZone(zoneId, {
      file,
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

  const handleSubmit = () => {
    const idFront = zones.id_front?.file;
    const idBack = zones.id_back?.file;
    const selfie = zones.selfie?.file;
    if (!idFront || !idBack || !selfie) return;

    submit.mutate(
      { id_front: idFront, id_back: idBack, selfie },
      { onSuccess: () => router.push("/profile/kyc") },
    );
  };

  return (
    <>
      <main className="flex-1 px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[840px] lg:px-10 lg:pt-9 lg:pb-12">
        <PageHeader title="Pièce d'identité" backHref="/profile/kyc" />

        <h2 className="text-text mt-8 text-[15px] leading-[20px] font-semibold">
          Photos du document
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {UPLOAD_ZONES.map((zone) => {
            const state = zones[zone.id] ?? {};
            const inputId = `upload-${zone.id}`;

            return (
              <div key={zone.id} className={cn(zone.full && "col-span-2")}>
                <input
                  id={inputId}
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  className="peer sr-only"
                  onChange={(event) => handleFile(zone.id, event)}
                />

                {state.file ? (
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
                  <label
                    htmlFor={inputId}
                    className={cn(
                      "hover:bg-surface flex h-[118px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-4 transition-colors",
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
                    <span className="mt-2.5 flex flex-col items-center">
                      <span className="text-text text-[12.5px] leading-[16px] font-medium">
                        {zone.label}
                      </span>
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

        <p className="text-text-secondary mt-2 text-[12px] leading-[18px]">
          {CHECKLIST}
        </p>

        {submit.isError && <InlineError error={submit.error} className="mt-6" />}

        {!ready && !submit.isError && (
          <p className="text-text-muted mt-8 text-[12px] leading-[16px]">
            Importez le recto, le verso et le selfie pour pouvoir soumettre.
          </p>
        )}

        <StickyActionBar>
          <div className="lg:mt-10">
            {ready ? (
              <Button
                onClick={handleSubmit}
                disabled={submit.isPending}
                className="lg:max-w-[320px]"
              >
                {submit.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" aria-hidden />
                    Envoi en cours…
                  </span>
                ) : (
                  "Soumettre les pièces"
                )}
              </Button>
            ) : (
              <button
                type="button"
                disabled
                className="border-border bg-surface-2 text-text-muted inline-flex h-[50px] w-full cursor-not-allowed items-center justify-center rounded-md border text-[15px] font-semibold lg:max-w-[320px]"
              >
                Soumettre les pièces
              </button>
            )}
          </div>
        </StickyActionBar>
      </main>

      <BottomNav />
    </>
  );
}
