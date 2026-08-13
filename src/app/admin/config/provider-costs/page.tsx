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
  StatusPill,
  TableScroll,
} from "@/components/admin/ui";
import { TextField } from "@/components/form/TextField";
import { InlineError } from "@/components/feedback/InlineError";
import {
  useCreateProviderCost,
  useDeactivateProviderCost,
  useProviderCosts,
  useUpdateProviderCost,
} from "@/lib/admin/hooks";
import { Permission } from "@/lib/admin/permissions";
import {
  COST_TYPE_OPTIONS,
  CURRENCY_OPTIONS,
  EVENT_TYPE_OPTIONS,
  labelOf,
  PROVIDER_OPTIONS,
  SCOPE_TYPE_OPTIONS,
} from "@/lib/admin/options";
import type { ProviderCost, WriteOutcome } from "@/lib/admin/types";
import {
  providerCostCreateSchema,
  providerCostUpdateSchema,
  toCreateProviderCost,
  toUpdateProviderCost,
  type ProviderCostCreateForm,
  type ProviderCostUpdateForm,
} from "@/lib/admin/formSchemas";
import { applyApiErrors } from "@/lib/forms/applyApiErrors";

function CreateForm({
  onDone,
  onCancel,
}: {
  onDone: (o: WriteOutcome<ProviderCost>) => void;
  onCancel: () => void;
}) {
  const mutation = useCreateProviderCost();
  const [formError, setFormError] = useState<unknown>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProviderCostCreateForm>({
    resolver: zodResolver(providerCostCreateSchema),
    defaultValues: {
      provider: "zayono",
      event_type: "withdrawal",
      scope_type: "global",
      scope_value: "",
      cost_type: "fixed",
      cost_value: "",
      failure_cost_minor: "",
      currency: "XOF",
      effective_from: "",
      effective_to: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      onDone(await mutation.mutateAsync(toCreateProviderCost(values)));
    } catch (err) {
      if (!applyApiErrors(err, setError)) setFormError(err);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <InlineError error={formError} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AdminSelectField
          label="Fournisseur"
          options={PROVIDER_OPTIONS}
          error={errors.provider?.message}
          {...register("provider")}
        />
        <AdminSelectField
          label="Type d'événement"
          options={EVENT_TYPE_OPTIONS}
          error={errors.event_type?.message}
          {...register("event_type")}
        />
        <AdminSelectField
          label="Portée"
          options={SCOPE_TYPE_OPTIONS}
          error={errors.scope_type?.message}
          {...register("scope_type")}
        />
        <TextField
          label="Valeur de portée"
          hint="Vide pour une portée globale."
          error={errors.scope_value?.message}
          {...register("scope_value")}
        />
        <AdminSelectField
          label="Type de coût"
          options={COST_TYPE_OPTIONS}
          error={errors.cost_type?.message}
          {...register("cost_type")}
        />
        <TextField
          label="Valeur de coût"
          inputMode="decimal"
          error={errors.cost_value?.message}
          {...register("cost_value")}
        />
        <TextField
          label="Coût d'échec (minor)"
          inputMode="numeric"
          error={errors.failure_cost_minor?.message}
          {...register("failure_cost_minor")}
        />
        <AdminSelectField
          label="Devise"
          options={CURRENCY_OPTIONS}
          error={errors.currency?.message}
          {...register("currency")}
        />
        <TextField
          label="Effet à partir de"
          type="datetime-local"
          error={errors.effective_from?.message}
          {...register("effective_from")}
        />
        <TextField
          label="Effet jusqu'à"
          type="datetime-local"
          error={errors.effective_to?.message}
          {...register("effective_to")}
        />
      </div>
      <FormActions onCancel={onCancel} submitLabel="Créer" pending={isSubmitting} />
    </form>
  );
}

function EditForm({
  cost,
  onDone,
  onCancel,
}: {
  cost: ProviderCost;
  onDone: (o: WriteOutcome<ProviderCost>) => void;
  onCancel: () => void;
}) {
  const mutation = useUpdateProviderCost();
  const [formError, setFormError] = useState<unknown>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProviderCostUpdateForm>({
    resolver: zodResolver(providerCostUpdateSchema),
    defaultValues: {
      cost_type: cost.cost_type,
      cost_value: cost.cost_value ?? "",
      failure_cost_minor:
        cost.failure_cost_minor === null ? "" : String(cost.failure_cost_minor),
      effective_to: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      onDone(
        await mutation.mutateAsync({
          uuid: cost.uuid,
          input: toUpdateProviderCost(values),
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
        <AdminSelectField
          label="Type de coût"
          options={COST_TYPE_OPTIONS}
          error={errors.cost_type?.message}
          {...register("cost_type")}
        />
        <TextField
          label="Valeur de coût"
          inputMode="decimal"
          error={errors.cost_value?.message}
          {...register("cost_value")}
        />
        <TextField
          label="Coût d'échec (minor)"
          inputMode="numeric"
          error={errors.failure_cost_minor?.message}
          {...register("failure_cost_minor")}
        />
        <TextField
          label="Effet jusqu'à"
          type="datetime-local"
          error={errors.effective_to?.message}
          {...register("effective_to")}
        />
      </div>
      <FormActions onCancel={onCancel} submitLabel="Enregistrer" pending={isSubmitting} />
    </form>
  );
}

type ModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; cost: ProviderCost };

export default function ProviderCostsPage() {
  const { data, isPending, isError, error, refetch } = useProviderCosts();
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [outcome, setOutcome] = useState<WriteOutcome<ProviderCost> | null>(null);
  const [writeError, setWriteError] = useState<unknown>(null);
  const deactivate = useDeactivateProviderCost();

  const rows = data?.items ?? [];

  const resetBanners = () => {
    setOutcome(null);
    setWriteError(null);
  };

  const onDone = (o: WriteOutcome<ProviderCost>) => {
    setWriteError(null);
    setOutcome(o);
    setModal({ mode: "closed" });
  };

  return (
    <>
      <AdminPageHeader
        title="Coûts fournisseurs"
        description="Le coût réel facturé par VCC / Zayono. Appliqué directement (non soumis à approbation)."
        actions={
          <PermissionGate permission={Permission.ConfigWrite}>
            <button
              type="button"
              onClick={() => {
                resetBanners();
                setModal({ mode: "create" });
              }}
              className="bg-primary focus-visible:ring-primary/60 flex h-10 items-center gap-1.5 rounded-md px-3.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
            >
              <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
              Nouveau coût
            </button>
          </PermissionGate>
        }
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
          <AdminEmpty>Aucun coût fournisseur.</AdminEmpty>
        ) : (
          <TableScroll>
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-border text-text-muted border-b text-[12px]">
                  <th className="px-4 py-3 font-medium">Fournisseur</th>
                  <th className="px-4 py-3 font-medium">Événement</th>
                  <th className="px-4 py-3 font-medium">Portée</th>
                  <th className="px-4 py-3 font-medium">Coût</th>
                  <th className="px-4 py-3 font-medium">Devise</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((cost) => (
                  <tr
                    key={cost.uuid}
                    className="border-border text-text border-b last:border-0"
                  >
                    <td className="px-4 py-3">
                      {labelOf(PROVIDER_OPTIONS, cost.provider)}
                    </td>
                    <td className="px-4 py-3">
                      {labelOf(EVENT_TYPE_OPTIONS, cost.event_type)}
                    </td>
                    <td className="text-text-secondary px-4 py-3">
                      {labelOf(SCOPE_TYPE_OPTIONS, cost.scope_type)}
                      {cost.scope_value ? ` · ${cost.scope_value}` : ""}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {cost.cost_value}
                      {cost.cost_type === "percent" ? " %" : ""}
                    </td>
                    <td className="px-4 py-3">{cost.currency}</td>
                    <td className="px-4 py-3">
                      <StatusPill tone="neutral">{cost.source}</StatusPill>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <PermissionGate permission={Permission.ConfigWrite}>
                        <button
                          type="button"
                          onClick={() => {
                            resetBanners();
                            setModal({ mode: "edit", cost });
                          }}
                          className="text-primary hover:bg-primary-tint mr-1 rounded-md px-2.5 py-1.5 text-[13px] font-semibold transition-colors"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          disabled={deactivate.isPending}
                          onClick={async () => {
                            resetBanners();
                            try {
                              setOutcome(await deactivate.mutateAsync(cost.uuid));
                            } catch (err) {
                              setWriteError(err);
                              void refetch();
                            }
                          }}
                          className="text-danger hover:bg-danger/10 rounded-md px-2.5 py-1.5 text-[13px] font-semibold transition-colors disabled:opacity-50"
                        >
                          Désactiver
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
        title="Nouveau coût fournisseur"
        onClose={() => setModal({ mode: "closed" })}
      >
        <CreateForm onDone={onDone} onCancel={() => setModal({ mode: "closed" })} />
      </AdminModal>
      <AdminModal
        open={modal.mode === "edit"}
        title="Modifier le coût fournisseur"
        onClose={() => setModal({ mode: "closed" })}
      >
        {modal.mode === "edit" ? (
          <EditForm
            cost={modal.cost}
            onDone={onDone}
            onCancel={() => setModal({ mode: "closed" })}
          />
        ) : null}
      </AdminModal>
    </>
  );
}
