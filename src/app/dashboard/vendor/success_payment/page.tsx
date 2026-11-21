"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Crown,
  ArrowRight,
  Sparkles,
  CalendarDays,
  Store,
  Loader2,
} from "lucide-react";
import { clientApi } from "@/lib/api/clientApi";
import { authClient } from "@/lib/auth-client";

function SuccessPaymentContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isVerifying, setIsVerifying] = React.useState(Boolean(sessionId));
  const { data: session , isPending} = authClient.useSession();
  const token = session?.session?.token;

  React.useEffect(() => {
    if (!sessionId || isPending) return;

    // Wait until Better Auth finishes loading.
    if (!token) {
      console.error("Authentication token is unavailable.");
      setIsVerifying(false);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const result = await clientApi.post("/verify-payment", token as string, { sessionId });
        console.log("Payment verification result:", result);
      } catch (err) {
        console.error("Payment verification check:", err);
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  },[sessionId, token, isPending]);

  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
  const formattedExpiry = ninetyDaysFromNow.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-primary/20 bg-card p-8 shadow-xl shadow-primary/5 text-center sm:p-10">
        {/* Animated Celebration Icon */}
        <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-[#B98695] text-primary-foreground shadow-lg shadow-primary/30">
          <Crown className="size-10" />
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4" />
          <span>Payment Confirmed</span>
        </div>

        <h1 className="mt-3 font-serif text-3xl font-semibold tracking-wide text-foreground sm:text-4xl">
          Welcome to Premium!
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Your payment has been successfully processed. Your vendor account has
          been upgraded with unlimited listings and premium benefits.
        </p>

        {/* Verification Status */}
        {isVerifying ? (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span>Confirming subscription status with Stripe…</span>
          </div>
        ) : (
          <div className="mt-6 space-y-2.5 rounded-2xl border border-border/80 bg-muted/20 p-4 text-left text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Sparkles className="size-3.5 text-primary" />
                Active Plan:
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                Premium
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground border-t border-border/60 pt-2.5">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5 text-primary" />
                Valid For:
              </span>
              <span className="font-medium text-foreground">
                90 Days (Until {formattedExpiry})
              </span>
            </div>
          </div>
        )}

        {/* Next Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard/vendor"
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-[#B98695] px-4 text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-sm transition-all hover:brightness-105"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="size-4" />
          </Link>

          <Link
            href="/dashboard/vendor/add-service"
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-xs font-semibold uppercase tracking-wider text-foreground transition-all hover:bg-accent"
          >
            <Store className="size-4" />
            <span>Add New Service</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPaymentPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      }
    >
      <SuccessPaymentContent />
    </React.Suspense>
  );
}
