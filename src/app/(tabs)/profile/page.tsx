"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertCircle,
  BadgeCheck,
  Bell,
  ChevronRight,
  Gift,
  LifeBuoy,
  Lock,
  Plus,
  Settings,
  Star,
  type LucideIcon,
} from "lucide-react";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { InlineError } from "@/components/feedback/InlineError";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusDot } from "@/components/ui/StatusDot";
import { useKyc, useNotifications } from "@/lib/api/accountHooks";
import { useCards } from "@/lib/api/cardHooks";
import type { Card, KycStatus } from "@/lib/api/types";
import { useAuth } from "@/lib/auth";
import { cardExpiry, cardStatusLabel, maskedPan } from "@/lib/cards";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { APP_VERSION } from "@/lib/version";

/** Première lettre du nom pour l'avatar (donnée dérivée, jamais fabriquée). */
function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

const STATUS_DOT: Record<Card["status"], string> = {
  active: "bg-success",
  frozen: "bg-warning",
  pending: "bg-warning",
  cancelled: "bg-danger",
};

/** Bannière KYC pilotée par le vrai statut ; masquée une fois vérifié. */
const KYC_BANNER: Record<
  Exclude<KycStatus, "approved">,
  { title: string; subtitle: string; cta: string }
> = {
  none: {
    title: "Vérifiez votre identité",
    subtitle: "Pièce d'identité requise pour lever vos plafonds",
    cta: "Commencer",
  },
  pending: {
    title: "Vérification en cours",
    subtitle: "Vos pièces sont en cours d'examen",
    cta: "Suivre",
  },
  rejected: {
    title: "Vérification à corriger",
    subtitle: "Une pièce doit être renvoyée",
    cta: "Corriger",
  },
};

function MenuGlyph({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <Icon
      size={18}
      strokeWidth={1.5}
      absoluteStrokeWidth
      aria-hidden="true"
      className="text-icon-muted w-[22px] shrink-0"
    />
  );
}

function MenuList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("border-border divide-border divide-y border-y", className)}
    >
      {children}
    </div>
  );
}

