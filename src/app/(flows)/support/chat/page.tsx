"use client";

import { useEffect, useRef, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import {
  ChatAvatar,
  ChatBubble,
  type ChatEntry,
} from "@/components/ui/ChatBubble";
import { ChatInputBar } from "@/components/ui/ChatInputBar";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SuggestionChip } from "@/components/ui/SuggestionChip";

/* -------------------------------------------------------------------------
   ÉCRAN SANS BACKEND — CONTENU GÉNÉRIQUE, HONNÊTE.

   Il n'existe pas d'API de chat ni de fil rattaché au compte de l'utilisateur.
   L'écran ne présente donc AUCUNE opération réelle : ni référence FP-, ni
   montant, ni destinataire, ni « dossier suivi » présentés comme ceux du
   compte. Le fil est un accueil générique d'assistant ; la saisie renvoie une
   réponse d'attente canned, sans jamais affirmer qu'un mouvement d'argent a eu
   lieu. Tant qu'un vrai backend de support n'est pas raccordé, on ne fabrique
   pas de donnée de compte.
   ------------------------------------------------------------------------- */

/** Le fil d'accueil : un message d'assistant, sans donnée de compte. */
const THREAD: ChatEntry[] = [
  {
    id: "chat-welcome",
    from: "agent",
    time: "09:00",
    text: "Bonjour, je suis l'assistant FixPay. Décrivez votre demande : recharge, carte, retrait ou sécurité. Un conseiller peut prendre le relais si besoin.",
  },
];

/** Temps de frappe simulé avant la réponse de l'assistant. */
const REPLY_DELAY = 1400;

const AGENT_REPLY =
  "Merci, c'est bien noté. Un conseiller vous répond dans cette conversation dès que possible. Gardez la référence de l'opération concernée à portée de main : elle commence par FP- et figure sur chaque écran de confirmation.";

/**
 * Réponses rapides d'ouverture — des SUJETS génériques, pas une opération du
 * compte. Elles envoient une question et l'assistant accuse réception.
 */
const QUICK_REPLIES = [
  "Recharger mon portefeuille",
  "Créer une carte",
  "Bloquer une carte",
];

/**
 * Rappel de sécurité d'ouverture de conversation : la ligne que porte tout
 * support bancaire réel, et la seule information utile AVANT d'écrire.
 */
const SAFETY_NOTE =
  "FixPay ne vous demandera jamais votre code PIN ni le cryptogramme de votre carte.";

/**
 * Bulle « l'assistant écrit… ». Elle reprend la géométrie de `ChatBubble` —
 * avatar 30px ancré en bas, coin cassé côté avatar — pour que l'attente occupe
 * la place du message qui va arriver.
 */
