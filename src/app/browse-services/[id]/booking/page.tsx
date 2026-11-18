import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarHeart,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { clientApi } from "@/lib/api/clientApi";
import { CATEGORY_META } from "@/lib/service-categories";
import type { IService, IServiceCategory } from "@/lib/types";
import BookingForm from "./booking-form";

interface BookingPageProps {
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

export async function generateMetadata({
  params,
}: BookingPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const service = await clientApi.get<IService>(
      `/services/${encodeURIComponent(id)}`
    );

    return {
      title: `Book ${service.title || "Service"} — WedPlan`,
      description: `Reserve your wedding date for ${service.title}. Direct vendor confirmation.`,
    };
  } catch {
    return { title: "Book Service — WedPlan" };
  }
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { id } = await params;

  let service: IService | null = null;

  try {
    service = await clientApi.get<IService>(`/services/${id}`);
  } catch (error) {
    console.error("Failed to fetch service for booking:", error);
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
          Explore our directory to find other wedding vendors.
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

  const categoryKey = (service.category?.toLowerCase() ?? "planner") as IServiceCategory;
  const categoryMeta = CATEGORY_META[categoryKey] ?? CATEGORY_META.planner;
  const CategoryIcon = categoryMeta.icon;
  const location = service.location?.trim() || "Location provided on confirmation";
  const vendorName = getVendorName(service);
  const priceDisplay = formatPrice(service.price);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Navigation Breadcrumb */}
      <Link
        href={`/browse-services/${id}`}
        className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-3.5" />
        Back to service details
      </Link>

      {/* Header Banner */}
      <header className="relative mt-5 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[#F5F1F6] via-[#FAF8FA] to-[#EFE7F1] px-6 py-8 sm:px-10 sm:py-9 dark:from-[#2E252C] dark:via-[#221B20] dark:to-[#3B3040]">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-secondary/30 blur-3xl" />

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              <CategoryIcon className="size-3" />
              {categoryMeta.label}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">
              <CalendarHeart className="size-3" />
              Booking Request
            </span>
          </div>

          <h1 className="mt-4 max-w-4xl font-serif text-3xl font-normal leading-tight tracking-[0.02em] text-foreground sm:text-4xl">
            Request Booking for {service.title}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Complete the form below with your wedding details to request reservation
            and direct availability confirmation.
          </p>
        </div>
      </header>

      {/* Content Layout: Form (Left) & Service Summary (Right) */}
      <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* Main Booking Form */}
        <div className="lg:col-span-7 xl:col-span-8">
          <BookingForm service={service} vendorName={vendorName} />
        </div>

        {/* Service Details & Summary Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:col-span-5 xl:col-span-4">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            {/* Cover image preview */}
            {/* {coverImage && (
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                <Image
                  src={coverImage}
                  alt={service.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 380px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-xs">
                    <CategoryIcon className="size-3" />
                    {categoryMeta.label}
                  </span>
                </div>
              </div>
            )} */}

            <div className="p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Selected Package
              </p>
              <h2 className="mt-1 font-serif text-xl font-normal text-foreground">
                {service.title}
              </h2>

              <div className="mt-4 flex items-baseline justify-between border-border/70 py-3">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Starting Price
                </span>
                <span className="font-serif text-2xl font-semibold text-primary">
                  {priceDisplay}
                </span>
              </div>

              {/* Service details list */}
              <div className="mt-4 space-y-2.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="size-3.5 shrink-0 text-primary" />
                  <span>{location}</span>
                </div>
                {service.description && (
                  <p className="line-clamp-3 pt-1 text-[11px] leading-relaxed text-muted-foreground italic">
                    &ldquo;{service.description}&rdquo;
                  </p>
                )}
              </div>



              {/* What happens next */}
              <div className="mt-6 space-y-3 border-t border-border/70 pt-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground">
                  Booking Process
                </p>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>Vendor reviews date availability and location</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>Direct proposal &amp; quote sent to your email</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span>No deposit required until contract agreement</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
