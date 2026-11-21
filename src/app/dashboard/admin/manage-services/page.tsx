"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { clientApi } from "@/lib/api/clientApi";
import { authClient } from "@/lib/auth-client";
import { CATEGORY_META } from "@/lib/service-categories";
import type { IService } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowUpDown,
  Check,
  CheckCircle2,
  Clock,
  FilterX,
  Loader2,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Store,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

type ServiceStatus = "active" | "pending" | "declined";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
] as const;

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

  // Filter and Search states
  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [sortOption, setSortOption] = React.useState<string>("newest");

  // Query & Data states
  const [services, setServices] = React.useState<IService[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);

  // In-flight moderation decision per service id
  const [updating, setUpdating] = React.useState<
    Record<string, "active" | "declined">
  >({});

  // Deletion modal and loading state
  const [serviceToDelete, setServiceToDelete] = React.useState<IService | null>(
    null
  );
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Debounce search input changes by 350ms
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  /**
   * Fetches services dynamically from the backend database using query parameters.
   */
  React.useEffect(() => {
    if (sessionLoading || !token) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const queryParams = new URLSearchParams();
        if (debouncedSearch) {
          queryParams.set("search", debouncedSearch);
        }
        if (statusFilter && statusFilter !== "all") {
          queryParams.set("status", statusFilter);
        }
        if (categoryFilter && categoryFilter !== "all") {
          queryParams.set("category", categoryFilter);
        }
        if (sortOption && sortOption !== "newest") {
          queryParams.set("sort", sortOption);
        }

        const queryString = queryParams.toString();
        const endpoint = queryString ? `/services?${queryString}` : "/services";

        const res = await clientApi.get<IService[]>(endpoint, token);
        if (cancelled) return;

        setServices(Array.isArray(res) ? res : []);
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
  }, [
    sessionLoading,
    token,
    debouncedSearch,
    statusFilter,
    categoryFilter,
    sortOption,
    reloadKey,
  ]);

  /**
   * Persists an approve/reject decision with an optimistic row update,
   * reverting to the previous status if the API rejects the change.
   */
  const handleDecision = async (
    service: IService,
    next: "active" | "declined"
  ) => {
    const id = service._id;
    if (updating[id] || !token) return;

    const previous = getStatus(service);

    setUpdating((prev) => ({ ...prev, [id]: next }));
    setServices((prev) =>
      prev.map((item) => (item._id === id ? { ...item, status: next } : item))
    );

    try {
      await clientApi.put<IService>(`/services/${id}/status`, token, {
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
        prev.map((item) =>
          item._id === id ? { ...item, status: previous } : item
        )
      );

      toast.add({
        type: "error",
        title: "Could not update service",
        description:
          err instanceof Error ? err.message : "Please try again in a moment.",
      });
    } finally {
      setUpdating((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  /**
   * Confirms and executes permanent service deletion via backend database delete.
   */
  const handleConfirmDelete = async () => {
    if (!serviceToDelete || !token) return;

    const id = serviceToDelete._id;
    const title = serviceToDelete.title;
    setIsDeleting(true);

    try {
      await clientApi.delete(`/services/${id}`, token);

      // Remove optimistically from state
      setServices((prev) => prev.filter((item) => item._id !== id));

      toast.add({
        type: "success",
        title: "Service deleted",
        description: `“${title}” has been permanently removed.`,
      });

      setServiceToDelete(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete service.";

      toast.add({
        type: "error",
        title: "Deletion failed",
        description: message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setSortOption("newest");
  };

  const hasActiveFilters = Boolean(
    debouncedSearch ||
      statusFilter !== "all" ||
      categoryFilter !== "all" ||
      sortOption !== "newest"
  );

  const isLoading = sessionLoading || loading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-border flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-serif">
            Manage Services & Moderation
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Search, filter, audit, approve, or remove vendor service listings from the database
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReloadKey((k) => k + 1)}
            disabled={isLoading}
            className="gap-1.5 text-xs font-medium"
          >
            <RotateCcw className={cn("size-3.5", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Dynamic Search & Backend Filter Bar */}
      <Card className="border-border/80 bg-card/70 shadow-xs">
        <CardContent className="p-4 space-y-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-center">
            {/* Search Input (5 cols) */}
            <div className="relative flex h-10 items-center gap-2 rounded-lg border border-border/80 bg-background px-3 transition focus-within:border-primary focus-within:ring-1 focus-within:ring-primary sm:col-span-2 lg:col-span-5">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search title, vendor, email, or city…"
                className="h-full w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/70"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="rounded-full p-0.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter (2.5 cols) */}
            <div className="relative flex h-10 items-center rounded-lg border border-border/80 bg-background sm:col-span-1 lg:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
                className="h-full w-full appearance-none bg-transparent pl-3 pr-8 text-xs text-foreground outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="active">Approved (Active)</option>
                <option value="declined">Declined</option>
              </select>
              <SlidersHorizontal className="pointer-events-none absolute right-2.5 size-3.5 text-muted-foreground" />
            </div>

            {/* Category Filter (2.5 cols) */}
            <div className="relative flex h-10 items-center rounded-lg border border-border/80 bg-background sm:col-span-1 lg:col-span-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by category"
                className="h-full w-full appearance-none bg-transparent pl-3 pr-8 text-xs text-foreground outline-none"
              >
                <option value="all">All Categories</option>
                {Object.entries(CATEGORY_META).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label}
                  </option>
                ))}
              </select>
              <SlidersHorizontal className="pointer-events-none absolute right-2.5 size-3.5 text-muted-foreground" />
            </div>

            {/* Sort Dropdown (3 cols) */}
            <div className="relative flex h-10 items-center rounded-lg border border-border/80 bg-background sm:col-span-2 lg:col-span-3">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                aria-label="Sort listings"
                className="h-full w-full appearance-none bg-transparent pl-3 pr-8 text-xs text-foreground outline-none font-medium"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ArrowUpDown className="pointer-events-none absolute right-2.5 size-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* Quick Status Bar & Active Filter Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-semibold text-foreground">
                {services.length} {services.length === 1 ? "listing" : "listings"} found
              </span>
              {isLoading && (
                <span className="inline-flex items-center gap-1 text-primary font-medium">
                  <Loader2 className="size-3 animate-spin" />
                  Querying database…
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                {debouncedSearch && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[11px] text-primary font-medium">
                    Keyword: &ldquo;{debouncedSearch}&rdquo;
                    <button
                      type="button"
                      onClick={() => setSearchInput("")}
                      className="hover:opacity-75"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                {statusFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-medium capitalize">
                    Status: {statusFilter}
                    <button
                      type="button"
                      onClick={() => setStatusFilter("all")}
                      className="hover:opacity-75"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                {categoryFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-medium">
                    Category: {CATEGORY_META[categoryFilter as keyof typeof CATEGORY_META]?.label ?? categoryFilter}
                    <button
                      type="button"
                      onClick={() => setCategoryFilter("all")}
                      className="hover:opacity-75"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                {sortOption !== "newest" && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-secondary/40 bg-secondary/20 px-2.5 py-0.5 text-[11px] font-medium">
                    Sort: {SORT_OPTIONS.find((s) => s.value === sortOption)?.label}
                    <button
                      type="button"
                      onClick={() => setSortOption("newest")}
                      className="hover:opacity-75"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handleClearFilters}
                  className="h-6 text-[11px] text-muted-foreground hover:text-foreground gap-1"
                >
                  <RotateCcw className="size-3" />
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading Skeleton */}
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
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              {hasActiveFilters ? (
                <FilterX className="size-6" />
              ) : (
                <Store className="size-6" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {hasActiveFilters
                  ? "No matching services found"
                  : "No services yet"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {hasActiveFilters
                  ? "Try adjusting your search terms or clearing your selected filters to view other listings."
                  : "Listings submitted by vendors will appear here for review, moderation, and management."}
              </p>
            </div>
            {hasActiveFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="gap-1.5"
              >
                <RotateCcw className="size-3.5" />
                Clear all filters
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReloadKey((key) => key + 1)}
              >
                Refresh
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Moderation & Management Table */}
      {!isLoading && !loadError && services.length > 0 && (
        <Card className="border-border overflow-hidden">
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
                    <th className="px-4 py-3 text-right">Moderation & Actions</th>
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
                        {/* Service Title & Info */}
                        <td className="px-4 py-3.5 max-w-[20rem]">
                          <div className="font-semibold text-foreground line-clamp-1">
                            {service.title || "Untitled service"}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {service.description || "No description provided."}
                          </div>
                          {service.location && (
                            <span className="text-[10px] text-muted-foreground/80 mt-1 inline-block">
                              📍 {service.location}
                            </span>
                          )}
                        </td>

                        {/* Vendor Details */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="text-xs font-medium text-foreground">
                            {service.vendorName || "—"}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {service.vendorEmail || "—"}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                            {categoryLabel}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3.5 text-sm font-semibold text-primary whitespace-nowrap">
                          {formatPrice(service.price)}
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border",
                              meta.className
                            )}
                          >
                            <StatusIcon className="size-3" />
                            {meta.label}
                          </span>
                        </td>

                        {/* Actions: Approve / Decline + Delete */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Approve / Re-approve Button */}
                            {status !== "active" && (
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
                            )}

                            {/* Reject / Decline Button */}
                            {status !== "declined" && (
                              <Button
                                size="xs"
                                variant="outline"
                                disabled={Boolean(rowUpdating)}
                                aria-label={`Decline ${service.title}`}
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
                                {status === "active" ? "Decline" : "Reject"}
                              </Button>
                            )}

                            {/* Delete Button */}
                            <Button
                              size="xs"
                              variant="ghost"
                              aria-label={`Delete ${service.title}`}
                              onClick={() => setServiceToDelete(service)}
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive size-7 p-0"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
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

      {/* Confirmation Dialog for Deleting Service */}
      <Dialog
        open={Boolean(serviceToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setServiceToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="size-5" />
              Delete Service Listing
            </DialogTitle>
            <DialogDescription className="space-y-2 pt-2 text-sm text-foreground">
              <span>
                Are you sure you want to permanently delete{" "}
                <strong className="text-foreground font-semibold">
                  &ldquo;{serviceToDelete?.title}&rdquo;
                </strong>
                ?
              </span>
              <span className="block text-xs text-muted-foreground">
                This listing will be permanently removed from the database and will
                no longer be visible in the vendor directory. This action cannot be
                undone.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setServiceToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="gap-1.5"
            >
              {isDeleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {isDeleting ? "Deleting…" : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
