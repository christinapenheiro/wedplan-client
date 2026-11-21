"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { clientApi } from "@/lib/api/clientApi";
import { authClient } from "@/lib/auth-client";
import type { IBookingPayload, IService } from "@/lib/types";
import {
  AlertCircle,
  CalendarDays,
  CalendarHeart,
  CheckCircle2,
  Clock,
  Compass,
  Inbox,
  Loader2,
  Mail,
  MapPin,
  RefreshCw,
  Store,
  Trash2,
  XCircle,
} from "lucide-react";

/** Booking document as stored by the API — `_id` plus the submitted payload. */
interface IBookingRecord extends IBookingPayload {
  _id?: string;
  /** Mongo-side duplicate of `bookingStatus` written by the API. */
  status?: string;
  /** Image URL, when the API starts persisting one with the booking. */
  serviceImage?: string;
}

type BookingStatus = "pending" | "accepted" | "declined";

/** Cover image and title resolved from the booked service, used as a fallback. */
interface IServiceInfo {
  image?: string;
  title?: string;
}

/** Normalises a date-only string (YYYY-MM-DD) as local time so the day never shifts. */
function parseDate(value?: string) {
  if (!value) return null;

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(dateOnly ? `${value}T00:00:00` : value);

  return Number.isNaN(date.getTime()) ? null : date;
}

/** Formats the wedding/event date, e.g. "Saturday, October 14, 2026". */
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

