export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  FilterX,
  Images,
  Sparkles,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { clientApi } from "@/lib/api/clientApi";
import { CATEGORY_META } from "@/lib/service-categories";
import type { IService } from "@/lib/types";
import { DirectoryFilters } from "./directory-filters";

/** Formats a numeric price as whole-dollar USD, falling back to an em dash. */
function formatPrice(price: number | undefined) {
  if (typeof price !== "number" || Number.isNaN(price)) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

/** Single directory card showing the cover photo, category, copy and price. */
function ServiceCard({ service }: { service: IService }) {
  const images = service.imageUrls ?? [];
  const cover = images[0];
  const available = service.isAvailable !== false;
  const meta = CATEGORY_META[service.category] ?? CATEGORY_META.planner;
  const CategoryIcon = meta.icon;

  return (
    <Link prefetch={false}
      href={`/browse-services/${service._id}`}
      className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="relative flex h-full flex-col gap-0 overflow-hidden rounded-2xl border-border/80 bg-card p-0 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-xl group-hover:shadow-primary/10">
        {/* Cover image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {cover ? (
            <Image
              src={cover}
              alt={service.title || "Service photo"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#F2EEF3] via-[#FAF8FA] to-[#E7DFEA] dark:from-[#2E252C] dark:via-[#221B20] dark:to-[#3B3040]">
              <CategoryIcon className="size-10 text-primary/40" />
            </div>
          )}

          {/* Editorial gradient so the category tag stays readable */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5" />

          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
            <CategoryIcon className="size-3" />
            {meta.label}
          </span>

          {images.length > 1 && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-md">
              <Images className="size-3" />
              {images.length}
            </span>
          )}

          <div className="absolute inset-x-3 bottom-3 h-0.5 w-10 bg-primary transition-all duration-500 group-hover:w-16" />

          <span className="absolute bottom-3 right-3 flex size-8 translate-y-1 items-center justify-center rounded-full bg-white/90 text-primary opacity-0 shadow-sm backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="size-4" />
          </span>
        </div>

        {/* Copy */}
        <div className="flex flex-1 flex-col p-5">
          <h2 className="font-serif text-xl font-normal leading-snug tracking-wide text-foreground line-clamp-2">
            {service.title || "Untitled service"}
          </h2>

          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {service.description || "No description provided."}
          </p>

          <div className="mt-auto pt-5">
            <div className="h-px w-full bg-gradient-to-r from-primary/30 via-border to-transparent" />

            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Starting from
                </p>
                <p className="font-serif text-2xl font-semibold text-primary">
                  {formatPrice(service.price)}
                </p>
              </div>

              <span
                className={
                  available
                    ? "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400"
                    : "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                }
              >
                <span
                  className={
                    available
                      ? "size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"
                      : "size-1.5 rounded-full bg-muted-foreground/60"
                  }
                />
                {available ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

interface PageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    location?: string;
    sort?: string;
  }>;
}

const BrowseServicesPage = async ({ searchParams }: PageProps) => {
  const params = (await searchParams) ?? {};
  const search = params.search?.trim() || "";
  const category = params.category?.trim() || "";
  const location = params.location?.trim() || "";
  const sort = params.sort?.trim() || "newest";

  let services: IService[] = [];
  let hasError = false;

  try {
    const query = new URLSearchParams();
    query.set("status", "active");
    if (search) query.set("search", search);
    if (category && category !== "all") query.set("category", category);
    if (location) query.set("location", location);
    if (sort) query.set("sort", sort);

    const res: IService[] = await clientApi.get(`/services?${query.toString()}`);
    services = res ?? [];
  } catch (error) {
    hasError = true;
    console.error("Failed to fetch services:", error);
  }

  const hasFiltersApplied = Boolean(
    search || (category && category !== "all") || location || (sort && sort !== "newest")
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header & Filter Controls */}
      <header className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[#F5F1F6] via-[#FAF8FA] to-[#EFE7F1] px-6 py-8 sm:px-10 sm:py-10 dark:from-[#2E252C] dark:via-[#221B20] dark:to-[#3B3040]">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-secondary/30 blur-3xl" />

        <div className="relative">
          <p className="font-serif text-2xl font-light italic tracking-wide text-primary sm:text-3xl">
            Curated for your celebration
          </p>

          <h1 className="mt-2 font-serif text-3xl uppercase leading-tight tracking-[0.1em] text-foreground sm:text-5xl">
            Vendor{" "}
            <span className="italic tracking-normal text-primary">
              Directory
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Explore trusted wedding professionals — from photographers and
            florists to venues and planners — ready to bring your day to life.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="size-3.5" />
              {services.length} {services.length === 1 ? "service" : "services"}{" "}
              {hasFiltersApplied ? "matching criteria" : "available"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
              Hand-picked professionals
            </span>
          </div>

          {/* Dynamic Interactive Filter & Sorting Bar */}
          <div className="mt-6">
            <DirectoryFilters
              initialSearch={search}
              initialCategory={category}
              initialLocation={location}
              initialSort={sort}
              totalResults={services.length}
            />
          </div>
        </div>
      </header>

      {hasError && (
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>
            We couldn&apos;t load the directory right now. Please refresh the
            page to try again.
          </p>
        </div>
      )}

      {services.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard
              key={service._id ?? `${service.title}-${index}`}
              service={service}
            />
          ))}
        </div>
      ) : (
        !hasError && (
          <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              {hasFiltersApplied ? (
                <FilterX className="size-7" />
              ) : (
                <Sparkles className="size-7" />
              )}
            </div>
            <h2 className="mt-5 font-serif text-2xl tracking-wide text-foreground">
              {hasFiltersApplied
                ? "No matching services found"
                : "No services listed yet"}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              {hasFiltersApplied
                ? "We couldn't find any services matching your search or filters. Try adjusting your keywords or clearing selected filters."
                : "Our vendors are still preparing their packages. Check back soon to discover the perfect match for your wedding."}
            </p>

            {hasFiltersApplied && (
              <div className="mt-6">
                <Link prefetch={false}
                  href="/browse-services"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                  Clear all filters
                </Link>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default BrowseServicesPage;
