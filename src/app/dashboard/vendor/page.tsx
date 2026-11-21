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
import { Button, buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import {
  Store,
  CalendarCheck,
  DollarSign,
  PlusCircle,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function VendorDashboardPage() {
  const { data: session } = authClient.useSession();

  const stats = [
    {
      title: "Total Services",
      value: "6",
      subtitle: "Active listings",
      icon: Store,
      color: "text-[#99616E]",
      bg: "bg-[#99616E]/10",
    },
    {
      title: "Pending Requests",
      value: "8",
      subtitle: "Awaiting your response",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
    {
      title: "Confirmed Bookings",
      value: "24",
      subtitle: "For upcoming season",
      icon: CalendarCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Estimated Revenue",
      value: "$18,450",
      subtitle: "Total this season",
      icon: DollarSign,
      color: "text-[#99616E]",
      bg: "bg-[#C4B6D0]/20",
    },
  ];

  const recentRequests = [
    {
      id: "REQ-101",
      couple: "Eleanor & Liam",
      service: "Floral Arch & Tablescapes",
      date: "Oct 14, 2026",
      guests: "140 Guests",
      status: "pending",
    },
    {
      id: "REQ-102",
      couple: "Sophia & Lucas",
      service: "Full Day Photography & Drone",
      date: "Nov 02, 2026",
      guests: "90 Guests",
      status: "pending",
    },
    {
      id: "REQ-103",
      couple: "Mia & Noah",
      service: "Custom 3-Tier Berry Cake",
      date: "Dec 18, 2026",
      guests: "180 Guests",
      status: "confirmed",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Vendor Dashboard Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back, {session?.user?.name || "Partner"}! Here is your current wedding business snapshot.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/vendor/add-service"
            className={buttonVariants({ variant: "default" }) + " bg-[#99616E] hover:bg-[#824E5B] text-white shadow-xs gap-2"}
          >
            <PlusCircle className="size-4" />
            <span>Add Service</span>
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
                <div className="mt-2 flex items-baseline gap-2">
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

      {/* Main Content Grid: Recent Requests & Subscription Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inquiries List */}
        <Card className="lg:col-span-2 border-border">
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
              className={buttonVariants({ variant: "ghost", size: "sm" }) + " text-xs text-[#99616E] gap-1"}
            >
              <span>View All</span>
              <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentRequests.map((req) => (
              <div
                key={req.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {req.couple}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        req.status === "confirmed"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {req.service} • {req.guests}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Event: <strong className="text-foreground">{req.date}</strong></span>
                  <Link
                    href="/dashboard/vendor/booking-requests"
                    className={buttonVariants({ variant: "outline", size: "xs" })}
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Subscription Plan Status Card */}
        <Card className="border-[#C4B6D0] bg-gradient-to-br from-white to-[#FAF7F9] dark:from-[#201A1E] dark:to-[#191417]">
          <CardHeader>
            <div className="flex items-center gap-2 text-[#99616E]">
              <Sparkles className="size-5" />
              <CardTitle className="text-base font-semibold">
                Vendor Membership
              </CardTitle>
            </div>
            <CardDescription>
              Your current directory visibility & benefits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-[#99616E]/10 border border-[#99616E]/20">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#99616E]">
                  Professional Tier
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Active
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Up to 10 active listings, priority search rank, direct client inquiries.
              </p>
            </div>

            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span>Unlimited direct booking quotes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span>Analytics and review management</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span>Featured badge on directory</span>
              </li>
            </ul>

            <Link
              href="/dashboard/vendor/subscription"
              className={buttonVariants({ variant: "outline" }) + " w-full border-[#C4B6D0] text-[#99616E] hover:bg-[#99616E] hover:text-white transition-colors"}
            >
              Manage Subscription
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
