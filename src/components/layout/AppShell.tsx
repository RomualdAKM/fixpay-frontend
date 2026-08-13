import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/Sidebar";

/**
 * Application shell for every screen that carries navigation.
 * Below `lg` nothing changes: the page keeps the 430px mobile column and its
 * fixed BottomNav. From `lg` up, the 264px Sidebar takes over and the content
 * area is offset to sit next to it.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="flex min-h-dvh flex-col lg:pl-[264px]">{children}</div>
    </>
  );
}
