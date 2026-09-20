import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NexoraLogoProps {
  className?: string;
  imageClassName?: string;
  size?: number;
  showText?: boolean;
  showSubtitle?: boolean;
  variant?: "emblem" | "full-badge";
  href?: string;
}

export function NexoraLogo({
  className,
  imageClassName,
  size = 40,
  showText = true,
  showSubtitle = false,
  variant = "emblem",
  href,
}: NexoraLogoProps) {
  if (variant === "full-badge") {
    const badge = (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-[#0B092B] border border-[#372E8A]/60 shadow-glow-ink p-1 group hover:border-[#CFDE22]/50 hover:shadow-glow-lime-sm transition-all duration-300",
          className
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.png"
          alt="Nexora AI Learning Companion"
          width={size}
          height={size}
          className={cn("object-contain w-full h-full rounded-xl", imageClassName)}
          priority
          unoptimized
        />
      </div>
    );

    if (href) {
      return (
        <Link href={href} className="inline-flex">
          {badge}
        </Link>
      );
    }
    return badge;
  }

  // Default: Emblem with glowing N and book wings filling the icon
  const content = (
    <div className={cn("inline-flex items-center gap-3 group", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl bg-[#0B092B] border border-[#372E8A]/60 flex items-center justify-center shadow-glow-ink group-hover:shadow-glow-lime-sm group-hover:border-[#CFDE22]/60 transition-all duration-200 shrink-0",
          imageClassName
        )}
        style={{ width: size, height: size }}
      >
        {/* Clean fit for new glowing scholar & open book emblem */}
        <Image
          src="/logo.png"
          alt="Nexora Logo"
          width={size * 2}
          height={size * 2}
          className="object-contain w-full h-full p-0.5 transform group-hover:scale-105 transition-transform duration-300"
          priority
          unoptimized
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-[#1D156B] leading-tight">
            Nexora<span className="text-[#CFDE22]">.</span>
          </span>
          {showSubtitle ? (
            <span className="text-[9px] font-mono font-bold tracking-wider text-[#8396B1] uppercase leading-none">
              AI Learning Companion
            </span>
          ) : (
            <span className="text-[10px] font-mono font-medium text-[#8396B1] leading-none">
              Study Companion
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}
