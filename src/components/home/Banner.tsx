"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

/**
 * Curated wedding imagery collection provided for the moving banner showcase.
 */
const BANNER_CARDS = [
  {
    url: "https://i.ibb.co.com/Ps2z5bMT/download-15.jpg",
    title: "Timeless Vows",
    category: "CEREMONY",
  },
  {
    url: "https://i.ibb.co.com/w9N8Z75/download-14.jpg",
    title: "Romantic Florals",
    category: "DECOR & STYLING",
  },
  {
    url: "https://i.ibb.co.com/GvpJ297L/download-13.jpg",
    title: "Golden Hour Bliss",
    category: "PORTRAITS",
  },
  {
    url: "https://i.ibb.co.com/21FdfVgh/download-10.jpg",
    title: "Grand Banquet",
    category: "RECEPTION",
  },
  {
    url: "https://i.ibb.co.com/nyqJKff/25-Stunning-Bridal-Shower-Themes-for-2026-From-Garden-Party-to-Old-Money-Glam.jpg",
    title: "Bridal Glamour",
    category: "BRIDAL SHOWER",
  },
  {
    url: "https://i.ibb.co.com/VWXdJ7wn/download-9.jpg",
    title: "Rustic Romance",
    category: "DESTINATION",
  },
  {
    url: "https://i.ibb.co.com/Xk6L42dx/download-8.jpg",
    title: "Classic Elegance",
    category: "TABLESCAPE",
  },
  {
    url: "https://i.ibb.co.com/23fDRYLT/How-To-Create-The-Perfect-Blue-Wedding.jpg",
    title: "Serene Blue Palette",
    category: "THEME DESIGN",
  },
  {
    url: "https://i.ibb.co.com/HT0dpmXh/Wedding.jpg",
    title: "Candlelit Intimacy",
    category: "EVENING SOIRÉE",
  },
  {
    url: "https://i.ibb.co.com/nNnCYdG8/Burgundy-Wedding-Aisle-Decor-Deep-Berry-Rose-Petals-Flower-Girl-Basket-Wine-Red-Wedding-Ceremony-E.jpg",
    title: "Burgundy Rose Aisle",
    category: "AISLE FLORALS",
  },
];

// Phrases cycled by the typewriter effect in the hero headline
const ROTATING_PHRASES = [
  "DREAM WEDDINGS",
  "TIMELESS LOVE",
  "ELEGANT VENUES",
  "CHERISHED MEMORIES",
];

