import Link from "next/link";
import { HeartHandshake, Home, ArrowLeft, SearchX } from "lucide-react";

/**
 * Custom 404 page shown when Next.js cannot match a route or notFound() is called.
 * Preserves the WedPlan brand palette and provides helpful navigation shortcuts.
 */
export default function NotFound() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center bg-[#FAF8FA] dark:bg-[#191417] px-4 py-16 overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-[#C4B6D0]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-[#99616E]/20 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full gap-8">
        {/* Icon */}
        <div className="relative">
          <div className="flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#99616E] to-[#C4B6D0] shadow-xl shadow-[#99616E]/20">
            <SearchX className="size-12 text-white" />
          </div>
          {/* Small brand badge */}
          <div className="absolute -bottom-3 -right-3 flex size-10 items-center justify-center rounded-full border-2 border-[#FAF8FA] bg-[#C4B6D0]/30 dark:border-[#191417]">
            <HeartHandshake className="size-5 text-[#99616E]" />
          </div>
        </div>

        {/* 404 heading */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#99616E]">
            404 · Page not found
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-[#2A1F25] dark:text-[#F5EFF3] sm:text-5xl">
            Lost in the aisle?
          </h1>
          <p className="text-sm leading-relaxed text-[#756770] dark:text-[#A797A2]">
            The page you&apos;re looking for doesn&apos;t exist or may have been
            moved. Let&apos;s get you back on track for your perfect day.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <Link prefetch={false}
            href="/"
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#99616E] px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#824E5B] hover:shadow-md"
          >
            <Home className="size-4" />
            Go Home
          </Link>
          <Link prefetch={false}
            href="/browse-services"
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#D2D3D0] bg-white/80 px-6 text-sm font-semibold text-[#2A1F25] shadow-sm transition-all hover:border-[#C4B6D0] hover:bg-[#F2EEF3] dark:border-[#423940] dark:bg-[#221B20]/80 dark:text-[#F5EFF3] dark:hover:bg-[#2E252C]"
          >
            <ArrowLeft className="size-4" />
            Browse Services
          </Link>
        </div>

        {/* Helpful links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[#756770] dark:text-[#A797A2]">
          <Link prefetch={false}
            href="/dashboard"
            className="hover:text-[#99616E] hover:underline underline-offset-4 transition-colors"
          >
            Dashboard
          </Link>
          <span className="text-[#D2D3D0]">·</span>
          <Link prefetch={false}
            href="/sign-in"
            className="hover:text-[#99616E] hover:underline underline-offset-4 transition-colors"
          >
            Sign In
          </Link>
          <span className="text-[#D2D3D0]">·</span>
          <Link prefetch={false}
            href="/sign-up"
            className="hover:text-[#99616E] hover:underline underline-offset-4 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
