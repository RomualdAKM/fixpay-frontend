import { cn } from "@/lib/utils";

interface TransactionFactsProps {
  /** Frais de l'opération, déjà formatés : « Gratuit », « 1 % (min. 100 FCFA) ». */
  fee: string;
  /** Délai de crédit annoncé : « Instantané », « Sous 5 min ». */
  delay: string;
  /** Plafond encore disponible, déjà formaté. Absent = colonne masquée. */
  limit?: string;
  /** Solde résultant. Ne le passer QUE lorsqu'un montant a été saisi. */
  balanceAfter?: string;
}

/**
 * Bande d'information transactionnelle des écrans de flux (04 → 08) :
 * « Frais · Délai · Plafond restant », plus une ligne « Solde après » qui
 * n'apparaît qu'une fois un montant saisi.
 *
 * Posée À PLAT sur le fond, sans carte ni rayon ni ombre : les colonnes ne
 * sont séparées que par un filet vertical `border-border`. C'est ce bloc,
 * plus que le style, qui distingue un écran de transfert réel d'un formulaire
 * à deux champs (audit : « Densité fintech absente »).
 */
export function TransactionFacts({
  fee,
  delay,
  limit,
  balanceAfter,
}: TransactionFactsProps) {
  const facts = [
    { label: "Frais", value: fee },
    { label: "Délai", value: delay },
    ...(limit ? [{ label: "Plafond restant", value: limit }] : []),
  ];

  return (
    <div>
      <dl
        className={cn(
          "divide-border grid divide-x",
          facts.length === 3 ? "grid-cols-3" : "grid-cols-2",
        )}
      >
        {facts.map((fact) => (
          <div key={fact.label} className="px-3.5 first:pl-0 last:pr-0">
            <dt className="text-text-muted text-[11.5px] leading-[15px]">
              {fact.label}
            </dt>
            <dd className="text-text mt-[3px] text-[13.5px] leading-[18px] font-medium">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>

      {balanceAfter && (
        <div className="border-border mt-3.5 flex items-baseline justify-between border-t pt-3.5">
          <span className="text-text-secondary text-[12.5px] leading-[16px]">
            Solde après
          </span>
          <span className="text-text text-[13.5px] leading-[18px] font-medium">
            {balanceAfter}
          </span>
        </div>
      )}
    </div>
  );
}