function MenuRow({
  icon,
  title,
  meta,
  href,
}: {
  icon: LucideIcon;
  title: string;
  meta?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="focus-visible:ring-primary/60 flex h-[52px] items-center gap-[13px] transition-opacity focus-visible:ring-2 focus-visible:outline-none lg:hover:opacity-80"
    >
      <MenuGlyph icon={icon} />
      <span className="text-text min-w-0 flex-1 truncate text-[13.5px] font-medium">
        {title}
      </span>
      {meta ? (
        <span className="text-text-muted shrink-0 text-[12px] leading-[16px]">
          {meta}
        </span>
      ) : null}
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

/**
 * Écran 19 · Profil — sur les vraies données du compte (GET /api/me), le vrai
 * statut KYC (GET /api/kyc) et les vraies cartes (GET /api/cards). Aucune
 * donnée de compte fabriquée : ni relevés fictifs, ni plafonds inventés.
 */
export default function ProfilePage() {
  const { user } = useAuth();
  const kycQuery = useKyc();
  const cardsQuery = useCards();
  const notificationsQuery = useNotifications();
  const cards = cardsQuery.data ?? [];
  const hasUnread = (notificationsQuery.data?.unread_count ?? 0) > 0;

  const kycStatus = kycQuery.data?.status;
  const banner =
    kycStatus && kycStatus !== "approved" ? KYC_BANNER[kycStatus] : null;

  return (
    <>
      <main className="flex-1 px-5 pt-[52px] pb-24 lg:mx-auto lg:w-full lg:max-w-[1080px] lg:px-10 lg:pt-9 lg:pb-12">
        <AppHeader title="Profil" bellDot={hasUnread} desktopTitle="Profil" />

        <div className="contents lg:mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* ---- Colonne A ---- */}
          <div className="contents lg:block">
            <section className="mt-6 lg:mt-0">
              <div className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="bg-primary flex size-[58px] shrink-0 items-center justify-center rounded-full text-[21px] leading-none font-bold text-white"
                >
                  {user ? initialOf(user.name) : "?"}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-text truncate text-[20px] leading-[26px] font-bold">
                    {user?.name ?? "—"}
                  </h2>
                  <p className="text-text-muted mt-[3px] truncate text-[12.5px] leading-[17px]">
                    {user?.email ?? ""}
                  </p>
                </div>
                <Link
                  href="/profile/settings"
                  className="border-border bg-surface text-text-secondary hover:bg-surface-2 hover:text-text focus-visible:ring-primary/60 inline-flex h-9 shrink-0 items-center rounded-md border px-3.5 text-[12.5px] font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  Modifier
                </Link>
              </div>
              {user?.email_verified === false ? (
                <p className="text-warning mt-2.5 ml-[74px] text-[11.5px] leading-[15px]">
                  E-mail non vérifié
                </p>
              ) : null}
            </section>

            {/* ---- Bannière KYC : pilotée par le vrai statut ---- */}
            {banner ? (
              <Link
                href="/profile/kyc"
                className="bg-primary-surface border-primary-border hover:bg-primary-tint focus-visible:ring-primary/60 mt-5 flex h-16 items-center gap-3 rounded-lg border px-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <BadgeCheck
                  size={18}
                  strokeWidth={1.5}
                  absoluteStrokeWidth
                  className="text-primary shrink-0"
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="text-text block truncate text-[13px] leading-[16.9px] font-semibold">
                    {banner.title}
                  </span>
                  <span className="text-text-muted mt-[2px] block truncate text-[11.5px] leading-[15px]">
                    {banner.subtitle}
                  </span>
                </span>
                <span className="text-primary inline-flex shrink-0 items-center gap-0.5 text-[12.5px] font-semibold">
                  {banner.cta}
                  <ChevronRight
                    size={14}
                    strokeWidth={2}
                    absoluteStrokeWidth
                    aria-hidden="true"
                  />
                </span>
              </Link>
            ) : kycQuery.isError ? (
              /* Statut KYC inconnu : on ne masque pas l'invite en silence — un
                 utilisateur non vérifié pourrait croire son compte vérifié. On
                 affiche un état discret et neutre, avec une reprise possible. */
              <div className="border-border bg-surface mt-5 flex h-16 items-center gap-3 rounded-lg border px-4">
                <AlertCircle
                  size={18}
                  strokeWidth={1.5}
                  absoluteStrokeWidth
                  className="text-icon-muted shrink-0"
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="text-text block truncate text-[13px] leading-[16.9px] font-semibold">
                    Statut de vérification indisponible
                  </span>
                  <span className="text-text-muted mt-[2px] block truncate text-[11.5px] leading-[15px]">
                    Impossible de charger votre statut pour le moment
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => void kycQuery.refetch()}
                  className="text-primary focus-visible:ring-primary/60 shrink-0 rounded-sm text-[12.5px] font-semibold focus-visible:ring-2 focus-visible:outline-none"
                >
                  Réessayer
                </button>
              </div>
            ) : null}

            {/* ---- Mes cartes : liste réelle ---- */}
            <div className="mt-8">
              <SectionHeader title="Mes cartes" />
            </div>
            <MenuList className="mt-2">
              {cardsQuery.isError ? (
                <div className="py-3">
                  <InlineError error={cardsQuery.error} />
                </div>
              ) : (
                cards.map((card) => (
                  <Link
                    key={card.uuid}
                    href={`/cards/${card.uuid}`}
                    className="focus-visible:ring-primary/60 flex h-[52px] items-center gap-[13px] transition-opacity focus-visible:ring-2 focus-visible:outline-none lg:hover:opacity-80"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="text-text block truncate font-mono text-[13px] leading-[17px] font-medium tracking-[1px]">
                        {maskedPan(card.pan_last4)}
                      </span>
                      <span className="text-text-secondary mt-[2px] flex items-center gap-[5px] text-[11.5px] leading-[15px]">
                        <StatusDot size={6} colorClass={STATUS_DOT[card.status]} />
                        {cardStatusLabel(card.status)} · Exp {cardExpiry(card)}
                      </span>
                    </span>
                    <span className="text-text shrink-0 font-mono text-[12.5px] font-semibold">
                      {formatMoney(card.balance)}
                    </span>
                    <ChevronRight
                      size={16}
                      strokeWidth={2}
                      absoluteStrokeWidth
                      aria-hidden="true"
                      className="text-icon-muted -mr-[4px] shrink-0"
                    />
                  </Link>
                ))
              )}
              <Link
                href="/cards/new"
                className="focus-visible:ring-primary/60 flex h-[52px] items-center gap-[13px] transition-opacity focus-visible:ring-2 focus-visible:outline-none lg:hover:opacity-80"
              >
                <Plus
                  size={18}
                  strokeWidth={1.5}
                  absoluteStrokeWidth
                  aria-hidden="true"
                  className="text-primary w-[22px] shrink-0"
                />
                <span className="text-primary min-w-0 flex-1 truncate text-[13.5px] font-medium">
                  Ajouter une carte
                </span>
                <ChevronRight
                  size={16}
                  strokeWidth={2}
                  absoluteStrokeWidth
                  aria-hidden="true"
                  className="text-icon-muted -mr-[4px] shrink-0"
                />
              </Link>
            </MenuList>
          </div>

          {/* ---- Colonne B ---- */}
          <div className="contents lg:block">
            <div className="mt-8 lg:mt-0">
              <SectionHeader title="Avantages" />
            </div>
            <MenuList className="mt-2">
              <MenuRow
                icon={Gift}
                title="Parrainage"
                meta={user?.referral_code ?? undefined}
                href="/profile/referral"
              />
              <MenuRow icon={Star} title="Fidélité" href="/profile/loyalty" />
            </MenuList>

            <div className="mt-8">
              <SectionHeader title="Compte" />
            </div>
            <MenuList className="mt-2">
              <MenuRow
                icon={Settings}
                title="Paramètres"
                href="/profile/settings"
              />
              <MenuRow
                icon={Lock}
                title="Sécurité et confidentialité"
                href="/profile/privacy"
              />
              <MenuRow
                icon={Bell}
                title="Notifications"
                href="/profile/notifications"
              />
              <MenuRow icon={LifeBuoy} title="Aide et support" href="/support" />
            </MenuList>
          </div>

          <div className="border-border mt-10 border-t pt-5 lg:col-span-2 lg:mt-12 lg:flex lg:items-center lg:justify-between lg:gap-6">
            <LogoutButton className="lg:h-10 lg:w-auto lg:px-5 lg:text-[13.5px]" />
            <p className="text-text-muted mt-3 text-[11px] leading-[15px] lg:mt-0">
              CGU · Confidentialité · v{APP_VERSION}
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </>
  );
}
