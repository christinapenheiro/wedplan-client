"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/ui/toast";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Crown,
  Loader2,
  Sparkles,
} from "lucide-react";
import { clientApi } from "@/lib/api/clientApi";

const FREE_FEATURES = [
  "Add up to 3 services",
  "Standard vendor listing",
  "Respond to booking requests",
  "Basic profile customization",
];

const PREMIUM_FEATURES = [
  "Unlimited service listings",
  "Unlimited active services",
  "Premium Vendor Badge",
  "All Free Plan features",
];

export default function VendorSubscriptionPage() {
  const { data: session } = authClient.useSession();
  const token = session?.session?.token;
  const [isUpgrading, setIsUpgrading] = React.useState(false);

  // The account is created on the Free plan, so anything other than "premium"
  // (including a still-loading session) falls back to Free.
  const plan = String(
    (session?.user as { subscriptionPlan?: string } | undefined)
      ?.subscriptionPlan ?? "Free"
  ).toLowerCase();
  const isPremium = plan === "premium";

  const handleUpgradePremium = async () => {
    if (!session?.user) {
      toast.add({
        title: "Authentication Required",
        description: "Please sign in to upgrade your subscription.",
        type: "warning",
      });
      return;
    }

    setIsUpgrading(true);

    try {
      const res = await clientApi.post<{ success: boolean; url?: string }>(
        "/create-checkout-session",
        token as string,
        {
          id: session.user.id,
          email: session.user.email,
        }
      );

      // Handle success redirect to Stripe Checkout URL
      if (res?.url) {
        window.location.href = res.url;
      } else {
        throw new Error("Checkout URL was not returned by the server.");
      }
    } catch (error) {
      console.error("Failed to create checkout session:", error);
      toast.add({
        title: "Checkout Failed",
        description:
          error instanceof Error
            ? error.message
            : "Could not initiate payment. Please try again.",
        type: "error",
      });
      setIsUpgrading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Subscription & Membership
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="size-3" />
              Plans
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose the plan that matches how many services you offer your
            couples.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          You are currently on the{" "}
          <span className="font-semibold text-foreground">
            {isPremium ? "Premium" : "Free"}
          </span>{" "}
          plan.
        </p>
      </div>

      <div className="grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 md:items-stretch">
        {/* Free plan */}
        <Card
          className={`relative flex h-full flex-col overflow-hidden rounded-2xl bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
            isPremium
              ? "border-border"
              : "border-primary/40 shadow-md shadow-primary/5 ring-1 ring-primary/10"
          }`}
        >
          <div
            className={`absolute inset-x-0 top-0 h-1 ${
              isPremium
                ? "bg-border"
                : "bg-gradient-to-r from-primary/30 via-primary to-primary/30"
            }`}
          />

          <CardHeader className="pt-7">
            <div className="flex items-start justify-between gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-secondary/50 bg-secondary/20 text-primary">
                <Sparkles className="size-5" />
              </div>
              {!isPremium && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                  <Check className="size-3" />
                  Current plan
                </span>
              )}
            </div>

            <CardTitle className="mt-5 text-xl font-bold">Free</CardTitle>
            <CardDescription>
              Everything you need to start booking your first couples.
            </CardDescription>

            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold tracking-tight text-foreground">
                $0
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                / forever
              </span>
            </div>
          </CardHeader>

          <CardContent className="flex-1 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              What&apos;s included
            </p>
            <ul className="space-y-3 text-sm">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-3" />
                  </span>
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>

          <CardFooter className="border-t border-border pt-5">
            <Button
              variant="outline"
              className="w-full gap-2 border-border hover:border-primary/40 hover:text-primary"
              disabled={!isPremium}
            >
              {!isPremium ? (
                <>
                  <Check className="size-4" />
                  Your current plan
                </>
              ) : (
                "Switch to Free"
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Premium plan */}
        <div className="relative isolate rounded-3xl bg-gradient-to-br from-primary via-secondary to-primary p-[1.5px] shadow-xl shadow-primary/15">
          <div className="pointer-events-none absolute -inset-3 -z-10 rounded-[2rem] bg-primary/20 blur-2xl" />

          <Card className="relative flex h-full flex-col overflow-hidden rounded-[calc(1.5rem-1.5px)] border-0 bg-card">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-primary" />
            <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-secondary/20 blur-3xl" />

            <CardHeader className="relative pt-7">
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#B98695] text-primary-foreground shadow-lg shadow-primary/25">
                  <Crown className="size-5" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-[#B98695] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm">
                  <Crown className="size-3" />
                  Most popular
                </span>
              </div>

              <CardTitle className="mt-5 flex items-center gap-2 text-xl font-bold">
                Premium
              </CardTitle>
              <CardDescription>
                Unlimited reach for vendors ready to grow their business.
              </CardDescription>

              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold tracking-tight text-foreground">
                  $99
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  / month
                </span>
              </div>
            </CardHeader>

            <CardContent className="relative flex-1 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Everything in Premium
              </p>
              <ul className="space-y-3 text-sm">
                {PREMIUM_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <Check className="size-3" />
                    </span>
                    <span className="font-medium text-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="relative flex-col items-stretch gap-2 border-t border-border pt-5">
              <Button
                className="group w-full gap-2 bg-gradient-to-r from-primary to-[#B98695] text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-105"
                disabled={isPremium || isUpgrading}
                onClick={handleUpgradePremium}
              >
                {isPremium ? (
                  <>
                    <BadgeCheck className="size-4" />
                    Your current plan
                  </>
                ) : isUpgrading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Redirecting to checkout…
                  </>
                ) : (
                  <>
                    <Crown className="size-4" />
                    Upgrade to Premium
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
              <p className="text-center text-[10px] text-muted-foreground">
                Cancel anytime · No hidden fees
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