/** Formats the date the request was submitted, e.g. "Nov 19, 2026". */
function formatRequestDate(value?: string) {
  const date = parseDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/** Reads the status case-insensitively and treats anything unknown as pending. */
function getBookingStatus(booking: IBookingRecord): BookingStatus {
  const raw = String(
    booking.bookingStatus ?? booking.status ?? "pending"
  ).toLowerCase();

  if (raw === "accepted") return "accepted";
  if (raw === "declined") return "declined";
  return "pending";
}

/** Badge styling and icon for each booking state. */
function statusMeta(status: BookingStatus) {
  if (status === "accepted") {
    return {
      icon: CheckCircle2,
      className:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    };
  }

  if (status === "declined") {
    return {
      icon: XCircle,
      className: "bg-destructive/10 text-destructive border-destructive/20",
    };
  }

  return {
    icon: Clock,
    className:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  };
}

/** Accepts either the array returned for a customer lookup or a single record. */
function toBookingList(
  payload: IBookingRecord | IBookingRecord[] | null | undefined
) {
  if (!payload) return [];

  const list = Array.isArray(payload) ? payload : [payload];

  return list
    .filter((booking) => booking && typeof booking === "object")
    .sort((a, b) => {
      const aTime = parseDate(a.createdAt)?.getTime() ?? 0;
      const bTime = parseDate(b.createdAt)?.getTime() ?? 0;
      return bTime - aTime;
    });
}

/** Cover photo for a booked service with a graceful fallback when it is missing. */
function ServiceThumbnail({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = React.useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#F2EEF3] via-[#FAF8FA] to-[#E7DFEA] dark:from-[#2E252C] dark:via-[#221B20] dark:to-[#3B3040]">
        <CalendarHeart className="size-8 text-primary/40" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, 192px"
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}

/** Placeholder shown while the customer's booking requests are being fetched. */
function BookingsSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <Card key={i} className="border-border">
          <div className="flex flex-col sm:flex-row">
            <Skeleton className="h-40 w-full rounded-none sm:h-auto sm:w-48" />
            <div className="flex-1 space-y-3 p-4">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function CustomerMyBookingsPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [bookings, setBookings] = React.useState<IBookingRecord[]>([]);
  const [serviceInfo, setServiceInfo] = React.useState<
    Record<string, IServiceInfo>
  >({});
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);
  const [bookingToDelete, setBookingToDelete] =
    React.useState<IBookingRecord | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const userId = session?.user?.id;
    const token = session?.session?.token;

  React.useEffect(() => {
    if (sessionLoading || !userId) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError(null);
      setServiceInfo({});

      try {
        const response = await clientApi.get<
          IBookingRecord | IBookingRecord[] | null
        >(`/bookings?customerId=${encodeURIComponent(userId)}`,session?.session?.token);

        if (cancelled) return;

        const list = toBookingList(response);
        setBookings(list);
        setLoading(false);

        // Bookings only store the service id, so pull each listing's cover photo.
        const serviceIds = Array.from(
          new Set(list.map((booking) => booking.serviceId).filter(Boolean))
        );
        if (serviceIds.length === 0) return;

        const results = await Promise.allSettled(
          serviceIds.map((id) => clientApi.get<IService>(`/services/${id}`,session?.session?.token))
        );

        if (cancelled) return;

        const info: Record<string, IServiceInfo> = {};
        results.forEach((result, index) => {
          if (result.status !== "fulfilled") return;

          info[serviceIds[index]] = {
            image: result.value.imageUrls?.[0],
            title: result.value.title,
          };
        });

        setServiceInfo(info);
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

  /** Deletes a pending booking after confirmation, then drops it from the list. */
  const handleDeleteBooking = async () => {
    const booking = bookingToDelete;
    if (!booking?._id || deleting) return;

    setDeleting(true);

    try {
      await clientApi.delete<{ success: boolean; deletedId: string }>(
        `/bookings/${booking._id}`
      ,token as string);

      setBookings((prev) =>
        prev.filter((item) => item._id !== booking._id)
      );
      setBookingToDelete(null);

      toast.add({
        type: "success",
        title: "Booking request deleted",
        description: `Your request for “${
          booking.serviceTitle || "this service"
        }” was removed.`,
      });
    } catch (err: unknown) {
      toast.add({
        type: "error",
        title: "Could not delete booking",
        description:
          err instanceof Error ? err.message : "Please try again in a moment.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const isInitialLoading = sessionLoading || (Boolean(userId) && loading);

  const statusCounts = bookings.reduce(
    (counts, booking) => {
      counts[getBookingStatus(booking)] += 1;
      return counts;
    },
    { pending: 0, accepted: 0, declined: 0 } as Record<BookingStatus, number>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-2 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              My Bookings
            </h1>
            {!isInitialLoading && !loadError && bookings.length > 0 && (
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                {bookings.length} {bookings.length === 1 ? "request" : "requests"}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Track all the booking requests you have submitted to wedding vendors
          </p>
        </div>
        <Link
          href="/browse-services"
          className={
            buttonVariants({ variant: "default" }) +
            " gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          }
        >
          <Compass className="size-4" />
          <span>Discover More Vendors</span>
        </Link>
      </div>

      {!isInitialLoading && !loadError && bookings.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span className="font-semibold uppercase tracking-wider">
            Status
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-400">
            <Clock className="size-3" />
            {statusCounts.pending} pending
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="size-3" />
            {statusCounts.accepted} accepted
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-destructive/20 bg-destructive/10 px-2 py-0.5 font-medium text-destructive">
            <XCircle className="size-3" />
            {statusCounts.declined} declined
          </span>
        </div>
      )}

      {isInitialLoading ? (
        <BookingsSkeleton />
      ) : loadError ? (
        <Card className="border-border p-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-foreground">
            Could not load your bookings
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            {loadError}
          </p>
          <Button
            variant="outline"
            className="mt-4 gap-2"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            <RefreshCw className="size-3.5" />
            Try again
          </Button>
        </Card>
      ) : bookings.length === 0 ? (
        <Card className="border-border p-10 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Inbox className="size-7" />
          </div>
          <h2 className="mt-4 font-serif text-xl text-foreground">
            No booking requests yet
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
            When you request a date with a vendor, your booking will appear here
            so you can follow its status.
          </p>
          <Link
            href="/browse-services"
            className={
              buttonVariants({ variant: "default" }) +
              " mt-5 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            }
          >
            <Compass className="size-4" />
            Browse services
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const status = getBookingStatus(booking);
            const meta = statusMeta(status);
            const StatusIcon = meta.icon;
            const info = serviceInfo[booking.serviceId];
            const serviceTitle =
              booking.serviceTitle || info?.title || "Untitled service";
            const image = booking.serviceImage || info?.image;

            return (
              <Card
                key={
                  booking._id ??
                  `${booking.serviceId}-${booking.createdAt ?? "unknown"}`
                }
                className="overflow-hidden border-border transition-colors hover:border-primary/30"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="relative h-40 w-full shrink-0 overflow-hidden bg-muted sm:h-auto sm:w-48">
                    <ServiceThumbnail src={image} alt={serviceTitle} />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-bold leading-snug text-foreground">
                            {serviceTitle}
                          </h2>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.className}`}
                          >
                            <StatusIcon className="size-3" />
                            {status}
                          </span>
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Store className="size-3.5 text-primary" />
                            {booking.vendorName || "Vendor"}
                          </span>
                          {booking.vendorEmail && (
                            <a
                              href={`mailto:${booking.vendorEmail}`}
                              className="flex items-center gap-1.5 transition-colors hover:text-primary"
                            >
                              <Mail className="size-3.5 text-primary" />
                              {booking.vendorEmail}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground sm:grid-cols-2">
                      <span className="flex items-start gap-1.5">
                        <CalendarDays className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        <span>
                          <span className="block text-[10px] font-semibold uppercase tracking-wider">
                            Event date
                          </span>
                          {formatEventDate(booking.eventDate)}
                        </span>
                      </span>
                      <span className="flex items-start gap-1.5">
                        <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        <span>
                          <span className="block text-[10px] font-semibold uppercase tracking-wider">
                            Event location
                          </span>
                          {booking.eventLocation || "Not provided"}
                        </span>
                      </span>
                    </div>

                    <div className="mt-auto flex flex-col gap-3 border-t border-border px-4 py-3 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-3.5 text-primary" />
                        Requested on {formatRequestDate(booking.createdAt)}
                      </span>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/browse-services/${booking.serviceId}`}
                          className={buttonVariants({
                            variant: "outline",
                            size: "xs",
                          })}
                        >
                          View Service
                        </Link>
                        {booking.vendorEmail && (
                          <a
                            href={`mailto:${booking.vendorEmail}?subject=${encodeURIComponent(
                              `Booking inquiry: ${serviceTitle}`
                            )}`}
                            className={
                              buttonVariants({ variant: "outline", size: "xs" }) +
                              " border-secondary text-primary"
                            }
                          >
                            Contact Vendor
                          </a>
                        )}
                        {status === "pending" && booking._id && (
                          <Button
                            variant="destructive"
                            size="xs"
                            className="gap-1"
                            aria-label={`Delete booking for ${serviceTitle}`}
                            onClick={() => setBookingToDelete(booking)}
                          >
                            <Trash2 className="size-3" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={Boolean(bookingToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleting) setBookingToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete booking request?</DialogTitle>
            <DialogDescription>
              This will permanently remove your request for{" "}
              <span className="font-medium text-foreground">
                {bookingToDelete?.serviceTitle || "this service"}
              </span>
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" />}
              disabled={deleting}
            >
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              className="gap-1.5"
              disabled={deleting}
              onClick={handleDeleteBooking}
            >
              {deleting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              {deleting ? "Deleting..." : "Delete booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
