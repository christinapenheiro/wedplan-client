import Link from "next/link";
import { ShieldX, Home, LogIn, HeartHandshake } from "lucide-react";

/**
 * Shown when a user tries to access a route they are not authorised for.
 * Preserves the WedPlan brand palette and provides clear next steps.
 */
export default function UnauthorizedPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#FAF8FA] dark:bg-[#191417] px-4 overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-40 -right-40 size-96 rounded-full bg-[#C4B6D0]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 size-96 rounded-full bg-destructive/10 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full gap-8">
        {/* Icon */}
        <div className="relative">
          <div className="flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-destructive to-[#C4B6D0] shadow-xl shadow-destructive/20">
            <ShieldX className="size-12 text-white" />
          </div>
          <div className="absolute -bottom-3 -right-3 flex size-10 items-center justify-center rounded-full border-2 border-[#FAF8FA] bg-[#C4B6D0]/30 dark:border-[#191417]">
            <HeartHandshake className="size-5 text-[#99616E]" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-destructive">
            403 · Unauthorized
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-[#2A1F25] dark:text-[#F5EFF3] sm:text-5xl">
            Access denied
          </h1>
          <p className="text-sm leading-relaxed text-[#756770] dark:text-[#A797A2]">
            You don&apos;t have permission to view this page. Please sign in
            with the correct account or return home.
          </p>
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#99616E] px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#824E5B] hover:shadow-md"
          >
            <Home className="size-4" />
            Go Home
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#D2D3D0] bg-white/80 px-6 text-sm font-semibold text-[#2A1F25] shadow-sm transition-all hover:border-[#C4B6D0] hover:bg-[#F2EEF3] dark:border-[#423940] dark:bg-[#221B20]/80 dark:text-[#F5EFF3] dark:hover:bg-[#2E252C]"
          >
            <LogIn className="size-4" />
            Sign In
          </Link>
        </div>

        {/* Footer note */}
        <p className="text-xs text-[#756770] dark:text-[#A797A2]">
          If you believe this is a mistake, please{" "}
          <Link
            href="#"
            className="font-medium text-[#99616E] hover:underline underline-offset-4"
          >
            contact support
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
