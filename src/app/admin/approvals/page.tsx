"use client";

import { useState } from "react";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";

import { AdminModal } from "@/components/admin/AdminModal";
import { PermissionGate } from "@/components/admin/PermissionGate";
import {
  AdminCard,
  AdminEmpty,
  AdminLoading,
  AdminPageHeader,
  StatusPill,
  TableScroll,
} from "@/components/admin/ui";
import { InlineError } from "@/components/feedback/InlineError";
import { ApiError } from "@/lib/api/ApiError";
import { useAuth } from "@/lib/auth";
import { isSelfApprovalError } from "@/lib/admin/approvalErrors";
import {
  useApproveConfig,
  useApproveTopup,
  useConfigApprovals,
  useRejectConfig,
  useRejectTopup,
  useTopupApprovals,
} from "@/lib/admin/hooks";
import { hasPermission, Permission } from "@/lib/admin/permissions";
import type { AdminList, ApprovalRequest } from "@/lib/admin/types";

interface DecisionVars {
  uuid: string;
  reason?: string;
}

type DecisionMutation = UseMutationResult<ApprovalRequest, ApiError, DecisionVars>;

const SELF_APPROVAL_EXPLANATION =
  "Vous êtes le demandeur de cette modification. Par séparation des tâches, un autre validateur doit l'approuver.";

