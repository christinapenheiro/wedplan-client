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
  CalendarHeart,
  Heart,
  DollarSign,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  Compass,
} from "lucide-react";

export default function CustomerDashboardPage() {
  const { data: session } = authClient.useSession();

  const metrics = [
    {
      title: "Wedding Countdown",
      value: "148 Days",
      subtitle: "Saturday, Oct 14, 2026",
      icon: Clock,
      color: "text-[#99616E]",
      bg: "bg-[#99616E]/10",
    },
    {
      title: "Confirmed Vendors",
      value: "4 of 7",
      subtitle: "Venue, Floral, Photo, Cake",
      icon: CalendarHeart,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Budget Allocated",
      value: "$19,500",
      subtitle: "Of $25,000 total budget",
      icon: DollarSign,
      color: "text-[#99616E]",
      bg: "bg-[#C4B6D0]/20",
    },
    {
      title: "Guest RSVPs",
      value: "92 / 120",
      subtitle: "76% response rate",
      icon: Users,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
  ];

  const upcomingBookings = [
    {
      vendor: "Meadow View Estate",
      category: "Ceremony & Reception Venue",
      date: "Oct 14, 2026",
      status: "Confirmed",
      amount: "$6,500",
    },
    {
      vendor: "Lumiere Film Studios",
      category: "Cinematic Photography",
      date: "Oct 14, 2026",
      status: "Deposit Paid",
      amount: "$2,800",
    },
    {
      vendor: "Blush & Petal Co.",
      category: "Florals & Centerpieces",
      date: "Oct 14, 2026",
      status: "Pending Final Review",
      amount: "$1,650",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="size-5 text-[#99616E] fill-[#99616E]/20" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome, {session?.user?.name || "Dreamer"}!
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your personal wedding countdown and planning control room
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/browse"
            className={buttonVariants({ variant: "default" }) + " bg-[#99616E] hover:bg-[#824E5B] text-white gap-2"}
          >
            <Compass className="size-4" />
            <span>Explore Vendors</span>
          </Link>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.title} className="border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {m.title}
                  </span>
                  <div className={`size-8 rounded-lg ${m.bg} flex items-center justify-center ${m.color}`}>
                    <Icon className="size-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold tracking-tight text-foreground">
                    {m.value}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {m.subtitle}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bookings & Checklist Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">
                My Booked Vendors & Services
              </CardTitle>
              <CardDescription>
                Overview of your confirmed wedding vendors and deposits
              </CardDescription>
            </div>
            <Link
              href="/dashboard/customer/my-bookings"
              className={buttonVariants({ variant: "ghost", size: "sm" }) + " text-xs text-[#99616E] gap-1"}
            >
              <span>View All</span>
              <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingBookings.map((b) => (
              <div
                key={b.vendor}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-border/80 bg-muted/20"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {b.vendor}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      {b.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {b.category}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-foreground">
                    {b.amount}
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Event: {b.date}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Milestone Checklist */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2 text-[#99616E]">
              <Sparkles className="size-4" />
              <CardTitle className="text-base font-semibold">
                Countdown Milestones
              </CardTitle>
            </div>
            <CardDescription>Next actions for this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5 p-2 rounded-md bg-muted/30">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="line-through text-muted-foreground">
                Book ceremony & reception venue
              </span>
            </div>
            <div className="flex items-start gap-2.5 p-2 rounded-md bg-muted/30">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="line-through text-muted-foreground">
                Hire photographer and videographer
              </span>
            </div>
            <div className="flex items-start gap-2.5 p-2 rounded-md bg-[#99616E]/10 border border-[#99616E]/20 text-[#2A1F25] dark:text-[#F5EFF3]">
              <Clock className="size-4 text-[#99616E] shrink-0 mt-0.5" />
              <span className="font-semibold">
                Finalize floral centerpieces & bridal bouquet
              </span>
            </div>
            <div className="flex items-start gap-2.5 p-2 rounded-md text-muted-foreground">
              <div className="size-4 rounded-full border border-border shrink-0 mt-0.5" />
              <span>Send out formal invitations to remaining guests</span>
            </div>

            <Link
              href="/dashboard/customer/profile-settings"
              className={buttonVariants({ variant: "outline", size: "sm" }) + " w-full mt-2 text-xs border-[#C4B6D0] text-[#99616E]"}
            >
              Edit Wedding Preferences
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
