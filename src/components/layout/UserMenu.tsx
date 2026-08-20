"use client";

import { ChevronsUpDown, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/lib/auth";

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

/**
 * Bloc utilisateur du rail desktop : un clic sur le nom/avatar ouvre un menu
 * (Profil · Paramètres · Se déconnecter). C'est le geste attendu pour se
 * déconnecter — rendu découvrable et à un clic, au lieu d'être enterré dans un
 * bouton « Paramètres et déconnexion ». Ferme au clic extérieur et à Échap.
 */
export function UserMenu() {
  const { user, status, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onLogout = async () => {
    if (pending) return;
    setPending(true);
    try {
      await logout();
    } finally {
      router.replace("/login");
    }
  };

  if (status === "loading") {
    return (
      <div
        aria-hidden="true"
        className="border-border bg-surface mt-3 flex items-center gap-3 rounded-md border p-3"
      >
        <span className="bg-surface-5 size-9 shrink-0 animate-pulse rounded-full" />
        <span className="min-w-0 flex-1 space-y-1.5">
          <span className="bg-surface-5 block h-3 w-24 animate-pulse rounded" />
          <span className="bg-surface-5 block h-2.5 w-32 animate-pulse rounded" />
        </span>
      </div>
    );
  }

  if (!user) return null;

  const itemClass =
    "flex h-10 w-full items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-colors";

  return (
    <div ref={ref} className="relative mt-3">
      {open && (
        <div
          role="menu"
          aria-label="Menu du compte"
          className="border-border bg-bg-raised absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-lg border p-1.5 shadow-lg"
        >
          <Link
            role="menuitem"
            href="/profile"
            onClick={() => setOpen(false)}
            className={`${itemClass} text-text-secondary hover:bg-surface hover:text-text`}
          >
            <User size={17} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
            Profil
          </Link>
          <Link
            role="menuitem"
            href="/profile/settings"
            onClick={() => setOpen(false)}
            className={`${itemClass} text-text-secondary hover:bg-surface hover:text-text`}
          >
            <Settings size={17} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
            Paramètres
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={onLogout}
            disabled={pending}
            className={`${itemClass} text-danger hover:bg-danger/10 disabled:opacity-60`}
          >
            <LogOut size={17} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
            {pending ? "Déconnexion…" : "Se déconnecter"}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Compte : paramètres et déconnexion"
        className="border-border bg-surface hover:bg-surface-2 flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors"
      >
        <span className="bg-surface-5 text-text flex size-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold">
          {initialOf(user.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-text block truncate text-[13px] font-medium">
            {user.name}
          </span>
          <span className="text-text-muted block truncate text-[11px]">
            {user.email}
          </span>
        </span>
        <ChevronsUpDown
          size={15}
          strokeWidth={2}
          absoluteStrokeWidth
          aria-hidden="true"
          className="text-icon-muted shrink-0"
        />
      </button>
    </div>
  );
}
