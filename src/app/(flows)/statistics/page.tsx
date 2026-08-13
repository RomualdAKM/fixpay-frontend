import { StatisticsView } from "./StatisticsView";

export const metadata = { title: "Statistiques" };

/**
 * Écran 11 · Statistiques.
 *
 * La page reste un composant serveur pour conserver son `metadata` (le titre
 * d'onglet), et délègue le rendu à `StatisticsView`, qui est client : le
 * sélecteur de période introduit par la refonte est un état, et tout l'écran
 * — plage, total, moyenne, histogramme, répartition, liste — en dérive.
 */
export default function StatisticsPage() {
  return <StatisticsView />;
}
