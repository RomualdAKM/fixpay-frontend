import type { Metadata } from "next";

// La page de ce segment est un Client Component ("use client") et ne peut
// pas exporter de métadonnées : le layout serveur porte le titre du document.
export const metadata: Metadata = { title: "Notifications" };

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
