import type { ReactNode } from "react";

/**
 * Studio-only layout: no site ThemeProvider, Tailwind globals, or SanityLive.
 * Those break Portable Text typing when nested around the Studio.
 */
export default function StudioGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div
      id="sanity-studio-root"
      style={{
        position: "fixed",
        inset: 0,
        height: "100dvh",
        maxHeight: "100dvh",
        overflow: "auto",
        overscrollBehavior: "none",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {children}
    </div>
  );
}
