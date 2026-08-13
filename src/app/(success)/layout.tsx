import { RouteGuard } from "@/lib/auth";

/**
 * The post-transaction confirmation screens are an authenticated context: they
 * report the outcome of an operation the signed-in user just performed. They
 * render full-screen (no AppShell chrome), but must still be gated by the GET
 * /api/me verdict like the rest of the app — once wired to real endpoints an
 * unguarded render would show a bare/error state to a guest.
 */
export default function SuccessLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RouteGuard>{children}</RouteGuard>;
}
