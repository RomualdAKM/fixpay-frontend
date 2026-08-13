import { AuthShell } from "@/components/auth/AuthShell";
import { PinSetView } from "@/components/auth/PinSetView";
import { RouteGuard } from "@/lib/auth";

export const metadata = { title: "Définir le code PIN" };

/**
 * Setting the transactional PIN is an authenticated action (POST /api/pin
 * returns 401 for a guest). It sits in the (auth) group next to the public
 * screens, so it carries its own RouteGuard rather than inheriting one from a
 * group layout — a guest reaching /pin/set is bounced to /login instead of
 * seeing the setup chrome.
 */
export default function PinSetPage() {
  return (
    <RouteGuard>
      <AuthShell title="Sécurisez votre compte">
        <PinSetView />
      </AuthShell>
    </RouteGuard>
  );
}
