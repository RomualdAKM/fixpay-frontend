import Link from "next/link";

interface OperationUnavailableProps {
  title: string;
  message: string;
  backHref: string;
  backLabel: string;
}

/**
 * Écran neutre pour une opération d'argent qui n'est pas encore raccordée à
 * l'API. Il remplace les anciens reçus de succès factices (montant codé en dur,
 * aucun appel, aucun débit) : tant qu'un flux n'émet pas de vraie mutation, il
 * ne doit jamais afficher « accepté / confirmé ». Aucun montant, aucune
 * référence, aucune sémantique de succès.
 */
export function OperationUnavailable({
  title,
  message,
  backHref,
  backLabel,
}: OperationUnavailableProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center px-6 text-center">
      <p className="text-text text-[18px] leading-[24px] font-semibold">
        {title}
      </p>
      <p className="text-text-muted mt-2 max-w-[360px] text-[13.5px] leading-[20px]">
        {message}
      </p>
      <Link
        href={backHref}
        className="text-primary-light mt-6 text-[13.5px] leading-[18px] font-medium underline-offset-4 hover:underline"
      >
        {backLabel}
      </Link>
    </main>
  );
}
