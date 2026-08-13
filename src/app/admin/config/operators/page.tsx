"use client";

import { useState } from "react";

import { PermissionGate } from "@/components/admin/PermissionGate";
import { WriteResultBanner } from "@/components/admin/WriteResultBanner";
import {
  AdminCard,
  AdminEmpty,
  AdminLoading,
  AdminPageHeader,
  BoolPill,
  TableScroll,
} from "@/components/admin/ui";
import { InlineError } from "@/components/feedback/InlineError";
import { Toggle } from "@/components/ui/Toggle";
import { useCurateOperator, useOperators } from "@/lib/admin/hooks";
import { Permission } from "@/lib/admin/permissions";
import type { AdminOperator, WriteOutcome } from "@/lib/admin/types";

function OperatorToggle({
  operator,
  onStart,
  onOutcome,
  onError,
}: {
  operator: AdminOperator;
  onStart: () => void;
  onOutcome: (o: WriteOutcome<AdminOperator>) => void;
  onError: (error: unknown) => void;
}) {
  const mutation = useCurateOperator();
  return (
    <Toggle
      label={`Activer ${operator.name}`}
      checked={operator.fixpay_enabled}
      onChange={async (next) => {
        onStart();
        try {
          onOutcome(
            await mutation.mutateAsync({
              code: operator.code,
              input: { fixpay_enabled: next },
            }),
          );
        } catch (error) {
          onError(error);
        }
      }}
    />
  );
}

export default function OperatorsPage() {
  const { data, isPending, isError, error, refetch } = useOperators();
  const [outcome, setOutcome] = useState<WriteOutcome<AdminOperator> | null>(
    null,
  );
  const [writeError, setWriteError] = useState<unknown>(null);

  const rows = data?.items ?? [];

  return (
    <>
      <AdminPageHeader
        title="Opérateurs Mobile Money"
        description="Curation des opérateurs proposés aux clients. Appliqué directement (non soumis à approbation)."
      />

      {outcome ? <WriteResultBanner outcome={outcome} className="mb-4" /> : null}
      <InlineError error={writeError} className="mb-4" />

      <AdminCard>
        {isPending ? (
          <AdminLoading />
        ) : isError ? (
          <div className="p-4">
            <InlineError error={error} />
          </div>
        ) : rows.length === 0 ? (
          <AdminEmpty>Aucun opérateur synchronisé.</AdminEmpty>
        ) : (
          <TableScroll>
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-border text-text-muted border-b text-[12px]">
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Nom</th>
                  <th className="px-4 py-3 font-medium">Pays</th>
                  <th className="px-4 py-3 font-medium">Pay-in</th>
                  <th className="px-4 py-3 font-medium">Pay-out</th>
                  <th className="px-4 py-3 font-medium">FixPay</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((operator) => (
                  <tr
                    key={operator.code}
                    className="border-border text-text border-b last:border-0"
                  >
                    <td className="px-4 py-3 font-medium tabular-nums">
                      {operator.code}
                    </td>
                    <td className="px-4 py-3">{operator.name}</td>
                    <td className="text-text-secondary px-4 py-3">
                      {operator.country}
                    </td>
                    <td className="px-4 py-3">
                      <BoolPill value={operator.supports_payin} />
                    </td>
                    <td className="px-4 py-3">
                      <BoolPill value={operator.supports_payout} />
                    </td>
                    <td className="px-4 py-3">
                      <PermissionGate
                        permission={Permission.ConfigWrite}
                        fallback={<BoolPill value={operator.fixpay_enabled} />}
                      >
                        <OperatorToggle
                          operator={operator}
                          onStart={() => {
                            setOutcome(null);
                            setWriteError(null);
                          }}
                          onOutcome={(o) => {
                            setWriteError(null);
                            setOutcome(o);
                          }}
                          onError={(err) => {
                            setOutcome(null);
                            setWriteError(err);
                            void refetch();
                          }}
                        />
                      </PermissionGate>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        )}
      </AdminCard>
    </>
  );
}
