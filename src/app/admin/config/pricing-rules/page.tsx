"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AdminModal } from "@/components/admin/AdminModal";
import { PermissionGate } from "@/components/admin/PermissionGate";
import { WriteResultBanner } from "@/components/admin/WriteResultBanner";
import {
  AdminSelectField,
  FormActions,
} from "@/components/admin/fields";
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
  useCreatePricingRule,
  useDeactivatePricingRule,
  usePricingRules,
  useUpdatePricingRule,
} from "@/lib/admin/hooks";
import { Permission } from "@/lib/admin/permissions";
import {
  CHANNEL_OPTIONS,
  CURRENCY_OPTIONS,
  EVENT_TYPE_OPTIONS,
  FAILURE_BEARER_OPTIONS,
  labelOf,
  MARGIN_TYPE_OPTIONS,
  SCOPE_TYPE_OPTIONS,
} from "@/lib/admin/options";
import type { PricingRule, WriteOutcome } from "@/lib/admin/types";
import {
  pricingRuleCreateSchema,
  pricingRuleUpdateSchema,
  toCreatePricingRule,
  toUpdatePricingRule,
  type PricingRuleCreateForm,
  type PricingRuleUpdateForm,
} from "@/lib/admin/formSchemas";
import { applyApiErrors } from "@/lib/forms/applyApiErrors";

const SENSITIVE_NOTE =
  "Les règles de tarification sont sensibles : toute création ou modification passe par le circuit maker-checker et n'est PAS appliquée immédiatement — elle attend l'approbation d'une autre personne.";

