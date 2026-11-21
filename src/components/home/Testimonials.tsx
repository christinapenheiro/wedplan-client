"use client";

import * as React from "react";
import Image from "next/image";
import {
  Sparkles,
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Heart,
} from "lucide-react";

interface TestimonialItem {
  id: string;
  category: "couple" | "vendor";
  name: string;
  role: string;
  location: string;
  eventDate: string;
  avatar: string;
  rating: number;
  highlight: string;
  quote: string;
  bookedTag: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "1",
    category: "couple",
    name: "Clara & Julian Montgomery",
    role: "Verified Couple",
    location: "Newport, Rhode Island",
    eventDate: "Married October 2025",
    avatar: "https://i.ibb.co.com/Ps2z5bMT/download-15.jpg",
    rating: 5,
    highlight: "Saved us at least 40 hours of stressful vendor coordination.",
    quote:
      "Finding our floral designer and photographer through WedPlan felt like an answered prayer. Upfront starting prices allowed us to budget without surprises, and direct date confirmations meant we locked our dream team in less than 48 hours.",
    bookedTag: "Booked Floral & Photography",
  },
  {
    id: "2",
    category: "couple",
    name: "Marcus & Elena Sterling",
    role: "Verified Couple",
    location: "Hudson Valley, New York",
    eventDate: "Married June 2025",
    avatar: "https://i.ibb.co.com/GvpJ297L/download-13.jpg",
    rating: 5,
    highlight: "The transparent pricing alone makes WedPlan a game changer.",
    quote:
      "We had almost given up on finding an estate venue within our budget. WedPlan connected us with Belvedere Manor, and the direct communication tools let us plan our outdoor reception seamlessly from another state.",
    bookedTag: "Booked Estate Venue",
  },
  {
    id: "3",
    category: "vendor",
    name: "Amara Laurent",
    role: "Lumière Wedding Studios (Vendor Partner)",
    location: "Brooklyn, New York",
    eventDate: "Partner since 2024",
    avatar: "https://i.ibb.co.com/w9N8Z75/download-14.jpg",
    rating: 5,
    highlight: "The highest quality client inquiries I've received in 8 years.",
    quote:
      "Unlike generic directories that flood you with spam leads, WedPlan couples already know their date, budget, and aesthetic. It has transformed my studio's booking workflow and connected me with couples who truly value my craft.",
    bookedTag: "Photography Partner",
  },
  {
    id: "4",
    category: "couple",
    name: "Sophia & David Vance",
    role: "Verified Couple",
    location: "Charleston, South Carolina",
    eventDate: "Married September 2025",
    avatar: "https://i.ibb.co.com/21FdfVgh/download-10.jpg",
    rating: 5,
    highlight: "Every single vendor exceeded our wildest expectations.",
    quote:
      "From our ceremony acoustic music to our four-course banquet catering, every artisan on WedPlan felt truly vetted and authentic. The dashboard kept our dates and bookings organized in one stress-free place.",
    bookedTag: "Booked Catering & Music",
  },
  {
    id: "5",
    category: "vendor",
    name: "Genevieve Dubois",
    role: "Petals & Poetry Floral Atelier (Vendor Partner)",
    location: "New York, New York",
    eventDate: "Partner since 2024",
    avatar: "https://i.ibb.co.com/nyqJKff/25-Stunning-Bridal-Shower-Themes-for-2026-From-Garden-Party-to-Old-Money-Glam.jpg",
    rating: 5,
    highlight: "An elegant platform that honors artisan craftsmanship.",
    quote:
      "WedPlan's clean aesthetics, instant notifications, and direct booking request management let me focus on floral architecture instead of chasing admin tasks. It's the standard the wedding industry needed.",
    bookedTag: "Floral Atelier Partner",
  },
  {
    id: "6",
    category: "couple",
    name: "Hannah & Liam Brooks",
    role: "Verified Couple",
    location: "Aspen, Colorado",
    eventDate: "Married December 2025",
    avatar: "https://i.ibb.co.com/VWXdJ7wn/download-9.jpg",
    rating: 5,
    highlight: "Our winter destination wedding came together effortlessly.",
    quote:
      "Coordinating a mountain destination ceremony seemed daunting until we found our planner on WedPlan. Having verified portfolio reviews gave us complete peace of mind while making decisions hundreds of miles away.",
    bookedTag: "Booked Wedding Planner",
  },
];

