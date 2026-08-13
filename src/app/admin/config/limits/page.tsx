"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AdminModal } from "@/components/admin/AdminModal";
import { PermissionGate } from "@/components/admin/PermissionGate";
import { WriteResultBanner } from "@/components/admin/WriteResultBanner";
import {
  AdminCheckboxField,
  AdminSelectField,
  FormActions,
} from "@/components/admin/fields";
import {
  AdminCard,
  AdminEmpty,
  AdminLoading,
  AdminPageHeader,
  BoolPill,
  TableScroll,
} from "@/components/admin/ui";
import { TextField } from "@/components/form/TextField";
import { InlineError } from "@/components/feedback/InlineError";
import { useCreateLimit, useLimits, useUpdateLimit } from "@/lib/admin/hooks";
import { Permission } from "@/lib/admin/permissions";
import {
  CURRENCY_OPTIONS,
  labelOf,
  LIMIT_TYPE_OPTIONS,
} from "@/lib/admin/options";
import type { Limit, WriteOutcome } from "@/lib/admin/types";
import {
  limitCreateSchema,
  limitUpdateSchema,
  toCreateLimit,
  toUpdateLimit,
  type LimitCreateForm,
  type LimitUpdateForm,
} from "@/lib/admin/formSchemas";
import { applyApiErrors } from "@/lib/forms/applyApiErrors";

const CURRENCY_WITH_BLANK = [{ value: "", label: "— (aucune) —" }, ...CURRENCY_OPTIONS];

