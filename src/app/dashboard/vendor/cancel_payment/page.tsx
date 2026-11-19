import Link from "next/link";
import {
  XCircle,
  RefreshCw,
  LayoutDashboard,
  ShieldCheck,
  CreditCard,
  Crown,
} from "lucide-react";

export default function CancelPaymentPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-xl shadow-muted/5 text-center sm:p-10">
        {/* Soft Cancel/Alert Icon */}
        <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm">
          <XCircle className="size-10" />
        </div>

        {/* Status Pill */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
          <CreditCard className="size-3.5" />
          <span>Checkout Cancelled</span>
        </div>

        {/* Heading */}
        <h1 className="mt-3 font-serif text-3xl font-semibold tracking-wide text-foreground sm:text-4xl">
          Payment Not Completed
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Your Stripe checkout session was cancelled. No charges were made to your
          card, and your vendor account remains on the Free plan.
        </p>

        {/* Reassurance Info Box */}
        <div className="mt-6 space-y-2.5 rounded-2xl border border-border/80 bg-muted/20 p-4 text-left text-xs">
          <div className="flex items-start gap-2.5 text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <span className="font-medium text-foreground">Zero Charges:</span>{" "}
              Your payment method was not billed.
            </div>
          </div>
          <div className="flex items-start gap-2.5 text-muted-foreground border-t border-border/60 pt-2.5">
            <Crown className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <span className="font-medium text-foreground">Premium Plan:</span>{" "}
              Upgrade anytime to unlock unlimited listings and verified badges.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard/vendor/subscription"
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-[#B98695] px-4 text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-sm transition-all hover:brightness-105"
          >
            <RefreshCw className="size-3.5" />
            <span>Try Again</span>
          </Link>

          <Link
            href="/dashboard/vendor"
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-xs font-semibold uppercase tracking-wider text-foreground transition-all hover:bg-accent hover:text-accent-foreground"
          >
            <LayoutDashboard className="size-3.5" />
            <span>Vendor Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
