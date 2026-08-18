import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleCheck,
  CreditCard,
  Music,
  Plane,
  RefreshCw,
  Shield,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

import type { AppNotification, TxIcon } from "@/lib/display-types";

/**
 * Maps a transaction icon key to its lucide icon (screens 02, 03, 10).
 *
 * Les mouvements d'argent utilisent deux flèches opposées et non les nuages
 * CloudUpload / CloudDownload de la maquette : le nuage est une métaphore de
 * stockage de fichiers, et à 14-17px les deux glyphes étaient indiscernables
 * l'un de l'autre. Entrant = ArrowDownLeft, sortant = ArrowUpRight.
 */
export const txIconMap: Record<TxIcon, LucideIcon> = {
  shopping: ShoppingCart,
  music: Music,
  plane: Plane,
  deposit: ArrowDownLeft,
  withdraw: ArrowUpRight,
  card: CreditCard,
  refresh: RefreshCw,
};

/** Extends txIconMap with the notification-only icons (screen 28). */
export const notificationIconMap: Record<AppNotification["icon"], LucideIcon> =
  {
    ...txIconMap,
    shield: Shield,
    check: CircleCheck,
  };
