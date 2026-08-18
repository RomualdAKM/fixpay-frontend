"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Eye, EyeOff } from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { InlineError } from "@/components/feedback/InlineError";
import { AmountFigure } from "@/components/ui/AmountText";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { WalletMovements } from "@/components/ui/WalletMovements";
import { useNotifications } from "@/lib/api/accountHooks";
import {
  useMobileMoneyAccounts,
  useWallet,
  useWalletTransactions,
} from "@/lib/api/moneyHooks";
import { walletTransactionToRow } from "@/lib/api/presenters";
import type { MobileMoneyAccount } from "@/lib/api/types";
import { formatDate, splitAmountCurrency } from "@/lib/format";
import { formatMoney } from "@/lib/money";

/**
 * Écran 03 · Portefeuille — LE COMPTE FCFA, câblé sur l'API réelle.
 *
 * Ce que cet écran porte, en données réelles : le solde (GET /api/wallet), les
 * comptes Mobile Money liés (GET /api/mobile-money-accounts) et le relevé
 * paginé (GET /api/wallet/transactions). Les anciens blocs « en attente /
 * échecs » et « consommation du plafond » ont été retirés : ils affichaient des
 * incidents et un plafond consommé fabriqués (mock-data), indiscernables des
 * vraies données. Ils reviendront câblés quand le contrat exposera une file
 * d'incidents et un compteur de plafond.
 */

/** Nom d'affichage d'un opérateur à partir de son code (« wave » → « Wave »). */
function operatorLabel(code: string): string {
  const cleaned = code.replace(/_/g, " ");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/** Rangée « compte Mobile Money » sur les données réelles de l'API. */
function AccountRow({ account }: { account: MobileMoneyAccount }) {
  return (
    <Link
      href="/wallet/deposit"
      className="flex items-center gap-3 py-[15px] lg:transition-opacity lg:hover:opacity-80"
    >
      <span className="min-w-0 flex-1">
        <span className="text-text block truncate font-mono text-[13px] leading-[17px] font-medium tracking-[1px]">
          {account.masked_number}
        </span>
        <span className="text-text-secondary mt-[3px] block truncate text-[12.5px] leading-[16px]">
          {operatorLabel(account.operator)}
          {account.is_primary ? " · Compte principal" : null}
        </span>
      </span>
      <span className="text-text-muted shrink-0 text-[11.5px] leading-[15px]">
        {formatDate(account.linked_at)}
      </span>
      <ChevronRight
        size={16}
        strokeWidth={2}
        absoluteStrokeWidth
        aria-hidden="true"
        className="text-icon-muted -mr-[4px] shrink-0"
      />
    </Link>
  );
}

const MASKED_BALANCE = "••••••";

export default function WalletPage() {
  const [hidden, setHidden] = useState(false);
  const EyeIcon = hidden ? EyeOff : Eye;

  const walletQuery = useWallet();
  const accountsQuery = useMobileMoneyAccounts();
  const txQuery = useWalletTransactions();
  const notificationsQuery = useNotifications();
  const hasUnread = (notificationsQuery.data?.unread_count ?? 0) > 0;

  const { figure, currency } = walletQuery.data
    ? splitAmountCurrency(formatMoney(walletQuery.data.balance))
    : { figure: "", currency: undefined };

  const rows = useMemo(
    () =>
      (txQuery.data?.pages ?? [])
        .flatMap((page) => page.items)
        .map((tx, index) => walletTransactionToRow(tx, index)),
    [txQuery.data],
  );

  const accounts = accountsQuery.data ?? [];

  return (
    <>
      <main className="flex-1 px-5 pt-[52px] pb-24 lg:mx-auto lg:w-full lg:max-w-[1080px] lg:px-10 lg:pt-9 lg:pb-12">
        <AppHeader
          title="Mon portefeuille"
          bellDot={hasUnread}
          desktopTitle="Mon portefeuille"
        />

        <div className="flex flex-col lg:mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* Colonne A — le compte : solde et comptes qui l'alimentent */}
          <div className="contents lg:block">
            <section className="mt-4 lg:mt-0">
              <h2 className="text-text-secondary text-[12.5px] leading-[16px]">
                Solde disponible
              </h2>
              {walletQuery.isPending ? (
                <div
                  className="bg-surface-2 mt-[9px] h-[42px] w-2/3 animate-pulse rounded-sm"
                  aria-hidden="true"
                />
              ) : walletQuery.isError ? (
                <div className="mt-2">
                  <InlineError error={walletQuery.error} />
                  <button
                    type="button"
                    onClick={() => void walletQuery.refetch()}
                    className="text-primary-light mt-3 text-[13px] leading-[18px] font-medium underline-offset-4 hover:underline"
                  >
                    Réessayer
                  </button>
                </div>
              ) : (
                <div className="mt-[5px] flex items-center gap-[9px]">
                  <span className="text-text flex items-baseline gap-1.5">
                    <AmountFigure
                      value={hidden ? MASKED_BALANCE : figure}
                      className="text-[32px] leading-[42px] font-bold tracking-[-1.5px]"
                    />
                    {currency && (
                      <span className="text-text-secondary text-[15px] leading-5 font-normal tracking-normal">
                        {currency}
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setHidden((v) => !v)}
                    aria-label={hidden ? "Afficher le solde" : "Masquer le solde"}
                    className="bg-surface-2 flex size-[30px] shrink-0 items-center justify-center rounded-sm"
                  >
                    <EyeIcon size={14} className="text-icon-muted" aria-hidden />
                  </button>
                </div>
              )}
            </section>

            <section className="mt-6 lg:mt-8">
              <SectionHeader
                title="Comptes Mobile Money"
                actionLabel="Gérer"
                actionHref="/profile/settings"
              />
              {accountsQuery.isPending ? (
                <div
                  className="mt-2 animate-pulse space-y-3 py-2"
                  aria-hidden="true"
                >
                  <div className="bg-surface-2 h-[14px] w-3/5 rounded-xs" />
                  <div className="bg-surface-2 h-[14px] w-2/5 rounded-xs" />
                </div>
              ) : accountsQuery.isError ? (
                <div className="mt-2">
                  <InlineError error={accountsQuery.error} />
                </div>
              ) : accounts.length === 0 ? (
                <p className="text-text-muted border-border mt-2 border-y py-4 text-[12.5px] leading-[18px]">
                  Aucun compte Mobile Money n&apos;est lié.
                </p>
              ) : (
                <div className="border-border divide-border mt-2 divide-y border-y">
                  {accounts.map((account) => (
                    <AccountRow key={account.uuid} account={account} />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Colonne B — ce qui bouge : le relevé réel du portefeuille */}
          <div className="contents lg:block">
            <section className="mt-6 lg:mt-0">
              <SectionHeader title="Mouvements du portefeuille" />
              <WalletMovements
                rows={rows}
                loading={txQuery.isPending}
                error={txQuery.isError ? txQuery.error : undefined}
                onRetry={() => void txQuery.refetch()}
                emptyLabel="Aucun mouvement pour le moment."
                accent
                hasMore={txQuery.hasNextPage}
                loadingMore={txQuery.isFetchingNextPage}
                onLoadMore={() => void txQuery.fetchNextPage()}
              />
            </section>
          </div>
        </div>
      </main>

      <BottomNav />
    </>
  );
}
