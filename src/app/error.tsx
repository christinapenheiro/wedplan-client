"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw, HeartHandshake } from "lucide-react";

/**
 * Root error boundary component.
 * Catches unhandled runtime errors thrown inside child route components
 * and displays a user-friendly recovery interface.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Route error captured by error boundary:", error);
  }, [error]);

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center bg-[#FAF8FA] dark:bg-[#191417] px-4 py-12 overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-[#C4B6D0]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-destructive/15 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full gap-8">
        <div className="relative">
          <div className="flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-destructive to-[#C4B6D0] shadow-xl shadow-destructive/20">
            <AlertTriangle className="size-12 text-white" />
          </div>
          <div className="absolute -bottom-3 -right-3 flex size-10 items-center justify-center rounded-full border-2 border-[#FAF8FA] bg-[#C4B6D0]/30 dark:border-[#191417]">
            <HeartHandshake className="size-5 text-[#99616E]" />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-destructive">
            Something went wrong
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#2A1F25] dark:text-[#F5EFF3] sm:text-4xl">
            We hit an unexpected snag
          </h1>
          <p className="text-sm leading-relaxed text-[#756770] dark:text-[#A797A2]">
            An unexpected error occurred while loading this page. You can try refreshing
            or return to the home page.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#99616E] px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#824E5B] hover:shadow-md cursor-pointer"
          >
            <RefreshCw className="size-4" />
            Try Again
          </button>
          <Link prefetch={false}
            href="/"
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#D2D3D0] bg-white/80 px-6 text-sm font-semibold text-[#2A1F25] shadow-sm transition-all hover:border-[#C4B6D0] hover:bg-[#F2EEF3] dark:border-[#423940] dark:bg-[#221B20]/80 dark:text-[#F5EFF3] dark:hover:bg-[#2E252C]"
          >
            <Home className="size-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
