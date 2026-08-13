"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

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
import {
  useFloats,
  useReconciliationRuns,
  useTasks,
  useTicks,
} from "@/lib/admin/hooks";
import { Permission } from "@/lib/admin/permissions";
import { useState, type ReactNode } from "react";
import { formatMoney, formatSignedMoney } from "@/lib/money";
import { formatDate } from "@/lib/format";

function okTone(status: string): "success" | "warning" | "danger" | "neutral" {
  const value = status.toLowerCase();
  if (["ok", "match", "success", "healthy", "completed"].includes(value))
    return "success";
  if (["drift", "warning", "degraded", "mismatch"].includes(value))
    return "warning";
  if (["failed", "error", "broken", "critical"].includes(value)) return "danger";
  return "neutral";
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="text-text mb-3 text-[15px] font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function FloatsSection() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error } = useFloats(page);
  const rows = data?.items ?? [];
  const meta = data?.meta;

  return (
    <Section title="Dérives de float (grand livre vs fournisseur)">
      <AdminCard>
        {isPending ? (
          <AdminLoading />
        ) : isError ? (
          <div className="p-4">
            <InlineError error={error} />
          </div>
        ) : rows.length === 0 ? (
          <AdminEmpty>Aucun instantané de float.</AdminEmpty>
        ) : (
          <>
          <TableScroll>
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-border text-text-muted border-b text-[12px]">
                  <th className="px-4 py-3 font-medium">Fournisseur</th>
                  <th className="px-4 py-3 font-medium">Solde grand livre</th>
                  <th className="px-4 py-3 font-medium">Solde fournisseur</th>
                  <th className="px-4 py-3 font-medium">Dérive</th>
                  <th className="px-4 py-3 font-medium">État</th>
                  <th className="px-4 py-3 font-medium">Capturé le</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((snapshot) => {
                  const hasDrift = snapshot.drift_minor !== 0;
                  return (
                    <tr
                      key={snapshot.uuid}
                      className="border-border text-text border-b last:border-0"
                    >
                      <td className="px-4 py-3 font-medium uppercase">
                        {snapshot.provider}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatMoney(snapshot.ledger_balance)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {snapshot.provider_balance
                          ? formatMoney(snapshot.provider_balance)
                          : "—"}
                      </td>
                      <td
                        className={`px-4 py-3 text-right tabular-nums ${hasDrift ? "text-danger font-semibold" : "text-text-secondary"}`}
                      >
                        {formatSignedMoney(
                          snapshot.drift_minor,
                          snapshot.currency,
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill
                          tone={hasDrift ? "danger" : okTone(snapshot.status)}
                        >
                          {hasDrift ? (
                            <span className="inline-flex items-center gap-1">
                              <AlertTriangle size={12} aria-hidden="true" />
                              {snapshot.status}
                            </span>
                          ) : (
                            snapshot.status
                          )}
                        </StatusPill>
                      </td>
                      <td className="text-text-secondary px-4 py-3">
                        {formatDate(snapshot.captured_at)}
                      </td>
                    </tr>
                  );
                })}
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
    </Section>
  );
}

function RunsSection() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error } = useReconciliationRuns(page);
  const rows = data?.items ?? [];
  const meta = data?.meta;

  return (
    <Section title="Runs de réconciliation">
      <AdminCard>
        {isPending ? (
          <AdminLoading />
        ) : isError ? (
          <div className="p-4">
            <InlineError error={error} />
          </div>
        ) : rows.length === 0 ? (
          <AdminEmpty>Aucun run de réconciliation.</AdminEmpty>
        ) : (
          <>
          <TableScroll>
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-border text-text-muted border-b text-[12px]">
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">État</th>
                  <th className="px-4 py-3 font-medium">Démarré</th>
                  <th className="px-4 py-3 font-medium">Terminé</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((run) => (
                  <tr
                    key={run.uuid}
                    className="border-border text-text border-b last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">{run.kind}</td>
                    <td className="px-4 py-3">
                      <StatusPill tone={okTone(run.status)}>
                        {run.status}
                      </StatusPill>
                    </td>
                    <td className="text-text-secondary px-4 py-3">
                      {formatDate(run.started_at)}
                    </td>
                    <td className="text-text-secondary px-4 py-3">
                      {run.finished_at ? formatDate(run.finished_at) : "—"}
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
    </Section>
  );
}

function TicksSection() {
  const { data, isPending, isError, error } = useTicks();
  const rows = data?.items ?? [];

  return (
    <Section title="Santé du planificateur (derniers ticks)">
      <AdminCard>
        {isPending ? (
          <AdminLoading />
        ) : isError ? (
          <div className="p-4">
            <InlineError error={error} />
          </div>
        ) : rows.length === 0 ? (
          <AdminEmpty>Aucun tick enregistré.</AdminEmpty>
        ) : (
          <TableScroll>
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-border text-text-muted border-b text-[12px]">
                  <th className="px-4 py-3 font-medium">Déclencheur</th>
                  <th className="px-4 py-3 font-medium">État</th>
                  <th className="px-4 py-3 font-medium">Durée</th>
                  <th className="px-4 py-3 font-medium">Démarré</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((tick) => {
                  const failed = okTone(tick.status) !== "success";
                  return (
                  <tr
                    key={tick.id}
                    className="border-border text-text border-b align-top last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">
                      {tick.trigger}
                      {failed && tick.error ? (
                        <span className="text-danger mt-1 block text-[12px] font-normal break-words">
                          {tick.error}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill tone={okTone(tick.status)}>
                        {tick.status}
                      </StatusPill>
                    </td>
                    <td className="text-text-secondary px-4 py-3 tabular-nums">
                      {tick.duration_ms !== null ? `${tick.duration_ms} ms` : "—"}
                    </td>
                    <td className="text-text-secondary px-4 py-3">
                      {formatDate(tick.started_at)}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </TableScroll>
        )}
      </AdminCard>
    </Section>
  );
}

function TasksSection() {
  const { data, isPending, isError, error } = useTasks();
  const rows = data?.items ?? [];

  return (
    <Section title="Tâches planifiées">
      <AdminCard>
        {isPending ? (
          <AdminLoading />
        ) : isError ? (
          <div className="p-4">
            <InlineError error={error} />
          </div>
        ) : rows.length === 0 ? (
          <AdminEmpty>Aucune tâche planifiée.</AdminEmpty>
        ) : (
          <ul className="divide-border divide-y">
            {rows.map((task) => (
              <li
                key={task.task}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
              >
                <span className="text-text flex items-center gap-2 text-[14px] font-medium">
                  {task.last_status && okTone(task.last_status) === "success" ? (
                    <CheckCircle2
                      size={15}
                      aria-hidden="true"
                      className="text-success"
                    />
                  ) : task.last_status ? (
                    <AlertTriangle
                      size={15}
                      aria-hidden="true"
                      className="text-warning-deep"
                    />
                  ) : null}
                  {task.task}
                </span>
                <span className="text-text-muted flex items-center gap-3 text-[12px]">
                  <span>
                    Dernier :{" "}
                    {task.last_run_at ? formatDate(task.last_run_at) : "—"}
                  </span>
                  <span>
                    Prochain :{" "}
                    {task.next_due_at ? formatDate(task.next_due_at) : "—"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </Section>
  );
}

export default function ReconciliationPage() {
  return (
    <>
      <AdminPageHeader
        title="Réconciliation"
        description="Surveillance des dérives de float, des runs de réconciliation et de la santé du planificateur. Vues en lecture seule ; les dérives sont mises en évidence."
      />
      <AdminSectionGuard permission={Permission.LedgerRead}>
        <FloatsSection />
        <RunsSection />
        <TicksSection />
        <TasksSection />
      </AdminSectionGuard>
    </>
  );
}