function ApprovalSection({
  title,
  description,
  query,
  approve,
  reject,
}: {
  title: string;
  description: string;
  query: UseQueryResult<AdminList<ApprovalRequest>, ApiError>;
  approve: DecisionMutation;
  reject: DecisionMutation;
}) {
  /** uuids the backend refused as self-approval — Approve stays disabled here. */
  const [selfBlocked, setSelfBlocked] = useState<Set<string>>(new Set());
  const [rowError, setRowError] = useState<{ uuid: string; message: string } | null>(
    null,
  );
  const [rejecting, setRejecting] = useState<ApprovalRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const rows = query.data?.items ?? [];

  const markSelfBlocked = (uuid: string) =>
    setSelfBlocked((prev) => new Set(prev).add(uuid));

  const onApprove = async (approval: ApprovalRequest) => {
    setRowError(null);
    try {
      await approve.mutateAsync({ uuid: approval.uuid });
    } catch (error) {
      if (isSelfApprovalError(error)) {
        markSelfBlocked(approval.uuid);
        setRowError({ uuid: approval.uuid, message: SELF_APPROVAL_EXPLANATION });
      } else if (error instanceof ApiError) {
        setRowError({ uuid: approval.uuid, message: error.message });
        // A 409 (no longer pending) means the list is stale — refresh it.
        if (error.status === 409) void query.refetch();
      }
    }
  };

  const onReject = async () => {
    if (!rejecting) return;
    setRowError(null);
    const uuid = rejecting.uuid;
    const reason = rejectReason.trim();
    try {
      await reject.mutateAsync({ uuid, reason: reason || undefined });
      setRejecting(null);
      setRejectReason("");
    } catch (error) {
      if (error instanceof ApiError) {
        setRowError({ uuid, message: error.message });
        if (error.status === 409) void query.refetch();
      }
      setRejecting(null);
      setRejectReason("");
    }
  };

  return (
    <section className="mt-8 first:mt-0">
      <div className="mb-3">
        <h2 className="text-text text-[15px] font-semibold">{title}</h2>
        <p className="text-text-muted mt-0.5 text-[13px]">{description}</p>
      </div>

      <AdminCard>
        {query.isPending ? (
          <AdminLoading />
        ) : query.isError ? (
          <div className="p-4">
            <InlineError error={query.error} />
          </div>
        ) : rows.length === 0 ? (
          <AdminEmpty>Aucune demande en attente.</AdminEmpty>
        ) : (
          <TableScroll>
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-border text-text-muted border-b text-[12px]">
                  <th className="px-4 py-3 font-medium">Opération</th>
                  <th className="px-4 py-3 font-medium">Cible</th>
                  <th className="px-4 py-3 font-medium">Demandé par</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((approval) => {
                  const blocked = selfBlocked.has(approval.uuid);
                  const busy = approve.isPending || reject.isPending;
                  return (
                    <tr
                      key={approval.uuid}
                      className="border-border text-text border-b align-top last:border-0"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium">
                          {approval.operation ?? "—"}
                        </span>
                        {rowError?.uuid === approval.uuid ? (
                          <span
                            role="alert"
                            className="text-warning-deep mt-1 block max-w-[320px] text-[12px] leading-[16px]"
                          >
                            {rowError.message}
                          </span>
                        ) : null}
                      </td>
                      <td className="text-text-secondary px-4 py-3">
                        <span className="font-mono text-[12px] break-all">
                          {approval.target_uuid ?? "—"}
                        </span>
                      </td>
                      <td className="text-text-secondary px-4 py-3 tabular-nums">
                        {approval.requested_by === null
                          ? "—"
                          : `#${approval.requested_by}`}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill tone="warning">En attente</StatusPill>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          disabled={busy || blocked}
                          aria-disabled={busy || blocked}
                          title={blocked ? SELF_APPROVAL_EXPLANATION : undefined}
                          onClick={() => void onApprove(approval)}
                          className="text-success hover:bg-success-tint mr-1 rounded-md px-2.5 py-1.5 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Approuver
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            setRowError(null);
                            setRejectReason("");
                            setRejecting(approval);
                          }}
                          className="text-danger hover:bg-danger/10 rounded-md px-2.5 py-1.5 text-[13px] font-semibold transition-colors disabled:opacity-50"
                        >
                          Rejeter
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableScroll>
        )}
      </AdminCard>

      <AdminModal
        open={rejecting !== null}
        title="Rejeter la demande"
        onClose={() => setRejecting(null)}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="reject-reason"
              className="text-text-secondary block text-[13px] leading-[18px] font-medium"
            >
              Motif (optionnel)
            </label>
            <textarea
              id="reject-reason"
              rows={3}
              maxLength={500}
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              className="border-border-strong bg-surface text-text mt-[6px] w-full rounded-md border px-[13px] py-2.5 text-[14px] outline-none focus-visible:border-primary focus-visible:ring-primary/60 focus-visible:ring-2 focus-visible:outline-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejecting(null)}
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
    </section>
  );
}

function ConfigApprovals() {
  const query = useConfigApprovals();
  const approve = useApproveConfig();
  const reject = useRejectConfig();
  return (
    <ApprovalSection
      title="Modifications de configuration"
      description="Créations et modifications sensibles en attente (tarifs, taux, limites, BIN, réglages sensibles)."
      query={query}
      approve={approve}
      reject={reject}
    />
  );
}

function TopupApprovals() {
  const query = useTopupApprovals();
  const approve = useApproveTopup();
  const reject = useRejectTopup();
  return (
    <ApprovalSection
      title="Approvisionnements marchands"
      description="Crédits de wallet marchand B2B en attente d'approbation."
      query={query}
      approve={approve}
      reject={reject}
    />
  );
}

export default function ApprovalsPage() {
  const { user } = useAuth();
  const hasAnySection =
    hasPermission(user, Permission.ConfigApprove) ||
    hasPermission(user, Permission.MerchantCreditApprove);

  return (
    <>
      <AdminPageHeader
        title="Approbations"
        description="Le maker-checker : une modification sensible n'est appliquée qu'une fois approuvée par une personne différente de son demandeur (séparation des tâches)."
      />
      <PermissionGate permission={Permission.ConfigApprove}>
        <ConfigApprovals />
      </PermissionGate>
      <PermissionGate permission={Permission.MerchantCreditApprove}>
        <TopupApprovals />
      </PermissionGate>
      {!hasAnySection ? (
        <AdminCard>
          <AdminEmpty>
            Vous n&apos;avez accès à aucune section d&apos;approbation.
          </AdminEmpty>
        </AdminCard>
      ) : null}
    </>
  );
}
