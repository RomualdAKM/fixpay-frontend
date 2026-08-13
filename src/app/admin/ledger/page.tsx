"use client";

import { useState } from "react";

import { AdminModal } from "@/components/admin/AdminModal";
import { AdminSectionGuard } from "@/components/admin/AdminSectionGuard";
import { AdminSelectField } from "@/components/admin/fields";
import {
  AdminCard,
  AdminEmpty,
  AdminLoading,
  AdminPageHeader,
  AdminPager,
  BoolPill,
  StatusPill,
  TableScroll,
} from "@/components/admin/ui";
import { TextField } from "@/components/form/TextField";
import { InlineError } from "@/components/feedback/InlineError";
import {
  useLedgerAccounts,
  useLedgerTransaction,
  useLedgerTransactions,
} from "@/lib/admin/hooks";
import { Permission } from "@/lib/admin/permissions";
import { CURRENCY_OPTIONS } from "@/lib/admin/options";
import type {
  LedgerAccountFilters,
  LedgerTransactionFilters,
} from "@/lib/admin/types";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/format";

type Tab = "accounts" | "transactions";

function AccountsView() {
  const [filters, setFilters] = useState<LedgerAccountFilters>({ page: 1 });
  const { data, isPending, isError, error } = useLedgerAccounts(filters);

  const rows = data?.items ?? [];
  const meta = data?.meta;

  return (
    <>
      <div className="mb-4 max-w-[240px]">
        <AdminSelectField
          label="Devise"
          placeholder="Toutes"
          options={CURRENCY_OPTIONS}
          value={filters.currency ?? ""}
          onChange={(event) =>
            setFilters({
              currency: (event.target.value || undefined) as
                | LedgerAccountFilters["currency"],
              page: 1,
            })
          }
        />
      </div>
      <AdminCard>
        {isPending ? (
          <AdminLoading />
        ) : isError ? (
          <div className="p-4">
            <InlineError error={error} />
          </div>
        ) : rows.length === 0 ? (
          <AdminEmpty>Aucun compte.</AdminEmpty>
        ) : (
          <>
            <TableScroll>
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-border text-text-muted border-b text-[12px]">
                    <th className="px-4 py-3 font-medium">Code</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Devise</th>
                    <th className="px-4 py-3 font-medium">Solde</th>
                    <th className="px-4 py-3 font-medium">Actif</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((account) => (
                    <tr
                      key={account.uuid}
                      className="border-border text-text border-b last:border-0"
                    >
                      <td className="px-4 py-3 font-mono text-[12px] font-medium break-all">
                        {account.code}
                      </td>
                      <td className="text-text-secondary px-4 py-3">
                        {account.type}
                      </td>
                      <td className="text-text-secondary px-4 py-3">
                        {account.currency}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatMoney(account.balance)}
                      </td>
                      <td className="px-4 py-3">
                        <BoolPill value={account.is_active} />
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

function TransactionDetail({ uuid }: { uuid: string }) {
  const { data, isPending, isError, error } = useLedgerTransaction(uuid);

  if (isPending) return <AdminLoading />;
  if (isError) return <InlineError error={error} />;

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13px]">
        <dt className="text-text-muted">Type</dt>
        <dd className="text-text">{data.type}</dd>
        <dt className="text-text-muted">Posté le</dt>
        <dd className="text-text">{formatDate(data.posted_at)}</dd>
        <dt className="text-text-muted">Référence</dt>
        <dd className="text-text break-all">
          {data.reference_type ?? "—"}
          {data.reference_id !== null ? ` #${data.reference_id}` : ""}
        </dd>
      </dl>
      <div>
        <h3 className="text-text-secondary mb-2 text-[13px] font-semibold">
          Écritures
        </h3>
        <TableScroll>
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-border text-text-muted border-b text-[12px]">
                <th className="px-3 py-2 font-medium">Compte</th>
                <th className="px-3 py-2 font-medium">Sens</th>
                <th className="px-3 py-2 font-medium">Montant</th>
              </tr>
            </thead>
            <tbody>
              {(data.entries ?? []).map((entry, index) => (
                <tr
                  key={`${entry.account_id}-${index}`}
                  className="border-border text-text border-b last:border-0"
                >
                  <td className="px-3 py-2 tabular-nums">#{entry.account_id}</td>
                  <td className="px-3 py-2">
                    <StatusPill
                      tone={entry.side === "debit" ? "danger" : "success"}
                    >
                      {entry.side === "debit" ? "Débit" : "Crédit"}
                    </StatusPill>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatMoney(entry.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
      </div>
    </div>
  );
}

function TransactionsView() {
  const [filters, setFilters] = useState<LedgerTransactionFilters>({ page: 1 });
  const [draft, setDraft] = useState<{ type: string; from: string; to: string }>(
    { type: "", from: "", to: "" },
  );
  const [selected, setSelected] = useState<string | null>(null);
  const { data, isPending, isError, error } = useLedgerTransactions(filters);

  const rows = data?.items ?? [];
  const meta = data?.meta;

  const applyFilters = () =>
    setFilters({
      type: draft.type || undefined,
      from: draft.from || undefined,
      to: draft.to || undefined,
      page: 1,
    });

  return (
    <>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <TextField
          label="Type"
          value={draft.type}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, type: event.target.value }))
          }
        />
        <TextField
          label="Du"
          type="date"
          value={draft.from}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, from: event.target.value }))
          }
        />
        <TextField
          label="Au"
          type="date"
          value={draft.to}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, to: event.target.value }))
          }
        />
        <div className="flex items-end">
          <button
            type="button"
            onClick={applyFilters}
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
          <AdminEmpty>Aucune transaction.</AdminEmpty>
        ) : (
          <>
            <TableScroll>
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-border text-text-muted border-b text-[12px]">
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Référence</th>
                    <th className="px-4 py-3 font-medium">Posté le</th>
                    <th className="px-4 py-3 font-medium">
                      <span className="sr-only">Détail</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((transaction) => (
                    <tr
                      key={transaction.uuid}
                      className="border-border text-text border-b last:border-0"
                    >
                      <td className="px-4 py-3 font-medium">
                        {transaction.type}
                      </td>
                      <td className="text-text-secondary px-4 py-3 break-all">
                        {transaction.reference_type ?? "—"}
                        {transaction.reference_id !== null
                          ? ` #${transaction.reference_id}`
                          : ""}
                      </td>
                      <td className="text-text-secondary px-4 py-3">
                        {formatDate(transaction.posted_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelected(transaction.uuid)}
                          className="text-primary hover:bg-primary-tint rounded-md px-2.5 py-1.5 text-[13px] font-semibold transition-colors"
                        >
                          Détail
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
                onPage={(page) => setFilters((prev) => ({ ...prev, page }))}
              />
            ) : null}
          </>
        )}
      </AdminCard>

      <AdminModal
        open={selected !== null}
        title="Transaction"
        onClose={() => setSelected(null)}
      >
        {selected ? <TransactionDetail uuid={selected} /> : null}
      </AdminModal>
    </>
  );
}

function LedgerSection() {
  const [tab, setTab] = useState<Tab>("accounts");

  return (
    <>
      <div
        role="tablist"
        aria-label="Vue du grand livre"
        className="border-border mb-5 flex gap-1 border-b"
      >
        {(
          [
            ["accounts", "Comptes"],
            ["transactions", "Transactions"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            role="tab"
            type="button"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={
              tab === value
                ? "text-primary border-primary -mb-px border-b-2 px-4 py-2.5 text-[14px] font-semibold"
                : "text-text-secondary hover:text-text -mb-px border-b-2 border-transparent px-4 py-2.5 text-[14px] font-semibold"
            }
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "accounts" ? <AccountsView /> : <TransactionsView />}
    </>
  );
}

export default function LedgerPage() {
  return (
    <>
      <AdminPageHeader
        title="Grand livre"
        description="Comptes et transactions du grand livre, en lecture seule. Aucune écriture n'est possible depuis cet écran."
      />
      <AdminSectionGuard permission={Permission.LedgerRead}>
        <LedgerSection />
      </AdminSectionGuard>
    </>
  );
}
