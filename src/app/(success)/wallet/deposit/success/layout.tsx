import type { Metadata } from "next";

// La page est un Client Component (elle relit le dépôt réel via son uuid) et
// ne peut pas exporter de métadonnées : le layout porte le titre du document.
export const metadata: Metadata = { title: "Succès Dépôt" };

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
