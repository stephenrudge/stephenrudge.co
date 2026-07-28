import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/brand/mountain-512.png"
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 dark:invert", className)}
      priority
    />
  );
}
