"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";

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
import { TextField } from "@/components/form/TextField";
import { InlineError } from "@/components/feedback/InlineError";
import { useAudit, useVerifyAudit } from "@/lib/admin/hooks";
import { Permission } from "@/lib/admin/permissions";
import type { AuditFilters } from "@/lib/admin/types";
import { formatDate } from "@/lib/format";

function ChainIntegrity() {
  const verify = useVerifyAudit();
  const result = verify.data;

  return (
    <AdminCard className="mb-5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck
            size={18}
            aria-hidden="true"
            className="text-icon-muted"
          />
          <div>
            <p className="text-text text-[14px] font-semibold">
              Intégrité de la chaîne d&apos;audit
            </p>
            <p className="text-text-muted text-[12px]">
              Vérifie que chaque entrée chaîne bien la précédente (hash).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {result ? (
            result.intact ? (
              <StatusPill tone="success">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 size={12} aria-hidden="true" />
                  Intègre · {result.entries} entrées
                </span>
              </StatusPill>
            ) : (
              <StatusPill tone="danger">
                <span className="inline-flex items-center gap-1">
                  <AlertTriangle size={12} aria-hidden="true" />
                  Rompue
                </span>
              </StatusPill>
            )
          ) : null}
          <button
            type="button"
            onClick={() => verify.mutate()}
            disabled={verify.isPending}
            className="bg-primary focus-visible:ring-primary/60 flex h-10 items-center rounded-md px-3.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60"
          >
            {verify.isPending ? "Vérification…" : "Vérifier l'intégrité"}
          </button>
        </div>
      </div>
      {verify.isError ? (
        <InlineError error={verify.error} className="mt-3" />
      ) : null}
      {result && !result.intact && result.broken_at_uuid ? (
        <p className="text-danger mt-3 text-[13px]">
          Rupture détectée à l&apos;entrée{" "}
          <span className="font-mono break-all">{result.broken_at_uuid}</span>.
        </p>
      ) : null}
    </AdminCard>
  );
}

function AuditLogSection() {
  const [filters, setFilters] = useState<AuditFilters>({ page: 1 });
  const [draft, setDraft] = useState<{ action: string; actor_type: string }>({
    action: "",
    actor_type: "",
  });
  const { data, isPending, isError, error } = useAudit(filters);

  const rows = data?.items ?? [];
  const meta = data?.meta;

  return (
    <>
      <ChainIntegrity />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <TextField
          label="Action"
          value={draft.action}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, action: event.target.value }))
          }
        />
        <TextField
          label="Type d'acteur"
          value={draft.actor_type}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, actor_type: event.target.value }))
          }
        />
        <div className="flex items-end">
          <button
            type="button"
            onClick={() =>
              setFilters({
                action: draft.action || undefined,
                actor_type: draft.actor_type || undefined,
                page: 1,
              })
            }
            className="border-border bg-surface text-text hover:bg-surface-2 focus-visible:ring-primary/60 h-12 w-full rounded-md border px-4 text-[14px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            Filtrer
          </button>
        </div>
      </div>

      <AdminCard>
        {isPending ? (
          <AdminLoading />
        ) : isError ? (
          <div className="p-4">
            <InlineError error={error} />
          </div>
        ) : rows.length === 0 ? (
          <AdminEmpty>Aucune entrée d&apos;audit.</AdminEmpty>
        ) : (
          <>
            <TableScroll>
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-border text-text-muted border-b text-[12px]">
                    <th className="px-4 py-3 font-medium">Acteur</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Sujet</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((log) => (
                    <tr
                      key={log.uuid}
                      className="border-border text-text border-b last:border-0"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium">{log.actor_type}</span>
                        {log.actor_id !== null ? (
                          <span className="text-text-muted tabular-nums">
                            {" "}
                            #{log.actor_id}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 font-mono text-[12px] break-all">
                        {log.action}
                      </td>
                      <td className="text-text-secondary px-4 py-3 break-all">
                        {log.subject_type ?? "—"}
                        {log.subject_id !== null ? ` #${log.subject_id}` : ""}
                      </td>
                      <td className="text-text-secondary px-4 py-3">
                        {formatDate(log.created_at)}
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
                onPage={(page) => setFilters((prev) => ({ ...prev, page }))}
              />
            ) : null}
          </>
        )}
      </AdminCard>
    </>
  );
}

export default function AuditPage() {
  return (
    <>
      <AdminPageHeader
        title="Journal d'audit"
        description="Journal chaîné des actions sensibles. Vérifiez l'intégrité de la chaîne à tout moment."
      />
      <AdminSectionGuard permission={Permission.AuditRead}>
        <AuditLogSection />
      </AdminSectionGuard>
    </>
  );
}
