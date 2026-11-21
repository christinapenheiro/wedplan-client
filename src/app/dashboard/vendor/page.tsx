"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { clientApi } from "@/lib/api/clientApi";
import type { IService } from "@/lib/types";
import type { IVendorBookingRequest } from "./booking-requests/page";
import {
  Store,
  CalendarCheck,
  PlusCircle,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Crown,
  Calendar,
  User,
  Inbox,
  ShieldCheck,
} from "lucide-react";

/** Formats an event date string into a readable short format (e.g. "Nov 25, 2026"). */
function formatEventDate(value?: string): string {
  if (!value) return "Date not set";
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(dateOnly ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function VendorDashboardPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const token = session?.session?.token;
  const userId = session?.user?.id;
  const userEmail = session?.user?.email;

  const [services, setServices] = React.useState<IService[]>([]);
  const [bookings, setBookings] = React.useState<IVendorBookingRequest[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (sessionLoading || !userId) return;

    let cancelled = false;

    (async () => {
      try {
        const [servicesRes, bookingsRes] = await Promise.allSettled([
          clientApi.get<IService[]>(
            `/services?vendorId=${encodeURIComponent(userId)}`,
            token
          ),
          clientApi.get<IVendorBookingRequest[]>(
            `/bookings/vendor?vendorId=${encodeURIComponent(userId)}${
              userEmail ? `&vendorEmail=${encodeURIComponent(userEmail)}` : ""
            }`,
            token
          ),
        ]);

        if (cancelled) return;

        if (servicesRes.status === "fulfilled" && Array.isArray(servicesRes.value)) {
          setServices(servicesRes.value);
        }

        if (bookingsRes.status === "fulfilled" && Array.isArray(bookingsRes.value)) {
          setBookings(bookingsRes.value);
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionLoading, userId, userEmail, token]);

  // Derived metrics
  const totalServices = services.length;
  const activeServices = services.filter((s) => s.status === "active").length;

  const pendingRequests = bookings.filter((b) => {
    const raw = String(b.bookingStatus ?? b.status ?? "pending").toLowerCase();
    return raw === "pending";
  }).length;

  const acceptedBookings = bookings.filter((b) => {
    const raw = String(b.bookingStatus ?? b.status ?? "").toLowerCase();
    return raw === "accepted";
  }).length;

  // Subscription plan check
  const rawPlan = String(
    (session?.user as { subscriptionPlan?: string } | undefined)?.subscriptionPlan ??
      "free"
  ).toLowerCase();
  const isPremium = rawPlan === "premium";
  const subscriptionPlanTitle = isPremium ? "Premium" : "Free";

  const subscriptionExpiresAt = (
    session?.user as { subscriptionExpiresAt?: string | Date } | undefined
  )?.subscriptionExpiresAt;

  // Stats cards configuration
  const stats = [
    {
      title: "Total Services",
      value: totalServices,
      subtitle: `${activeServices} currently active`,
      icon: Store,
      color: "text-[#99616E]",
      bg: "bg-[#99616E]/10",
      link: "/dashboard/vendor/my-services",
    },
    {
      title: "Active Services",
      value: activeServices,
      subtitle: "Visible to couples",
      icon: Sparkles,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      link: "/dashboard/vendor/my-services",
    },
    {
      title: "Pending Booking Requests",
      value: pendingRequests,
      subtitle: "Awaiting your response",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
      link: "/dashboard/vendor/booking-requests",
    },
    {
      title: "Accepted Bookings",
      value: acceptedBookings,
      subtitle: "Confirmed bookings",
      icon: CalendarCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      link: "/dashboard/vendor/booking-requests",
    },
    {
      title: "Current Subscription Plan",
      value: subscriptionPlanTitle,
      subtitle: isPremium ? "Unlimited listings active" : "Up to 3 listings",
      icon: Crown,
      color: isPremium ? "text-amber-500" : "text-[#99616E]",
      bg: isPremium ? "bg-amber-500/10" : "bg-[#C4B6D0]/20",
      link: "/dashboard/vendor/subscription",
    },
  ];

  // Latest 4 booking requests for quick view
  const recentRequests = bookings.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Vendor Dashboard Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back, {session?.user?.name || "Partner"}! Here is your wedding business snapshot.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/vendor/add-service"
            className={
              buttonVariants({ variant: "default" }) +
              " bg-[#99616E] hover:bg-[#824E5B] text-white shadow-xs gap-2"
            }
          >
            <PlusCircle className="size-4" />
            <span>Add Service</span>
          </Link>
        </div>
      </div>

      {/* Dynamic Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="border-border hover:border-primary/40 transition-colors shadow-xs"
            >
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {stat.title}
                  </span>
                  <div
                    className={`size-8 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color} shrink-0`}
                  >
                    <Icon className="size-4" />
                  </div>
                </div>

                <div className="mt-3">
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <span className="text-2xl font-bold tracking-tight text-foreground">
                      {stat.value}
                    </span>
                  )}
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {stat.subtitle}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid: Recent Inquiries & Subscription Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inquiries List */}
        <Card className="lg:col-span-2 border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">
                Recent Booking Requests
              </CardTitle>
              <CardDescription>
                Couples inquiring about your wedding services
              </CardDescription>
            </div>
            <Link
              href="/dashboard/vendor/booking-requests"
              className={
                buttonVariants({ variant: "ghost", size: "sm" }) +
                " text-xs text-[#99616E] hover:text-[#824E5B] gap-1"
              }
            >
              <span>View All</span>
              <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : recentRequests.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-border/80 rounded-lg bg-muted/10">
                <Inbox className="size-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">
                  No booking requests yet
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  When couples inquire about your listings, their requests will appear here.
                </p>
              </div>
            ) : (
              recentRequests.map((req) => {
                const reqId = req._id || req.id || "";
                const rawStatus = String(
                  req.bookingStatus ?? req.status ?? "pending"
                ).toLowerCase();
                const isAccepted = rawStatus === "accepted";
                const isRejected =
                  rawStatus === "rejected" || rawStatus === "declined";

                const customerName =
                  req.customerName || req.couple || "Engaged Couple";
                const serviceTitle =
                  req.serviceTitle || req.service || "Wedding Service";
                const eventDate = req.eventDate || req.date;

                return (
                  <div
                    key={reqId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-md bg-primary/10 text-primary">
                          <User className="size-3" />
                        </span>
                        <span className="font-semibold text-sm text-foreground">
                          {customerName}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isAccepted
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                              : isRejected
                              ? "bg-destructive/10 text-destructive border border-destructive/20"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {isAccepted
                            ? "Accepted"
                            : isRejected
                            ? "Rejected"
                            : "Pending"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                        <Sparkles className="size-3 text-primary/70" />
                        <span>{serviceTitle}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3 text-muted-foreground" />
                        <span>{formatEventDate(eventDate)}</span>
                      </span>
                      <Link
                        href="/dashboard/vendor/booking-requests"
                        className={buttonVariants({
                          variant: "outline",
                          size: "xs",
                        })}
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Current Subscription Plan Card */}
        <Card className="border-[#C4B6D0] bg-gradient-to-br from-white to-[#FAF7F9] dark:from-[#201A1E] dark:to-[#191417] shadow-xs flex flex-col justify-between">
          <div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#99616E]">
                  <Crown className="size-5" />
                  <CardTitle className="text-base font-semibold">
                    Current Plan
                  </CardTitle>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isPremium
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {isPremium ? "PREMIUM" : "FREE TIER"}
                </span>
              </div>
              <CardDescription>
                Your vendor visibility & platform benefits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3.5 rounded-lg bg-[#99616E]/10 border border-[#99616E]/20">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#99616E]">
                    {isPremium ? "Premium Membership" : "Free Plan"}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="size-3" />
                    Active
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {isPremium
                    ? "Unlimited service listings, verified badge, and priority directory placement."
                    : "Up to 3 active service listings and standard directory exposure."}
                </p>
                {isPremium && subscriptionExpiresAt && (
                  <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400 mt-2">
                    Valid through: {formatEventDate(String(subscriptionExpiresAt))}
                  </p>
                )}
              </div>

              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {isPremium ? "Unlimited service listings" : "Max 3 listings"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  <span>Direct client booking requests</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {isPremium ? "Verified vendor badge" : "Standard directory badge"}
                  </span>
                </li>
              </ul>
            </CardContent>
          </div>

          <CardContent className="pt-0">
            <Link
              href="/dashboard/vendor/subscription"
              className={
                buttonVariants({
                  variant: isPremium ? "outline" : "default",
                }) +
                (isPremium
                  ? " w-full border-[#C4B6D0] text-[#99616E] hover:bg-[#99616E] hover:text-white transition-colors"
                  : " w-full bg-[#99616E] hover:bg-[#824E5B] text-white transition-colors")
              }
            >
              {isPremium ? "Manage Subscription" : "Upgrade to Premium"}
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
