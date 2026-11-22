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
import { buttonVariants, Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { clientApi } from "@/lib/api/clientApi";
import { authClient } from "@/lib/auth-client";
import type { IService } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Users,
  Store,
  Boxes,
  Receipt,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  HeartHandshake,
  Clock,
  CheckCircle2,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface RecentUser {
  _id?: string;
  name?: string;
  email?: string;
  accountType?: string;
  role?: string;
  createdAt?: string;
  isBlocked?: boolean;
}

interface AdminStats {
  totalUsers: number;
  totalVendors: number;
  totalCustomers: number;
  totalServices: number;
  pendingServices: number;
  totalTransactions: number;
  recentUsers: RecentUser[];
}

/** Formats a numeric count with commas */
function formatCount(num: number | undefined) {
  if (typeof num !== "number" || Number.isNaN(num)) return "0";
  return new Intl.NumberFormat("en-US").format(num);
}

/** Formats an ISO date into a clean display date */
function formatDate(dateStr?: string) {
  if (!dateStr) return "Recently";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function AdminDashboardPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const token = session?.session?.token;

  const [stats, setStats] = React.useState<AdminStats>({
    totalUsers: 0,
    totalVendors: 0,
    totalCustomers: 0,
    totalServices: 0,
    pendingServices: 0,
    totalTransactions: 0,
    recentUsers: [],
  });
  const [loading, setLoading] = React.useState(true);
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    if (sessionLoading || !token) return;

    let cancelled = false;

    (async () => {
      setLoading(true);

      try {
        // 1. Primary: Try dedicated /admin/stats endpoint
        try {
          const res = await clientApi.get<AdminStats>("/admin/stats", token);
          if (res && typeof res.totalUsers === "number") {
            if (!cancelled) {
              setStats(res);
              setLoading(false);
            }
            return;
          }
        } catch {
          // If /admin/stats endpoint is not available, fall back to aggregating individual routes
        }

        // 2. Fallback: Aggregate from existing admin routes in parallel
        const [usersRes, servicesRes, txRes] = await Promise.allSettled([
          clientApi.get<RecentUser[]>("/users", token),
          clientApi.get<IService[]>("/services", token),
          clientApi.get<unknown[]>("/transactions", token),
        ]);

        if (cancelled) return;

        const usersList: RecentUser[] =
          usersRes.status === "fulfilled" && Array.isArray(usersRes.value)
            ? usersRes.value
            : [];
        const servicesList: IService[] =
          servicesRes.status === "fulfilled" && Array.isArray(servicesRes.value)
            ? servicesRes.value
            : [];
        const txList =
          txRes.status === "fulfilled" && Array.isArray(txRes.value)
            ? txRes.value
            : [];

        const vendorsCount = usersList.filter(
          (u) => u.accountType === "vendor" || u.role === "vendor"
        ).length;
        const customersCount = usersList.filter(
          (u) =>
            u.accountType === "customer" ||
            (!u.accountType && u.role !== "admin" && u.role !== "vendor")
        ).length;
        const pendingCount = servicesList.filter(
          (s) => s.status === "pending"
        ).length;

        setStats({
          totalUsers: usersList.length,
          totalVendors: vendorsCount,
          totalCustomers: customersCount,
          totalServices: servicesList.length,
          pendingServices: pendingCount,
          totalTransactions: txList.length,
          recentUsers: usersList.slice(0, 5),
        });
      } catch (err: unknown) {
        if (cancelled) return;
        const msg =
          err instanceof Error ? err.message : "Failed to load admin stats";
        console.error("Failed to load admin stats:", err);
        toast.add({
          type: "error",
          title: "Could not load stats",
          description: msg,
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionLoading, token, reloadKey]);

  // Dynamic 6 metrics configuration
  const metricCards = [
    {
      title: "Total Registered Users",
      value: formatCount(stats.totalUsers),
      subtitle: "Couples, vendors & admins",
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10",
      border: "hover:border-purple-500/40",
      href: "/dashboard/admin/manage-users",
    },
    {
      title: "Total Vendors",
      value: formatCount(stats.totalVendors),
      subtitle: "Verified businesses & creators",
      icon: Store,
      color: "text-[#99616E]",
      bg: "bg-[#99616E]/10",
      border: "hover:border-[#99616E]/40",
      href: "/dashboard/admin/manage-users",
    },
    {
      title: "Total Customers",
      value: formatCount(stats.totalCustomers),
      subtitle: "Couples planning celebrations",
      icon: HeartHandshake,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      border: "hover:border-blue-500/40",
      href: "/dashboard/admin/manage-users",
    },
    {
      title: "Total Services",
      value: formatCount(stats.totalServices),
      subtitle: "Active catalog listings",
      icon: Boxes,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "hover:border-emerald-500/40",
      href: "/dashboard/admin/manage-services",
    },
    {
      title: "Pending Services",
      value: formatCount(stats.pendingServices),
      subtitle:
        stats.pendingServices > 0
          ? "Action required in queue"
          : "All submissions moderated",
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "hover:border-amber-500/40",
      badge: stats.pendingServices > 0 ? "Review Needed" : undefined,
      href: "/dashboard/admin/manage-services",
    },
    {
      title: "Total Transactions",
      value: formatCount(stats.totalTransactions),
      subtitle: "Stripe subscription payments",
      icon: Receipt,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10",
      border: "hover:border-rose-500/40",
      href: "/dashboard/admin/transactions",
    },
  ];

  const isLoading = sessionLoading || loading;

  return (
    <div className="space-y-6">
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-serif">
              Admin Overview Console
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time platform metrics, user moderation, and business operations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReloadKey((k) => k + 1)}
            disabled={isLoading}
            className="text-xs gap-1.5"
          >
            <RotateCcw className={cn("size-3.5", isLoading && "animate-spin")} />
            Refresh
          </Button>

          <Link
            href="/dashboard/admin/manage-services"
            className={buttonVariants({ variant: "outline", size: "sm" }) + " text-xs"}
          >
            <Boxes className="size-3.5 mr-1.5" />
            Moderate Services
          </Link>
          <Link
            href="/dashboard/admin/transactions"
            className={
              buttonVariants({ size: "sm" }) +
              " bg-[#99616E] hover:bg-[#824E5B] text-white text-xs"
            }
          >
            <TrendingUp className="size-3.5 mr-1.5" />
            Transactions
          </Link>
        </div>
      </div>

      {/* Dynamic 6 Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metricCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="group block outline-none"
            >
              <Card
                className={cn(
                  "h-full border-border/80 bg-card/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
                  stat.border
                )}
              >
                <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider line-clamp-1">
                      {stat.title}
                    </span>
                    <div
                      className={cn(
                        "size-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                        stat.bg,
                        stat.color
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                  </div>

                  <div>
                    {isLoading ? (
                      <Skeleton className="h-7 w-20 my-1" />
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold tracking-tight text-foreground font-serif">
                          {stat.value}
                        </span>
                        {stat.badge && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                            {stat.badge}
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                      {stat.subtitle}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Main Insights Row: Recent Registrations & Moderation Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent User Registrations */}
        <Card className="lg:col-span-2 border-border/80 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold font-serif">
                Recent User Registrations
              </CardTitle>
              <CardDescription>
                Newly signed up couples and onboarding wedding vendors
              </CardDescription>
            </div>
            <Link
              href="/dashboard/admin/manage-users"
              className={buttonVariants({ variant: "ghost", size: "sm" }) + " text-xs text-primary gap-1"}
            >
              <span>View All Users</span>
              <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-3 rounded-lg border border-border/70 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-60" />
                </div>
              ))
            ) : stats.recentUsers && stats.recentUsers.length > 0 ? (
              stats.recentUsers.map((u, i) => {
                const isVendor = u.accountType === "vendor" || u.role === "vendor";
                const roleLabel = isVendor ? "Vendor" : "Customer";

                return (
                  <div
                    key={u._id ?? u.email ?? `user-${i}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-border/70 bg-card/40 transition hover:bg-card"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {u.name || "Unnamed user"}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                            isVendor
                              ? "bg-primary/15 text-primary border-primary/20"
                              : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                          )}
                        >
                          {roleLabel}
                        </span>
                        {u.isBlocked && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/20">
                            Blocked
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground whitespace-nowrap">
                      <span>Joined: {formatDate(u.createdAt)}</span>
                      <span className="text-emerald-600 font-medium">Active</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No user registrations recorded yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Queue & Alerts */}
        <Card className="border-border/80 bg-card/60">
          <CardHeader>
            <CardTitle className="text-base font-semibold font-serif">
              Moderation & Quick Actions
            </CardTitle>
            <CardDescription>Administrative tasks requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {stats.pendingServices > 0 ? (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="size-4 shrink-0 text-amber-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-sm">
                    {stats.pendingServices} {stats.pendingServices === 1 ? "Service" : "Services"} Awaiting Approval
                  </p>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                    Vendor packages submitted to directory awaiting administrative verification.
                  </p>
                  <div className="pt-1.5">
                    <Link
                      href="/dashboard/admin/manage-services"
                      className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300 hover:underline"
                    >
                      <span>Review in Manage Services</span>
                      <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-900 dark:text-emerald-300 flex items-start gap-2.5">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Moderation Queue Clear</p>
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
                    All vendor service listings are audited and up to date.
                  </p>
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-foreground flex items-start gap-2.5">
              <Sparkles className="size-4 shrink-0 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Stripe Subscriptions</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  {stats.totalTransactions} transactions recorded across vendor Premium memberships.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/dashboard/admin/manage-services"
                className={buttonVariants({ variant: "outline", size: "sm" }) + " w-full text-xs justify-between"}
              >
                <span>Manage All Services</span>
                <Boxes className="size-3.5" />
              </Link>
              <Link
                href="/dashboard/admin/manage-users"
                className={buttonVariants({ variant: "outline", size: "sm" }) + " w-full text-xs justify-between"}
              >
                <span>Directory of Users</span>
                <Users className="size-3.5" />
              </Link>
              <Link
                href="/dashboard/admin/transactions"
                className={buttonVariants({ variant: "outline", size: "sm" }) + " w-full text-xs justify-between"}
              >
                <span>Audit Transactions</span>
                <Receipt className="size-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
