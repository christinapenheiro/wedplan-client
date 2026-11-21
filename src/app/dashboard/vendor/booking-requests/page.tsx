"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { clientApi } from "@/lib/api/clientApi";
import { authClient } from "@/lib/auth-client";
import {
  Check,
  X,
  Mail,
  User,
  Calendar,
  MapPin,
  MessageSquare,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertCircle,
  Inbox,
  Loader2,
} from "lucide-react";

/** Structure of a booking request received from the backend API. */
export interface IVendorBookingRequest {
  _id: string;
  id?: string;
  serviceId: string;
  serviceTitle?: string;
  service?: string;
  serviceLocation?: string;
  vendorId?: string;
  vendorEmail?: string;
  customerId?: string;
  customerName?: string;
  couple?: string;
  customerEmail?: string;
  email?: string;
  eventDate?: string;
  date?: string;
  eventLocation?: string;
  venue?: string;
  location?: string;
  additionalMessage?: string;
  notes?: string;
  message?: string;
  guestCount?: number | string;
  bookingStatus?: "pending" | "accepted" | "rejected" | "declined";
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

type NormalizedStatus = "pending" | "accepted" | "rejected";

/**
 * Normalises status across various naming conventions.
 * "declined" and "rejected" are treated as "rejected".
 */
function getNormalizedStatus(
  bookingStatus?: string,
  status?: string
): NormalizedStatus {
  const raw = String(bookingStatus ?? status ?? "pending").toLowerCase();
  if (raw === "accepted") return "accepted";
  if (raw === "declined" || raw === "rejected") return "rejected";
  return "pending";
}

/** Formats an event date string (e.g. "2026-11-25" -> "Wednesday, Nov 25, 2026"). */
function formatEventDate(value?: string): string {
  if (!value) return "Date not specified";
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(dateOnly ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/** Formats the submission date (e.g. "Nov 21, 2026"). */
function formatSubmissionDate(value?: string): string {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/** Loading skeleton for booking request cards. */
function BookingRequestsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-border">
          <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-8 w-40" />
          </CardHeader>
          <CardContent className="pt-3 border-t border-border space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-14 w-full rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function VendorBookingRequestsPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const token = session?.session?.token;
  const userId = session?.user?.id;
  const userEmail = session?.user?.email;

  const [requests, setRequests] = React.useState<IVendorBookingRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<"all" | NormalizedStatus>("all");
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [updatingAction, setUpdatingAction] = React.useState<"accepted" | "rejected" | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);

  /** Fetches vendor bookings from the server using the authenticated vendor details. */
  React.useEffect(() => {
    if (sessionLoading || (!userId && !userEmail)) return;

    let cancelled = false;

    (async () => {
      try {
        const params = new URLSearchParams();
        if (userId) params.set("vendorId", userId);
        if (userEmail) params.set("vendorEmail", userEmail);

        // const data = await clientApi.get<IVendorBookingRequest[]>(
        //   `/bookings/vendor?${params.toString()}`,
        //   token
        // );
          const data = await clientApi.get<IVendorBookingRequest[]>(
            `/bookings/vendor?vendorId=${userId}&vendorEmail=${userEmail}`,
            token,
          );

        if (cancelled) return;
        setRequests(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err: unknown) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Failed to load booking requests";
        setError(msg);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionLoading, userId, userEmail, token, reloadKey]);

  const handleRefresh = () => {
    setLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  /**
   * Updates booking status to accepted or rejected.
   * Enforces rules:
   * 1. Only pending requests can be accepted or rejected.
   * 2. Once accepted or rejected, a request cannot be processed again.
   */
  const handleUpdateStatus = async (
    bookingId: string,
    newStatus: "accepted" | "rejected"
  ) => {
    const target = requests.find((r) => (r._id || r.id) === bookingId);
    if (!target) return;

    const currentStatus = getNormalizedStatus(target.bookingStatus, target.status);

    // Rule enforcement: Only pending requests can be processed
    if (currentStatus !== "pending") {
      toast.add({
        title: "Action not permitted",
        description: "Once accepted or rejected, a request cannot be processed again.",
        type: "warning",
      });
      return;
    }

    setUpdatingId(bookingId);
    setUpdatingAction(newStatus);

    try {
      await clientApi.put(
        `/bookings/${bookingId}/status`,
        token || "",
        {
          status: newStatus,
          bookingStatus: newStatus,
        }
      );

      // Optimistically update the list in local state
      setRequests((prev) =>
        prev.map((item) => {
          const itemId = item._id || item.id;
          if (itemId === bookingId) {
            return {
              ...item,
              bookingStatus: newStatus,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            };
          }
          return item;
        })
      );

      const customerLabel = target.customerName || target.couple || "Customer";
      toast.add({
        title: newStatus === "accepted" ? "Booking Accepted" : "Booking Rejected",
        description: `${customerLabel}'s booking request has been ${newStatus}.`,
        type: newStatus === "accepted" ? "success" : "default",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update booking status";
      toast.add({
        title: "Action Failed",
        description: msg,
        type: "error",
      });
    } finally {
      setUpdatingId(null);
      setUpdatingAction(null);
    }
  };

  // Status counts for badge tabs
  const counts = React.useMemo(() => {
    const total = requests.length;
    let pending = 0;
    let accepted = 0;
    let rejected = 0;

    for (const r of requests) {
      const s = getNormalizedStatus(r.bookingStatus, r.status);
      if (s === "pending") pending++;
      else if (s === "accepted") accepted++;
      else if (s === "rejected") rejected++;
    }

    return { total, pending, accepted, rejected };
  }, [requests]);

  // Filtered requests based on active tab
  const filteredRequests = React.useMemo(() => {
    if (activeTab === "all") return requests;
    return requests.filter(
      (r) => getNormalizedStatus(r.bookingStatus, r.status) === activeTab
    );
  }, [requests, activeTab]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Booking Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review, accept, or decline booking inquiries submitted by engaged couples
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="gap-2 h-9 self-start sm:self-auto border-border text-foreground hover:bg-muted"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            activeTab === "all"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          All Requests ({counts.total})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === "pending"
              ? "bg-amber-500 text-white shadow-xs"
              : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
          }`}
        >
          <Clock className="size-3" />
          Pending ({counts.pending})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("accepted")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === "accepted"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
          }`}
        >
          <CheckCircle2 className="size-3" />
          Accepted ({counts.accepted})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rejected")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === "rejected"
              ? "bg-destructive text-destructive-foreground shadow-xs"
              : "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20"
          }`}
        >
          <XCircle className="size-3" />
          Rejected ({counts.rejected})
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <BookingRequestsSkeleton />
      ) : error ? (
        <Card className="border-destructive/30 bg-destructive/5 p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <AlertCircle className="size-10 text-destructive" />
            <h3 className="text-base font-semibold text-foreground">
              Unable to load booking requests
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {error}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="mt-2 gap-2"
            >
              <RefreshCw className="size-4" />
              Try Again
            </Button>
          </div>
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card className="border-dashed border-border/80 bg-muted/10 p-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-3 rounded-full bg-muted/60 text-muted-foreground">
              <Inbox className="size-8" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              No booking requests found
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {activeTab === "all"
                ? "When couples submit inquiries for your wedding services, they will appear here for review."
                : `There are currently no requests in "${activeTab}" status.`}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const reqId = req._id || req.id || "";
            const status = getNormalizedStatus(req.bookingStatus, req.status);
            const isPending = status === "pending";
            const isCurrentUpdating = updatingId === reqId;

            const customerName =
              req.customerName || req.couple || "Engaged Couple";
            const customerEmail = req.customerEmail || req.email || null;
            const serviceTitle =
              req.serviceTitle || req.service || "Wedding Service";
            const eventDate = req.eventDate || req.date;
            const eventLocation =
              req.eventLocation || req.venue || req.location || "Location not specified";
            const customerMessage =
              req.additionalMessage || req.notes || req.message;

            return (
              <Card
                key={reqId}
                className="border-border hover:border-primary/30 transition-colors shadow-xs"
              >
                <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Customer Information */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="p-1 rounded-md bg-primary/10 text-primary">
                        <User className="size-4" />
                      </span>
                      <CardTitle className="text-base font-bold text-foreground">
                        {customerName}
                      </CardTitle>

                      {/* Booking Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          status === "accepted"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                            : status === "rejected"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {status === "accepted" ? (
                          <>
                            <CheckCircle2 className="size-3" />
                            Accepted
                          </>
                        ) : status === "rejected" ? (
                          <>
                            <XCircle className="size-3" />
                            Rejected
                          </>
                        ) : (
                          <>
                            <Clock className="size-3" />
                            Pending Review
                          </>
                        )}
                      </span>
                    </div>

                    <CardDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-3 mt-1">
                      {customerEmail && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="size-3.5 text-muted-foreground" />
                          <a
                            href={`mailto:${customerEmail}`}
                            className="hover:underline hover:text-foreground"
                          >
                            {customerEmail}
                          </a>
                        </span>
                      )}
                      {req.createdAt && (
                        <span className="text-[11px] text-muted-foreground/80">
                          Requested on {formatSubmissionDate(req.createdAt)}
                        </span>
                      )}
                    </CardDescription>
                  </div>

                  {/* Actions: Accept and Reject (Only for Pending requests) */}
                  <div>
                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          disabled={isCurrentUpdating}
                          onClick={() => handleUpdateStatus(reqId, "accepted")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8 text-xs font-medium shadow-xs"
                        >
                          {isCurrentUpdating && updatingAction === "accepted" ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Check className="size-3.5" />
                          )}
                          <span>Accept</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isCurrentUpdating}
                          onClick={() => handleUpdateStatus(reqId, "rejected")}
                          className="text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30 h-8 text-xs gap-1.5 font-medium"
                        >
                          {isCurrentUpdating && updatingAction === "rejected" ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <X className="size-3.5" />
                          )}
                          <span>Reject</span>
                        </Button>
                      </div>
                    ) : (
                      /* Once accepted or rejected, request cannot be processed again */
                      <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
                        {status === "accepted" ? (
                          <>
                            <Check className="size-3 text-emerald-600" />
                            <span>Decision finalized: Accepted</span>
                          </>
                        ) : (
                          <>
                            <X className="size-3 text-destructive" />
                            <span>Decision finalized: Rejected</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-3 border-t border-border mt-1 space-y-3 text-xs">
                  {/* Service, Date, and Location Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-muted/20 border border-border/60">
                    {/* Service Information */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                        <Sparkles className="size-3 text-primary" />
                        Service
                      </span>
                      <p className="font-semibold text-foreground text-sm">
                        {serviceTitle}
                      </p>
                    </div>

                    {/* Event Date */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="size-3 text-primary" />
                        Event Date
                      </span>
                      <p className="font-semibold text-foreground text-sm">
                        {formatEventDate(eventDate)}
                      </p>
                    </div>

                    {/* Event Location */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="size-3 text-primary" />
                        Event Location
                      </span>
                      <p className="font-semibold text-foreground text-sm truncate" title={eventLocation}>
                        {eventLocation}
                      </p>
                    </div>
                  </div>

                  {/* Customer Message */}
                  {customerMessage ? (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                        <MessageSquare className="size-3 text-primary" />
                        Customer Message
                      </span>
                      <div className="p-3 rounded-md bg-muted/40 border border-border/50 text-foreground italic leading-relaxed">
                        &ldquo;{customerMessage}&rdquo;
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground italic">
                      No additional message provided by customer.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
