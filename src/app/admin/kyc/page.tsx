"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";

import { AdminModal } from "@/components/admin/AdminModal";
import { AdminSectionGuard } from "@/components/admin/AdminSectionGuard";
import {
  AdminCard,
  AdminEmpty,
  AdminLoading,
  AdminPageHeader,
  AdminPager,
  StatusPill,
  TableScroll,
} from "@/components/admin/ui";
import { InlineError } from "@/components/feedback/InlineError";
import { ApiError } from "@/lib/api/ApiError";
import { fetchKycDocument } from "@/lib/admin/endpoints";
import {
  useApproveKyc,
  useKycDetail,
  useKycQueue,
  useRejectKyc,
} from "@/lib/admin/hooks";
import { Permission } from "@/lib/admin/permissions";
import type {
  KycDocumentMeta,
  KycDocumentTypeSlug,
  KycReviewStatus,
} from "@/lib/admin/types";
import { formatDate } from "@/lib/format";

const STATUS_LABEL: Record<KycReviewStatus, string> = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Rejeté",
};

const STATUS_TONE: Record<
  KycReviewStatus,
  "warning" | "success" | "danger"
> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

const DOC_LABEL: Record<KycDocumentTypeSlug, string> = {
  id_front: "Pièce d'identité (recto)",
  id_back: "Pièce d'identité (verso)",
  selfie: "Selfie",
};

