"use client";

import * as React from "react";
import Link from "next/link";
import {
  HeartHandshake,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowUp,
  Sparkles,
  Send,
} from "lucide-react";

/**
 * Social media link definitions with inline SVG vectors
 * to ensure zero external icon library dependencies and pixel-perfect rendering.
 */
const SOCIAL_LINKS = [
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    name: "Pinterest",
    href: "https://pinterest.com",
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.053.225-.177.268-.407.16-1.523-.709-2.476-2.937-2.476-4.727 0-3.854 2.8-7.397 8.077-7.397 4.241 0 7.537 3.022 7.537 7.062 0 4.215-2.657 7.608-6.345 7.608-1.239 0-2.404-.644-2.803-1.407l-.763 2.908c-.276 1.063-1.023 2.395-1.524 3.208C9.569 23.81 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    name: "X / Twitter",
    href: "https://twitter.com",
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
];

/** Navigation links grouped into categories */
const NAV_CATEGORIES = [
  {
    title: "Planning & Directory",
    links: [
      { label: "Browse All Vendors", href: "/browse-services" },
      { label: "Wedding Venues", href: "/browse-services" },
      { label: "Photographers", href: "/browse-services" },
      { label: "Floral & Decor", href: "/browse-services" },
      { label: "Catering & Cakes", href: "/browse-services" },
      { label: "Planners & Coordinators", href: "/browse-services" },
    ],
  },
  {
    title: "Platform & Account",
    links: [
      { label: "Home", href: "/" },
      { label: "Why Choose Us", href: "/#why-choose-us" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Vendor Membership", href: "/dashboard/vendor/subscription" },
      { label: "Sign In", href: "/sign-in" },
      { label: "Create Account", href: "/sign-up" },
    ],
  },
];

export default function Footer() {
  const [emailSubscribed, setEmailSubscribed] = React.useState(false);
  const [newsletterEmail, setNewsletterEmail] = React.useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setEmailSubscribed(true);
    setNewsletterEmail("");
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer
      role="contentinfo"
      aria-label="Site Footer"
      className="relative w-full border-t border-[#D2D3D0] dark:border-[#423940] bg-[#FAF8FA] dark:bg-[#191417] text-[#2A1F25] dark:text-[#F5EFF3] transition-colors overflow-hidden"
    >
      {/* Ambient background glow accents */}
      <div className="pointer-events-none absolute -bottom-40 -left-40 size-96 rounded-full bg-[#C4B6D0]/20 blur-3xl" />
      <div className="pointer-events-none absolute -top-40 -right-40 size-96 rounded-full bg-[#99616E]/10 blur-3xl" />

      {/* Main Footer Container */}
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          
          {/* Column 1: Brand, Description, Newsletter & Socials (Span 5 cols on lg) */}
          <div className="space-y-6 lg:col-span-5">
            {/* Brand Logo & Title */}
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group outline-none"
              aria-label="WedPlan Home"
            >
              <div className="size-10 rounded-full bg-[#C4B6D0]/30 border border-[#C4B6D0] flex items-center justify-center text-[#99616E] shadow-sm transition-transform duration-200 group-hover:scale-105">
                <HeartHandshake className="size-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-[#2A1F25] dark:text-[#F5EFF3]">
                Wed<span className="text-[#99616E]">Plan</span>
              </span>
            </Link>

            {/* Short Description */}
            <p className="max-w-md text-sm leading-relaxed text-[#756770] dark:text-[#A797A2]">
              Curating unforgettable celebrations. WedPlan brings couples and
              trusted wedding professionals together to discover venues, compare
              services, and manage bookings seamlessly in one romantic sanctuary.
            </p>

            {/* Newsletter Subscription */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#99616E]">
                <Sparkles className="size-3.5" />
                <span>Wedding Inspiration & Updates</span>
              </div>
              {emailSubscribed ? (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                  ✨ Thank you for subscribing! We&apos;ll be in touch with the latest wedding tips.
                </div>
              ) : (
                <form
                  onSubmit={handleNewsletterSubmit}
                  className="flex max-w-md items-center gap-2"
                >
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="h-10 flex-1 rounded-xl border border-[#D2D3D0] dark:border-[#423940] bg-white dark:bg-[#221B20] px-3.5 text-xs text-[#2A1F25] dark:text-[#F5EFF3] placeholder:text-[#756770]/60 outline-none transition focus:border-[#99616E] focus:ring-2 focus:ring-[#99616E]/20"
                    aria-label="Newsletter email input"
                  />
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#99616E] hover:bg-[#824E5B] px-4 text-xs font-medium text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Subscribe</span>
                    <Send className="size-3" />
                  </button>
                </form>
              )}
            </div>

            {/* Social Media Links */}
            <div className="space-y-2.5 pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#756770] dark:text-[#A797A2]">
                Follow Our Journey
              </p>
              <div className="flex items-center gap-2.5">
                {SOCIAL_LINKS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Follow WedPlan on ${item.name}`}
                      className="flex size-9 items-center justify-center rounded-full border border-[#D2D3D0] dark:border-[#423940] bg-white/80 dark:bg-[#221B20]/80 text-[#756770] dark:text-[#A797A2] shadow-xs transition-all duration-200 hover:scale-110 hover:border-[#99616E] hover:bg-[#99616E] hover:text-white"
                    >
                      <Icon className="size-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 2 & 3: Important Navigation Links (Span 4 cols total on lg) */}
          <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:col-span-4">
            {NAV_CATEGORIES.map((category) => (
              <div key={category.title} className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2A1F25] dark:text-[#F5EFF3]">
                  {category.title}
                </h3>
                <ul className="space-y-2.5 text-xs">
                  {category.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[#756770] dark:text-[#A797A2] hover:text-[#99616E] dark:hover:text-[#99616E] transition-colors inline-block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Column 4: Contact Information (Span 3 cols on lg) */}
          <div className="space-y-4 lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2A1F25] dark:text-[#F5EFF3]">
              Contact Us
            </h3>
            <ul className="space-y-3.5 text-xs text-[#756770] dark:text-[#A797A2]">
              <li className="flex items-start gap-3">
                <MapPin className="size-4 shrink-0 text-[#99616E] mt-0.5" />
                <span>
                  742 Evergreen Terrace, Suite 100
                  <br />
                  New York, NY 10001, USA
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-[#99616E]" />
                <a
                  href="tel:+18005559337"
                  className="hover:text-[#99616E] transition-colors"
                >
                  +1 (800) 555-WEDP
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-[#99616E]" />
                <a
                  href="mailto:support@wedplan.com"
                  className="hover:text-[#99616E] transition-colors"
                >
                  support@wedplan.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="size-4 shrink-0 text-[#99616E] mt-0.5" />
                <span>
                  Monday – Friday: 9 AM – 6 PM EST
                  <br />
                  Weekend Support: 10 AM – 4 PM EST
                </span>
              </li>
            </ul>

            {/* Quick Vendor Help Callout */}
            <div className="rounded-xl border border-[#C4B6D0]/60 bg-[#C4B6D0]/15 dark:bg-[#C4B6D0]/10 p-3 text-[11px] text-[#756770] dark:text-[#A797A2]">
              <span className="font-semibold text-[#99616E]">Are you a wedding vendor?</span>
              <br />
              Grow your client base and list your services on WedPlan today.
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-[#D2D3D0] dark:border-[#423940]" />

        {/* Bottom Bar: Copyright, Legal Links & Back to Top */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-xs text-[#756770] dark:text-[#A797A2] sm:flex-row">
          {/* Copyright Information */}
          <div className="text-center sm:text-left">
            <p>
              © {new Date().getFullYear()} <span className="font-semibold text-[#2A1F25] dark:text-[#F5EFF3]">WedPlan, Inc.</span> All rights reserved.
            </p>
            <p className="text-[11px] text-[#756770]/70 dark:text-[#A797A2]/70 mt-0.5">
              Empowering dream weddings with curated vendor excellence.
            </p>
          </div>

          {/* Legal / Policy Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <Link href="#" className="hover:text-[#99616E] hover:underline underline-offset-4 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-[#D2D3D0] dark:text-[#423940]">·</span>
            <Link href="#" className="hover:text-[#99616E] hover:underline underline-offset-4 transition-colors">
              Terms of Service
            </Link>
            <span className="text-[#D2D3D0] dark:text-[#423940]">·</span>
            <Link href="#" className="hover:text-[#99616E] hover:underline underline-offset-4 transition-colors">
              Cookie Preferences
            </Link>
            <span className="text-[#D2D3D0] dark:text-[#423940]">·</span>
            <Link href="#" className="hover:text-[#99616E] hover:underline underline-offset-4 transition-colors">
              Security
            </Link>
          </div>

          {/* Back to top button */}
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll back to top of page"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D2D3D0] dark:border-[#423940] bg-white dark:bg-[#221B20] px-3 py-1.5 text-[11px] font-medium text-[#756770] dark:text-[#A797A2] shadow-2xs transition-all hover:border-[#99616E] hover:text-[#99616E] cursor-pointer"
          >
            <span>Top</span>
            <ArrowUp className="size-3" />
          </button>
        </div>
      </div>
    </footer>
  );
}