function CreateForm({
  onDone,
  onCancel,
}: {
  onDone: (outcome: WriteOutcome<PricingRule>) => void;
  onCancel: () => void;
}) {
  const mutation = useCreatePricingRule();
  const [formError, setFormError] = useState<unknown>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PricingRuleCreateForm>({
    resolver: zodResolver(pricingRuleCreateSchema),
    defaultValues: {
      event_type: "withdrawal",
      channel: "app",
      scope_type: "global",
      scope_value: "",
      margin_type: "fixed",
      margin_value: "",
      min_margin_minor: "",
      max_margin_minor: "",
      failure_cost_bearer: "fixpay",
      currency: "XOF",
      effective_from: "",
      effective_to: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const outcome = await mutation.mutateAsync(toCreatePricingRule(values));
      onDone(outcome);
    } catch (error) {
      if (!applyApiErrors(error, setError)) setFormError(error);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <InlineError error={formError} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AdminSelectField
          label="Type d'événement"
          options={EVENT_TYPE_OPTIONS}
          error={errors.event_type?.message}
          {...register("event_type")}
        />
        <AdminSelectField
          label="Canal"
          options={CHANNEL_OPTIONS}
          error={errors.channel?.message}
          {...register("channel")}
        />
        <AdminSelectField
          label="Portée"
          options={SCOPE_TYPE_OPTIONS}
          error={errors.scope_type?.message}
          {...register("scope_type")}
        />
        <TextField
          label="Valeur de portée (BIN / code / uuid)"
          hint="Vide pour une portée globale."
          error={errors.scope_value?.message}
          {...register("scope_value")}
        />
        <AdminSelectField
          label="Type de marge"
          options={MARGIN_TYPE_OPTIONS}
          error={errors.margin_type?.message}
          {...register("margin_type")}
        />
        <TextField
          label="Valeur de marge"
          inputMode="decimal"
          error={errors.margin_value?.message}
          {...register("margin_value")}
        />
        <TextField
          label="Marge min. (minor)"
          inputMode="numeric"
          error={errors.min_margin_minor?.message}
          {...register("min_margin_minor")}
        />
        <TextField
          label="Marge max. (minor)"
          inputMode="numeric"
          error={errors.max_margin_minor?.message}
          {...register("max_margin_minor")}
        />
        <AdminSelectField
          label="Porteur du coût d'échec"
          options={FAILURE_BEARER_OPTIONS}
          error={errors.failure_cost_bearer?.message}
          {...register("failure_cost_bearer")}
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
      <FormActions
        onCancel={onCancel}
        submitLabel="Soumettre pour approbation"
        pending={isSubmitting}
      />
    </form>
  );
}

function EditForm({
  rule,
  onDone,
  onCancel,
}: {
  rule: PricingRule;
  onDone: (outcome: WriteOutcome<PricingRule>) => void;
  onCancel: () => void;
}) {
  const mutation = useUpdatePricingRule();
  const [formError, setFormError] = useState<unknown>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PricingRuleUpdateForm>({
    resolver: zodResolver(pricingRuleUpdateSchema),
    defaultValues: {
      margin_type: rule.margin_type,
      margin_value: rule.margin_value ?? "",
      min_margin_minor:
        rule.min_margin_minor === null ? "" : String(rule.min_margin_minor),
      max_margin_minor:
        rule.max_margin_minor === null ? "" : String(rule.max_margin_minor),
      failure_cost_bearer: rule.failure_cost_bearer,
      effective_to: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const outcome = await mutation.mutateAsync({
        uuid: rule.uuid,
        input: toUpdatePricingRule(values),
      });
      onDone(outcome);
    } catch (error) {
      if (!applyApiErrors(error, setError)) setFormError(error);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <InlineError error={formError} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AdminSelectField
          label="Type de marge"
          options={MARGIN_TYPE_OPTIONS}
          error={errors.margin_type?.message}
          {...register("margin_type")}
        />
        <TextField
          label="Valeur de marge"
          inputMode="decimal"
          error={errors.margin_value?.message}
          {...register("margin_value")}
        />
        <TextField
          label="Marge min. (minor)"
          inputMode="numeric"
          error={errors.min_margin_minor?.message}
          {...register("min_margin_minor")}
        />
        <TextField
          label="Marge max. (minor)"
          inputMode="numeric"
          error={errors.max_margin_minor?.message}
          {...register("max_margin_minor")}
        />
        <AdminSelectField
          label="Porteur du coût d'échec"
          options={FAILURE_BEARER_OPTIONS}
          error={errors.failure_cost_bearer?.message}
          {...register("failure_cost_bearer")}
        />
        <TextField
          label="Effet jusqu'à"
          type="datetime-local"
          error={errors.effective_to?.message}
          {...register("effective_to")}
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

type ModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; rule: PricingRule };

export default function PricingRulesPage() {
  const { data, isPending, isError, error, refetch } = usePricingRules();
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [outcome, setOutcome] = useState<WriteOutcome<PricingRule> | null>(null);
  const [writeError, setWriteError] = useState<unknown>(null);
  const deactivate = useDeactivatePricingRule();

  const rows = data?.items ?? [];

  const resetBanners = () => {
    setOutcome(null);
    setWriteError(null);
  };

  const onDone = (result: WriteOutcome<PricingRule>) => {
    setWriteError(null);
    setOutcome(result);
    setModal({ mode: "closed" });
  };

  return (
    <>
      <AdminPageHeader
        title="Règles de tarification"
        description="La marge FixPay appliquée par événement, canal et portée."
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
              Nouvelle règle
            </button>
          </PermissionGate>
        }
      />

      <p className="border-warning-border bg-warning-tint text-warning-deep mb-4 rounded-md border px-3.5 py-2.5 text-[13px] leading-[18px]">
        {SENSITIVE_NOTE}
      </p>

      {outcome ? (
        <WriteResultBanner outcome={outcome} className="mb-4" />
      ) : null}
      <InlineError error={writeError} className="mb-4" />

      <AdminCard>
        {isPending ? (
          <AdminLoading />
        ) : isError ? (
          <div className="p-4">
            <InlineError error={error} />
          </div>
        ) : rows.length === 0 ? (
          <AdminEmpty>Aucune règle de tarification.</AdminEmpty>
        ) : (
          <TableScroll>
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-border text-text-muted border-b text-[12px]">
                  <th className="px-4 py-3 font-medium">Événement</th>
                  <th className="px-4 py-3 font-medium">Canal</th>
                  <th className="px-4 py-3 font-medium">Portée</th>
                  <th className="px-4 py-3 font-medium">Marge</th>
                  <th className="px-4 py-3 font-medium">Coût échec</th>
                  <th className="px-4 py-3 font-medium">Devise</th>
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((rule) => (
                  <tr
                    key={rule.uuid}
                    className="border-border text-text border-b last:border-0"
                  >
                    <td className="px-4 py-3">
                      {labelOf(EVENT_TYPE_OPTIONS, rule.event_type)}
                    </td>
                    <td className="px-4 py-3">
                      {labelOf(CHANNEL_OPTIONS, rule.channel)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-text-secondary">
                        {labelOf(SCOPE_TYPE_OPTIONS, rule.scope_type)}
                        {rule.scope_value ? ` · ${rule.scope_value}` : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {rule.margin_value}
                      {rule.margin_type === "percent" ? " %" : ""}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill
                        tone={
                          rule.failure_cost_bearer === "fixpay"
                            ? "warning"
                            : "neutral"
                        }
                      >
                        {labelOf(FAILURE_BEARER_OPTIONS, rule.failure_cost_bearer)}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-3">{rule.currency}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <PermissionGate permission={Permission.ConfigWrite}>
                        <button
                          type="button"
                          onClick={() => {
                            resetBanners();
                            setModal({ mode: "edit", rule });
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
                              setOutcome(await deactivate.mutateAsync(rule.uuid));
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
        title="Nouvelle règle de tarification"
        onClose={() => setModal({ mode: "closed" })}
      >
        <CreateForm onDone={onDone} onCancel={() => setModal({ mode: "closed" })} />
      </AdminModal>

      <AdminModal
        open={modal.mode === "edit"}
        title="Modifier la règle de tarification"
        onClose={() => setModal({ mode: "closed" })}
      >
        {modal.mode === "edit" ? (
          <EditForm
            rule={modal.rule}
            onDone={onDone}
            onCancel={() => setModal({ mode: "closed" })}
          />
        ) : null}
      </AdminModal>
    </>
  );
}
