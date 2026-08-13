import { redirect } from "next/navigation";

/**
 * The design set has no card-list screen: the 'Cartes' tab goes straight
 * to the primary card's detail page (see docs/ARCHITECTURE.md, screen 02).
 */
export default function CardsPage() {
  redirect("/cards/visa-4291");
}
