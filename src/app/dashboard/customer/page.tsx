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
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { clientApi } from "@/lib/api/clientApi";
import type { IBookingPayload } from "@/lib/types";
import {
  AlertCircle,
  CalendarHeart,
  Heart,
  CheckCircle2,
  ArrowRight,
  Clock,
  Compass,
  Inbox,
  MapPin,
  RefreshCw,
  XCircle,
} from "lucide-react";

/** Booking document as stored by the API — `_id` plus the submitted payload. */
interface IBookingRecord extends IBookingPayload {
  _id?: string;
  /** Mongo-side duplicate of `bookingStatus` written by the API. */
  status?: string;
}

type BookingStatus = "Pending" | "Accepted" | "Declined";

/** Reads the status case-insensitively and treats anything unknown as pending. */
function getBookingStatus(booking: IBookingRecord): BookingStatus {
  const raw = String(
    booking.bookingStatus ?? booking.status ?? "Pending"
  ).toLowerCase();

  if (raw === "accepted") return "Accepted";
  if (raw === "declined") return "Declined";
  return "Pending";
}

/** Accepts either the array returned for a customer lookup or a single record. */
function toBookingList(
  payload: IBookingRecord | IBookingRecord[] | null | undefined
) {
  if (!payload) return [];

  return Array.isArray(payload) ? payload : [payload];
}

/** Normalises a date-only string (YYYY-MM-DD) as local time so the day never shifts. */
function parseDate(value?: string) {
  if (!value) return null;

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(dateOnly ? `${value}T00:00:00` : value);

  return Number.isNaN(date.getTime()) ? null : date;
}

/** Formats the event date, e.g. "Saturday, October 14, 2026". */
function formatEventDate(value?: string) {
  const date = parseDate(value);
  if (!date) return "Date not provided";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/** Badge styling for the two statuses shown in the active bookings list. */
function statusBadgeClass(status: BookingStatus) {
  if (status === "Accepted") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
  }

  return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
}

export default function CustomerDashboardPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [bookings, setBookings] = React.useState<IBookingRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);

  const userId = session?.user?.id;

  React.useEffect(() => {
    if (sessionLoading || !userId) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const response = await clientApi.get<
          IBookingRecord | IBookingRecord[] | null
        >(`/bookings?customerId=${encodeURIComponent(userId)}`);

        if (cancelled) return;

        setBookings(toBookingList(response));
      } catch (err: unknown) {
        if (cancelled) return;

        setLoadError(
          err instanceof Error
            ? err.message
            : "Failed to load your booking requests."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, sessionLoading, reloadKey]);

  const isStatsLoading = sessionLoading || (Boolean(userId) && loading);

  const statusCounts = bookings.reduce(
    (counts, booking) => {
      counts[getBookingStatus(booking)] += 1;
      return counts;
    },
    { Pending: 0, Accepted: 0, Declined: 0 } as Record<BookingStatus, number>
  );

  const metrics = [
    {
      title: "Total Booking Requests",
      value: bookings.length,
      subtitle: "All requests you have submitted",
      icon: CalendarHeart,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Pending Bookings",
      value: statusCounts.Pending,
      subtitle: "Awaiting a vendor response",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
    {
      title: "Accepted Bookings",
      value: statusCounts.Accepted,
      subtitle: "Confirmed by vendors",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Rejected Bookings",
      value: statusCounts.Declined,
      subtitle: "Declined by vendors",
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
  ];

  // Only pending and accepted requests count as active vendor engagements.
  const activeBookings = bookings.filter((booking) => {
    const status = getBookingStatus(booking);
    return status === "Pending" || status === "Accepted";
  });

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
            Your wedding planning control room
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/browse-services"
            className={buttonVariants({ variant: "default" }) + " bg-primary text-primary-foreground hover:bg-primary/90 gap-2"}
          >
            <Compass className="size-4" />
            <span>Explore Vendors</span>
          </Link>
        </div>
      </div>

      {loadError && (
        <div className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            {loadError}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            <RefreshCw className="size-3.5" />
            Try again
          </Button>
        </div>
      )}

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
                  {isStatsLoading ? (
                    <Skeleton className="h-7 w-10" />
                  ) : (
                    <span className="text-2xl font-bold tracking-tight text-foreground">
                      {m.value}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {m.subtitle}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active bookings */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">
              My Booked Vendors & Services
            </CardTitle>
            <CardDescription>
              Pending and accepted requests with their current status
            </CardDescription>
          </div>
          <Link
            href="/dashboard/customer/my-bookings"
            className={buttonVariants({ variant: "ghost", size: "sm" }) + " text-xs text-primary gap-1"}
          >
            <span>View All</span>
            <ArrowRight className="size-3" />
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {isStatsLoading ? (
            [0, 1].map((i) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-lg border border-border/80 bg-muted/20 p-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-3 w-32" />
              </div>
            ))
          ) : loadError ? (
            <p className="rounded-lg border border-border/80 bg-muted/20 p-4 text-center text-sm text-muted-foreground">
              Your bookings could not be loaded right now. Use “Try again”
              above to retry.
            </p>
          ) : activeBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Inbox className="size-6" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">
                No active booking requests
              </h3>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                When you request a vendor, pending and accepted bookings will
                show up here with their status.
              </p>
              <Link
                href="/browse-services"
                className={buttonVariants({ variant: "outline", size: "sm" }) + " mt-4 gap-1.5"}
              >
                <Compass className="size-3.5" />
                Browse services
              </Link>
            </div>
          ) : (
            activeBookings.map((booking) => {
              const status = getBookingStatus(booking);
              const vendor = booking.vendorName || "Vendor";
              const serviceTitle =
                booking.serviceTitle || "Wedding service";

              return (
                <div
                  key={
                    booking._id ??
                    `${booking.serviceId}-${booking.createdAt ?? "unknown"}`
                  }
                  className="flex flex-col gap-3 rounded-lg border border-border/80 bg-muted/20 p-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        {vendor}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusBadgeClass(status)}`}
                      >
                        {status === "Accepted" ? (
                          <CheckCircle2 className="size-3" />
                        ) : (
                          <Clock className="size-3" />
                        )}
                        {status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {serviceTitle}
                    </p>
                    {booking.eventLocation && (
                      <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <MapPin className="size-3 text-primary" />
                        {booking.eventLocation}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-left sm:text-right">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Event date
                    </span>
                    <p className="text-sm font-medium text-foreground">
                      {formatEventDate(booking.eventDate)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
