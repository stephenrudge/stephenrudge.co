import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Stephen Rudge — Travel Logs & Photography",
    template: "%s · Stephen Rudge",
  },
  description:
    "Travel logs, field notes, and photography by Stephen Rudge. Stories from the road, maps of places visited, and gear notes.",
  metadataBase: new URL("https://stephenrudge.co"),
};

/**
 * Minimal root layout so /studio is not wrapped in site ThemeProvider / Tailwind.
 * Site chrome lives in `(site)/layout.tsx`.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
