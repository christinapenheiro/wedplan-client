"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  XCircle,
  ArrowLeft,
  RefreshCw,
  HeartHandshake,
  CreditCard,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";

/**
 * Rendered when a vendor cancels or abandons the Stripe checkout session.
 * Provides clear context about what happened and offers a path back to retry.
 */
export default function CancelPaymentPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 size-80 rounded-full bg-[#C4B6D0]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 size-80 rounded-full bg-destructive/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="rounded-3xl border border-destructive/20 bg-card shadow-xl shadow-destructive/5 p-8 sm:p-10 text-center space-y-6">

          {/* Icon */}
          <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-destructive/10 border border-destructive/20">
            <XCircle className="size-10 text-destructive" />
          </div>

          {/* Status label */}
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-destructive">
            <XCircle className="size-3.5" />
            <span>Payment Cancelled</span>
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              No charge was made
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You cancelled the checkout before completing payment. Your account
              remains on the{" "}
              <span className="font-semibold text-foreground">Free plan</span>{" "}
              and nothing was charged.
            </p>
          </div>

          {/* Info cards */}
          <div className="space-y-2.5 rounded-2xl border border-border/70 bg-muted/20 p-4 text-left text-xs">
            <div className="flex items-start gap-3 text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <p>
                <span className="font-semibold text-foreground">
                  Your data is safe.
                </span>{" "}
                All your services, listings, and bookings remain exactly as they
                were.
              </p>
            </div>
            <div className="flex items-start gap-3 text-muted-foreground">
              <CreditCard className="mt-0.5 size-4 shrink-0 text-[#99616E]" />
              <p>
                <span className="font-semibold text-foreground">
                  No payment processed.
                </span>{" "}
                Stripe never finalised this session, so your card or payment
                method was not charged.
              </p>
            </div>
            <div className="flex items-start gap-3 text-muted-foreground">
              <HeartHandshake className="mt-0.5 size-4 shrink-0 text-[#99616E]" />
              <p>
                <span className="font-semibold text-foreground">
                  Ready when you are.
                </span>{" "}
                You can upgrade to Premium at any time from your subscription
                page.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/dashboard/vendor/subscription")}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#99616E] px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#824E5B] hover:shadow-md"
            >
              <RefreshCw className="size-4" />
              Try Again
            </button>
            <Link
              href="/dashboard/vendor"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 text-sm font-semibold text-foreground transition-all hover:bg-accent"
            >
              <ArrowLeft className="size-4" />
              Back to Dashboard
            </Link>
          </div>

          {/* Help link */}
          <p className="text-xs text-muted-foreground">
            Having trouble?{" "}
            <Link
              href="#"
              className="inline-flex items-center gap-0.5 font-medium text-[#99616E] hover:underline underline-offset-4"
            >
              <HelpCircle className="size-3" />
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