function formatBytes(size: number): string {
  if (size < 1024) return `${size} o`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} Ko`;
  return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
}

/**
 * Preview a KYC document fetched over the AUTHENTICATED session. The bytes are
 * never exposed as a public URL: they are fetched with the session cookie and
 * rendered from a transient `blob:` object URL that is revoked when the preview
 * changes or the component unmounts.
 */
function DocumentPreview({
  profileUuid,
  document: doc,
}: {
  profileUuid: string;
  document: KycDocumentMeta;
}) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    return () => {
      if (objectUrl && typeof URL.revokeObjectURL === "function") {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const onView = async () => {
    setError(null);
    setLoading(true);
    try {
      const blob = await fetchKycDocument(profileUuid, doc.uuid);
      const url =
        typeof URL.createObjectURL === "function"
          ? URL.createObjectURL(blob)
          : null;
      setObjectUrl(url);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const isImage = doc.mime.startsWith("image/");

  return (
    <div className="border-border bg-surface rounded-md border p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-text flex items-center gap-2 text-[14px] font-medium">
            <FileText size={15} aria-hidden="true" className="text-icon-muted" />
            {DOC_LABEL[doc.type]}
          </p>
          <p className="text-text-muted mt-0.5 text-[12px]">
            {doc.mime} · {formatBytes(doc.size)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void onView()}
          disabled={loading}
          className="border-border bg-bg-raised text-text hover:bg-surface-2 focus-visible:ring-primary/60 shrink-0 rounded-md border px-3 py-1.5 text-[13px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60"
        >
          {loading ? "Chargement…" : objectUrl ? "Recharger" : "Voir le document"}
        </button>
      </div>

      {error ? <InlineError error={error} className="mt-3" /> : null}

      {objectUrl ? (
        <div className="mt-3">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={objectUrl}
              alt={DOC_LABEL[doc.type]}
              className="border-border max-h-[420px] w-auto max-w-full rounded-md border"
            />
          ) : (
            <iframe
              src={objectUrl}
              title={DOC_LABEL[doc.type]}
              sandbox=""
              className="border-border h-[420px] w-full rounded-md border"
            />
          )}
          <a
            href={objectUrl}
            download={`${doc.type}`}
            className="text-primary mt-2 inline-block text-[13px] font-semibold hover:underline"
          >
            Télécharger
          </a>
        </div>
      ) : null}
    </div>
  );
}

function DossierDetail({
  uuid,
  onDecided,
}: {
  uuid: string;
  onDecided: () => void;
}) {
  const { data, isPending, isError, error } = useKycDetail(uuid);
  const approve = useApproveKyc();
  const reject = useRejectKyc();

  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [actionError, setActionError] = useState<unknown>(null);
  const [reasonError, setReasonError] = useState<string | null>(null);

  const onApprove = async () => {
    setActionError(null);
    try {
      await approve.mutateAsync({ uuid });
      onDecided();
    } catch (err) {
      setActionError(err);
    }
  };

  const onReject = async () => {
    const trimmed = reason.trim();
    if (trimmed.length < 3) {
      setReasonError("Un motif d'au moins 3 caractères est obligatoire.");
      return;
    }
    setActionError(null);
    setReasonError(null);
    try {
      await reject.mutateAsync({ uuid, reason: trimmed });
      setRejectOpen(false);
      setReason("");
      onDecided();
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors.reason) {
        setReasonError(err.fieldErrors.reason);
        return;
      }
      setActionError(err);
      setRejectOpen(false);
    }
  };

  return (
    <AdminCard className="p-4">
      {isPending ? (
        <AdminLoading />
      ) : isError ? (
        <InlineError error={error} />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-text text-[15px] font-semibold">
                Dossier utilisateur #{data.user_id}
              </h2>
              <p className="text-text-muted mt-0.5 text-[12px]">
                Soumis le {data.submitted_at ? formatDate(data.submitted_at) : "—"}{" "}
                · niveau {data.level}
              </p>
            </div>
            <StatusPill tone={STATUS_TONE[data.status]}>
              {STATUS_LABEL[data.status]}
            </StatusPill>
          </div>

          {data.status === "rejected" && data.rejection_reason ? (
            <p className="text-danger text-[13px]">
              Motif du rejet : {data.rejection_reason}
            </p>
          ) : null}

          <div>
            <h3 className="text-text-secondary mb-2 text-[13px] font-semibold">
              Documents
            </h3>
            {data.documents.length === 0 ? (
              <p className="text-text-muted text-[13px]">Aucun document.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {data.documents.map((doc) => (
                  <DocumentPreview
                    key={doc.uuid}
                    profileUuid={data.uuid}
                    document={doc}
                  />
                ))}
              </div>
            )}
          </div>

          {actionError ? <InlineError error={actionError} /> : null}

          {data.status === "pending" ? (
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setReason("");
                  setReasonError(null);
                  setRejectOpen(true);
                }}
                disabled={reject.isPending || approve.isPending}
                className="border-border bg-surface text-danger hover:bg-danger/10 focus-visible:ring-danger/60 flex h-10 items-center rounded-md border px-4 text-[14px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60"
              >
                Rejeter
              </button>
              <button
                type="button"
                onClick={() => void onApprove()}
                disabled={approve.isPending || reject.isPending}
                className="bg-success focus-visible:ring-success/60 flex h-10 items-center rounded-md px-4 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60"
              >
                {approve.isPending ? "Approbation…" : "Approuver"}
              </button>
            </div>
          ) : null}
        </div>
      )}

      <AdminModal
        open={rejectOpen}
        title="Rejeter le dossier KYC"
        onClose={() => setRejectOpen(false)}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="kyc-reject-reason"
              className="text-text-secondary block text-[13px] leading-[18px] font-medium"
            >
              Motif du rejet (obligatoire)
            </label>
            <textarea
              id="kyc-reject-reason"
              rows={3}
              maxLength={500}
              value={reason}
              aria-invalid={reasonError ? true : undefined}
              onChange={(event) => setReason(event.target.value)}
              className="border-border-strong bg-surface text-text mt-[6px] w-full rounded-md border px-[13px] py-2.5 text-[14px] outline-none focus-visible:border-primary focus-visible:ring-primary/60 focus-visible:ring-2 focus-visible:outline-none"
            />
            {reasonError ? (
              <p role="alert" className="text-danger mt-[6px] text-[12px]">
                {reasonError}
              </p>
            ) : null}
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejectOpen(false)}
              className="border-border bg-surface text-text hover:bg-surface-2 focus-visible:ring-primary/60 flex h-11 items-center rounded-md border px-5 text-[14px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={reject.isPending}
              onClick={() => void onReject()}
              className="bg-danger focus-visible:ring-danger/60 flex h-11 items-center rounded-md px-5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60"
            >
              Confirmer le rejet
            </button>
          </div>
        </div>
      </AdminModal>
    </AdminCard>
  );
}

function KycReviewSection() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const { data, isPending, isError, error } = useKycQueue(page);

  const rows = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <AdminCard>
        {isPending ? (
          <AdminLoading />
        ) : isError ? (
          <div className="p-4">
            <InlineError error={error} />
          </div>
        ) : rows.length === 0 ? (
          <AdminEmpty>Aucun dossier KYC en attente.</AdminEmpty>
        ) : (
          <>
            <TableScroll>
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-border text-text-muted border-b text-[12px]">
                    <th className="px-4 py-3 font-medium">Utilisateur</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                    <th className="px-4 py-3 font-medium">Soumis le</th>
                    <th className="px-4 py-3 font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => (
                    <tr
                      key={item.uuid}
                      className="border-border text-text border-b last:border-0"
                    >
                      <td className="px-4 py-3 font-medium tabular-nums">
                        #{item.user_id}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill tone={STATUS_TONE[item.status]}>
                          {STATUS_LABEL[item.status]}
                        </StatusPill>
                      </td>
                      <td className="text-text-secondary px-4 py-3">
                        {item.submitted_at ? formatDate(item.submitted_at) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelected(item.uuid)}
                          aria-pressed={selected === item.uuid}
                          className="text-primary hover:bg-primary-tint rounded-md px-2.5 py-1.5 text-[13px] font-semibold transition-colors"
                        >
                          Examiner
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroll>
            {meta ? (
              <AdminPager
                page={meta.current_page}
                lastPage={meta.last_page}
                total={meta.total}
                onPage={setPage}
              />
            ) : null}
          </>
        )}
      </AdminCard>

      {selected ? (
        <DossierDetail uuid={selected} onDecided={() => setSelected(null)} />
      ) : (
        <AdminCard className="hidden xl:block">
          <AdminEmpty>
            Sélectionnez un dossier à examiner pour voir ses documents.
          </AdminEmpty>
        </AdminCard>
      )}
    </div>
  );
}

export default function KycReviewPage() {
  return (
    <>
      <AdminPageHeader
        title="Revue KYC"
        description="File d'attente des dossiers d'identité. Les documents sont consultés via une requête authentifiée — jamais exposés par une URL publique."
      />
      <AdminSectionGuard permission={Permission.KycReview}>
        <KycReviewSection />
      </AdminSectionGuard>
    </>
  );
}
