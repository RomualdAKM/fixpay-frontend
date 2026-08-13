"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Copy, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AdminModal } from "@/components/admin/AdminModal";
import { AdminSectionGuard } from "@/components/admin/AdminSectionGuard";
import { PermissionGate } from "@/components/admin/PermissionGate";
import { WriteResultBanner } from "@/components/admin/WriteResultBanner";
import { AdminCheckboxField, FormActions } from "@/components/admin/fields";
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
  useCreateMerchant,
  useCreditMerchantWallet,
  useIssueMerchantKey,
  useMerchants,
  useRevokeMerchantKey,
} from "@/lib/admin/hooks";
import { Permission } from "@/lib/admin/permissions";
import type {
  B2bMerchant,
  IssuedApiKey,
  WriteOutcome,
} from "@/lib/admin/types";
import {
  creditWalletSchema,
  merchantCreateSchema,
  toCreateMerchant,
  toCreditWallet,
  type CreditWalletForm,
  type MerchantCreateForm,
} from "@/lib/admin/formSchemas";
import { applyApiErrors } from "@/lib/forms/applyApiErrors";
import { formatDate } from "@/lib/format";

/** Copy text to the clipboard when the API is available (guarded for SSR/tests). */
async function copyToClipboard(text: string): Promise<void> {
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    await navigator.clipboard.writeText(text);
  }
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <p className="text-text-secondary text-[12px] font-medium">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <code className="border-border bg-surface text-text min-w-0 flex-1 truncate rounded-md border px-2.5 py-1.5 font-mono text-[12px]">
          {value}
        </code>
        <button
          type="button"
          onClick={() => {
            void copyToClipboard(value).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            });
          }}
          className="border-border bg-surface text-text hover:bg-surface-2 focus-visible:ring-primary/60 flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <Copy size={13} aria-hidden="true" />
          {copied ? "Copié" : "Copier"}
        </button>
      </div>
    </div>
  );
}

/**
 * The ONE-TIME reveal of a freshly issued API key. The secret and webhook secret
 * are shown here only, never re-fetched or persisted. Closing the modal drops
 * them from memory for good.
 */
function IssuedKeyModal({
  issued,
  onClose,
}: {
  issued: IssuedApiKey;
  onClose: () => void;
}) {
  return (
    <AdminModal open title="Clé API émise" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="border-warning-border bg-warning-tint flex items-start gap-2.5 rounded-md border px-3.5 py-3">
          <AlertTriangle
            size={16}
            aria-hidden="true"
            className="text-warning-deep mt-[1px] shrink-0"
          />
          <p className="text-text-secondary text-[13px] leading-[18px]">
            <span className="text-warning-deep font-semibold">
              Copiez ces secrets maintenant.
            </span>{" "}
            Ils ne sont affichés qu&apos;une seule fois : ni FixPay ni cet écran ne
            pourront les ré-afficher. Transmettez-les au marchand par un canal sûr.
          </p>
        </div>
        <CopyRow label="Clé publique" value={issued.key.public_key} />
        <CopyRow label="Secret (API)" value={issued.secret} />
        <CopyRow label="Secret webhook" value={issued.webhook_secret} />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-primary focus-visible:ring-primary/60 flex h-11 items-center rounded-md px-5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
          >
            J&apos;ai copié les secrets
          </button>
        </div>
      </div>
    </AdminModal>
  );
}

