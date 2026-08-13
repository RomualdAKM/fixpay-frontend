"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { AdminModal } from "@/components/admin/AdminModal";
import { PermissionGate } from "@/components/admin/PermissionGate";
import { WriteResultBanner } from "@/components/admin/WriteResultBanner";
import {
  AdminCheckboxField,
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
import { useConfigs, useUpdateConfig } from "@/lib/admin/hooks";
import { Permission } from "@/lib/admin/permissions";
import type {
  AdminConfig,
  UpdateAdminConfigInput,
  WriteOutcome,
} from "@/lib/admin/types";
import { applyApiErrors } from "@/lib/forms/applyApiErrors";

const SECRET_MASK = "••••••••";

/** Render a config value for the table, never revealing a secret. */
function displayValue(config: AdminConfig): string {
  if (config.is_secret) return SECRET_MASK;
  const value = config.value;
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

interface EditFormValues {
  value: string;
  boolValue: boolean;
}

function EditForm({
  config,
  onDone,
  onCancel,
}: {
  config: AdminConfig;
  onDone: (o: WriteOutcome<AdminConfig>) => void;
  onCancel: () => void;
}) {
  const mutation = useUpdateConfig();
  const [formError, setFormError] = useState<unknown>(null);

  const currentText =
    config.is_secret || config.value === null || config.value === undefined
      ? ""
      : typeof config.value === "object"
        ? JSON.stringify(config.value, null, 2)
        : String(config.value);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({
    defaultValues: {
      value: currentText,
      boolValue:
        config.value_type === "bool" ? config.value === true : false,
    },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);

    let payload: UpdateAdminConfigInput;
    if (config.value_type === "bool") {
      payload = { value: values.boolValue };
    } else if (config.value_type === "json") {
      try {
        payload = { value: JSON.parse(values.value) as unknown };
      } catch {
        setError("value", {
          type: "manual",
          message: "JSON invalide.",
        });
        return;
      }
    } else {
      payload = { value: values.value };
    }

    try {
      onDone(await mutation.mutateAsync({ key: config.key, input: payload }));
    } catch (err) {
      if (!applyApiErrors(err, setError)) setFormError(err);
    }
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <InlineError error={formError} />
      <div className="text-text-muted text-[13px] leading-[18px]">
        <p>
          Clé : <span className="text-text font-mono">{config.key}</span>
        </p>
        <p className="mt-1">
          Type : {config.value_type}
          {config.is_secret ? " · valeur secrète (jamais affichée)" : ""}
        </p>
      </div>

      {config.value_type === "bool" ? (
        <AdminCheckboxField
          label="Activé"
          hint="Valeur booléenne."
          {...register("boolValue")}
        />
      ) : config.value_type === "json" ? (
        <div>
          <label
            htmlFor="config-json"
            className="text-text-secondary block text-[13px] leading-[18px] font-medium"
          >
            Valeur (JSON)
          </label>
          <textarea
            id="config-json"
            rows={6}
            aria-invalid={errors.value ? true : undefined}
            className="border-border-strong bg-surface text-text mt-[6px] w-full rounded-md border px-[13px] py-2.5 font-mono text-[13px] outline-none focus-visible:border-primary focus-visible:ring-primary/60 focus-visible:ring-2 focus-visible:outline-none"
            {...register("value")}
          />
          {errors.value ? (
            <p className="text-danger mt-[6px] text-[12px]">
              {errors.value.message}
            </p>
          ) : null}
        </div>
      ) : (
        <TextField
          label={config.is_secret ? "Nouvelle valeur secrète" : "Valeur"}
          type={config.is_secret ? "password" : "text"}
          inputMode={
            config.value_type === "int" || config.value_type === "decimal"
              ? "decimal"
              : undefined
          }
          placeholder={config.is_secret ? "Saisir pour remplacer" : undefined}
          error={errors.value?.message}
          {...register("value")}
        />
      )}

      <FormActions
        onCancel={onCancel}
        submitLabel="Enregistrer"
        pending={isSubmitting}
      />
    </form>
  );
}

export default function SettingsPage() {
  const { data, isPending, isError, error } = useConfigs();
  const [editing, setEditing] = useState<AdminConfig | null>(null);
  const [outcome, setOutcome] = useState<WriteOutcome<AdminConfig> | null>(null);

  const rows = data?.items ?? [];

  return (
    <>
      <AdminPageHeader
        title="Réglages"
        description="Configuration clé-valeur. Les clés sensibles passent par une approbation ; les valeurs secrètes ne sont jamais affichées en clair."
        actions={
          data ? (
            <StatusPill tone="primary">Version v{data.version}</StatusPill>
          ) : undefined
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
          <AdminEmpty>Aucun réglage.</AdminEmpty>
        ) : (
          <TableScroll>
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-border text-text-muted border-b text-[12px]">
                  <th className="px-4 py-3 font-medium">Clé</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Valeur</th>
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((config) => (
                  <tr
                    key={config.key}
                    className="border-border text-text border-b last:border-0"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-[12px]">{config.key}</span>
                      {config.label ? (
                        <span className="text-text-muted mt-0.5 block text-[12px]">
                          {config.label}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <StatusPill tone="neutral">{config.value_type}</StatusPill>
                        {config.is_secret ? (
                          <StatusPill tone="warning">secret</StatusPill>
                        ) : null}
                      </span>
                    </td>
                    <td className="text-text-secondary px-4 py-3">
                      <span className="font-mono text-[12px] break-all">
                        {displayValue(config)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <PermissionGate permission={Permission.ConfigWrite}>
                        <button
                          type="button"
                          onClick={() => {
                            setOutcome(null);
                            setEditing(config);
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
        open={editing !== null}
        title="Modifier le réglage"
        onClose={() => setEditing(null)}
      >
        {editing ? (
          <EditForm
            config={editing}
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
