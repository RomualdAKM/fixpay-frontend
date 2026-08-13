import { AppShell } from "@/components/layout/AppShell";

export default function FlowsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
