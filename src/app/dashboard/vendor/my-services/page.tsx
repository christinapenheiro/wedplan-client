"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { clientApi } from "@/lib/api/clientApi";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { IService, IServiceCategory } from "@/lib/types";
import {
  AlertCircle,
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  Flower2,
  Images,
  Landmark,
  Loader2,
  Music,
  Pencil,
  PlusCircle,
  Search,
  Shirt,
  Sparkles,
  Store,
  Trash2,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";

const CATEGORIES: IServiceCategory[] = [
  "photography",
  "venue",
  "floral",
  "catering",
  "makeup",
  "fashion",
  "music",
  "planner",
];

const CATEGORY_LABELS: Record<IServiceCategory, string> = {
  photography: "Photography & Videography",
  venue: "Wedding Venues",
  floral: "Decoration & Florist",
  catering: "Catering Services",
  makeup: "Makeup & Styling",
  fashion: "Wedding Fashion",
  music: "Music & Entertainment",
  planner: "Wedding Planner",
};

const CATEGORY_ICONS: Record<
  IServiceCategory,
  React.ComponentType<{ className?: string }>
> = {
  photography: Camera,
  venue: Landmark,
  floral: Flower2,
  catering: UtensilsCrossed,
  makeup: Sparkles,
  fashion: Shirt,
  music: Music,
  planner: ClipboardList,
};

type ServiceStatus = "active" | "pending" | "declined";

const STATUS_FILTERS: ("All" | ServiceStatus)[] = [
  "All",
  "active",
  "pending",
  "declined",
];

/** Normalises a stored status — records saved without one are treated as awaiting review. */
function getStatus(service: IService): ServiceStatus {
  if (service.status === "active") return "active";
  if (service.status === "declined") return "declined";
  return "pending";
}

/** Badge styling, icon and explanation for each approval state. */
function statusMeta(status: ServiceStatus) {
  if (status === "active") {
    return {
      icon: CheckCircle2,
      label: "Active",
      className:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
      helper: "Approved — visible to couples in the public directory.",
    };
  }

  if (status === "declined") {
    return {
      icon: XCircle,
      label: "Declined",
      className: "bg-destructive/10 text-destructive border-destructive/30",
      helper: "Not approved by admin — update the listing and resubmit it.",
    };
  }

  return {
    icon: Clock,
    label: "Pending review",
    className:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
    helper: "Awaiting admin approval before it goes live in the directory.",
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

/** Formats an ISO date for card meta; legacy records without one show an em dash. */
function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function VendorMyServicesPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [services, setServices] = React.useState<IService[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);

  /** Ids with an in-flight availability or delete request, used to disable their controls. */
  const [updatingIds, setUpdatingIds] = React.useState<string[]>([]);

  const [statusFilter, setStatusFilter] = React.useState<"All" | ServiceStatus>(
    "All"
  );
  const [search, setSearch] = React.useState("");

  const [viewingId, setViewingId] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(
    null
  );

  const viewing = viewingId
    ? services.find((service) => service._id === viewingId) ?? null
    : null;

  const editing = editingId
    ? services.find((service) => service._id === editingId) ?? null
    : null;

  const userId = session?.user?.id;
  const token = session?.session?.token;

  /** Loads every service then keeps only the ones owned by the signed-in vendor. */
  React.useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const all = await clientApi.get<IService[]>(
          `/services?vendorId=${encodeURIComponent(userId)}`
        ,token as string);
        if (cancelled) return;

        setServices(all.filter((service) => service.vendorId === userId));
      } catch (err: unknown) {
        if (cancelled) return;

        const message =
          err instanceof Error ? err.message : "Failed to load your services.";

        setLoadError(message);
        toast.add({
          type: "error",
          title: "Could not load your services",
          description: message,
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, reloadKey]);

  const isAvailable = (service: IService) => service.isAvailable !== false;

  const isUpdating = (service: IService) =>
    updatingIds.includes(service._id);

  const totalImages = services.reduce(
    (count, service) => count + (service.imageUrls?.length ?? 0),
    0
  );

  const counts = {
    total: services.length,
    active: services.filter((s) => getStatus(s) === "active").length,
    pending: services.filter((s) => getStatus(s) === "pending").length,
    declined: services.filter((s) => getStatus(s) === "declined").length,
  };

  const query = search.trim().toLowerCase();
  const visibleServices = services.filter((service) => {
    const matchesStatus =
      statusFilter === "All" || getStatus(service) === statusFilter;

    if (!matchesStatus) return false;
    if (!query) return true;

    const categoryLabel =
      CATEGORY_LABELS[service.category] ?? String(service.category ?? "");

    return (
      service.title?.toLowerCase().includes(query) ||
      categoryLabel.toLowerCase().includes(query) ||
      service.description?.toLowerCase().includes(query)
    );
  });

  const hasFilters = statusFilter !== "All" || query.length > 0;

  /** Persists an availability flip, reverting the optimistic update if the API fails. */
  const toggleAvailability = async (service: IService) => {
    if (isUpdating(service)) return;

    const next = !isAvailable(service);

    setUpdatingIds((prev) => [...prev, service._id]);
    setServices((prev) =>
      prev.map((item) =>
        item._id === service._id ? { ...item, isAvailable: next } : item
      )
    );

    try {
      await clientApi.put<IService>(`/services/${service._id}`,token as string, {
        isAvailable: next,
      });

      toast.add({
        type: next ? "success" : "info",
        title: next ? "Marked as available" : "Marked as unavailable",
        description: `“${service.title}” is now ${
          next ? "open for bookings" : "hidden from new bookings"
        }.`,
      });
    } catch (err: unknown) {
      setServices((prev) =>
        prev.map((item) =>
          item._id === service._id
            ? { ...item, isAvailable: service.isAvailable }
            : item
        )
      );

      toast.add({
        type: "error",
        title: "Could not update availability",
        description:
          err instanceof Error ? err.message : "Please try again in a moment.",
      });
    } finally {
      setUpdatingIds((prev) => prev.filter((id) => id !== service._id));
    }
  };

  /** Deletes a service through the API, then drops it from the list. */
  const handleDelete = async (service: IService) => {
    if (isUpdating(service)) return;

    setUpdatingIds((prev) => [...prev, service._id]);

    try {
      await clientApi.delete<{ success: boolean; deletedId: string }>(
        `/services/${service._id}`
      ,token as string);

      setServices((prev) => prev.filter((s) => s._id !== service._id));
      setPendingDeleteId(null);
      if (viewingId === service._id) setViewingId(null);
      if (editingId === service._id) setEditingId(null);

      toast.add({
        type: "success",
        title: "Service deleted",
        description: `“${service.title}” was removed from your listings.`,
      });
    } catch (err: unknown) {
      toast.add({
        type: "error",
        title: "Could not delete service",
        description:
          err instanceof Error ? err.message : "Please try again in a moment.",
      });
    } finally {
      setUpdatingIds((prev) => prev.filter((id) => id !== service._id));
    }
  };

  /**
   * Saves edited fields through the API and merges the saved record into state.
   * Returns false so the edit sheet can stay open when the request fails.
   */
  const handleUpdate = async (changes: {
    title: string;
    category: IServiceCategory;
    price: number;
    description: string;
  }): Promise<boolean> => {
    if (!editing) return false;

    const id = editing._id;

    try {
      const saved = await clientApi.put<IService>(`/services/${id}`,session?.session?.token as string, changes);

      setServices((prev) =>
        prev.map((service) =>
          service._id === id
            ? { ...service, ...changes, ...(saved?._id ? saved : {}) }
            : service
        )
      );
      setEditingId(null);

      toast.add({
        type: "success",
        title: "Service updated",
        description: `“${changes.title}” has been saved.`,
      });

      return true;
    } catch (err: unknown) {
      toast.add({
        type: "error",
        title: "Could not update service",
        description:
          err instanceof Error ? err.message : "Please try again in a moment.",
      });

      return false;
    }
  };

  const isLoading = sessionLoading || (Boolean(userId) && loading);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My Services
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your wedding packages, pricing, availability and directory
            approval status
          </p>
        </div>
        <Link
          href="/dashboard/vendor/add-service"
          className={cn(
            buttonVariants({ variant: "default" }),
            "gap-2 bg-[#99616E] hover:bg-[#824E5B] text-white shadow-xs"
          )}
        >
          <PlusCircle className="size-4" />
          <span>Add New Service</span>
        </Link>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryTile
          label="Total Services"
          value={counts.total}
          icon={Store}
          tone="brand"
          loading={isLoading}
        />
        <SummaryTile
          label="Active"
          value={counts.active}
          icon={CheckCircle2}
          tone="emerald"
          loading={isLoading}
        />
        <SummaryTile
          label="Pending Approval"
          value={counts.pending}
          icon={Clock}
          tone="amber"
          loading={isLoading}
        />
        <SummaryTile
          label="Gallery Photos"
          value={totalImages}
          icon={Images}
          tone="muted"
          loading={isLoading}
        />
      </div>

      {/* Search + status filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, category or description…"
            aria-label="Search your services"
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_FILTERS.map((filter) => {
            const active = statusFilter === filter;
            const count =
              filter === "All" ? counts.total : counts[filter.toLowerCase() as "active" | "pending" | "declined"];

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-[#99616E] bg-[#99616E] text-white"
                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span>{filter === "pending" ? "Pending" : filter}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[10px] font-semibold",
                    active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="overflow-hidden border-border">
              <Skeleton className="aspect-[16/9] w-full rounded-none" />
              <CardContent className="space-y-3 p-5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && loadError && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-4 shrink-0 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  We couldn&apos;t load your services
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{loadError}</p>
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

      {/* Empty states */}
      {!isLoading && !loadError && visibleServices.length === 0 && (
        <Card className="border-dashed border-border">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#99616E]/10 text-[#99616E]">
              <Store className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {hasFilters ? "No services match your filters" : "No services yet"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {hasFilters
                  ? "Try a different search term or clear the status filter to see all of your listings."
                  : "Publish your first wedding package to start appearing in the WedPlan directory."}
              </p>
            </div>
            {hasFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Link
                href="/dashboard/vendor/add-service"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "gap-2 bg-[#99616E] hover:bg-[#824E5B] text-white"
                )}
              >
                <PlusCircle className="size-4" />
                Add New Service
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Service cards */}
      {!isLoading && !loadError && visibleServices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {visibleServices.map((service) => {
            const status = getStatus(service);
            const meta = statusMeta(status);
            const StatusIcon = meta.icon;
            const CategoryIcon =
              CATEGORY_ICONS[service.category] ?? ClipboardList;
            const available = isAvailable(service);
            const updating = isUpdating(service);
            const images = service.imageUrls ?? [];
            const confirmingDelete = pendingDeleteId === service._id;

            return (
              <Card
                key={service._id}
                className="group flex flex-col overflow-hidden border-border shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Cover image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                  {images[0] ? (
                    <Image
                      src={images[0]}
                      alt={service.title || "Service photo"}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground/70">
                      <CategoryIcon className="size-8" />
                      <span className="text-[11px] font-medium">
                        No photos uploaded
                      </span>
                    </div>
                  )}

                  {/* Approval status */}
                  <span
                    className={cn(
                      "absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border bg-background/90 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-xs",
                      meta.className
                    )}
                  >
                    <StatusIcon className="size-3" />
                    {meta.label}
                  </span>

                  {images.length > 1 && (
                    <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                      <Images className="size-3" />
                      {images.length}
                    </span>
                  )}
                </div>

                <CardHeader className="flex-1 gap-2 pb-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#99616E]">
                    <CategoryIcon className="size-3" />
                    <span>
                      {CATEGORY_LABELS[service.category] ??
                        String(service.category)}
                    </span>
                  </div>

                  <CardTitle className="text-base font-semibold leading-snug line-clamp-2">
                    {service.title || "Untitled service"}
                  </CardTitle>

                  <CardDescription className="line-clamp-2 text-xs">
                    {service.description || "No description provided."}
                  </CardDescription>

                  <p className="text-sm font-semibold text-foreground pt-0.5">
                    Starting at{" "}
                    <span className="text-[#99616E]">
                      {formatPrice(service.price)}
                    </span>
                  </p>
                </CardHeader>

                <CardContent className="space-y-3 border-t border-border pt-3">
                  {/* Availability control */}
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          available ? "bg-emerald-600" : "bg-muted-foreground/60"
                        )}
                      />
                      <span className="text-xs font-medium text-foreground truncate">
                        {available ? "Available for bookings" : "Unavailable"}
                      </span>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={available}
                      aria-busy={updating}
                      aria-label={`Toggle availability for ${service.title}`}
                      disabled={updating}
                      onClick={() => toggleAvailability(service)}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors outline-none",
                        "focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60",
                        available
                          ? "border-emerald-600 bg-emerald-600"
                          : "border-border bg-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none block size-4 rounded-full bg-white shadow-sm transition-transform",
                          available ? "translate-x-4" : "translate-x-0.5"
                        )}
                      />
                    </button>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" />
                      Listed {formatDate(service.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Images className="size-3.5" />
                      {images.length} photo{images.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  {/* Actions */}
                  {confirmingDelete ? (
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-2.5 py-2">
                      <span className="text-xs font-medium text-destructive">
                        Delete this service?
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => setPendingDeleteId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          size="xs"
                          disabled={updating}
                          onClick={() => handleDelete(service)}
                          className="gap-1"
                        >
                          {updating && (
                            <Loader2 className="size-3 animate-spin" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5"
                        onClick={() => setViewingId(service._id)}
                      >
                        <Eye className="size-3.5" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5"
                        onClick={() => setEditingId(service._id)}
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${service.title}`}
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setPendingDeleteId(service._id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Details panel */}
      {viewing && (
        <ServiceDetailsSheet
          key={`view-${viewing._id}`}
          service={viewing}
          onClose={() => setViewingId(null)}
          onEdit={() => {
            setEditingId(viewing._id);
            setViewingId(null);
          }}
        />
      )}

      {/* Edit panel */}
      {editing && (
        <EditServiceSheet
          key={`edit-${editing._id}`}
          service={editing}
          onClose={() => setEditingId(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}

interface SummaryTileProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "brand" | "emerald" | "amber" | "muted";
  loading?: boolean;
}

/** Compact metric tile used above the service grid. */
function SummaryTile({ label, value, icon: Icon, tone, loading }: SummaryTileProps) {
  const tones = {
    brand: "bg-[#99616E]/10 text-[#99616E]",
    emerald: "bg-emerald-500/10 text-emerald-600",
    amber: "bg-amber-500/10 text-amber-600",
    muted: "bg-muted text-muted-foreground",
  } as const;

  return (
    <Card className="border-border">
      <CardContent className="flex items-center justify-between gap-2 p-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          {loading ? (
            <Skeleton className="mt-1.5 h-6 w-10" />
          ) : (
            <p className="mt-1 text-xl font-bold tracking-tight text-foreground">
              {value}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            tones[tone]
          )}
        >
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  );
}

interface ServiceDetailsSheetProps {
  service: IService;
  onClose: () => void;
  onEdit: () => void;
}

/** Read-only side panel listing every field captured by the add-service form. */
function ServiceDetailsSheet({
  service,
  onClose,
  onEdit,
}: ServiceDetailsSheetProps) {
  const images = service.imageUrls ?? [];
  const available = service.isAvailable !== false;
  const status = getStatus(service);
  const meta = statusMeta(status);
  const StatusIcon = meta.icon;
  const CategoryIcon = CATEGORY_ICONS[service.category] ?? ClipboardList;

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="border-b border-border pr-12">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#99616E]">
            <CategoryIcon className="size-3" />
            {CATEGORY_LABELS[service.category] ?? String(service.category)}
          </div>
          <SheetTitle className="text-base leading-snug">
            {service.title || "Untitled service"}
          </SheetTitle>
          <span
            className={cn(
              "mt-1 inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
              meta.className
            )}
          >
            <StatusIcon className="size-3" />
            {meta.label}
          </span>
          <SheetDescription className="pt-1">
            {meta.helper}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          {/* Gallery */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Gallery ({images.length})
            </p>

            {images.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border text-muted-foreground/70">
                <Images className="size-6" />
                <span className="text-[11px]">No photos uploaded</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {images.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className={cn(
                      "relative overflow-hidden rounded-lg border border-border bg-muted",
                      index === 0 ? "col-span-2 aspect-video" : "aspect-square"
                    )}
                  >
                    <Image
                      src={url}
                      alt={`${service.title} photo ${index + 1}`}
                      fill
                      sizes="(max-width: 640px) 50vw, 320px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="rounded-lg border border-[#99616E]/20 bg-[#99616E]/5 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Base starting price
            </p>
            <p className="mt-0.5 text-xl font-bold text-[#99616E]">
              {formatPrice(service.price)}
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Package description
            </p>
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
              {service.description || "No description provided."}
            </p>
          </div>

          {/* Meta */}
          <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3 text-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Availability</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 font-medium",
                  available
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    available ? "bg-emerald-600" : "bg-muted-foreground/60"
                  )}
                />
                {available ? "Available for bookings" : "Unavailable"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Listed on</span>
              <span className="font-medium text-foreground">
                {formatDate(service.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Vendor email</span>
              <span className="max-w-[65%] truncate font-medium text-foreground">
                {service.vendorEmail || "—"}
              </span>
            </div>
          </div>
        </div>

        <SheetFooter className="border-t border-border">
          <Button
            className="gap-2 bg-[#99616E] hover:bg-[#824E5B] text-white"
            onClick={onEdit}
          >
            <Pencil className="size-4" />
            Edit service
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

interface EditServiceSheetProps {
  service: IService;
  onClose: () => void;
  onSave: (changes: {
    title: string;
    category: IServiceCategory;
    price: number;
    description: string;
  }) => Promise<boolean>;
}

/** Side panel form for updating the editable fields of a listing. */
function EditServiceSheet({ service, onClose, onSave }: EditServiceSheetProps) {
  const [title, setTitle] = React.useState(service.title ?? "");
  const [category, setCategory] = React.useState<IServiceCategory>(
    service.category ?? "Photography"
  );
  const [price, setPrice] = React.useState(
    typeof service.price === "number" ? String(service.price) : ""
  );
  const [description, setDescription] = React.useState(
    service.description ?? ""
  );
  const [saving, setSaving] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextPrice = Number(price);
    if (!title.trim() || Number.isNaN(nextPrice)) {
      toast.add({
        type: "error",
        title: "Invalid service details",
        description: "A title and a valid price are required.",
      });
      return;
    }

    setSaving(true);

    const saved = await onSave({
      title: title.trim(),
      category,
      price: nextPrice,
      description: description.trim(),
    });

    // On success the panel unmounts, so only reset the flag when saving failed.
    if (!saved) setSaving(false);
  };

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="border-b border-border pr-12">
          <SheetTitle className="text-base">Update service</SheetTitle>
          <SheetDescription>
            Adjust the details couples see in the directory.
          </SheetDescription>
        </SheetHeader>

        <form
          id="update-service-form"
          onSubmit={handleSubmit}
          className="flex-1 space-y-4 overflow-y-auto p-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Service Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Full Day Cinematic Wedding Videography"
              disabled={saving}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-category">Service Category</Label>
              <select
                id="edit-category"
                value={category}
                disabled={saving}
                onChange={(event) =>
                  setCategory(event.target.value as IServiceCategory)
                }
                className="w-full h-9 px-3 rounded-lg border border-input bg-transparent text-sm shadow-xs focus:ring-2 focus:ring-[#99616E]/30 outline-none"
              >
                {CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {CATEGORY_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-price">Base Starting Price ($)</Label>
              <Input
                id="edit-price"
                type="number"
                min={0}
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="e.g. 1500"
                disabled={saving}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-description">
              Package Description &amp; Inclusions
            </Label>
            <textarea
              id="edit-description"
              rows={6}
              value={description}
              disabled={saving}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe what is included in this package…"
              className="w-full p-3 rounded-lg border border-input bg-transparent text-sm shadow-xs focus:ring-2 focus:ring-[#99616E]/30 outline-none resize-y"
            />
          </div>

          <p className="text-[11px] text-muted-foreground">
            Gallery photos and approval status can&apos;t be changed here — re-upload
            photos from a new listing if needed.
          </p>
        </form>

        <SheetFooter className="border-t border-border flex-row justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="update-service-form"
            disabled={saving}
            className="gap-2 bg-[#99616E] hover:bg-[#824E5B] text-white"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
