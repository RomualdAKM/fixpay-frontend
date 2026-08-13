"use client";

import { useEffect } from "react";

/**
 * Appelle `reset` une fois `delayMs` écoulé, tant que `active` est vrai. Le
 * minuteur est annulé si `active` repasse à faux (masquage manuel) ou au
 * démontage : sert à purger un secret affiché (PAN/CVV révélé) sans le laisser
 * indéfiniment à l'écran ni en mémoire, comme le font les applications
 * bancaires.
 */
export function useAutoDismiss(
  active: boolean,
  reset: () => void,
  delayMs: number,
): void {
  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(reset, delayMs);
    return () => window.clearTimeout(timer);
  }, [active, reset, delayMs]);
}
