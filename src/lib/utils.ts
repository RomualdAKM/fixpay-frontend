import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge doit connaître nos tokens `@theme` personnalisés pour qu'une
 * surcharge remplace la classe de base au lieu de s'y ajouter.
 *
 * Les rayons n'ont plus besoin d'être déclarés : les 13 tokens sémantiques
 * d'origine ont été remplacés par l'échelle `xs / sm / md / lg` — des noms
 * que tailwind-merge connaît nativement.
 * Restent les 3 ombres, dont les noms sont propres au produit.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      shadow: [{ shadow: ["surface", "raised", "specular"] }],
    },
  },
});

/** Merge conditional class names with Tailwind conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
