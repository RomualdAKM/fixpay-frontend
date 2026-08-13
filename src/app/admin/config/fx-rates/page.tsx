"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AdminModal } from "@/components/admin/AdminModal";
import { PermissionGate } from "@/components/admin/PermissionGate";
import { WriteResultBanner } from "@/components/admin/WriteResultBanner";
import { AdminSelectField, FormActions } from "@/components/admin/fields";
import {
  AdminCard,
  AdminEmpty,
  AdminLoading,
  AdminPageHeader,
  TableScroll,
} from "@/components/admin/ui";
import { TextField } from "@/components/form/TextField";
import { InlineError } from "@/components/feedback/InlineError";
import { useCreateFxRate, useFxRates } from "@/lib/admin/hooks";
import { Permission } from "@/lib/admin/permissions";
import { CURRENCY_OPTIONS } from "@/lib/admin/options";
import type { FxRate, WriteOutcome } from "@/lib/admin/types";
import {
  fxRateCreateSchema,
  toCreateFxRate,
  type FxRateCreateForm,
} from "@/lib/admin/formSchemas";
import { applyApiErrors } from "@/lib/forms/applyApiErrors";
import { formatDate } from "@/lib/format";

function CreateForm({
  onDone,
  onCancel,
}: {
  onDone: (o: WriteOutcome<FxRate>) => void;
  onCancel: () => void;
}) {
  const mutation = useCreateFxRate();
  const [formError, setFormError] = useState<unknown>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FxRateCreateForm>({
    resolver: zodResolver(fxRateCreateSchema),
    defaultValues: {
      base_currency: "USD",
      quote_currency: "XOF",
      rate: "",
      margin_percent: "",
      effective_from: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      onDone(await mutation.mutateAsync(toCreateFxRate(values)));
    } catch (err) {
      if (!applyApiErrors(err, setError)) setFormError(err);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <InlineError error={formError} />
      <p className="text-text-muted text-[13px] leading-[18px]">
        Les taux de change sont en ajout seul : on ne modifie ni ne supprime un
        taux, on en publie un nouveau avec sa date d&apos;effet. La publication est
        sensible et passe par une approbation.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AdminSelectField
          label="Devise de base"
          options={CURRENCY_OPTIONS}
          error={errors.base_currency?.message}
          {...register("base_currency")}
        />
        <AdminSelectField
          label="Devise cotée"
          options={CURRENCY_OPTIONS}
          error={errors.quote_currency?.message}
          {...register("quote_currency")}
        />
        <TextField
          label="Taux"
          inputMode="decimal"
          error={errors.rate?.message}
          {...register("rate")}
        />
        <TextField
          label="Marge (%)"
          inputMode="decimal"
          hint="Optionnel."
          error={errors.margin_percent?.message}
          {...register("margin_percent")}
        />
        <TextField
          label="Effet à partir de"
          type="datetime-local"
          error={errors.effective_from?.message}
          {...register("effective_from")}
        />
      </div>
      <FormActions
        onCancel={onCancel}
        submitLabel="Soumettre pour approbation"
        pending={isSubmitting}
      />
    </form>
  );
}

export default function FxRatesPage() {
  const { data, isPending, isError, error } = useFxRates();
  const [open, setOpen] = useState(false);
  const [outcome, setOutcome] = useState<WriteOutcome<FxRate> | null>(null);

  const rows = data?.items ?? [];

  return (
    <>
      <AdminPageHeader
        title="Taux de change"
        description="Historique append-only des taux USD/XOF. Création uniquement."
        actions={
          <PermissionGate permission={Permission.ConfigWrite}>
            <button
              type="button"
              onClick={() => {
                setOutcome(null);
                setOpen(true);
              }}
              className="bg-primary focus-visible:ring-primary/60 flex h-10 items-center gap-1.5 rounded-md px-3.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
            >
              <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
              Nouveau taux
            </button>
          </PermissionGate>
        }
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
          <AdminEmpty>Aucun taux de change publié.</AdminEmpty>
        ) : (
          <TableScroll>
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-border text-text-muted border-b text-[12px]">
                  <th className="px-4 py-3 font-medium">Paire</th>
                  <th className="px-4 py-3 font-medium">Taux</th>
                  <th className="px-4 py-3 font-medium">Marge</th>
                  <th className="px-4 py-3 font-medium">Effet</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((rate) => (
                  <tr
                    key={rate.uuid}
                    className="border-border text-text border-b last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">
                      {rate.base_currency} / {rate.quote_currency}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{rate.rate}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {rate.margin_percent === null
                        ? "—"
                        : `${rate.margin_percent} %`}
                    </td>
                    <td className="text-text-secondary px-4 py-3">
                      {formatDate(rate.effective_from)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        )}
      </AdminCard>

      <AdminModal
        open={open}
        title="Publier un taux de change"
        onClose={() => setOpen(false)}
      >
        <CreateForm
          onDone={(o) => {
            setOutcome(o);
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      </AdminModal>
    </>
  );
}
