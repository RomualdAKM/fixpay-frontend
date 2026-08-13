"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import {
  ChatAvatar,
  ChatBubble,
  type ChatEntry,
} from "@/components/ui/ChatBubble";
import { ChatInputBar } from "@/components/ui/ChatInputBar";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SuggestionChip } from "@/components/ui/SuggestionChip";
import { formatFcfa } from "@/lib/format";
import { withdrawFacts } from "@/lib/mock-data";

/* -------------------------------------------------------------------------
   L'OPÉRATION DONT ON PARLE

   Une conversation de support bancaire n'a pas de sujet abstrait : elle est
   accrochée à une opération. Celle-ci est le retrait de l'écran 22 — mêmes
   référence, montant, destinataire, horodatage — et les frais sont RECALCULÉS
   depuis le barème du flux (`withdrawFacts` : 1 %, plancher 100 FCFA) plutôt
   que réécrits à la main. Le grand livre des écrans 21-25 reste la source.
   ------------------------------------------------------------------------- */
const OPERATION = {
  reference: "FP-1404-9032",
  amount: 30_000,
  recipient: "Wave · +221 77 ••• •• 34",
  issuedAt: "14 avr. 2026, 16:05",
  status: "En attente chez Wave",
  href: "/wallet/withdraw/success",
};

const FEE = Math.max(
  withdrawFacts.feeMin ?? 0,
  Math.round((OPERATION.amount * (withdrawFacts.feeRate ?? 0)) / 100),
);
const DEBITED = OPERATION.amount + FEE;

/** Le conseiller qui a pris le relais de l'assistant. */
const ADVISOR = {
  name: "Aminata Diallo",
  firstName: "Aminata",
  role: "conseillère retraits",
  initials: "AD",
};

/* -------------------------------------------------------------------------
   LE FIL

   Un vrai échange, et non un message d'accueil seul : réclamation datée,
   accusé de réception, rappel de la référence et du barème, cause côté
   opérateur, garantie de remboursement chiffrée, puis escalade vers un humain
   nommé qui reprend le dossier et s'engage sur une heure. C'est ce fil qui
   remplit la colonne — pas de la décoration ajoutée sous l'en-tête.
   ------------------------------------------------------------------------- */
const THREAD: ChatEntry[] = [
  {
    id: "chat-1",
    from: "user",
    time: "17:12",
    text: "Bonjour, mon retrait du 14 avr. vers Wave n'est toujours pas arrivé. Ça fait plus d'une heure.",
  },
  {
    id: "chat-2",
    from: "agent",
    time: "17:12",
    text: "Bonjour. Je vérifie l'opération, un instant.",
  },
  {
    id: "chat-3",
    from: "agent",
    time: "17:13",
    text: `Retrait de ${formatFcfa(OPERATION.amount)} vers ${OPERATION.recipient}, référence ${OPERATION.reference}, émis le 14 avr. à 16:05. Total débité ${formatFcfa(DEBITED)}, dont ${formatFcfa(FEE)} de frais.`,
  },
  {
    id: "chat-4",
    from: "agent",
    time: "17:13",
    text: "Il est bien parti de FixPay et Wave l'a accepté à 16:06. Le crédit annoncé sous 5 min dépend ensuite de l'opérateur, et Wave signale une file d'attente depuis 16:00.",
  },
  {
    id: "chat-5",
    from: "user",
    time: "17:14",
    text: "Et si l'argent n'arrive jamais ?",
  },
  {
    id: "chat-6",
    from: "agent",
    time: "17:15",
    text: `Sans crédit sous 24 h, les ${formatFcfa(DEBITED)} sont automatiquement remis sur votre portefeuille, frais compris, et vous recevez une notification.`,
  },
  {
    id: "chat-7",
    from: "agent",
    time: "17:15",
    text: "Je peux passer le dossier à un conseiller si vous préférez un suivi humain.",
  },
  {
    id: "chat-8",
    from: "user",
    time: "17:16",
    text: "Oui, je préfère.",
  },
  {
    id: "chat-9",
    from: "advisor",
    time: "17:17",
    author: ADVISOR.name,
    role: ADVISOR.role,
    notice: "Transfert au service retraits · 1 min d'attente",
    text: `Bonjour, ${ADVISOR.firstName} du service retraits. J'ai le dossier ${OPERATION.reference} sous les yeux.`,
  },
  {
    id: "chat-10",
    from: "advisor",
    time: "17:18",
    author: ADVISOR.name,
    role: ADVISOR.role,
    text: "Wave nous a confirmé un incident sur les transferts entrants, ouvert à 16:00. Votre virement est dans leur file, il n'est pas perdu.",
  },
  {
    id: "chat-11",
    from: "advisor",
    time: "17:19",
    author: ADVISOR.name,
    role: ADVISOR.role,
    text: `Je vous écris ici dès que le crédit est confirmé. Si rien n'a bougé à 19:05, je déclenche le remboursement des ${formatFcfa(DEBITED)} sans que vous ayez à revenir.`,
  },
];

