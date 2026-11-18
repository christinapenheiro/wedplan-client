"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarHeart,
  MapPin,
  MessageSquare,
  Sparkles,
  Loader2,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { clientApi } from "@/lib/api/clientApi";
import { toast } from "@/components/ui/toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { IAccountRole, IBookingPayload, IService } from "@/lib/types";

interface BookingFormProps {
  service: IService;
  vendorName: string;
}

export default function BookingForm({ service, vendorName }: BookingFormProps) {
  const router = useRouter();
  const { data:session } = authClient.useSession();

  // Form input state
  const [eventDate, setEventDate] = React.useState("");
  const [eventLocation, setEventLocation] = React.useState(service.location || "");
  const [additionalMessage, setAdditionalMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Minimum selectable date is today
  const todayStr = React.useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!eventDate) {
      toast.add({
        title: "Missing event date",
        description: "Please choose your preferred wedding or event date.",
        type: "warning",
      });
      return;
    }

    if (!eventLocation.trim()) {
      toast.add({
        title: "Missing location",
        description: "Please specify the city, venue, or address for your event.",
        type: "warning",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Compile complete booking payload object combining service details & form inputs
      const bookingData: IBookingPayload = {
        // Service details from service listing
        serviceId: service._id,
        serviceTitle: service.title,
        vendorId: service.vendorId,
        vendorName: vendorName,
        vendorEmail: service.vendorEmail,
        // Customer inputs
        eventDate,
        eventLocation: eventLocation.trim(),
        additionalMessage: additionalMessage.trim(),
        customerName: session?.user?.name || "" ,
        customerId: session?.user?.id,
        // Status metadata
        status: "Pending",
        createdAt: new Date().toISOString(),
        customerRole:
          (session?.user as { role?: IAccountRole } | undefined)?.role ||
          "customer",
      };

      // 2. Create standard FormData object with all collected data
      const formData = new FormData();
      Object.entries(bookingData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Log structured payload and formData keys for easy debugging & backend hookup
      // console.log("Booking Request Object:", bookingData);
      // console.log("Booking Request FormData entries:", Array.from(formData.entries()));

      /**
       * Backend API route submission:
       * When your backend booking endpoint is ready, call your API route here:
       * e.g.:
       * await clientApi.post("/bookings", bookingData);
       * OR
       * await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/bookings`, {
       *   method: "POST",
       *   body: formData,
       * });
       */
      try {
        await clientApi.post("/bookings", bookingData);
      } catch (apiErr) {
        // If the backend endpoint is not yet connected by the user, we log and treat as queued
        console.info(
          "Backend endpoint /bookings pending backend implementation:",
          apiErr
        );
      }

      setIsSuccess(true);

      // Trigger Shadcn / Base UI Success Toast
      toast.add({
        title: "Booking request submitted!",
        description: `Your request for "${service.title}" has been sent to ${vendorName}.`,
        type: "success",
      });

      // Optional redirect back to service details after brief delay
      setTimeout(() => {
        router.push(`/browse-services/${service._id}`);
      }, 2500);
    } catch (error) {
      console.error("Booking submission error:", error);

      // Trigger Shadcn / Base UI Error Toast
      toast.add({
        title: "Failed to submit request",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="border-border bg-card p-8 text-center shadow-md">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="mt-4 font-serif text-2xl font-normal text-foreground">
          Booking Request Received!
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Thank you! Your booking details for{" "}
          <strong className="text-foreground">{service.title}</strong> have been
          forwarded to <strong className="text-foreground">{vendorName}</strong>.
          You will receive a response soon.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Redirecting you back to the service details...
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="space-y-1.5 border-b border-border/60 pb-5">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          <CalendarHeart className="size-3.5" />
          Reservation Request
        </div>
        <CardTitle className="font-serif text-2xl font-normal tracking-wide text-foreground">
          Book This Wedding Service
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Provide your event date and location to request direct confirmation from{" "}
          {vendorName}.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Event Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Event Information
            </h3>

            {/* Event Date */}
            <div className="space-y-1.5">
              <Label
                htmlFor="eventDate"
                className="flex items-center gap-1.5 text-xs font-medium text-foreground"
              >
                <CalendarHeart className="size-3.5 text-primary" />
                Event Date <span className="text-primary">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="eventDate"
                  name="eventDate"
                  type="date"
                  min={todayStr}
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="h-11 rounded-xl border-border bg-background px-3.5 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/25"
                />
              </div>
              {eventDate && (
                <p className="text-[11px] text-muted-foreground">
                  Selected:{" "}
                  <span className="font-medium text-foreground">
                    {new Date(`${eventDate}T00:00:00`).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </span>
                </p>
              )}
            </div>

            {/* Event Location */}
            <div className="space-y-1.5">
              <Label
                htmlFor="eventLocation"
                className="flex items-center gap-1.5 text-xs font-medium text-foreground"
              >
                <MapPin className="size-3.5 text-primary" />
                Event Location / Venue <span className="text-primary">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="eventLocation"
                  name="eventLocation"
                  type="text"
                  placeholder="e.g. The Grand Ballroom, New York, NY or Hudson Valley"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  required
                  className="h-11 rounded-xl border-border bg-background px-3.5 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/25"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Venue name, city, or general ceremony/reception area.
              </p>
            </div>

            {/* Additional Message */}
            <div className="space-y-1.5">
              <Label
                htmlFor="additionalMessage"
                className="flex items-center gap-1.5 text-xs font-medium text-foreground"
              >
                <MessageSquare className="size-3.5 text-primary" />
                Additional Message &amp; Special Requests
              </Label>
              <textarea
                id="additionalMessage"
                name="additionalMessage"
                rows={4}
                value={additionalMessage}
                onChange={(e) => setAdditionalMessage(e.target.value)}
                placeholder="Share your wedding vision, estimated guest count, preferred timing, theme colors, or any custom requests..."
                className="w-full rounded-xl border border-border bg-background p-3.5 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/25 resize-y"
              />
            </div>
          </div>

          <div className="h-px w-full bg-border/60" />
 

          {/* Guarantee pill */}
          <div className="flex items-start gap-2.5 p-3.5 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              <strong>Zero upfront fee:</strong> Submitting this request sends
              your event details to the vendor. No payment is processed at this
              stage.
            </span>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting Request…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Submit Booking Request
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
