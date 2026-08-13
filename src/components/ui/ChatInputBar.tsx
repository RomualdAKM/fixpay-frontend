"use client";

import { useState } from "react";
import { Paperclip, Send } from "lucide-react";

import { cn } from "@/lib/utils";

interface ChatInputBarProps {
  placeholder?: string;
  onSend?: (text: string) => void;
}

/**
 * Barre de saisie fixe du chat support (écran 27) : 71px, fond plein avec un
 * filet haut, délibérément SANS backdrop-blur contrairement à la BottomNav —
 * un champ de saisie ne doit pas laisser transparaître le texte qui défile
 * dessous. Ce choix est validé par l'audit et conservé.
 *
 * Migré : le bouton d'envoi passe du dégradé de marque à l'aplat `bg-primary`
 * (le dégradé est réservé à la carte bancaire), et il porte enfin son état
 * désactivé tant que le champ est vide — il était toujours affiché actif.
 *
 * Complété à l'étape 11 : la barre ne se réduit plus à un champ et un bouton.
 * Le trombone est un vrai `input[type=file]` — joindre la photo d'un reçu est
 * la première chose qu'on fait dans un support bancaire, et une affordance qui
 * n'ouvre rien ne vaut pas mieux que pas d'affordance du tout.
 *
 * La piste interne s'aligne exactement sur la COLONNE DE CONVERSATION, pas sur
 * la largeur de la page : à partir de `lg`, la marge droite de 320px réserve
 * le rail de dossier (280 + 40 de gouttière) pour que le champ tombe au pixel
 * sous les bulles.
 *
 * Étape 12 — la mesure se resserre avec celle de la conversation : la page
 * passe de 1040 à 880px et le rail de 320 à 280. Les DEUX valeurs sont ici,
 * et elles doivent rester égales à celles de la page (`max-w-[880px]`,
 * `lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10`) : un champ de saisie plus
 * large que les bulles qu'il produit se voit immédiatement.
 */
export function ChatInputBar({
  placeholder = "Votre message...",
  onSend,
}: ChatInputBarProps) {
  const [text, setText] = useState("");
  const canSend = text.trim().length > 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend?.(trimmed);
    setText("");
  }

  function handleAttach(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onSend?.(`Pièce jointe · ${file.name}`);
    // Permet de rejoindre deux fois le même fichier.
    event.target.value = "";
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-border bg-bg fixed inset-x-0 bottom-0 z-50 mx-auto h-[71px] w-full max-w-[430px] border-t px-5 lg:right-0 lg:left-[264px] lg:mx-0 lg:w-auto lg:max-w-none lg:px-0"
    >
      <div className="mx-auto flex h-full w-full items-center lg:max-w-[880px] lg:px-10">
        <div className="flex w-full items-center gap-2.5 lg:mr-[320px]">
          <label className="text-icon-muted hover:bg-surface-2 focus-within:ring-primary/60 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors focus-within:ring-2">
            <Paperclip size={18} aria-hidden="true" />
            <input
              type="file"
              className="sr-only"
              aria-label="Joindre un fichier"
              onChange={handleAttach}
            />
          </label>
          <input
            type="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={placeholder}
            aria-label="Message"
            className="border-border-strong bg-surface text-text placeholder:text-text-muted focus:border-primary h-11 min-w-0 flex-1 rounded-md border px-[17px] text-[15px] leading-[19.5px] transition-colors outline-none"
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Envoyer le message"
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-md transition-colors",
              canSend
                ? "bg-primary hover:opacity-90"
                : "bg-surface-3 pointer-events-none",
            )}
          >
            {/* L'état désactivé change de MATIÈRE, pas d'opacité : le bleu de
                marque à 40 % donnait un lavande pâle que le thème clair ne
                distinguait plus du bleu actif (re-notation, écran 27). Une
                surface neutre et un glyphe muted se lisent inertes dans les
                deux thèmes. */}
            <Send
              size={16}
              aria-hidden="true"
              className={canSend ? "text-white" : "text-icon-muted"}
            />
          </button>
        </div>
      </div>
    </form>
  );
}