/**
 * Horloge du fil. Le dernier message date de 17:19 : les envois suivants
 * continuent cette minute-là au lieu de porter l'heure réelle du navigateur,
 * qui aurait daté une réponse de 09:04 sous un message de 17:19. Un fil de
 * conversation a une chronologie ; elle ne peut pas dépendre de l'heure à
 * laquelle on ouvre la démonstration.
 */
const THREAD_END_MINUTES = 17 * 60 + 19;

function clock(offsetMinutes: number): string {
  const total = (THREAD_END_MINUTES + offsetMinutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** Temps de frappe simulé avant la réponse du conseiller. */
const REPLY_DELAY = 1400;

const ADVISOR_REPLY =
  "C'est noté, je m'en occupe. Je vous réponds dans cette conversation dès que j'ai la confirmation de Wave.";

/**
 * Réponses rapides du tour de parole en cours. Ce ne sont plus des « sujets
 * fréquents » — le fil a commencé, proposer « Créer une carte » au milieu d'une
 * réclamation de retrait n'aurait aucun sens. Deux réponses d'information et
 * une demande qui engage l'opération, distinguée par le contour.
 */
const QUICK_REPLIES = ["Combien de temps encore ?", "Me prévenir par SMS"];
const CLAIM_REPLY = "Rembourser maintenant";

/**
 * Rappel de sécurité d'ouverture de conversation. Ce n'est pas du remplissage
 * : c'est la ligne que porte tout support bancaire réel, et c'est la seule
 * information dont l'utilisateur a besoin AVANT d'écrire.
 */
const SAFETY_NOTE =
  "FixPay ne vous demandera jamais votre code PIN ni le cryptogramme de votre carte.";

/** Le dossier, tel qu'il s'affiche à côté de la conversation en desktop. */
const OPERATION_ROWS: [label: string, value: string][] = [
  ["Référence", OPERATION.reference],
  ["Montant", formatFcfa(OPERATION.amount)],
  ["Frais", `${formatFcfa(FEE)} (${withdrawFacts.feeRate} %)`],
  ["Total débité", formatFcfa(DEBITED)],
  ["Destinataire", OPERATION.recipient],
  ["Émis le", OPERATION.issuedAt],
  ["Statut", OPERATION.status],
];

/**
 * Bulle « le conseiller écrit… ». Elle reprend exactement la géométrie de
 * `ChatBubble` — avatar 30px ancré en bas, coin cassé côté avatar — pour que
 * l'attente occupe la place du message qui va arriver.
 */
function TypingBubble() {
  return (
    <div className="flex items-end gap-[10px]">
      <ChatAvatar from="advisor" initials={ADVISOR.initials} />
      <div
        className="bg-surface-2 rounded-lg rounded-bl-sm px-[15px] py-[17px]"
        aria-live="polite"
      >
        <span className="sr-only">{ADVISOR.firstName} écrit une réponse</span>
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
 * Écran 27 · Chat Support.
 *
 * ÉTAPE 12 — LES TROIS BLOQUANTS SE RÈGLENT PAR LA MÊME CAUSE : il n'y avait
 * pas de conversation. Un message d'accueil seul, ancré en bas, laissait 620px
 * de fond nu sur mobile et 60 % de surface vide en desktop ; aucune
 * composition ne rattrape une colonne de chat sans messages. Le fil est donc
 * devenu un échange réel (`THREAD`), accroché à une opération du grand livre
 * (le retrait FP-1404-9032 de l'écran 22) : réclamation, accusé de réception,
 * référence, barème, cause opérateur, garantie de remboursement, escalade vers
 * une conseillère nommée qui s'engage sur une heure. Le vide est rempli par de
 * l'information, jamais par du décor.
 *
 * MESURE DE LECTURE. La colonne de conversation était posée dans 1040px de
 * page : des bulles de 261px y flottaient au milieu d'un canevas. La page passe
 * à 880px et la conversation à 480px au plus — la mesure d'une messagerie —, le
 * rail d'aide à 280px. La barre de saisie suit exactement le même calcul
 * (voir `ChatInputBar`), au pixel.
 *
 * LE DOSSIER. La largeur desktop porte le suivi de l'opération discutée
 * (référence, frais, total débité, destinataire, statut) plutôt qu'un rail de
 * navigation. Sur mobile la même information existe, condensée en une ligne
 * sous l'en-tête, cliquable vers le reçu : plus de contenu réservé au grand
 * écran.
 *
 * ACQUIS CONSERVÉS : groupement des séries (8px dans une série, 16px entre
 * deux, avatar et heure sur la dernière seule), accusé « Envoyé » puis « Lu »
 * dans la ligne d'heure, état « écrit… » pendant la réponse, rappel de
 * sécurité, horaires humains 8h – 22h.
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
          id: `chat-advisor-${prev.length}`,
          from: "advisor",
          text: ADVISOR_REPLY,
          time: clock(tick.current),
          author: ADVISOR.name,
          role: ADVISOR.role,
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
              ? `${ADVISOR.firstName} écrit…`
              : `${ADVISOR.name} · répond en moins de 5 min`,
          }}
        />

        {/* Mobile : l'opération discutée, en une ligne, juste sous l'en-tête.
            C'est ce que le desktop montre en colonne — la même information,
            à la densité du petit écran. */}
        <Link
          href={OPERATION.href}
          className="border-border hover:bg-surface-2 -mx-5 mt-5 flex items-center gap-[13px] border-y px-5 py-[11px] transition-colors lg:hidden"
        >
          <span className="min-w-0 flex-1">
            <span className="text-text block truncate text-[13.5px] leading-[18px] font-medium [word-spacing:0.16em]">
              Retrait {formatFcfa(OPERATION.amount)} · {OPERATION.reference}
            </span>
            <span className="text-text-muted mt-[2px] block truncate text-[11.5px] leading-[15px]">
              Wave · émis à 16:05 · en attente chez l&apos;opérateur
            </span>
          </span>
          <ChevronRight
            size={16}
            strokeWidth={2}
            absoluteStrokeWidth
            aria-hidden="true"
            className="text-icon-muted shrink-0"
          />
        </Link>

        <div className="flex flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:grid-rows-[1fr] lg:items-stretch lg:gap-10">
          <div className="flex flex-1 flex-col">
            {/* mt-auto : un fil court tombe au bas de la colonne ; celui-ci la
                remplit. max-w : la mesure de lecture d'une messagerie. */}
            <div className="mt-auto w-full max-w-[480px] pt-6 lg:pt-8">
              <p className="text-text-muted mx-auto mb-5 max-w-[300px] text-center text-[11.5px] leading-[16px] lg:hidden">
                {SAFETY_NOTE}
              </p>

              <p className="text-text-muted mb-3 text-center text-[11px] leading-[15px]">
                Aujourd&apos;hui
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
                        : previous.from === message.from && !message.notice
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

              {/* Réponses rapides du tour en cours. Indentées de 40px (avatar
                  30 + gap 10) pour tomber exactement sous le bord gauche de la
                  bulle : alignement calculé, à conserver. Même place et même
                  statut sur les deux largeurs — ce sont des réponses, pas une
                  navigation. */}
              {pristine && !typing && (
                <div className="mt-3 flex flex-wrap gap-2 pl-10">
                  {QUICK_REPLIES.map((reply) => (
                    <SuggestionChip key={reply} onClick={() => send(reply)}>
                      {reply}
                    </SuggestionChip>
                  ))}
                  <SuggestionChip
                    tone="action"
                    onClick={() => send(CLAIM_REPLY)}
                  >
                    {CLAIM_REPLY}
                  </SuggestionChip>
                </div>
              )}

              <div ref={endRef} />
            </div>
          </div>

          {/* Rail desktop : le dossier suivi. Ce que la largeur doit porter,
              plutôt qu'une bulle seule dans un canevas vide.

              COLLANT. Le fil est plus haut que le viewport : sans `sticky` la
              colonne de droite se serait arrêtée à mi-page et le bas du rail
              serait redevenu du vide — exactement le défaut relevé (« le rail
              droit s'arrête à y≈390 »), déplacé plus bas. Le dossier reste en
              vis-à-vis de la conversation pendant tout le défilement. */}
          <aside className="hidden lg:sticky lg:top-0 lg:block lg:self-start lg:pt-8">
            <SectionLabel>Opération suivie</SectionLabel>
            <dl className="border-border divide-border mt-1.5 divide-y border-t">
              {OPERATION_ROWS.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-3 py-2.5"
                >
                  <dt className="text-text-muted shrink-0 text-[11.5px] leading-[15px]">
                    {label}
                  </dt>
                  <dd className="text-text text-right text-[12.5px] leading-[17px] font-medium [word-spacing:0.16em]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <Link
              href={OPERATION.href}
              className="text-primary-light mt-3 inline-block text-[12.5px] leading-[17px] font-medium underline-offset-4 hover:underline"
            >
              Voir le reçu
            </Link>

            <div className="border-border mt-6 border-t pt-6">
              <SectionLabel>Votre interlocutrice</SectionLabel>
              <div className="mt-2.5 flex items-center gap-2.5">
                <ChatAvatar from="advisor" initials={ADVISOR.initials} />
                <span className="min-w-0">
                  <span className="text-text block text-[13px] leading-[17px] font-medium">
                    {ADVISOR.name}
                  </span>
                  <span className="text-text-muted block text-[11.5px] leading-[15px]">
                    {ADVISOR.role}
                  </span>
                </span>
              </div>
              {/* Information NEUVE — pas une reformulation du délai déjà
                  annoncé dans l'en-tête : les horaires humains, qui ne sont
                  pas ceux de l'assistant. */}
              <p className="text-text-muted mt-3 text-[11.5px] leading-[16px]">
                Conseillers du lundi au dimanche, 8h – 22h. En dehors,
                l&apos;assistant prend le relais et transmet au matin.
              </p>
            </div>

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
