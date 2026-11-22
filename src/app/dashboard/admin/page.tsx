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
import {
  Users,
  Store,
  Boxes,
  Receipt,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    {
      title: "Total Registered Users",
      value: "1,480",
      subtitle: "+12% this month",
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      title: "Active Vendors",
      value: "164",
      subtitle: "Across 14 categories",
      icon: Store,
      color: "text-[#99616E]",
      bg: "bg-[#99616E]/10",
    },
    {
      title: "Published Services",
      value: "432",
      subtitle: "8 pending moderation",
      icon: Boxes,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Gross Transaction Volume",
      value: "$214,800",
      subtitle: "$21,480 platform revenue",
      icon: Receipt,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
  ];

  const recentUsers = [
    {
      name: "Eleanor Vance",
      email: "eleanor@example.com",
      role: "Customer",
      joined: "Today, 10:20 AM",
      status: "active",
    },
    {
      name: "Meadow View Estate",
      email: "events@meadowview.com",
      role: "Vendor",
      joined: "Yesterday",
      status: "verified",
    },
    {
      name: "Lumiere Studios",
      email: "hello@lumiere.com",
      role: "Vendor",
      joined: "Nov 15, 2026",
      status: "verified",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-purple-600" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Admin Overview Console
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time platform metrics, user moderation, and business operations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link prefetch={false}
            href="/dashboard/admin/manage-services"
            className={buttonVariants({ variant: "outline", size: "sm" }) + " text-xs"}
          >
            <Boxes className="size-3.5 mr-1.5" />
            Moderate Services
          </Link>
          <Link prefetch={false}
            href="/dashboard/admin/transactions"
            className={buttonVariants({ size: "sm" }) + " bg-[#99616E] hover:bg-[#824E5B] text-white text-xs"}
          >
            <TrendingUp className="size-3.5 mr-1.5" />
            View Transactions
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {stat.title}
                  </span>
                  <div className={`size-8 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
                    <Icon className="size-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold tracking-tight text-foreground">
                    {stat.value}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.subtitle}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tables Row: Recent Users & Moderation Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">
                Recent User Registrations
              </CardTitle>
              <CardDescription>
                Newly signed up couples and onboarding wedding vendors
              </CardDescription>
            </div>
            <Link prefetch={false}
              href="/dashboard/admin/manage-users"
              className={buttonVariants({ variant: "ghost", size: "sm" }) + " text-xs text-[#99616E] gap-1"}
            >
              <span>Manage Users</span>
              <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentUsers.map((u) => (
              <div
                key={u.email}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border/70 bg-muted/20"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">{u.name}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        u.role === "Vendor"
                          ? "bg-[#99616E]/15 text-[#99616E]"
                          : "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{u.email}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Joined: {u.joined}</span>
                  <span className="text-emerald-600 font-medium">{u.status}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Queue & Alerts */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Moderation Queue</CardTitle>
            <CardDescription>Items pending administrative review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="size-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold">3 New Vendor Verification Requests</p>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-400 mt-0.5">
                  Business licenses submitted for review.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-900 dark:text-purple-300 flex items-start gap-2.5">
              <Boxes className="size-4 shrink-0 text-purple-600 mt-0.5" />
              <div>
                <p className="font-semibold">5 Services Awaiting Approval</p>
                <p className="text-[11px] text-purple-800/80 dark:text-purple-400 mt-0.5">
                  New package listings created by verified vendors.
                </p>
              </div>
            </div>

            <Link prefetch={false}
              href="/dashboard/admin/manage-services"
              className={buttonVariants({ variant: "outline", size: "sm" }) + " w-full text-xs mt-2"}
            >
              Open Queue
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
