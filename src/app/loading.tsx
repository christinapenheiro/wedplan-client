import { HeartHandshake } from "lucide-react";

/**
 * Global loading UI shown by Next.js during route-level suspense boundaries.
 * Renders a branded spinner that covers the full viewport while a page loads.
 */
export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[#FAF8FA] dark:bg-[#191417]">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-[#C4B6D0]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-[#99616E]/20 blur-3xl" />

      {/* Logo pulse ring */}
      <div className="relative flex items-center justify-center">
        {/* Outer pulse ring */}
        <span className="absolute inline-flex size-20 animate-ping rounded-full bg-[#C4B6D0]/40" />
        {/* Inner icon container */}
        <div className="relative flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-[#99616E] to-[#C4B6D0] shadow-lg shadow-[#99616E]/30">
          <HeartHandshake className="size-8 text-white" />
        </div>
      </div>

      {/* Brand name */}
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-lg font-bold tracking-tight text-[#2A1F25] dark:text-[#F5EFF3]">
          WedPlan
        </span>
        {/* Animated dots */}
        <div className="flex items-center gap-1.5">
          <span
            className="size-1.5 rounded-full bg-[#99616E] animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="size-1.5 rounded-full bg-[#99616E] animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="size-1.5 rounded-full bg-[#99616E] animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
