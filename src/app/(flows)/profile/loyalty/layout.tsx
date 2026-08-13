import type { Metadata } from "next";

// La page de ce segment est devenue un Client Component ("use client") pour
// porter l'échange de points : le layout serveur porte le titre du document.
export const metadata: Metadata = { title: "Fidélité" };

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
