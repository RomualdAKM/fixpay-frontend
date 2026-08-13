import { AppShell } from "@/components/layout/AppShell";
import { RouteGuard } from "@/lib/auth";

export default function TabsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RouteGuard>
      <AppShell>{children}</AppShell>
    </RouteGuard>
  );
}
