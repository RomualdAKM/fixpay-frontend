import { Star } from "lucide-react";

import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";

export const metadata = { title: "Programme fidélité" };

/**
 * Écran 18 · Fidélité — le programme de fidélité n'a pas encore d'API : aucun
 * solde de points, aucun catalogue ni historique n'est exposé par le backend.
 * L'écran reste HONNÊTE — il décrit le principe du programme (contenu générique)
 * sans présenter de solde de compte fabriqué comme réel.
 */
export default function LoyaltyPage() {
  return (
    <>
      <main className="px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[720px] lg:px-10 lg:pt-9 lg:pb-12">
        <PageHeader title="Programme fidélité" backHref="/profile" />

        <div className="mt-8 flex items-center gap-2.5">
          <Star
            size={18}
            strokeWidth={1.75}
            absoluteStrokeWidth
            aria-hidden="true"
            className="text-gold shrink-0"
          />
          <h2 className="text-text text-[16px] leading-[21px] font-semibold">
            Bientôt disponible
          </h2>
        </div>
        <p className="text-text-secondary mt-2 text-[13px] leading-[20px] lg:max-w-[520px]">
          Le programme de fidélité FixPay arrive prochainement. Vous cumulerez
          des points sur vos paiements par carte, échangeables contre des
          réductions sur vos prochaines opérations.
        </p>

        <GlassCard className="mt-6 p-4 lg:p-5">
          <p className="text-text text-[13.5px] leading-[18px] font-semibold">
            Comment ça marchera
          </p>
          <ul className="text-text-secondary mt-2 space-y-1.5 text-[12.5px] leading-[18px]">
            <li>· Des points à chaque paiement par carte FixPay.</li>
            <li>· Des paliers qui débloquent des avantages.</li>
            <li>· Des points échangeables contre des réductions.</li>
          </ul>
        </GlassCard>
      </main>

      <BottomNav />
    </>
  );
}
