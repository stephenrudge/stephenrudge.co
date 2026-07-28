"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareNative() {
    if (typeof navigator !== "undefined" && navigator.share) {
      void navigator.share({
        title,
        url: window.location.href,
      });
    } else {
      void copyLink();
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={shareNative}>
        <Share2 className="h-3.5 w-3.5" />
        Share
      </Button>
      <Button variant="outline" size="sm" onClick={copyLink}>
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Copied
          </>
        ) : (
          <>
            <Link2 className="h-3.5 w-3.5" />
            Copy link
          </>
        )}
      </Button>
    </div>
  );
}