function TypingBubble() {
  return (
    <div className="flex items-end gap-[10px]">
      <ChatAvatar from="agent" />
      <div
        className="bg-surface-2 rounded-lg rounded-bl-sm px-[15px] py-[17px]"
        aria-live="polite"
      >
        <span className="sr-only">L&apos;assistant écrit une réponse</span>
        <span aria-hidden="true" className="flex items-center gap-[5px]">
          {[0, 160, 320].map((delay) => (
            <span
              key={delay}
              className="bg-text-muted size-[5px] animate-pulse rounded-full"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

/**
 * Écran 27 · Chat Support — accueil générique.
 *
 * Faute d'API de chat, l'écran reste honnête : aucune opération du compte n'y
 * est présentée. Il porte un accueil d'assistant, un rappel de sécurité et des
 * sujets d'aide génériques. La saisie fonctionne comme une démonstration (accusé
 * de réception d'attente), sans jamais confirmer un mouvement d'argent.
 */
export default function ChatSupportPage() {
  const [messages, setMessages] = useState<ChatEntry[]>(THREAD);
  const [typing, setTyping] = useState(false);
  const timers = useRef<number[]>([]);
  const tick = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);

  // Les minuteries de frappe ne doivent pas survivre au démontage.
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  // Suivi du bas de conversation, jamais au premier rendu.
  useEffect(() => {
    if (messages.length <= THREAD.length && !typing) return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  function send(text: string) {
    tick.current += 1;
    setMessages((prev) => [
      ...prev,
      {
        id: `chat-user-${prev.length}`,
        from: "user",
        text,
        time: clock(tick.current),
      },
    ]);
    setTyping(true);

    const timer = window.setTimeout(() => {
      tick.current += 1;
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `chat-agent-${prev.length}`,
          from: "agent",
          text: AGENT_REPLY,
          time: clock(tick.current),
        },
      ]);
    }, REPLY_DELAY);
    timers.current.push(timer);
  }

  /** Le fil n'a pas encore reçu de nouveau tour de parole. */
  const pristine = messages.length === THREAD.length;

  /** Index du dernier message envoyé : lui seul porte un accusé. */
  const lastSentIndex = messages.reduce(
    (found, message, index) => (message.from === "user" ? index : found),
    -1,
  );

  return (
    <>
      <main className="flex flex-1 flex-col px-5 pt-[54px] pb-[91px] lg:mx-auto lg:w-full lg:max-w-[880px] lg:px-10 lg:pt-9">
        <PageHeader
          title="Chat en direct"
          backHref="/support"
          status={{
            label: typing
              ? "L'assistant écrit…"
              : "Assistant FixPay · un conseiller peut prendre le relais",
          }}
        />

        <div className="flex flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:grid-rows-[1fr] lg:items-stretch lg:gap-10">
          <div className="flex flex-1 flex-col">
            {/* mt-auto : un fil court tombe au bas de la colonne. max-w : la
                mesure de lecture d'une messagerie. */}
            <div className="mt-auto w-full max-w-[480px] pt-6 lg:pt-8">
              <p className="text-text-muted mx-auto mb-5 max-w-[300px] text-center text-[11.5px] leading-[16px] lg:hidden">
                {SAFETY_NOTE}
              </p>

              {messages.map((message, index) => {
                const previous = messages[index - 1];
                const next = messages[index + 1];
                const receipt =
                  index === lastSentIndex
                    ? index === messages.length - 1
                      ? "Envoyé"
                      : "Lu"
                    : undefined;

                return (
                  <div
                    key={message.id}
                    className={
                      previous === undefined
                        ? undefined
                        : previous.from === message.from
                          ? "mt-2"
                          : "mt-4"
                    }
                  >
                    <ChatBubble
                      message={message}
                      first={previous?.from !== message.from}
                      last={next?.from !== message.from}
                      receipt={receipt}
                    />
                  </div>
                );
              })}

              {typing && (
                <div className="mt-4">
                  <TypingBubble />
                </div>
              )}

              {/* Sujets d'aide génériques. Indentés de 40px (avatar 30 + gap 10)
                  pour tomber sous le bord gauche de la bulle. */}
              {pristine && !typing && (
                <div className="mt-3 flex flex-wrap gap-2 pl-10">
                  {QUICK_REPLIES.map((reply) => (
                    <SuggestionChip key={reply} onClick={() => send(reply)}>
                      {reply}
                    </SuggestionChip>
                  ))}
                </div>
              )}

              <div ref={endRef} />
            </div>
          </div>

          {/* Rail desktop : de l'aide générique, jamais une opération du compte.
              Horaires humains et rappel de sécurité — l'information qu'un service
              client donne avant qu'on le sollicite. */}
          <aside className="hidden lg:sticky lg:top-0 lg:block lg:self-start lg:pt-8">
            <SectionLabel>Votre interlocuteur</SectionLabel>
            <div className="mt-2.5 flex items-center gap-2.5">
              <ChatAvatar from="agent" />
              <span className="min-w-0">
                <span className="text-text block text-[13px] leading-[17px] font-medium">
                  Assistant FixPay
                </span>
                <span className="text-text-muted block text-[11.5px] leading-[15px]">
                  relais vers un conseiller si besoin
                </span>
              </span>
            </div>
            <p className="text-text-muted mt-3 text-[11.5px] leading-[16px]">
              Conseillers du lundi au dimanche, 8h – 22h. En dehors,
              l&apos;assistant prend le relais et transmet au matin.
            </p>

            <p className="text-text-muted border-border mt-6 border-t pt-6 text-[11.5px] leading-[16px]">
              {SAFETY_NOTE}
            </p>
          </aside>
        </div>
      </main>

      <ChatInputBar onSend={send} />
    </>
  );
}

/**
 * Horloge relative du fil : les envois sont horodatés à partir de l'ouverture de
 * la conversation. Aucun horaire n'est présenté comme celui d'une opération du
 * compte — c'est le temps de la session, pas une donnée bancaire.
 */
const SESSION_START_MINUTES = 9 * 60;

function clock(offsetMinutes: number): string {
  const total = (SESSION_START_MINUTES + offsetMinutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
