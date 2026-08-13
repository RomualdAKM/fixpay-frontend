"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  CreditCard,
  Loader2,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { InlineError } from "@/components/feedback/InlineError";
import { StatusDot } from "@/components/ui/StatusDot";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/lib/api/accountHooks";
import type { NotificationItem } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Présentation par type de notification. Le `type` vient de `data.type` (ou du
 * nom de classe côté backend) ; on n'invente aucun champ, on ne fait que mapper
 * un type connu vers une icône, une tonalité et un libellé. Un type inconnu
 * retombe sur une cloche neutre.
 */
const TYPE_META: Record<
  string,
  { icon: LucideIcon; tone: string; label: string }
> = {
  deposit: { icon: ArrowDownLeft, tone: "text-success", label: "Dépôt reçu" },
  withdrawal: { icon: ArrowUpRight, tone: "text-text", label: "Retrait envoyé" },
  card_recharge: {
    icon: CreditCard,
    tone: "text-primary-light",
    label: "Carte alimentée",
  },
  card_cashout: {
    icon: CreditCard,
    tone: "text-primary-light",
    label: "Retrait vers portefeuille",
  },
  kyc: { icon: ShieldCheck, tone: "text-warning", label: "Vérification KYC" },
  referral_payout: {
    icon: ArrowDownLeft,
    tone: "text-success",
    label: "Gain de parrainage",
  },
};

const FALLBACK = { icon: Bell, tone: "text-icon-muted", label: "Notification" };

/** Sous-ligne lisible : `data.message`/`data.body` si présent, sinon vide. */
function messageOf(data: Record<string, unknown>): string | null {
  const candidate = data.message ?? data.body ?? data.description;
  return typeof candidate === "string" ? candidate : null;
}

/** Titre : `data.title` si présent, sinon le libellé du type. */
function titleOf(item: NotificationItem): string {
  const title = item.data.title;
  if (typeof title === "string" && title.length > 0) return title;
  return (TYPE_META[item.type] ?? FALLBACK).label;
}

function NotificationRow({
  item,
  onRead,
  marking,
}: {
  item: NotificationItem;
  onRead: (id: string) => void;
  marking: boolean;
}) {
  const meta = TYPE_META[item.type] ?? FALLBACK;
  const Icon = meta.icon;
  const unread = item.read_at === null;
  const message = messageOf(item.data);

  return (
    <div
      className={cn(
        "relative flex items-start gap-[13px] py-[15px]",
        unread ? "pl-[14px]" : "pl-0",
      )}
    >
      {unread && (
        <StatusDot
          size={6}
          colorClass="bg-primary"
          className="absolute top-[22px] left-0"
        />
      )}
      <Icon
        size={18}
        strokeWidth={2}
        absoluteStrokeWidth
        aria-hidden="true"
        className={cn("mt-[1px] shrink-0", meta.tone)}
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-text text-[13.5px] leading-[18px]",
            unread ? "font-semibold" : "font-normal",
          )}
        >
          {titleOf(item)}
        </p>
        {message ? (
          <p className="text-text-muted mt-[3px] text-[12px] leading-[16px]">
            {message}
          </p>
        ) : null}
        <p className="text-text-muted mt-[3px] text-[11.5px] leading-[15px]">
          {item.created_at ? formatDate(item.created_at) : ""}
        </p>
      </div>
      {unread ? (
        <button
          type="button"
          onClick={() => onRead(item.id)}
          disabled={marking}
          className="text-primary focus-visible:ring-primary/60 shrink-0 rounded-sm text-[12px] font-medium transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
        >
          Marquer lu
        </button>
      ) : null}
    </div>
  );
}

export default function NotificationsPage() {
  const notificationsQuery = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const data = notificationsQuery.data;
  const items = data?.notifications ?? [];
  const unreadCount = data?.unread_count ?? 0;

  return (
    <>
      <main className="px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[860px] lg:px-10 lg:pt-9 lg:pb-12">
        <PageHeader title="Notifications" backHref="/" />

        <div className="mt-6 flex items-baseline justify-between gap-3">
          <p className="text-text-muted text-[12.5px] leading-[16px]">
            {unreadCount > 0
              ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
              : "Tout est à jour"}
          </p>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              className="text-primary focus-visible:ring-primary/60 shrink-0 rounded-sm text-[12.5px] font-medium transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
            >
              Tout marquer comme lu
            </button>
          ) : null}
        </div>

        {notificationsQuery.isPending ? (
          <div className="mt-10 flex justify-center">
            <Loader2 size={26} className="text-primary animate-spin" aria-hidden />
          </div>
        ) : notificationsQuery.isError ? (
          <div className="mt-6">
            <InlineError error={notificationsQuery.error} />
            <button
              type="button"
              onClick={() => void notificationsQuery.refetch()}
              className="text-primary-light mt-3 text-[13px] font-medium underline-offset-4 hover:underline"
            >
              Réessayer
            </button>
          </div>
        ) : items.length === 0 ? (
          <p className="text-text-secondary border-border mt-6 border-t py-10 text-center text-[13px] leading-[19px]">
            Aucune notification pour l&apos;instant.
          </p>
        ) : (
          <ul className="border-border mt-4 border-t">
            {items.map((item) => (
              <li key={item.id} className="border-border border-b">
                <NotificationRow
                  item={item}
                  onRead={(id) => markRead.mutate(id)}
                  marking={markRead.isPending && markRead.variables === item.id}
                />
              </li>
            ))}
          </ul>
        )}
      </main>

      <BottomNav />
    </>
  );
}