export default function Testimonials() {
  const [filter, setFilter] = React.useState<"all" | "couple" | "vendor">("all");
  const [activeIndex, setActiveIndex] = React.useState(0);

  const filteredItems = React.useMemo(() => {
    if (filter === "all") return TESTIMONIALS;
    return TESTIMONIALS.filter((t) => t.category === filter);
  }, [filter]);

  const handleFilterChange = (newFilter: "all" | "couple" | "vendor") => {
    setFilter(newFilter);
    setActiveIndex(0);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === filteredItems.length - 1 ? 0 : prev + 1));
  };

  const activeStory = filteredItems[activeIndex] ?? filteredItems[0];

  return (
    <section className="relative w-full py-20 lg:py-28 bg-[#FAF8FA] dark:bg-[#191417] overflow-hidden border-t border-[#D2D3D0]/60 dark:border-[#423940]/60">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-[30rem] rounded-full bg-[#C4B6D0]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-[30rem] rounded-full bg-[#99616E]/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C4B6D0] bg-[#C4B6D0]/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-[#99616E]">
            <Heart className="size-3.5 text-[#99616E] fill-[#99616E]/20" />
            <span>Loved by Couples & Vendors</span>
          </div>

          <h2 className="text-3xl font-serif tracking-tight text-[#2A1F25] dark:text-[#F5EFF3] sm:text-5xl font-normal leading-tight">
            Real Stories, <span className="italic text-[#99616E]">Timeless Vows</span>
          </h2>

          <p className="text-sm sm:text-base leading-relaxed text-[#756770] dark:text-[#A797A2] max-w-2xl">
            Hear from couples who found their dream wedding artisans on WedPlan, and the
            passionate professionals who brought their celebrations to life.
          </p>

          {/* Social Proof Trust Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-[#756770] dark:text-[#A797A2]">
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-bold text-[#2A1F25] dark:text-[#F5EFF3]">4.9 / 5.0</span>
              <span>(2,400+ reviews)</span>
            </div>
            <span className="hidden sm:inline-block text-[#D2D3D0]">•</span>
            <div className="flex items-center gap-1.5">
              <BadgeCheck className="size-4 text-[#99616E]" />
              <span className="font-medium">100% Verified Reviews</span>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="pt-4 flex items-center gap-2 p-1.5 rounded-full border border-[#D2D3D0] dark:border-[#423940] bg-white/80 dark:bg-[#221B20]/80 shadow-2xs backdrop-blur-sm">
            {(
              [
                { key: "all", label: "All Stories" },
                { key: "couple", label: "Couples' Notes" },
                { key: "vendor", label: "Vendor Voices" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleFilterChange(tab.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filter === tab.key
                    ? "bg-[#99616E] text-white shadow-xs"
                    : "text-[#756770] dark:text-[#A797A2] hover:text-[#2A1F25] dark:hover:text-[#F5EFF3]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Editorial Spotlight Banner */}
        {activeStory && (
          <div className="mt-14 relative overflow-hidden rounded-3xl border border-[#D2D3D0] dark:border-[#423940] bg-white dark:bg-[#221B20] p-8 sm:p-12 shadow-md shadow-[#99616E]/5">
            {/* Background Decorative Quote Mark */}
            <Quote className="pointer-events-none absolute right-8 bottom-6 size-40 text-[#C4B6D0]/15 dark:text-[#99616E]/10" />

            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Couple / Vendor Image with Ring Glow */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-sm aspect-[4/5] rounded-3xl overflow-hidden shadow-xl shadow-[#99616E]/15 border-4 border-white dark:border-[#2A1F25]">
                  <Image
                    src={activeStory.avatar}
                    alt={activeStory.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Photo badge */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs drop-shadow-sm">
                    <span className="font-semibold">{activeStory.eventDate}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-medium backdrop-blur-md">
                      {activeStory.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Story Narrative */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Star rating & Booked Tag */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(activeStory.rating)].map((_, i) => (
                      <Star key={i} className="size-4.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C4B6D0] bg-[#C4B6D0]/20 px-3 py-1 text-[11px] font-semibold text-[#99616E]">
                    <Sparkles className="size-3" />
                    <span>{activeStory.bookedTag}</span>
                  </span>
                </div>

                {/* Highlight Quote */}
                <blockquote className="font-serif text-2xl sm:text-3xl font-normal leading-snug tracking-wide text-[#2A1F25] dark:text-[#F5EFF3]">
                  &ldquo;{activeStory.highlight}&rdquo;
                </blockquote>

                {/* Full Review */}
                <p className="text-sm sm:text-base leading-relaxed text-[#756770] dark:text-[#A797A2] italic">
                  &ldquo;{activeStory.quote}&rdquo;
                </p>

                {/* Author Info */}
                <div className="pt-4 border-t border-[#D2D3D0]/60 dark:border-[#423940]/60 flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-lg font-semibold text-[#2A1F25] dark:text-[#F5EFF3] flex items-center gap-1.5">
                      <span>{activeStory.name}</span>
                      <BadgeCheck className="size-4 text-[#99616E]" />
                    </h4>
                    <p className="text-xs text-[#756770] dark:text-[#A797A2]">
                      {activeStory.role} • {activeStory.location}
                    </p>
                  </div>

                  {/* Navigation Arrows */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrev}
                      aria-label="Previous story"
                      className="flex size-10 items-center justify-center rounded-full border border-[#D2D3D0] dark:border-[#423940] bg-white dark:bg-[#1E181C] text-[#2A1F25] dark:text-[#F5EFF3] hover:border-[#99616E] hover:text-[#99616E] transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      aria-label="Next story"
                      className="flex size-10 items-center justify-center rounded-full border border-[#D2D3D0] dark:border-[#423940] bg-white dark:bg-[#1E181C] text-[#2A1F25] dark:text-[#F5EFF3] hover:border-[#99616E] hover:text-[#99616E] transition-colors cursor-pointer"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Carousel Thumbnails / Stories Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredItems.slice(0, 3).map((item, i) => (
            <div
              key={item.id}
              onClick={() => setActiveIndex(i)}
              className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 ${
                activeIndex === i
                  ? "border-[#99616E] bg-white dark:bg-[#221B20] shadow-lg shadow-[#99616E]/10 scale-[1.02]"
                  : "border-[#D2D3D0] dark:border-[#423940] bg-white/60 dark:bg-[#221B20]/60 hover:border-[#C4B6D0] hover:bg-white dark:hover:bg-[#221B20]"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-500">
                    {[...Array(item.rating)].map((_, idx) => (
                      <Star key={idx} className="size-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-[#99616E] uppercase tracking-wider">
                    {item.bookedTag}
                  </span>
                </div>

                <p className="text-xs font-serif font-medium leading-relaxed text-[#2A1F25] dark:text-[#F5EFF3] line-clamp-2">
                  &ldquo;{item.highlight}&rdquo;
                </p>
                <p className="text-[11px] text-[#756770] dark:text-[#A797A2] line-clamp-2">
                  {item.quote}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-[#D2D3D0]/60 dark:border-[#423940]/60">
                <div className="relative size-10 rounded-full overflow-hidden shrink-0 border border-[#C4B6D0]">
                  <Image
                    src={item.avatar}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#2A1F25] dark:text-[#F5EFF3] truncate">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-[#756770] dark:text-[#A797A2] truncate">
                    {item.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
