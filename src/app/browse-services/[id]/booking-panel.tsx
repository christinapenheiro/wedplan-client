"use client";

import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import { clientApi } from "@/lib/api/clientApi";
import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { IBookingPayload, TBookingStatus } from "@/lib/types";

interface BookingPanelProps {
  serviceId?: string;
  serviceTitle: string;
  priceLabel: string;
  vendorEmail?: string;
  available: boolean;
}



/** Booking document as returned by the API — payload plus the Mongo-side `status`. */
interface IBookingRecord extends IBookingPayload {
  status?: string;
}

/**
 * Normalises the booking status from the API. Stored values are lowercase
 * ("pending", "accepted", "declined"), so compare them directly against the
 * lowercase strings. Unknown/missing values mean there is no active request.
 */
function getBookingStatus(
  booking: IBookingRecord | IBookingRecord[] | null | undefined
): TBookingStatus | null {
  const record = Array.isArray(booking) ? booking[0] : booking;
  const raw = record?.bookingStatus ?? record?.status;

  if (!raw) return null;

  const normalized = String(raw).toLowerCase();

  if (normalized === "pending") return "pending";
  if (normalized === "accepted") return "accepted";
  if (normalized === "declined") return "declined";

  return null;
}

/**
 * Booking side panel on the service details page. Directs the user to the dedicated
 * booking request form page for this service.
 */
export default function BookingPanel({
  serviceId,
  serviceTitle,
  priceLabel,
  available,
}: BookingPanelProps) {
  const targetHref = serviceId ? `/browse-services/${serviceId}/booking` : "#";
  const { data: session } = authClient.useSession();
  const token = session?.session?.token;
  const [bookingStatus, setBookingStatus] = useState<TBookingStatus | null>(null);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId || !serviceId) return;

    let cancelled = false;

    (async () => {
      // Clear any status belonging to a previously viewed service.
      setBookingStatus(null);

      try {
        const bookingInfo = await clientApi.get<
          IBookingRecord | IBookingRecord[] | null
        >(
          `/bookings?customerId=${encodeURIComponent(
            userId
          )}&serviceId=${encodeURIComponent(serviceId)}`
        ,token as string);

        if (cancelled) return;

        setBookingStatus(getBookingStatus(bookingInfo));
      } catch (error) {
        if (cancelled) return;
        console.error(error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, serviceId]);

  return (
    <div className="overflow-hidden rounded-3xl border border-primary/20 bg-card shadow-lg shadow-primary/5">
      {/* Price header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#F5F1F6] via-[#FAF8FA] to-[#EFE7F1] px-6 py-6 dark:from-[#2E252C] dark:via-[#221B20] dark:to-[#3B3040]">
        <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-primary/10 blur-2xl" />

        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Starting from
          </p>
          <p className="mt-1 font-serif text-4xl font-semibold text-primary">
            {priceLabel}
          </p>

          <span
            className={
              available
                ? "mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400"
                : "mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
            }
          >
            <span
              className={
                available
                  ? "size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"
                  : "size-1.5 rounded-full bg-muted-foreground/60"
              }
            />
            {available ? "Open for bookings" : "Pending Status"}
          </span>
        </div>
      </div>

      {/* Booking actions */}
      <div className="space-y-4 p-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Ready to reserve your date with{" "}
          <strong className="text-foreground">{serviceTitle}</strong>? Submit
          your event details to receive availability confirmation and custom
          quote.
        </p>

        {bookingStatus === "pending" ? (
          <span
            aria-disabled="true"
            className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-muted px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            Pending for Vendor Review
          </span>
        ) : bookingStatus === "accepted" ? (
          <span
            aria-disabled="true"
            className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-muted px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            Booking Accepted
          </span>
        ) : bookingStatus === "declined" ? (
          <span
            aria-disabled="true"
            className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-muted px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            Booking Declined
          </span>
        ) : !available ? (
          <span
            aria-disabled="true"
            className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-muted px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            Service Unavailable
          </span>
        ) : (
          <Link
            href={targetHref}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Sparkles className="size-4" />
            Request booking
          </Link>
        )}

        <div className="flex items-center justify-center gap-1.5 border-t border-border pt-4 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          Direct vendor contact after booking confirmation.
        </div>
      </div>
    </div>
  );
}
