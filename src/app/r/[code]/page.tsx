import { redirect } from "next/navigation";

/**
 * Point d'entrée d'un lien de parrainage (« …/r/{code} »), tel qu'il est
 * affiché et copié depuis l'écran Parrainage (profile/referral).
 *
 * Le lien n'ouvre pas d'écran propre : il transmet le code au formulaire
 * d'inscription via la query `ref`, que RegisterForm lit pour pré-remplir le
 * champ « Code de parrainage ». En Next 15 `params` est asynchrone.
 */
export default async function ReferralLinkPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  redirect(`/register?ref=${encodeURIComponent(code)}`);
}
