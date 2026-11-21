"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { clientApi } from "@/lib/api/clientApi";
import { authClient } from "@/lib/auth-client";
import { CATEGORY_META } from "@/lib/service-categories";
import type { IService } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  Store,
  X,
  XCircle,
} from "lucide-react";

type ServiceStatus = "active" | "pending" | "declined";

/** Normalises a stored status — records saved without one are treated as awaiting review. */
function getStatus(service: IService): ServiceStatus {
  if (service.status === "active") return "active";
  if (service.status === "declined") return "declined";
  return "pending";
}

/** Badge label, icon and classes for each moderation state. */
function statusMeta(status: ServiceStatus) {
  if (status === "active") {
    return {
      label: "Approved",
      icon: CheckCircle2,
      className:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    };
  }

  if (status === "declined") {
    return {
      label: "Declined",
      icon: XCircle,
      className: "bg-destructive/10 text-destructive border-destructive/20",
    };
  }

  return {
    label: "Pending",
    icon: Clock,
    className:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  };
}

/** Formats a numeric price as whole-dollar USD, falling back to an em dash. */
function formatPrice(price: number | undefined) {
  if (typeof price !== "number" || Number.isNaN(price)) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function AdminManageServicesPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const token = session?.session?.token;

  const [services, setServices] = React.useState<IService[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);

  /** In-flight decision per service id, used to disable that row's controls. */
  const [updating, setUpdating] = React.useState<
    Record<string, "active" | "declined">
  >({});

  /** Loads every listing once the session (and therefore the auth token) is ready. */
  React.useEffect(() => {
    if (sessionLoading) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const all = await clientApi.get<IService[]>("/services", token);
        if (cancelled) return;

        setServices(Array.isArray(all) ? all : []);
      } catch (err: unknown) {
        if (cancelled) return;

        const message =
          err instanceof Error ? err.message : "Failed to load services.";

        setLoadError(message);
        toast.add({
          type: "error",
          title: "Could not load services",
          description: message,
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionLoading, token, reloadKey]);

  /**
   * Persists an approve/reject decision with an optimistic row update,
   * reverting to the previous status when the API rejects the change.
   */
  const handleDecision = async (
    service: IService,
    next: "active" | "declined"
  ) => {
    const id = service._id;
    if (updating[id]) return;

    const previous = getStatus(service);

    setUpdating((prev) => ({ ...prev, [id]: next }));
    setServices((prev) =>
      prev.map((item) => (item._id === id ? { ...item, status: next } : item))
    );

    try {
      await clientApi.put<IService>(`/services/${id}/status`, token as string, {
        status: next,
      });

      toast.add({
        type: next === "active" ? "success" : "info",
        title: next === "active" ? "Service approved" : "Service declined",
        description:
          next === "active"
            ? `“${service.title}” is now live in the vendor directory.`
            : `“${service.title}” is hidden from the vendor directory.`,
      });
    } catch (err: unknown) {
      setServices((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: previous } : item))
      );

      toast.add({
        type: "error",
        title: "Could not update service",
        description:
          err instanceof Error ? err.message : "Please try again in a moment.",
      });
    } finally {
      setUpdating((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const isLoading = sessionLoading || loading;

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Manage Services & Moderation
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Audit vendor service listings, package pricing, and directory standards
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <Card className="border-border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Base Price</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {Array.from({ length: 5 }).map((_, rowIndex) => (
                    <tr key={rowIndex}>
                      {Array.from({ length: 6 }).map((__, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-3.5">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {!isLoading && loadError && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-4 shrink-0 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  We couldn&apos;t load the services
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {loadError}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !loadError && services.length === 0 && (
        <Card className="border-dashed border-border">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#99616E]/10 text-[#99616E]">
              <Store className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                No services yet
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Listings submitted by vendors will appear here for review and
                moderation.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Refresh
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Moderation table */}
      {!isLoading && !loadError && services.length > 0 && (
        <Card className="border-border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Base Price</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {services.map((service) => {
                    const status = getStatus(service);
                    const meta = statusMeta(status);
                    const StatusIcon = meta.icon;
                    const rowUpdating = updating[service._id];
                    const categoryLabel =
                      CATEGORY_META[service.category]?.label ??
                      String(service.category ?? "");

                    return (
                      <tr
                        key={service._id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3.5 max-w-[22rem]">
                          <div className="font-semibold text-foreground line-clamp-1">
                            {service.title || "Untitled service"}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {service.description ||
                              "No description provided."}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="text-xs font-medium text-foreground">
                            {service.vendorName || "—"}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {service.vendorEmail || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#99616E]/15 text-[#99616E] whitespace-nowrap">
                            {categoryLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-sm font-semibold text-[#99616E] whitespace-nowrap">
                          {formatPrice(service.price)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap",
                              meta.className
                            )}
                          >
                            <StatusIcon className="size-3" />
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {status === "pending" ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="xs"
                                disabled={Boolean(rowUpdating)}
                                aria-label={`Approve ${service.title}`}
                                onClick={() => handleDecision(service, "active")}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                              >
                                {rowUpdating === "active" ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  <Check className="size-3.5" />
                                )}
                                Approve
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                disabled={Boolean(rowUpdating)}
                                aria-label={`Reject ${service.title}`}
                                onClick={() =>
                                  handleDecision(service, "declined")
                                }
                                className="text-destructive hover:bg-destructive/10 border-destructive/20 gap-1"
                              >
                                {rowUpdating === "declined" ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  <X className="size-3.5" />
                                )}
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
