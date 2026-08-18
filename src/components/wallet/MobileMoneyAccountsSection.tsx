"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { PinPromptDialog } from "@/components/auth/PinPromptDialog";
import { InlineError } from "@/components/feedback/InlineError";
import {
  useLinkMobileMoneyAccount,
  useMobileMoneyAccounts,
  useOperators,
  useSetPrimaryMobileMoneyAccount,
  useUnlinkMobileMoneyAccount,
} from "@/lib/api/moneyHooks";
import { PinTicketAction } from "@/lib/api/types";
import { countryDial } from "@/lib/operators";

/** Nom d'affichage d'un opérateur depuis son code (« orange_ci » → « Orange ci »). */
function operatorLabel(code: string): string {
  const cleaned = code.replace(/_/g, " ");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function toE164(dial: string | undefined, phone: string): string {
  const cc = (dial ?? "").replace(/\D/g, "");
  const local = phone.replace(/\D/g, "");
  return `+${cc}${local}`;
}

/**
 * Gestion réelle des comptes Mobile Money : liste (GET), liaison (POST, sous
 * ticket PIN `link_mm_account`), déliaison (DELETE) et définition du compte
 * principal (PUT). Remplace le faux bascule « Délier » de l'écran 16.
 */
export function MobileMoneyAccountsSection() {
  const accountsQuery = useMobileMoneyAccounts();
  const operatorsQuery = useOperators();
  const linkAccount = useLinkMobileMoneyAccount();
  const unlinkAccount = useUnlinkMobileMoneyAccount();
  const setPrimary = useSetPrimaryMobileMoneyAccount();

  const [adding, setAdding] = useState(false);
  const [operatorCode, setOperatorCode] = useState("");
  const [phone, setPhone] = useState("");
  const [pinOpen, setPinOpen] = useState(false);
  const [confirmUuid, setConfirmUuid] = useState<string | null>(null);

  const operators = operatorsQuery.data ?? [];
  const selectedOperator = operators.find((o) => o.code === operatorCode);
  const dial = selectedOperator ? countryDial(selectedOperator.country) : undefined;

  const accounts = accountsQuery.data ?? [];
  const phoneValid = phone.replace(/\D/g, "").length >= 8;
  const linkValid = operatorCode !== "" && phoneValid;

  const submitLink = (pinTicket: string) => {
    setPinOpen(false);
    linkAccount.mutate(
      {
        input: {
          operator: operatorCode,
          phone_e164: toE164(dial, phone),
        },
        pinTicket,
      },
      {
        onSuccess: () => {
          setAdding(false);
          setOperatorCode("");
          setPhone("");
        },
      },
    );
  };

  return (
    <div className="mt-4">
      {accountsQuery.isPending ? (
        <div className="animate-pulse space-y-3 py-2" aria-hidden="true">
          <div className="bg-surface-2 h-[14px] w-3/5 rounded-xs" />
          <div className="bg-surface-2 h-[14px] w-2/5 rounded-xs" />
        </div>
      ) : accountsQuery.isError ? (
        <InlineError error={accountsQuery.error} />
      ) : accounts.length === 0 ? (
        <p className="text-text-muted border-border border-b py-4 text-[12.5px] leading-[18px]">
          Aucun compte Mobile Money n&apos;est lié.
        </p>
      ) : (
        <ul className="divide-border divide-y">
          {accounts.map((account) => (
            <li key={account.uuid} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-text truncate text-[14px] leading-[19px] font-medium">
                    {account.masked_number}
                  </p>
                  <p className="text-text-muted mt-[2px] truncate text-[12px] leading-[16px]">
                    {operatorLabel(account.operator)}
                    {account.is_primary ? " · Compte principal" : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!account.is_primary && (
                    <button
                      type="button"
                      onClick={() => setPrimary.mutate(account.uuid)}
                      disabled={setPrimary.isPending}
                      className="border-border bg-surface text-text-secondary hover:bg-surface-2 hover:text-text focus-visible:ring-primary/60 inline-flex h-8 items-center rounded-sm border px-3 text-[12px] font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60"
                    >
                      Principal
                    </button>
                  )}
                  {confirmUuid === account.uuid ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          unlinkAccount.mutate(account.uuid, {
                            onSettled: () => setConfirmUuid(null),
                          })
                        }
                        disabled={unlinkAccount.isPending}
                        className="bg-danger/10 text-danger border-danger/30 focus-visible:ring-primary/60 inline-flex h-8 items-center rounded-sm border px-3 text-[12px] font-medium focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60"
                      >
                        {unlinkAccount.isPending ? "…" : "Confirmer"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmUuid(null)}
                        className="text-text-muted hover:text-text inline-flex h-8 items-center rounded-sm px-2 text-[12px] font-medium"
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmUuid(account.uuid)}
                      className="border-border bg-surface text-text-secondary hover:bg-surface-2 hover:text-text focus-visible:ring-primary/60 inline-flex h-8 items-center rounded-sm border px-3 text-[12px] font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                      Délier
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {unlinkAccount.isError && (
        <InlineError error={unlinkAccount.error} className="mt-3" />
      )}
      {setPrimary.isError && (
        <InlineError error={setPrimary.error} className="mt-3" />
      )}

      {/* Liaison d'un nouveau compte */}
      {adding ? (
        <div className="border-border mt-4 border-t pt-4">
          <div className="relative flex h-12 items-center">
            <select
              value={operatorCode}
              onChange={(e) => setOperatorCode(e.target.value)}
              aria-label="Opérateur"
              className="text-text border-border-strong bg-surface focus-visible:ring-primary/60 h-12 w-full appearance-none rounded-md border px-[17px] pr-9 text-[14px] focus-visible:ring-2 focus-visible:outline-none"
            >
              <option value="" className="bg-bg text-text">
                Choisir un opérateur…
              </option>
              {operators.map((o) => (
                <option key={o.code} value={o.code} className="bg-bg text-text">
                  {o.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              aria-hidden="true"
              className="text-icon-muted pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
            />
          </div>
          <input
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Numéro Mobile Money"
            aria-label="Numéro Mobile Money"
            className="border-border-strong bg-surface text-text placeholder:text-text-muted focus-visible:border-primary focus-visible:ring-primary/60 mt-3 h-12 w-full rounded-md border px-[17px] text-[15px] focus-visible:ring-2 focus-visible:outline-none"
          />
          {selectedOperator && (
            <p className="text-text-muted mt-2 text-[11.5px] leading-[16px]">
              Indicatif {dial ?? "?"} · le numéro sera enregistré au format
              international.
            </p>
          )}
          {linkAccount.isError && (
            <InlineError error={linkAccount.error} className="mt-3" />
          )}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPinOpen(true)}
              disabled={!linkValid || linkAccount.isPending}
              className="bg-primary focus-visible:ring-primary/60 inline-flex h-10 items-center rounded-md px-4 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60"
            >
              {linkAccount.isPending ? "Liaison…" : "Lier ce compte"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                linkAccount.reset();
              }}
              className="text-text-muted hover:text-text text-[13px] font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-primary-light mt-4 text-[13px] leading-[18px] font-medium underline-offset-4 hover:underline"
        >
          Lier un compte Mobile Money
        </button>
      )}

      <PinPromptDialog
        open={pinOpen}
        action={PinTicketAction.LinkMmAccount}
        title="Confirmez la liaison avec votre code PIN"
        onTicket={submitLink}
        onCancel={() => setPinOpen(false)}
      />
    </div>
  );
}
