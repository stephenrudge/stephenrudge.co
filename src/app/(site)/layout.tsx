import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteShell } from "@/components/site-shell";
import { SanityLive } from "@/sanity/lib/live";
import { isSanityConfigured } from "@/sanity/env";
import "../globals.css";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDraftMode = (await draftMode()).isEnabled;

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground antialiased">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SiteShell>{children}</SiteShell>
      </ThemeProvider>
      {isSanityConfigured() ? <SanityLive /> : null}
      {isDraftMode ? <VisualEditing /> : null}
    </div>
  );
}