function CreateForm({
  onDone,
  onCancel,
}: {
  onDone: (o: WriteOutcome<Limit>) => void;
  onCancel: () => void;
}) {
  const mutation = useCreateLimit();
  const [formError, setFormError] = useState<unknown>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LimitCreateForm>({
    resolver: zodResolver(limitCreateSchema),
    defaultValues: {
      kyc_level: "0",
      limit_type: "daily_deposit",
      value_minor: "",
      currency: "XOF",
      value_count: "",
      effective: true,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      onDone(await mutation.mutateAsync(toCreateLimit(values)));
    } catch (err) {
      if (!applyApiErrors(err, setError)) setFormError(err);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <InlineError error={formError} />
      <p className="text-text-muted text-[13px] leading-[18px]">
        Un plafond de type montant exige value_minor + devise ; un plafond de
        type comptage exige value_count. La règle exacte est validée côté serveur.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Niveau KYC (0–5)"
          inputMode="numeric"
          error={errors.kyc_level?.message}
          {...register("kyc_level")}
        />
        <AdminSelectField
          label="Type de plafond"
          options={LIMIT_TYPE_OPTIONS}
          error={errors.limit_type?.message}
          {...register("limit_type")}
        />
        <TextField
          label="Valeur montant (minor)"
          inputMode="numeric"
          hint="Plafonds de type montant."
          error={errors.value_minor?.message}
          {...register("value_minor")}
        />
        <AdminSelectField
          label="Devise"
          options={CURRENCY_WITH_BLANK}
          error={errors.currency?.message}
          {...register("currency")}
        />
        <TextField
          label="Valeur comptage"
          inputMode="numeric"
          hint="Plafonds de type comptage."
          error={errors.value_count?.message}
          {...register("value_count")}
        />
      </div>
      <AdminCheckboxField
        label="Actif"
        hint="Le plafond est appliqué lorsqu'il est actif."
        {...register("effective")}
      />
      <FormActions
        onCancel={onCancel}
        submitLabel="Soumettre pour approbation"
        pending={isSubmitting}
      />
    </form>
  );
}

function EditForm({
  limit,
  onDone,
  onCancel,
}: {
  limit: Limit;
  onDone: (o: WriteOutcome<Limit>) => void;
  onCancel: () => void;
}) {
  const mutation = useUpdateLimit();
  const [formError, setFormError] = useState<unknown>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LimitUpdateForm>({
    resolver: zodResolver(limitUpdateSchema),
    defaultValues: {
      value_minor: limit.value_minor === null ? "" : String(limit.value_minor),
      currency: limit.currency ?? "",
      value_count: limit.value_count === null ? "" : String(limit.value_count),
      effective: limit.effective,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      onDone(
        await mutation.mutateAsync({
          uuid: limit.uuid,
          input: toUpdateLimit(values),
        }),
      );
    } catch (err) {
      if (!applyApiErrors(err, setError)) setFormError(err);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <InlineError error={formError} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Valeur montant (minor)"
          inputMode="numeric"
          error={errors.value_minor?.message}
          {...register("value_minor")}
        />
        <AdminSelectField
          label="Devise"
          options={CURRENCY_WITH_BLANK}
          error={errors.currency?.message}
          {...register("currency")}
        />
        <TextField
          label="Valeur comptage"
          inputMode="numeric"
          error={errors.value_count?.message}
          {...register("value_count")}
        />
      </div>
      <AdminCheckboxField label="Actif" {...register("effective")} />
      <FormActions
        onCancel={onCancel}
        submitLabel="Soumettre pour approbation"
        pending={isSubmitting}
      />
    </form>
  );
}

type ModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; limit: Limit };

export default function LimitsPage() {
  const { data, isPending, isError, error } = useLimits();
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [outcome, setOutcome] = useState<WriteOutcome<Limit> | null>(null);

  const rows = data?.items ?? [];
  const onDone = (o: WriteOutcome<Limit>) => {
    setOutcome(o);
    setModal({ mode: "closed" });
  };

  return (
    <>
      <AdminPageHeader
        title="Limites"
        description="Plafonds réglementaires par niveau KYC. Sensible : soumis à approbation."
        actions={
          <PermissionGate permission={Permission.ConfigWrite}>
            <button
              type="button"
              onClick={() => {
                setOutcome(null);
                setModal({ mode: "create" });
              }}
              className="bg-primary focus-visible:ring-primary/60 flex h-10 items-center gap-1.5 rounded-md px-3.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
            >
              <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
              Nouvelle limite
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
          <AdminEmpty>Aucune limite configurée.</AdminEmpty>
        ) : (
          <TableScroll>
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-border text-text-muted border-b text-[12px]">
                  <th className="px-4 py-3 font-medium">KYC</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Mesure</th>
                  <th className="px-4 py-3 font-medium">Valeur</th>
                  <th className="px-4 py-3 font-medium">Actif</th>
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((limit) => (
                  <tr
                    key={limit.uuid}
                    className="border-border text-text border-b last:border-0"
                  >
                    <td className="px-4 py-3 tabular-nums">{limit.kyc_level}</td>
                    <td className="px-4 py-3">
                      {labelOf(LIMIT_TYPE_OPTIONS, limit.limit_type)}
                    </td>
                    <td className="text-text-secondary px-4 py-3">
                      {limit.measure === "amount" ? "Montant" : "Comptage"} ·{" "}
                      {limit.period}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {limit.measure === "amount"
                        ? `${limit.value_minor ?? "—"} ${limit.currency ?? ""}`
                        : (limit.value_count ?? "—")}
                    </td>
                    <td className="px-4 py-3">
                      <BoolPill value={limit.effective} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <PermissionGate permission={Permission.ConfigWrite}>
                        <button
                          type="button"
                          onClick={() => {
                            setOutcome(null);
                            setModal({ mode: "edit", limit });
                          }}
                          className="text-primary hover:bg-primary-tint rounded-md px-2.5 py-1.5 text-[13px] font-semibold transition-colors"
                        >
                          Modifier
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
        open={modal.mode === "create"}
        title="Nouvelle limite"
        onClose={() => setModal({ mode: "closed" })}
      >
        <CreateForm onDone={onDone} onCancel={() => setModal({ mode: "closed" })} />
      </AdminModal>
      <AdminModal
        open={modal.mode === "edit"}
        title="Modifier la limite"
        onClose={() => setModal({ mode: "closed" })}
      >
        {modal.mode === "edit" ? (
          <EditForm
            limit={modal.limit}
            onDone={onDone}
            onCancel={() => setModal({ mode: "closed" })}
          />
        ) : null}
      </AdminModal>
    </>
  );
}