function CreateMerchantForm({
  onDone,
  onCancel,
}: {
  onDone: (outcome: WriteOutcome<B2bMerchant>) => void;
  onCancel: () => void;
}) {
  const mutation = useCreateMerchant();
  const [formError, setFormError] = useState<unknown>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MerchantCreateForm>({
    resolver: zodResolver(merchantCreateSchema),
    defaultValues: {
      name: "",
      contact_email: "",
      webhook_url: "",
      default_bin_uuid: "",
      can_reveal_pan: false,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      onDone(await mutation.mutateAsync(toCreateMerchant(values)));
    } catch (err) {
      if (!applyApiErrors(err, setError)) setFormError(err);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <InlineError error={formError} />
      <TextField
        label="Nom du marchand"
        error={errors.name?.message}
        {...register("name")}
      />
      <TextField
        label="E-mail de contact"
        type="email"
        error={errors.contact_email?.message}
        {...register("contact_email")}
      />
      <TextField
        label="URL de webhook"
        hint="Optionnel. HTTPS public uniquement."
        error={errors.webhook_url?.message}
        {...register("webhook_url")}
      />
      <TextField
        label="BIN par défaut (UUID)"
        hint="Optionnel."
        error={errors.default_bin_uuid?.message}
        {...register("default_bin_uuid")}
      />
      <AdminCheckboxField
        label="Autoriser la divulgation du PAN"
        hint="Sensible : cette création passe alors par une approbation (maker-checker) avant d'être appliquée."
        {...register("can_reveal_pan")}
      />
      <FormActions
        onCancel={onCancel}
        submitLabel="Créer le marchand"
        pending={isSubmitting}
      />
    </form>
  );
}

function CreditWalletForm({
  merchant,
  onDone,
  onCancel,
}: {
  merchant: B2bMerchant;
  onDone: (outcome: WriteOutcome<B2bMerchant>) => void;
  onCancel: () => void;
}) {
  const mutation = useCreditMerchantWallet();
  const [formError, setFormError] = useState<unknown>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreditWalletForm>({
    resolver: zodResolver(creditWalletSchema),
    defaultValues: { amount_minor: "", source: "", reference: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      onDone(
        await mutation.mutateAsync({
          uuid: merchant.uuid,
          input: toCreditWallet(values),
        }),
      );
    } catch (err) {
      if (!applyApiErrors(err, setError)) setFormError(err);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <InlineError error={formError} />
      <p className="text-text-muted text-[13px] leading-[18px]">
        L&apos;approvisionnement du wallet est soumis à une seconde approbation :
        il n&apos;est PAS appliqué immédiatement.
      </p>
      <TextField
        label="Montant (FCFA)"
        inputMode="numeric"
        error={errors.amount_minor?.message}
        {...register("amount_minor")}
      />
      <TextField
        label="Source des fonds"
        error={errors.source?.message}
        {...register("source")}
      />
      <TextField
        label="Référence"
        error={errors.reference?.message}
        {...register("reference")}
      />
      <FormActions
        onCancel={onCancel}
        submitLabel="Soumettre pour approbation"
        pending={isSubmitting}
      />
    </form>
  );
}

function MerchantsSection() {
  const { data, isPending, isError, error } = useMerchants();
  const issueKey = useIssueMerchantKey();
  const revokeKey = useRevokeMerchantKey();

  const [createOpen, setCreateOpen] = useState(false);
  const [creditFor, setCreditFor] = useState<B2bMerchant | null>(null);
  const [issued, setIssued] = useState<IssuedApiKey | null>(null);
  const [outcome, setOutcome] = useState<WriteOutcome<B2bMerchant> | null>(null);
  const [rowError, setRowError] = useState<unknown>(null);
  /** Keys issued IN THIS SESSION (the backend exposes no key-listing endpoint). */
  const [sessionKeys, setSessionKeys] = useState<
    Record<string, { uuid: string; public_key: string; revoked: boolean }[]>
  >({});

  const rows = data?.items ?? [];

  const onIssue = async (merchant: B2bMerchant) => {
    setRowError(null);
    try {
      const result = await issueKey.mutateAsync({ uuid: merchant.uuid });
      setIssued(result);
      setSessionKeys((prev) => ({
        ...prev,
        [merchant.uuid]: [
          ...(prev[merchant.uuid] ?? []),
          {
            uuid: result.key.uuid,
            public_key: result.key.public_key,
            revoked: false,
          },
        ],
      }));
    } catch (err) {
      setRowError(err);
    }
  };

  const onRevoke = async (merchantUuid: string, keyUuid: string) => {
    setRowError(null);
    try {
      await revokeKey.mutateAsync({ uuid: merchantUuid, keyUuid });
      setSessionKeys((prev) => ({
        ...prev,
        [merchantUuid]: (prev[merchantUuid] ?? []).map((key) =>
          key.uuid === keyUuid ? { ...key, revoked: true } : key,
        ),
      }));
    } catch (err) {
      setRowError(err);
    }
  };

  return (
    <>
      {outcome ? <WriteResultBanner outcome={outcome} className="mb-4" /> : null}
      {rowError ? <InlineError error={rowError} className="mb-4" /> : null}

      <div className="mb-4 flex justify-end">
        <PermissionGate permission={Permission.MerchantManage}>
          <button
            type="button"
            onClick={() => {
              setOutcome(null);
              setCreateOpen(true);
            }}
            className="bg-primary focus-visible:ring-primary/60 flex h-10 items-center gap-1.5 rounded-md px-3.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
          >
            <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
            Nouveau marchand
          </button>
        </PermissionGate>
      </div>

      <AdminCard>
        {isPending ? (
          <AdminLoading />
        ) : isError ? (
          <div className="p-4">
            <InlineError error={error} />
          </div>
        ) : rows.length === 0 ? (
          <AdminEmpty>Aucun marchand B2B enregistré.</AdminEmpty>
        ) : (
          <TableScroll>
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-border text-text-muted border-b text-[12px]">
                  <th className="px-4 py-3 font-medium">Marchand</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">PAN</th>
                  <th className="px-4 py-3 font-medium">Créé le</th>
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((merchant) => {
                  const keys = sessionKeys[merchant.uuid] ?? [];
                  return (
                    <tr
                      key={merchant.uuid}
                      className="border-border text-text border-b align-top last:border-0"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium">{merchant.name}</span>
                        <span className="text-text-muted mt-0.5 block text-[12px]">
                          {merchant.contact_email}
                        </span>
                        {keys.length > 0 ? (
                          <ul className="mt-2 space-y-1">
                            {keys.map((key) => (
                              <li
                                key={key.uuid}
                                className="flex items-center gap-2 text-[12px]"
                              >
                                <code className="text-text-secondary font-mono break-all">
                                  {key.public_key}
                                </code>
                                {key.revoked ? (
                                  <StatusPill tone="neutral">Révoquée</StatusPill>
                                ) : (
                                  <PermissionGate
                                    permission={Permission.MerchantManage}
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void onRevoke(merchant.uuid, key.uuid)
                                      }
                                      disabled={revokeKey.isPending}
                                      className="text-danger hover:underline disabled:opacity-50"
                                    >
                                      Révoquer
                                    </button>
                                  </PermissionGate>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill
                          tone={
                            merchant.status === "active" ? "success" : "neutral"
                          }
                        >
                          {merchant.status}
                        </StatusPill>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill
                          tone={merchant.can_reveal_pan ? "warning" : "neutral"}
                        >
                          {merchant.can_reveal_pan ? "Divulgable" : "Masqué"}
                        </StatusPill>
                      </td>
                      <td className="text-text-secondary px-4 py-3">
                        {merchant.created_at
                          ? formatDate(merchant.created_at)
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <PermissionGate permission={Permission.MerchantManage}>
                          <button
                            type="button"
                            onClick={() => void onIssue(merchant)}
                            disabled={issueKey.isPending}
                            className="text-primary hover:bg-primary-tint mr-1 rounded-md px-2.5 py-1.5 text-[13px] font-semibold transition-colors disabled:opacity-50"
                          >
                            Émettre une clé
                          </button>
                        </PermissionGate>
                        <PermissionGate permission={Permission.MerchantCredit}>
                          <button
                            type="button"
                            onClick={() => {
                              setOutcome(null);
                              setCreditFor(merchant);
                            }}
                            className="text-text-secondary hover:bg-surface-2 rounded-md px-2.5 py-1.5 text-[13px] font-semibold transition-colors"
                          >
                            Créditer le wallet
                          </button>
                        </PermissionGate>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableScroll>
        )}
      </AdminCard>

      <AdminModal
        open={createOpen}
        title="Créer un marchand B2B"
        onClose={() => setCreateOpen(false)}
      >
        <CreateMerchantForm
          onDone={(result) => {
            setOutcome(result);
            setCreateOpen(false);
          }}
          onCancel={() => setCreateOpen(false)}
        />
      </AdminModal>

      <AdminModal
        open={creditFor !== null}
        title="Créditer le wallet marchand"
        onClose={() => setCreditFor(null)}
      >
        {creditFor ? (
          <CreditWalletForm
            merchant={creditFor}
            onDone={(result) => {
              setOutcome(result);
              setCreditFor(null);
            }}
            onCancel={() => setCreditFor(null)}
          />
        ) : null}
      </AdminModal>

      {issued ? (
        <IssuedKeyModal issued={issued} onClose={() => setIssued(null)} />
      ) : null}
    </>
  );
}

export default function MerchantsPage() {
  return (
    <>
      <AdminPageHeader
        title="Marchands B2B"
        description="Marchands, clés API et approvisionnement de wallet. Un secret de clé n'est affiché qu'une seule fois ; un crédit de wallet passe par une approbation."
      />
      <AdminSectionGuard
        permission={[Permission.MerchantManage, Permission.MerchantCredit]}
      >
        <MerchantsSection />
      </AdminSectionGuard>
    </>
  );
}
