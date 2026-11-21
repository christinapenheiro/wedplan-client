import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  CalendarHeart,
  LayoutDashboard,
  Lock,
  HeartHandshake,
  ArrowRight,
  CheckCircle2,
  Users,
  Award,
  Crown,
} from "lucide-react";

/** Pillars highlighting the WedPlan advantage */
const PILLARS = [
  {
    title: "Vetted & Verified Talent",
    tagline: "Top 5% Acceptance Rate",
    description:
      "Every photographer, florist, venue, and planner undergoes strict portfolio verification and review authenticity checks before being listed.",
    icon: ShieldCheck,
    gradient: "from-[#99616E]/20 via-[#C4B6D0]/30 to-[#99616E]/10",
  },
  {
    title: "100% Transparent Pricing",
    tagline: "Zero Hidden Markups",
    description:
      "Say goodbye to vague estimates. See clear starting rates, comprehensive package tiers, and itemized inclusions before reaching out.",
    icon: Sparkles,
    gradient: "from-[#C4B6D0]/30 via-[#99616E]/20 to-[#C4B6D0]/10",
  },
  {
    title: "Direct & Instant Coordination",
    tagline: "Real-Time Date Locks",
    description:
      "Submit personalized booking requests directly to business owners and receive timely confirmations without clunky third-party delays.",
    icon: CalendarHeart,
    gradient: "from-[#99616E]/20 via-[#C4B6D0]/30 to-[#99616E]/10",
  },
  {
    title: "Unified Planning Sanctuary",
    tagline: "All-in-One Dashboard",
    description:
      "Track your active booking requests, review accepted agreements, and manage your wedding timeline effortlessly inside one elegant hub.",
    icon: LayoutDashboard,
    gradient: "from-[#C4B6D0]/30 via-[#99616E]/20 to-[#C4B6D0]/10",
  },
  {
    title: "Secure & Encrypted Platform",
    tagline: "Stripe-Powered Safety",
    description:
      "Your wedding dates, contact information, and vendor subscriptions are shielded by enterprise-grade SSL encryption and secure payment rails.",
    icon: Lock,
    gradient: "from-[#99616E]/20 via-[#C4B6D0]/30 to-[#99616E]/10",
  },
  {
    title: "Dedicated Concierge Care",
    tagline: "Couples & Vendor Support",
    description:
      "From choosing the right floral palette to finalizing vendor terms, our friendly support team is always ready to guide you to the altar.",
    icon: HeartHandshake,
    gradient: "from-[#C4B6D0]/30 via-[#99616E]/20 to-[#C4B6D0]/10",
  },
];

/** Quantitative trust indicators */
const METRICS = [
  {
    number: "500+",
    label: "Vetted Wedding Professionals",
    detail: "Hand-inspected portfolios",
    icon: Award,
  },
  {
    number: "99.4%",
    label: "Couple Satisfaction Score",
    detail: "Based on post-event reviews",
    icon: CheckCircle2,
  },
  {
    number: "12,000+",
    label: "Enquiries & Bookings Completed",
    detail: "Across top wedding destinations",
    icon: Users,
  },
  {
    number: "4.9 ★",
    label: "Average Vendor Rating",
    detail: "Real authentic couple reviews",
    icon: Crown,
  },
];

