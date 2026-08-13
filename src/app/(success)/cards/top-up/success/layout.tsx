import type { Metadata } from "next";

// La page est un Client Component (elle relit la recharge réelle via son uuid)
// et ne peut pas exporter de métadonnées : le layout porte le titre du document.
export const metadata: Metadata = { title: "Carte alimentée" };

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
