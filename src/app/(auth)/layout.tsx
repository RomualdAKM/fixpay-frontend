// Charge le thème d'auth (design du landing) pour les écrans d'authentification.
// Le CSS est entièrement scopé sous `.fp-auth` (posé par AuthShell), donc son
// simple chargement n'affecte aucune page qui n'utilise pas ce wrapper.
import "./auth-theme.css";

export default function AuthGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
