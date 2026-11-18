"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarHeart,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface BookingPanelProps {
  serviceTitle: string;
  priceLabel: string;
  vendorEmail?: string;
  available: boolean;
}

/**
 * Booking side panel. Since there is no booking endpoint yet, the request is
 * composed as a prefilled email to the vendor with the chosen event date.
 */
export default function BookingPanel({
  serviceTitle,
  priceLabel,
  vendorEmail,
  available,
}: BookingPanelProps) {
  const [date, setDate] = useState("");

  const prettyDate = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const subject = encodeURIComponent(`Booking request — ${serviceTitle}`);
  const body = encodeURIComponent(
    [
      "Hi,",
      "",
      `I would like to enquire about booking "${serviceTitle}".`,
      prettyDate ? `Preferred event date: ${prettyDate}.` : null,
      "",
      "Could you please share availability and the next steps?",
      "",
      "Thank you!",
    ]
      .filter((line): line is string => line !== null)
      .join("\n")
  );

  const mailtoHref = vendorEmail
    ? `mailto:${vendorEmail}?subject=${subject}&body=${body}`
    : undefined;

  const canBook = available && Boolean(mailtoHref);

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
            {available ? "Open for bookings" : "Currently unavailable"}
          </span>
        </div>
      </div>

      {/* Booking form — UI only */}
      <div className="space-y-4 p-6">
        {/* <div>
          <label
            htmlFor="event-date"
            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground"
          >
            <CalendarHeart className="size-3.5 text-primary" />
            Preferred event date
          </label>
          <input
            id="event-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            disabled={!available}
            className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div> */}

        {canBook ? (
          <Link
            href="/"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Sparkles className="size-4" />
            Request booking
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-muted px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            {available ? "Contact details unavailable" : "Currently unavailable"}
          </span>
        )}

        {/* <p className="flex items-start gap-2 rounded-xl border border-border/70 bg-muted/30 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
          No payment is taken now. Your request opens a pre-filled email so the
          vendor can confirm availability directly.
        </p> */}


        <div className="flex items-center justify-center gap-1.5 border-t border-border pt-4 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          Direct vendor contact after booking confirmation.
        </div>
      </div>
    </div>
  );
}