export default function Banner() {
  // Typewriter state
  const [phraseIndex, setPhraseIndex] = React.useState(0);
  const [displayText, setDisplayText] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);

  /**
   * Drives the typewriter effect for the hero headline.
   * Types characters progressively, pauses at full length, deletes character by character,
   * then advances to the next romantic keyword.
   */
  React.useEffect(() => {
    const currentTarget = ROTATING_PHRASES[phraseIndex];
    const typingSpeed = isDeleting ? 300 : 250;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing forward
        if (displayText.length < currentTarget.length) {
          setDisplayText(currentTarget.slice(0, displayText.length + 1));
        } else {
          // Pause at word completion before starting deletion
          setTimeout(() => setIsDeleting(true), 1800);
        }
      } else {
        // Deleting backward
        if (displayText.length > 0) {
          setDisplayText(currentTarget.slice(0, displayText.length - 1));
        } else {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, phraseIndex]);

  // Duplicate cards to build an endless seamless infinite marquee
  const marqueeCards = [...BANNER_CARDS, ...BANNER_CARDS];

  return (
    <section className="relative w-full overflow-hidden bg-[#FAF7F5] dark:bg-[#161215] pt-14 pb-16 sm:pt-20 sm:pb-24 border-b border-[#D2D3D0] dark:border-[#382F36] transition-colors">
      
      {/* Decorative Watercolor Foliage - Left (matches reference styling) */}
      <div className="pointer-events-none absolute top-4 left-2 sm:left-6 w-28 sm:w-44 opacity-80 select-none">
        <svg
          viewBox="0 0 200 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto text-[#99616E]/40 dark:text-[#C4B6D0]/30"
        >
          <path
            d="M10 130 C45 105, 80 80, 150 20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M35 112 C25 90, 5 95, 10 110 C15 125, 30 120, 35 112 Z"
            fill="currentColor"
            className="text-[#C4B6D0]/60 dark:text-[#99616E]/40"
          />
          <path
            d="M65 92 C55 70, 35 75, 40 90 C45 105, 60 100, 65 92 Z"
            fill="currentColor"
            className="text-[#99616E]/40"
          />
          <path
            d="M95 72 C85 50, 65 55, 70 70 C75 85, 90 80, 95 72 Z"
            fill="currentColor"
            className="text-[#C4B6D0]/60"
          />
          <path
            d="M125 50 C115 28, 95 33, 100 48 C105 63, 120 58, 125 50 Z"
            fill="currentColor"
            className="text-[#99616E]/40"
          />
          <path
            d="M150 22 C145 2, 125 10, 130 25 C135 40, 148 35, 150 22 Z"
            fill="currentColor"
            className="text-[#C4B6D0]/70"
          />
        </svg>
      </div>

      {/* Decorative Botanical Foliage - Right */}
      <div className="pointer-events-none absolute top-4 right-2 sm:right-6 w-24 sm:w-36 opacity-70 select-none scale-x-[-1]">
        <svg
          viewBox="0 0 200 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto text-[#99616E]/30 dark:text-[#C4B6D0]/20"
        >
          <path
            d="M10 130 C45 105, 80 80, 150 20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M35 112 C25 90, 5 95, 10 110 C15 125, 30 120, 35 112 Z"
            fill="currentColor"
            className="text-[#C4B6D0]/50"
          />
          <path
            d="M65 92 C55 70, 35 75, 40 90 C45 105, 60 100, 65 92 Z"
            fill="currentColor"
            className="text-[#99616E]/30"
          />
          <path
            d="M95 72 C85 50, 65 55, 70 70 C75 85, 90 80, 95 72 Z"
            fill="currentColor"
            className="text-[#C4B6D0]/50"
          />
        </svg>
      </div>

      {/* Center Hero Heading & Call to Action */}
      <div className="relative max-w-4xl mx-auto px-4 text-center mb-12 sm:mb-16">
        
        {/* Elegant Cursive Script Subtitle (matches reference "A wedding photography") */}
        <p className="font-serif italic text-2xl sm:text-3xl text-[#99616E] dark:text-[#C4B6D0] font-light mb-2.5 tracking-wide">
          A wedding celebration & planning
        </p>

        <div>
        {/* Primary All-Caps High Fashion Serif Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-[0.08em] sm:tracking-[0.14em] uppercase text-[#231A20] dark:text-[#F8F5F7] font-serif leading-[1.2] mb-3 max-w-6xl mx-auto">
          PREMIUM WEDDING <br className="hidden sm:inline" />
          PLANNING FOR{" "}
          <span className="text-[#99616E] dark:text-[#C4B6D0] font-medium border-b-2 border-[#99616E]/40 pb-0.5">
            {displayText}
          </span>
          <span className="inline-block w-0.5 h-7 sm:h-11 bg-[#231A20] dark:bg-[#F8F5F7] ml-1.5 align-middle animate-pulse" />
        </h1>
        </div>

        {/* Subtle Supporting Subtext */}
        <p className="max-w-xl mx-auto text-xs sm:text-sm text-[#756770] dark:text-[#A797A2] tracking-wide mb-8">
          Curating unforgettable moments, trusted vendors, and effortless guest experiences for your once-in-a-lifetime journey.
        </p>

        {/* Action Button (matches reference design: sharp, elegant, tracking-widest) */}
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/browse"
            className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#1F191D] hover:bg-[#99616E] text-white text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#99616E]/20"
          >
            <span>EXPLORE WEDDINGS</span>
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 px-6 py-3.5 border border-[#D2D3D0] hover:border-[#99616E] hover:text-[#99616E] text-[#231A20] dark:text-[#F8F5F7] text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase transition-colors"
          >
            <span>SERVICES</span>
          </Link>
        </div>
      </div>

      {/* Moving Image Cards Showcase (Framer Motion Marquee) */}
      <div
        className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Soft Vignette Edge Masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-[#FAF7F5] dark:from-[#161215] to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-[#FAF7F5] dark:from-[#161215] to-transparent z-20" />

        {/* Continuous Horizontal Motion Strip */}
        <motion.div
          className="flex gap-4 sm:gap-6 w-max px-4"
          animate={{
            x: isPaused ? undefined : ["0%", "-50%"],
          }}
          transition={{
            ease: "linear",
            duration: 38,
            repeat: Infinity,
          }}
        >
          {marqueeCards.map((card, index) => (
            <div
              key={`${card.title}-${index}`}
              className="group relative w-60 sm:w-72 md:w-80 h-80 sm:h-96 md:h-[430px] rounded-sm overflow-hidden bg-white dark:bg-[#201A1E] shadow-md hover:shadow-2xl hover:shadow-[#99616E]/20 transition-all duration-500 shrink-0 border border-[#D2D3D0]/60 dark:border-[#382F36]"
            >
              {/* Card Image */}
              <Image
                src={card.url}
                alt={card.title}
                fill
                unoptimized
                sizes="(max-width: 768px) 240px, 320px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Bottom Editorial Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Editorial Badge / Top Tag */}
              <div className="absolute top-3.5 left-3.5 z-10">
                <span className="px-2.5 py-1 rounded-xs bg-black/40 backdrop-blur-md text-[10px] tracking-[0.18em] font-medium uppercase text-white/90 border border-white/15">
                  {card.category}
                </span>
              </div>

              {/* Bottom Editorial Title */}
              <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
                <p className="font-serif text-lg sm:text-xl font-normal tracking-wide leading-snug drop-shadow-sm group-hover:text-[#C4B6D0] transition-colors">
                  {card.title}
                </p>
                <div className="h-0.5 w-6 bg-[#99616E] mt-2 group-hover:w-12 transition-all duration-300" />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
