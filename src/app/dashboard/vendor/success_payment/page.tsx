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
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { clientApi } from "@/lib/api/clientApi";
import { authClient } from "@/lib/auth-client";

/** Response shape of the backend /verify-payment endpoint. */
type VerifyPaymentResponse = {
  success: boolean;
  status?: "paid" | "pending";
  message?: string;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: string;
};

function SuccessPaymentContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { data: session, isPending, refetch } = authClient.useSession();
  const token = session?.session?.token;

  const [isVerifying, setIsVerifying] = React.useState(Boolean(sessionId));
  const [verification, setVerification] =
    React.useState<VerifyPaymentResponse | null>(null);
  const [verifyError, setVerifyError] = React.useState<string | null>(null);
  const [verifyAttempt, setVerifyAttempt] = React.useState(0);

  React.useEffect(() => {
    if (!sessionId || isPending) return;

    // Wait until Better Auth finishes loading; the derived UI below handles
    // the "session unavailable" case without setting state here.
    if (!token) return;

    let isMounted = true;

    (async () => {
      try {
        const result = await clientApi.post<VerifyPaymentResponse>(
          "/verify-payment",
          token,
          { sessionId }
        );

        if (!isMounted) return;

        setVerification(result);
        setVerifyError(null);

        // Re-read the user from MongoDB instead of the 7-day cookie cache so
        // the new plan shows up immediately across the dashboard.
        if (result.success) {
          await refetch({ query: { disableCookieCache: true } });
        }
      } catch (err) {
        if (!isMounted) return;

        console.error("Payment verification failed:", err);
        setVerification(null);
        setVerifyError(
          err instanceof Error
            ? err.message
            : "Could not verify your payment. Please try again."
        );
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [sessionId, token, isPending, verifyAttempt, refetch]);

  const isConfirmed = verification?.success === true;
  const authUnavailable = !isPending && !token;
  const showSpinner = isVerifying && !authUnavailable;
  const isPendingConfirmation =
    !showSpinner && !isConfirmed && !verifyError && verification?.status === "pending";
  const missingReference = !sessionId;

  const retryVerification = () => {
    setIsVerifying(true);
    setVerifyError(null);
    setVerifyAttempt((attempt) => attempt + 1);
  };

  const expiryLabel = verification?.subscriptionExpiresAt
    ? new Date(verification.subscriptionExpiresAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const planLabel =
    String(
      verification?.subscriptionPlan ??
        (session?.user as { subscriptionPlan?: string } | undefined)
          ?.subscriptionPlan ??
        ""
    ).toLowerCase() === "premium"
      ? "Premium"
      : "Free";

  const statusLabel = isConfirmed
    ? "Payment Confirmed"
    : showSpinner
      ? "Verifying Payment"
      : "Payment Pending";

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-primary/20 bg-card p-8 shadow-xl shadow-primary/5 text-center sm:p-10">
        {/* Animated Celebration Icon */}
        <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-[#B98695] text-primary-foreground shadow-lg shadow-primary/30">
          <Crown className="size-10" />
        </div>

        <div
          className={`mt-6 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-widest ${
            isConfirmed
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-600 dark:text-amber-400"
          }`}
        >
          {isConfirmed ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <AlertTriangle className="size-4" />
          )}
          <span>{statusLabel}</span>
        </div>

        <h1 className="mt-3 font-serif text-3xl font-semibold tracking-wide text-foreground sm:text-4xl">
          {isConfirmed ? "Welcome to Premium!" : "Payment Received"}
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {isConfirmed
            ? "Your payment has been successfully processed. Your vendor account has been upgraded with unlimited listings and premium benefits."
            : missingReference || authUnavailable
              ? "We could not complete the subscription check automatically. Use the details below to finish it."
              : "Stripe accepted your payment. We are finishing the subscription update on your account."}
        </p>

        {/* Verification Status */}
        {showSpinner ? (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span>Confirming subscription status with Stripe…</span>
          </div>
        ) : isConfirmed ? (
          <div className="mt-6 space-y-2.5 rounded-2xl border border-border/80 bg-muted/20 p-4 text-left text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Sparkles className="size-3.5 text-primary" />
                Active Plan:
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                {planLabel}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border/60 pt-2.5 text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5 text-primary" />
                Valid For:
              </span>
              <span className="font-medium text-foreground">
                {expiryLabel ? `90 Days (Until ${expiryLabel})` : "90 Days"}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-left text-xs">
            <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p className="leading-relaxed">
                {missingReference
                  ? "We could not find the Stripe session reference in this link, so the payment cannot be verified."
                  : authUnavailable
                    ? "We could not read your session. Please sign in again to confirm the upgrade."
                    : isPendingConfirmation
                      ? "Stripe has not confirmed the payment yet. This usually takes a few seconds — retry to update your plan."
                      : (verifyError ??
                        "We could not confirm the subscription update. Please retry.")}
              </p>
            </div>
            {!missingReference && !authUnavailable && (
              <button
                type="button"
                onClick={retryVerification}
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-xs font-semibold uppercase tracking-wider text-foreground transition-all hover:bg-accent"
              >
                <RefreshCw className="size-3.5" />
                Retry verification
              </button>
            )}
          </div>
        )}

        {/* Next Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link prefetch={false}
            href="/dashboard/vendor"
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-[#B98695] px-4 text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-sm transition-all hover:brightness-105"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="size-4" />
          </Link>

          <Link prefetch={false}
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
