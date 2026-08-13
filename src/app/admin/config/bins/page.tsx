"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AdminModal } from "@/components/admin/AdminModal";
import { PermissionGate } from "@/components/admin/PermissionGate";
import { WriteResultBanner } from "@/components/admin/WriteResultBanner";
import { AdminCheckboxField, FormActions } from "@/components/admin/fields";
import {
  AdminCard,
  AdminEmpty,
  AdminLoading,
  AdminPageHeader,
  BoolPill,
  TableScroll,
} from "@/components/admin/ui";
import { InlineError } from "@/components/feedback/InlineError";
import { useBins, useCurateBin } from "@/lib/admin/hooks";
import { Permission } from "@/lib/admin/permissions";
import type { Bin, WriteOutcome } from "@/lib/admin/types";
import {
  binCurateSchema,
  toCurateBin,
  type BinCurateForm,
} from "@/lib/admin/formSchemas";
import { applyApiErrors } from "@/lib/forms/applyApiErrors";

function CurateForm({
  bin,
  onDone,
  onCancel,
}: {
  bin: Bin;
  onDone: (o: WriteOutcome<Bin>) => void;
  onCancel: () => void;
}) {
  const mutation = useCurateBin();
  const [formError, setFormError] = useState<unknown>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BinCurateForm>({
    resolver: zodResolver(binCurateSchema),
    defaultValues: {
      fixpay_enabled: bin.fixpay_enabled,
      requires_email: bin.requires_email,
    },
  });
  void errors;

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      onDone(
        await mutation.mutateAsync({ uuid: bin.uuid, input: toCurateBin(values) }),
      );
    } catch (err) {
      if (!applyApiErrors(err, setError)) setFormError(err);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <InlineError error={formError} />
      <p className="text-text-muted text-[13px] leading-[18px]">
        BIN {bin.bin}
        {bin.organization ? ` · ${bin.organization}` : ""}. L&apos;activation
        d&apos;un BIN est sensible et passe par une approbation.
      </p>
      <AdminCheckboxField
        label="Activé chez FixPay"
        hint="Le BIN devient émissible pour les clients."
        {...register("fixpay_enabled")}
      />
      <AdminCheckboxField
        label="E-mail requis à l'émission"
        {...register("requires_email")}
      />
      <FormActions
        onCancel={onCancel}
        submitLabel="Soumettre pour approbation"
        pending={isSubmitting}
      />
    </form>
  );
}

export default function BinsPage() {
  const { data, isPending, isError, error } = useBins();
  const [editing, setEditing] = useState<Bin | null>(null);
  const [outcome, setOutcome] = useState<WriteOutcome<Bin> | null>(null);

  const rows = data?.items ?? [];

  return (
    <>
      <AdminPageHeader
        title="BIN cartes"
        description="Curation des BIN émissibles. Activer un BIN est sensible : soumis à approbation."
      />

      {outcome ? <WriteResultBanner outcome={outcome} className="mb-4" /> : null}

      <AdminCard>
        {isPending ? (
          <AdminLoading />
        ) : isError ? (
          <div className="p-4">
            <InlineError error={error} />
          </div>
        ) : rows.length === 0 ? (
          <AdminEmpty>Aucun BIN synchronisé.</AdminEmpty>
        ) : (
          <TableScroll>
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-border text-text-muted border-b text-[12px]">
                  <th className="px-4 py-3 font-medium">BIN</th>
                  <th className="px-4 py-3 font-medium">Organisation</th>
                  <th className="px-4 py-3 font-medium">Pays</th>
                  <th className="px-4 py-3 font-medium">Fournisseur</th>
                  <th className="px-4 py-3 font-medium">FixPay</th>
                  <th className="px-4 py-3 font-medium">E-mail requis</th>
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((bin) => (
                  <tr
                    key={bin.uuid}
                    className="border-border text-text border-b last:border-0"
                  >
                    <td className="px-4 py-3 font-medium tabular-nums">
                      {bin.bin}
                    </td>
                    <td className="text-text-secondary px-4 py-3">
                      {bin.organization ?? "—"}
                    </td>
                    <td className="text-text-secondary px-4 py-3">
                      {bin.country ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <BoolPill value={bin.provider_enabled} />
                    </td>
                    <td className="px-4 py-3">
                      <BoolPill value={bin.fixpay_enabled} />
                    </td>
                    <td className="px-4 py-3">
                      <BoolPill value={bin.requires_email} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <PermissionGate permission={Permission.ConfigWrite}>
                        <button
                          type="button"
                          onClick={() => {
                            setOutcome(null);
                            setEditing(bin);
                          }}
                          className="text-primary hover:bg-primary-tint rounded-md px-2.5 py-1.5 text-[13px] font-semibold transition-colors"
                        >
                          Curer
                        </button>
                      </PermissionGate>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        )}
      </AdminCard>

      <AdminModal
        open={editing !== null}
        title="Curer le BIN"
        onClose={() => setEditing(null)}
      >
        {editing ? (
          <CurateForm
            bin={editing}
            onDone={(o) => {
              setOutcome(o);
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        ) : null}
      </AdminModal>
    </>
  );
}
