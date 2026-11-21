import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  ClipboardList,
  Flower2,
  Landmark,
  Music,
  Shirt,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import type { IServiceCategory } from "@/lib/types";

interface CategoryCardItem {
  id: IServiceCategory;
  name: string;
  tagline: string;
  icon: typeof Sparkles;
  accentGradient: string;
  countLabel: string;
}

const CATEGORIES: CategoryCardItem[] = [
  {
    id: "photography",
    name: "Photography & Video",
    tagline: "Cinematic memories, candid tears & timeless frames",
    icon: Camera,
    accentGradient: "from-rose-500/10 via-primary/10 to-amber-500/5",
    countLabel: "Visual Artists",
  },
  {
    id: "venue",
    name: "Wedding Venues",
    tagline: "Grand ballrooms, sunlit barns & seaside pavilions",
    icon: Landmark,
    accentGradient: "from-amber-500/10 via-primary/10 to-purple-500/5",
    countLabel: "Exclusive Estates",
  },
  {
    id: "floral",
    name: "Floral & Styling",
    tagline: "Lush botanical arches, bouquets & table aesthetics",
    icon: Flower2,
    accentGradient: "from-emerald-500/10 via-primary/10 to-rose-500/5",
    countLabel: "Floral Designers",
  },
  {
    id: "catering",
    name: "Catering & Cakes",
    tagline: "Epicurean banquets, bespoke cocktails & pastries",
    icon: UtensilsCrossed,
    accentGradient: "from-orange-500/10 via-primary/10 to-amber-500/5",
    countLabel: "Master Chefs",
  },
  {
    id: "makeup",
    name: "Makeup & Hair",
    tagline: "Bridal glow, haute couture styling & wellness",
    icon: Sparkles,
    accentGradient: "from-pink-500/10 via-primary/10 to-violet-500/5",
    countLabel: "Beauty Artists",
  },
  {
    id: "fashion",
    name: "Wedding Fashion",
    tagline: "Designer gowns, bespoke tuxedos & accessories",
    icon: Shirt,
    accentGradient: "from-indigo-500/10 via-primary/10 to-pink-500/5",
    countLabel: "Couture Houses",
  },
  {
    id: "music",
    name: "Music & Live Bands",
    tagline: "Acoustic strings, soulful vocalists & club DJs",
    icon: Music,
    accentGradient: "from-violet-500/10 via-primary/10 to-cyan-500/5",
    countLabel: "Entertainers",
  },
  {
    id: "planner",
    name: "Wedding Planners",
    tagline: "Full-scale coordination, timelines & design direction",
    icon: ClipboardList,
    accentGradient: "from-teal-500/10 via-primary/10 to-primary/5",
    countLabel: "Pro Directors",
  },
];

export default function CategoryShowcase() {
  return (
    <section className="relative w-full overflow-hidden py-16 sm:py-24">
      {/* Background radial ambiance */}
      <div className="pointer-events-none absolute -left-40 top-1/4 size-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 size-96 rounded-full bg-secondary/20 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Sparkles className="size-3.5" />
            Curated Specializations
          </span>

          <h2 className="mt-4 font-serif text-3xl uppercase tracking-wide text-foreground sm:text-4xl lg:text-5xl">
            Explore By{" "}
            <span className="italic tracking-normal text-primary">
              Category
            </span>
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Select a wedding discipline below to browse verified vendors, compare bespoke packages, and find the perfect match for your big day.
          </p>
        </div>

        {/* Fancy Category Grid */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const targetUrl = `/browse-services?category=${cat.id}`;

            return (
              <Link
                key={cat.id}
                href={targetUrl}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-b from-card/90 via-card/70 to-card/40 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {/* Background accent glow on hover */}
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${cat.accentGradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                />

                {/* Shimmer top line */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/0 to-transparent transition-all duration-500 group-hover:via-primary/70" />

                <div className="relative">
                  {/* Top Bar: Icon + Corner Arrow */}
                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-primary shadow-xs transition-all duration-300 group-hover:scale-110 group-hover:border-primary/40 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-5" />
                    </div>

                    <span className="flex size-8 items-center justify-center rounded-full border border-border/40 bg-background/50 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </div>

                  {/* Category Details */}
                  <div className="mt-5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80">
                      {cat.countLabel}
                    </span>
                    <h3 className="mt-1 font-serif text-lg font-medium text-foreground transition-colors group-hover:text-primary sm:text-xl">
                      {cat.name}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {cat.tagline}
                    </p>
                  </div>
                </div>

                {/* Fancy Interactive Button Strip */}
                <div className="relative mt-5 pt-3">
                  <div className="h-px w-full bg-gradient-to-r from-border/80 via-border/40 to-transparent transition-colors group-hover:from-primary/30 group-hover:via-primary/20" />
                  <div className="mt-2.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-primary">
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">
                      Explore Vendors
                    </span>
                    <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA to browse all */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/browse-services"
            className="group inline-flex items-center gap-2.5 rounded-full border border-border/80 bg-background/80 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-foreground shadow-xs backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <span>View All Vendor Services & Packages</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
