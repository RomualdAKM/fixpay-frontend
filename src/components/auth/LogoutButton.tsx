"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  className?: string;
}

/**
 * Real sign-out: POST /api/logout (invalidates the session), clears the React
 * Query cache via the auth layer, then routes to /login. Styling matches the
 * discreet danger action the settings screen previously faked with a link.
 */
export function LogoutButton({ className }: LogoutButtonProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const onClick = async () => {
    if (pending) return;
    setPending(true);
    try {
      await logout();
    } finally {
      router.replace("/login");
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={cn(
        "border-border bg-surface text-danger hover:bg-surface-2 focus-visible:ring-danger/60 flex h-12 w-full items-center justify-center rounded-md border text-[14px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60",
        className,
      )}
    >
      {pending ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}
