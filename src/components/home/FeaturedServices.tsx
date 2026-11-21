import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Images,
  Store,
} from "lucide-react";
import type { IService } from "@/lib/types";
import { CATEGORY_META } from "@/lib/service-categories";

interface FeaturedServicesProps {
  services: IService[];
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

/**
 * Editorial fallback items used when the database has fewer than 3 services,
 * ensuring the featured showcase always looks breathtaking on initial deploy.
 */
const FALLBACK_FEATURED: IService[] = [
  {
    _id: "preview-1",
    title: "Golden Hour Cinematic Wedding Film & Photography",
    category: "photography",
    price: 3200,
    description:
      "Capturing raw emotion, timeless portraiture, and golden hour magic. Full-day documentary wedding coverage with drone cinematography.",
    imageUrls: ["https://i.ibb.co.com/GvpJ297L/download-13.jpg"],
    location: "New York, NY",
    vendorName: "Lumière Wedding Studios",
    vendorId: "preview-vendor-1",
    vendorEmail: "lumiere@wedplan.com",
    createdAt: new Date().toISOString(),
    status: "active",
    isAvailable: true,
  },
  {
    _id: "preview-2",
    title: "The Glasshouse Botanical Garden & Estate",
    category: "venue",
    price: 8500,
    description:
      "A sunlit conservatory surrounded by romantic blooming rose gardens, antique stone pergolas, and full-service banquet facilities.",
    imageUrls: ["https://i.ibb.co.com/Xk6L42dx/download-8.jpg"],
    location: "Hudson Valley, NY",
    vendorName: "Belvedere Manor & Gardens",
    vendorId: "preview-vendor-2",
    vendorEmail: "belvedere@wedplan.com",
    createdAt: new Date().toISOString(),
    status: "active",
    isAvailable: true,
  },
  {
    _id: "preview-3",
    title: "Ethereal Garden Floral Arches & Centerpieces",
    category: "floral",
    price: 2400,
    description:
      "Artisanal garden roses, cascading ranunculus, and delicate seasonal greenery designed to frame your ceremony aisle in pure romance.",
    imageUrls: [
      "https://i.ibb.co.com/nNnCYdG8/Burgundy-Wedding-Aisle-Decor-Deep-Berry-Rose-Petals-Flower-Girl-Basket-Wine-Red-Wedding-Ceremony-E.jpg",
    ],
    location: "Brooklyn, NY",
    vendorName: "Petals & Poetry Floral Atelier",
    vendorId: "preview-vendor-3",
    vendorEmail: "petals@wedplan.com",
    createdAt: new Date().toISOString(),
    status: "active",
    isAvailable: true,
  },
];

export default function FeaturedServices({ services }: FeaturedServicesProps) {
  // Only display active status services; fallback to editorial preview if none found
  const activeServices = (services ?? []).filter((s) => s.status === "active");
  const displayItems =
    activeServices.length > 0 ? activeServices.slice(0, 6) : FALLBACK_FEATURED;

  return (
    <section className="relative w-full py-20 lg:py-28 bg-[#FAF8FA] dark:bg-[#191417] overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 -right-40 size-96 rounded-full bg-[#C4B6D0]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 size-96 rounded-full bg-[#99616E]/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C4B6D0] bg-[#C4B6D0]/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-[#99616E]">
            <Sparkles className="size-3.5 text-[#99616E]" />
            <span>Curated Vendor Spotlight</span>
          </div>

          <h2 className="text-3xl font-serif tracking-tight text-[#2A1F25] dark:text-[#F5EFF3] sm:text-5xl font-normal leading-tight">
            Featured <span className="italic text-[#99616E]">Wedding Services</span>
          </h2>

          <p className="text-sm sm:text-base leading-relaxed text-[#756770] dark:text-[#A797A2] max-w-2xl">
            Handpicked premier venues, award-winning photographers, and artisanal florists
            ready to bring your romantic celebration to life with extraordinary precision.
          </p>
        </div>

        {/* Services Grid */}
        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {displayItems.map((service, index) => {
            const isPreview = service._id.startsWith("preview-");
            const href = isPreview
              ? "/browse-services"
              : `/browse-services/${service._id}`;
            const images = service.imageUrls ?? [];
            const cover = images[0] || "https://i.ibb.co.com/GvpJ297L/download-13.jpg";
            const meta =
              CATEGORY_META[service.category as keyof typeof CATEGORY_META] ??
              CATEGORY_META.planner;
            const CategoryIcon = meta.icon;
            const available = service.isAvailable !== false;
            const vendorDisplayName =
              service.vendorName ||
              service.vendorEmail?.split("@")[0] ||
              "Verified Vendor";

            return (
              <Link
                key={service._id ?? `service-${index}`}
                href={href}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#D2D3D0]/80 dark:border-[#423940] bg-white dark:bg-[#221B20] shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#99616E]/40 hover:shadow-xl hover:shadow-[#99616E]/10 outline-none"
              >
                {/* Image Wrap */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  <Image
                    src={cover}
                    alt={service.title || "Wedding service photo"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Gradient shadow overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Category Pill */}
                  <span className="absolute left-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                    <CategoryIcon className="size-3" />
                    <span>{meta.label}</span>
                  </span>

                  {/* Multi-photo indicator */}
                  {images.length > 1 && (
                    <span className="absolute right-3.5 top-3.5 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md">
                      <Images className="size-3" />
                      <span>{images.length}</span>
                    </span>
                  )}

                  {/* Hover arrow button */}
                  <span className="absolute bottom-3.5 right-3.5 flex size-9 translate-y-2 items-center justify-center rounded-full bg-white text-[#99616E] opacity-0 shadow-md backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <ArrowUpRight className="size-4.5" />
                  </span>

                  {/* Vendor Name on cover bottom */}
                  <div className="absolute bottom-3.5 left-3.5 flex items-center gap-1.5 text-xs text-white/95 font-medium drop-shadow-sm">
                    <Store className="size-3.5 text-[#C4B6D0]" />
                    <span className="truncate max-w-[200px]">{vendorDisplayName}</span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="flex flex-1 flex-col p-6 space-y-4">
                  {/* Location & Status row */}
                  <div className="flex items-center justify-between text-xs text-[#756770] dark:text-[#A797A2]">
                    <span className="inline-flex items-center gap-1.5 truncate max-w-[65%]">
                      <MapPin className="size-3.5 text-[#99616E] shrink-0" />
                      <span className="truncate">{service.location || "Available Nationwide"}</span>
                    </span>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        available
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          available ? "bg-emerald-600 dark:bg-emerald-400" : "bg-muted-foreground/60"
                        }`}
                      />
                      {available ? "Available" : "Unavailable"}
                    </span>
                  </div>

                  {/* Service Title */}
                  <h3 className="font-serif text-xl font-normal leading-snug tracking-wide text-[#2A1F25] dark:text-[#F5EFF3] line-clamp-2 group-hover:text-[#99616E] transition-colors">
                    {service.title || "Untitled Wedding Service"}
                  </h3>

                  {/* Short Description */}
                  <p className="line-clamp-2 text-xs leading-relaxed text-[#756770] dark:text-[#A797A2]">
                    {service.description || "Delivering unparalleled craftsmanship and personalized wedding experiences."}
                  </p>

                  {/* Price & Action Footer */}
                  <div className="mt-auto pt-4 border-t border-[#D2D3D0]/60 dark:border-[#423940]/60 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#756770] dark:text-[#A797A2]">
                        Starting from
                      </p>
                      <p className="font-serif text-2xl font-semibold text-[#99616E]">
                        {formatPrice(service.price)}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#99616E] group-hover:translate-x-0.5 transition-transform">
                      <span>Explore</span>
                      <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All CTA */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <Link
            href="/browse-services"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#99616E] hover:bg-[#824E5B] px-8 text-xs font-semibold uppercase tracking-wider text-white shadow-md shadow-[#99616E]/20 transition-all hover:shadow-lg hover:shadow-[#99616E]/30 cursor-pointer"
          >
            <span>Explore All Wedding Services</span>
            <ArrowRight className="size-4" />
          </Link>
          <span className="text-xs text-[#756770] dark:text-[#A797A2]">
            Over 500+ curated packages available
          </span>
        </div>
      </div>
    </section>
  );
}
