import { FixPayLogo } from "@/components/brand/FixPayLogo";
import { cn } from "@/lib/utils";

/**
 * Qui parle. Un support bancaire réel a TROIS voix et l'écran doit les
 * distinguer : l'assistant automatique, le conseiller humain qui prend le
 * relais, et l'utilisateur. Les DA relevaient qu'« Assistant FixPay » et
 * « Parler à un conseiller » cohabitaient sans que rien ne dise lequel des deux
 * répondait.
 */
export type ChatSender = "agent" | "advisor" | "user";

/** Une prise de parole du fil (écran 27). */
export interface ChatEntry {
  id: string;
  from: ChatSender;
  text: string;
  /** Heure d'envoi, "17:13". */
  time: string;
  /**
   * Nom de l'humain. Porté par TOUTES les bulles de sa série — c'est lui qui
   * fabrique les initiales de l'avatar, posé sur la dernière — mais affiché en
   * étiquette au-dessus de la PREMIÈRE seulement. L'assistant, lui, est
   * identifié par son avatar de marque et par l'en-tête de l'écran : le nommer
   * à chaque série serait du bruit.
   */
  author?: string;
  /** Fonction de l'humain, en second rang de l'étiquette de série. */
  role?: string;
  /**
   * Ligne de service qui précède la bulle : transfert vers une file, arrivée
   * d'un conseiller. C'est un événement de la conversation, pas un message —
   * d'où le traitement centré et discret du séparateur de jour.
   */
  notice?: string;
}

interface ChatBubbleProps {
  message: ChatEntry;
  /**
   * Dernière bulle d'une SÉRIE (même émetteur, messages consécutifs). Elle
   * seule porte l'avatar et l'heure ; les précédentes réservent la place de
   * l'avatar sans le redessiner. C'est la convention de toutes les messageries
   * et c'est ce qui permet d'afficher une série sans répéter trois fois le
   * même rond de 30px et trois horodatages à la minute près.
   */
  last?: boolean;
  /** Première bulle d'une série : elle seule porte le nom de l'humain. */
  first?: boolean;
  /** Accusé de réception d'un message utilisateur : « Envoyé » puis « Lu ». */
  receipt?: string;
}

/**
 * Avatar 30px de l'interlocuteur. L'assistant porte le monogramme de marque
 * sur l'aplat primaire ; le conseiller porte ses initiales sur une surface
 * neutre. Deux natures, deux avatars — pas de tuile colorée inventée pour
 * l'occasion, la distinction se fait sur le contenu du rond.
 */
export function ChatAvatar({
  from,
  initials,
}: {
  from: ChatSender;
  initials?: string;
}) {
  if (from === "advisor") {
    return (
      <span
        aria-hidden="true"
        className="bg-surface-3 text-text flex size-[30px] shrink-0 items-center justify-center rounded-full text-[11px] leading-none font-medium"
      >
        {initials}
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="bg-primary flex size-[30px] shrink-0 items-center justify-center rounded-full"
    >
      <FixPayLogo variant="mark" tone="white" width={13} />
    </span>
  );
}

/**
 * Bulle de conversation (écran 27).
 *
 * Trois réglages de la maquette sont justes et conservés tels quels : le coin
 * cassé du côté de l'interlocuteur, l'avatar ancré en BAS de la bulle (le
 * réglage d'iMessage et de WhatsApp), et la largeur maximale de 261px — une
 * bulle se lit dans une mesure étroite, quelle que soit la largeur de la
 * colonne qui l'accueille.
 *
 * Migrés après l'audit : l'avatar passe du dégradé 3 arrêts — illisible sur
 * 30px — à l'aplat de marque, et la bulle agent cesse d'emprunter la surface
 * de verre des panneaux (fond + bordure) : une bulle n'a pas de bordure,
 * sinon elle se lit comme une carte réutilisée.
 *
 * Composition (étape 11) : `text-balance` répartit le texte sur des lignes de
 * longueur égale. L'audit relevait un « escalier irrégulier » — une dernière
 * ligne de 152px dans une bulle de 261px. La longueur des lignes fait partie
 * de la composition d'une bulle ; elle se règle ici, une fois, plutôt qu'en
 * réécrivant chaque message.
 *
 * Étape 12 : le conseiller humain. Même surface de bulle que l'assistant — il
 * reste l'interlocuteur, du même côté du fil — mais son avatar porte ses
 * initiales et son nom coiffe sa première bulle. Les lignes de service
 * (transfert, file d'attente) passent au-dessus de la bulle concernée plutôt
 * que dans un composant flottant de plus.
 */
export function ChatBubble({
  message,
  last = true,
  first = true,
  receipt,
}: ChatBubbleProps) {
  const isUser = message.from === "user";
  const meta = receipt ? `${message.time} · ${receipt}` : message.time;
  const initials = message.author
    ? message.author
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
    : undefined;

  return (
    <div>
      {message.notice && (
        <p className="text-text-muted mb-3 text-center text-[11px] leading-[15px]">
          {message.notice}
        </p>
      )}

      <div className={cn("flex items-end gap-[10px]", isUser && "justify-end")}>
        {!isUser &&
          (last ? (
            <ChatAvatar from={message.from} initials={initials} />
          ) : (
            // Place réservée : les bulles d'une même série gardent le même bord
            // gauche que celle qui porte l'avatar.
            <span aria-hidden="true" className="size-[30px] shrink-0" />
          ))}

        <div className="flex min-w-0 flex-col">
          {first && message.author && (
            <p className="text-text-secondary mb-[5px] text-[11px] leading-[14px] font-medium">
              {message.author}
              {message.role && (
                <span className="text-text-muted font-normal">
                  {" · "}
                  {message.role}
                </span>
              )}
            </p>
          )}

          <div
            className={cn(
              "max-w-[261px] rounded-lg px-[15px] pt-3.5 pb-[13px]",
              isUser
                ? "bg-primary rounded-br-sm"
                : "bg-surface-2 rounded-bl-sm",
            )}
          >
            <p
              className={cn(
                "text-[13px] leading-[20.8px] text-balance",
                isUser ? "text-white" : "text-text",
              )}
            >
              {message.text}
            </p>
            {last && (
              <p
                className={cn(
                  "mt-[7px] text-[10px] leading-[13px]",
                  isUser ? "text-white/60" : "text-text-muted",
                )}
              >
                {meta}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