export default function WhyChooseUs() {
  return (
    <section
      id="why-choose-us"
      className="scroll-mt-20 relative w-full py-20 lg:py-28 bg-white dark:bg-[#151013] overflow-hidden border-t border-[#D2D3D0]/60 dark:border-[#423940]/60"
    >
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute top-1/4 -left-40 size-[32rem] rounded-full bg-[#99616E]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 -right-40 size-[32rem] rounded-full bg-[#C4B6D0]/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C4B6D0] bg-[#C4B6D0]/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-[#99616E]">
            <Sparkles className="size-3.5 text-[#99616E]" />
            <span>The WedPlan Standard</span>
          </div>

          <h2 className="text-3xl font-serif tracking-tight text-[#2A1F25] dark:text-[#F5EFF3] sm:text-5xl font-normal leading-tight">
            Why Choose <span className="italic text-[#99616E]">WedPlan</span>
          </h2>

          <p className="text-sm sm:text-base leading-relaxed text-[#756770] dark:text-[#A797A2] max-w-2xl">
            Planning your once-in-a-lifetime celebration should feel inspiring,
            not stressful. Here is how WedPlan transforms months of wedding
            coordination into a seamless, joyful journey.
          </p>
        </div>

        {/* Fancy Pillars Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#D2D3D0] dark:border-[#423940] bg-[#FAF8FA]/90 dark:bg-[#221B20]/90 p-8 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-[#99616E]/50 hover:shadow-xl hover:shadow-[#99616E]/10"
              >
                {/* Decorative corner glow */}
                <div className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-gradient-to-br from-[#99616E]/15 to-transparent blur-2xl group-hover:scale-150 transition-transform duration-500" />

                <div className="relative space-y-4">
                  {/* Icon & Index Row */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${pillar.gradient} border border-[#C4B6D0]/50 text-[#99616E] shadow-xs group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="size-7" />
                    </div>
                    <span className="font-serif text-2xl font-light text-[#C4B6D0]/70 dark:text-[#756770]">
                      0{idx + 1}
                    </span>
                  </div>

                  {/* Badge */}
                  <span className="inline-block rounded-full bg-[#99616E]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#99616E]">
                    {pillar.tagline}
                  </span>

                  {/* Title */}
                  <h3 className="font-serif text-xl font-normal tracking-wide text-[#2A1F25] dark:text-[#F5EFF3] group-hover:text-[#99616E] transition-colors">
                    {pillar.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs leading-relaxed text-[#756770] dark:text-[#A797A2]">
                    {pillar.description}
                  </p>
                </div>

                <div className="relative mt-6 pt-4 border-t border-[#D2D3D0]/50 dark:border-[#423940]/50 flex items-center justify-between text-[11px] font-medium text-[#99616E]">
                  <span>Crafted for couples & vendors</span>
                  <ArrowRight className="size-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Stat Trust Counters */}
        <div className="mt-16 rounded-3xl border border-[#D2D3D0] dark:border-[#423940] bg-gradient-to-br from-[#FAF8FA] via-white to-[#F2EEF3] dark:from-[#1E181C] dark:via-[#221B20] dark:to-[#2B2329] p-8 sm:p-10 shadow-sm">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-6 divide-y lg:divide-y-0 lg:divide-x divide-[#D2D3D0]/60 dark:divide-[#423940]/60">
            {METRICS.map((metric, i) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.label}
                  className={`flex flex-col items-center text-center ${
                    i > 0 ? "pt-6 lg:pt-0 lg:pl-6" : ""
                  }`}
                >
                  <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-[#99616E]/10 text-[#99616E]">
                    <Icon className="size-5" />
                  </div>
                  <span className="font-serif text-3xl font-bold tracking-tight text-[#99616E] sm:text-4xl">
                    {metric.number}
                  </span>
                  <span className="mt-1 text-xs font-semibold text-[#2A1F25] dark:text-[#F5EFF3]">
                    {metric.label}
                  </span>
                  <span className="mt-0.5 text-[11px] text-[#756770] dark:text-[#A797A2]">
                    {metric.detail}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* High-Impact Bottom Callout */}
        <div className="mt-16 relative overflow-hidden rounded-3xl border border-[#99616E]/30 bg-gradient-to-r from-[#99616E] via-[#894F5D] to-[#99616E] p-8 sm:p-12 text-white shadow-xl shadow-[#99616E]/15">
          <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 size-64 rounded-full bg-[#C4B6D0]/20 blur-2xl" />

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
            <div className="space-y-3 max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
                <Sparkles className="size-3.5 text-[#C4B6D0]" />
                <span>Begin Your Planning Story</span>
              </span>
              <h3 className="text-2xl sm:text-4xl font-serif font-normal tracking-tight">
                Ready to plan the wedding you&apos;ve always envisioned?
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Connect with passionate vendors, book your favorite date, and
                create memories that endure a lifetime.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link
                href="/browse-services"
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-7 text-xs font-semibold uppercase tracking-wider text-[#99616E] shadow-md transition-all hover:bg-[#FAF8FA] hover:shadow-lg cursor-pointer"
              >
                <span>Browse Directory</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/sign-up"
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 hover:bg-white/20 px-7 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-xs transition-colors cursor-pointer"
              >
                <span>Join as a Vendor</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
