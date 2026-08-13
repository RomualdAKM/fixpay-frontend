import type { Metadata, Viewport } from "next";
import { DM_Mono, DM_Sans } from "next/font/google";

import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/lib/auth";
import { QueryProvider } from "@/lib/query/QueryProvider";
import { THEME_STORAGE_KEY } from "@/lib/theme";

import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-dm-sans",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: {
    default: "FixPay",
    template: "%s · FixPay",
  },
  description:
    "Portefeuille mobile et cartes bancaires virtuelles — dépôts, retraits et paiements en FCFA.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#070c1a" },
    { media: "(prefers-color-scheme: light)", color: "#eef1f8" },
  ],
};

/**
 * Runs while the document is parsed (inline, inside an explicit <head>):
 * resolves the stored preference, falling back to the OS setting, and stamps
 * `data-theme` on <html> so tokens are correct with no flash of the wrong theme.
 * The <head> is declared explicitly so React does not hoist the script at
 * hydration — a moved node fails hydration and makes React rebuild <html>,
 * which would drop the attribute (and next/script defers it past first paint).
 */
const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}})()`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /* No `data-theme` here on purpose: React would reconcile it back to the
       server value and undo the pre-paint script. The CSS `:root` block holds
       the dark palette, so markup without the attribute renders dark. */
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${dmSans.variable} ${dmMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ErrorBoundary>
          <ThemeProvider>
            <QueryProvider>
              <AuthProvider>
                {/* Mobile canvas: the design is authored at 390px; the shell
                    stays fluid up to 430px and centers on larger viewports.
                    From `lg` up the constraint is released so the desktop shell
                    (Sidebar + content area, see AppShell) can span the full
                    width. */}
                <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-x-hidden lg:max-w-none lg:overflow-x-visible">
                  {children}
                </div>
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
