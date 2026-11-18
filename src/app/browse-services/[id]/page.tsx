import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  FileText,
  Images,
  Mail,
  MapPin,
  Sparkles,
  Store,
} from "lucide-react";

import { clientApi } from "@/lib/api/clientApi";
import { CATEGORY_META } from "@/lib/service-categories";
import type { IService } from "@/lib/types";
import BookingPanel from "./booking-panel";
import ServiceGallery from "./service-gallery";

interface ServiceDetailsPageProps {
  params: Promise<{ id: string }>;
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

/** Formats an ISO date for the listing metadata, or returns null when invalid. */
function formatDate(value: string | undefined) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/** Prefers an explicit vendor name, otherwise humanises the email local part. */
function getVendorName(service: IService) {
  const explicit = service.vendorName?.trim();
  if (explicit) return explicit;

  const localPart = service.vendorEmail?.split("@")[0] ?? "";
  const cleaned = localPart
    .replace(/[._-]+/g, " ")
    .replace(/\d+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "WedPlan Vendor";

  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Builds two-letter initials for the vendor avatar. */
function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

/** Status pill copy and colours for the listing. */
function getStatusMeta(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "active") {
    return {
      label: "Active listing",
      className:
        "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      dot: "bg-emerald-600 dark:bg-emerald-400",
    };
  }

  if (normalized === "declined") {
    return {
      label: "Not listed",
      className: "border-destructive/25 bg-destructive/10 text-destructive",
      dot: "bg-destructive",
    };
  }

  return {
    label: "Pending review",
    className:
      "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  };
}

export async function generateMetadata({
  params,
}: ServiceDetailsPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const service = await clientApi.get<IService>(
      `/services/${encodeURIComponent(id)}`
    );

    return {
      title: `${service.title || "Service"} — WedPlan`,
      description: service.description?.slice(0, 160),
    };
  } catch {
    return { title: "Service not found — WedPlan" };
  }
}

export default async function ServiceDetailsPage({
  params,
}: ServiceDetailsPageProps) {
  const { id } = await params;

  let service: IService | null = null;

  try {
    service = await clientApi.get<IService>(`/services/${id}`);
  } catch (error) {
    console.error("Failed to fetch service details:", error);
  }

  if (!service) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="size-9" />
        </div>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
          Service unavailable
        </p>
        <h1 className="mt-2 font-serif text-3xl tracking-wide text-foreground sm:text-4xl">
          We couldn&apos;t find that service
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          The listing may have been removed or is no longer accepting enquiries.
          Explore the directory to discover other trusted wedding professionals.
        </p>
        <Link
          href="/browse-services"
          className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <ArrowLeft className="size-4" />
          Back to directory
        </Link>
      </div>
    );
  }

  const images = service.imageUrls ?? [];
  const categoryMeta = CATEGORY_META[service.category] ?? CATEGORY_META.planner;
  const CategoryIcon = categoryMeta.icon;
  const location = service.location?.trim() || "Location not provided";
  const listedOn = formatDate(service.createdAt);
  const vendorName = getVendorName(service);
  const initials = getInitials(vendorName);
  const normalizedStatus = String(service.status ?? "pending").toLowerCase();
  const statusMeta = getStatusMeta(normalizedStatus);
  const available =
    normalizedStatus === "active" && service.isAvailable !== false;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/browse-services"
        className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-3.5" />
        Back to directory
      </Link>

      {/* Heading */}
      <header className="relative mt-5 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[#F5F1F6] via-[#FAF8FA] to-[#EFE7F1] px-6 py-8 sm:px-10 sm:py-10 dark:from-[#2E252C] dark:via-[#221B20] dark:to-[#3B3040]">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-secondary/30 blur-3xl" />

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              <CategoryIcon className="size-3" />
              {categoryMeta.label}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${statusMeta.className}`}
            >
              <span className={`size-1.5 rounded-full ${statusMeta.dot}`} />
              {statusMeta.label}
            </span>
          </div>

          <h1 className="mt-4 max-w-4xl font-serif text-3xl font-normal leading-tight tracking-[0.02em] text-foreground sm:text-5xl">
            {service.title || "Untitled service"}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 text-primary" />
              {location}
            </span>
            {listedOn && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4 text-primary" />
                Listed {listedOn}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Images className="size-4 text-primary" />
              {images.length} {images.length === 1 ? "photo" : "photos"}
            </span>
          </div>
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(19rem,1fr)] lg:items-start">
        <div className="space-y-8">
          <ServiceGallery
            images={images}
            title={service.title}
            categoryLabel={categoryMeta.label}
          />

          {/* Description */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              <FileText className="size-3.5" />
              The experience
            </div>
            <h2 className="mt-2 font-serif text-2xl tracking-wide text-foreground sm:text-3xl">
              About this service
            </h2>
            <div className="mt-4 h-px w-full bg-gradient-to-r from-primary/30 via-border to-transparent" />
            <p className="mt-5 whitespace-pre-line text-[15px] leading-7 text-muted-foreground">
              {service.description || "No description provided."}
            </p>

            <dl className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Category
                </dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {categoryMeta.label}
                </dd>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Location
                </dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {location}
                </dd>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Starting price
                </dt>
                <dd className="mt-1 text-sm font-medium text-primary">
                  {formatPrice(service.price)}
                </dd>
              </div>
            </dl>
          </section>

          {/* Vendor */}
          <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-6 py-4">
              <Store className="size-4 text-primary" />
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
                Vendor information
              </h2>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif text-xl font-semibold text-primary ring-1 ring-primary/20">
                    {initials || "WV"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif text-2xl tracking-wide text-foreground">
                      {vendorName}
                    </h3>
                    {service.vendorEmail && (
                      <a
                        href={`mailto:${service.vendorEmail}`}
                        className="mt-1 inline-flex max-w-full items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        <Mail className="size-3.5 shrink-0" />
                        <span className="truncate">{service.vendorEmail}</span>
                      </a>
                    )}
                  </div>
                </div>

                {service.vendorEmail && (
                  <a
                    href={`mailto:${service.vendorEmail}?subject=${encodeURIComponent(
                      `Enquiry — ${service.title || "WedPlan service"}`
                    )}`}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:bg-primary/10"
                  >
                    <Mail className="size-3.5" />
                    Contact vendor
                  </a>
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex items-start gap-2.5 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Listing
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">
                      {normalizedStatus === "active"
                        ? "Admin approved"
                        : statusMeta.label}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Service area
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">
                      {location}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                  <Images className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Portfolio
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">
                      {images.length} {images.length === 1 ? "photo" : "photos"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Booking */}
        <aside className="lg:sticky lg:top-24">
          <BookingPanel
            serviceTitle={service.title}
            priceLabel={formatPrice(service.price)}
            vendorEmail={service.vendorEmail}
            available={available}
          />
        </aside>
      </div>
    </div>
  );
}
