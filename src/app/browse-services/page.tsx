export const dynamic = "force-dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  ChevronDown,
  Images,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { clientApi } from "@/lib/api/clientApi";
import { CATEGORY_META } from "@/lib/service-categories";
import type { IService } from "@/lib/types";

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
    <Link
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

const BrowseServicesPage = async () => {
  let services: IService[] = [];
  let hasError = false;

  try {
    const res: IService[] = await clientApi.get(`/services?status=active`);
    services = res ?? [];
  } catch (error) {
    hasError = true;
    console.error("Failed to fetch services:", error);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Heading */}
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
              available
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
              Hand-picked professionals
            </span>
          </div>

          {/* Filter bar — UI only */}
          <div className="mt-6 rounded-2xl border border-border/70 bg-background/70 p-2.5 shadow-lg shadow-primary/5 backdrop-blur-md sm:p-3">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_11.5rem_11.5rem_auto] lg:items-center">
              {/* Search by name */}
              <div className="flex h-12 items-center gap-2.5 rounded-xl bg-card/80 px-3.5 ring-1 ring-border/60 transition focus-within:ring-2 focus-within:ring-primary/40 sm:col-span-2 sm:h-[3.25rem] lg:col-span-1 lg:h-11 lg:px-3">
                <Search className="size-4 shrink-0 text-primary sm:size-[18px] lg:size-4" />
                <input
                  type="text"
                  aria-label="Search services by name"
                  placeholder="Search services by name…"
                  className="h-full w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground/70 sm:text-base lg:text-sm"
                />
              </div>

              {/* Category filter */}
              <div className="relative flex h-12 items-center rounded-xl bg-card/80 ring-1 ring-border/60 transition focus-within:ring-2 focus-within:ring-primary/40 sm:h-[3.25rem] lg:h-11">
                <SlidersHorizontal className="pointer-events-none absolute left-3.5 size-4 shrink-0 text-primary sm:size-[18px] lg:left-3 lg:size-4" />
                <select
                  aria-label="Filter by category"
                  defaultValue=""
                  className="h-full w-full appearance-none bg-transparent pl-10 pr-9 text-[15px] text-foreground outline-none sm:text-base lg:pl-9 lg:text-sm"
                >
                  <option value="">All categories</option>
                  {Object.entries(CATEGORY_META).map(([value, meta]) => (
                    <option key={value} value={value}>
                      {meta.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 size-3.5 text-muted-foreground sm:size-4 lg:right-3 lg:size-3.5" />
              </div>

              {/* Location filter */}
              <div className="flex h-12 items-center gap-2.5 rounded-xl bg-card/80 px-3.5 ring-1 ring-border/60 transition focus-within:ring-2 focus-within:ring-primary/40 sm:h-[3.25rem] lg:h-11 lg:px-3">
                <MapPin className="size-4 shrink-0 text-primary sm:size-[18px] lg:size-4" />
                <input
                  type="text"
                  aria-label="Filter by location"
                  placeholder="Location or city"
                  className="h-full w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground/70 sm:text-base lg:text-sm"
                />
              </div>

              <button
                type="button"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:col-span-2 sm:h-[3.25rem] lg:col-span-1 lg:h-11 lg:px-5"
              >
                <Search className="size-3.5 sm:size-4 lg:size-3.5" />
                Search
              </button>
            </div>
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
              <Sparkles className="size-7" />
            </div>
            <h2 className="mt-5 font-serif text-2xl tracking-wide text-foreground">
              No services listed yet
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Our vendors are still preparing their packages. Check back soon to
              discover the perfect match for your wedding.
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default BrowseServicesPage;
