"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

/**
 * Curated wedding imagery collection for the editorial spotlight showcase.
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

// Romantic keywords smoothly cycled in the hero headline
const ROTATING_PHRASES = [
  "DREAM WEDDINGS",
  "TIMELESS LOVE",
  "ELEGANT VENUES",
  "CHERISHED MEMORIES",
];

export default function Banner() {
  // Smooth phrase rotator state
  const [phraseIndex, setPhraseIndex] = React.useState(0);

  // Picture carousel state (non-marquee, luxury spotlight)
  const [activeCardIndex, setActiveCardIndex] = React.useState(2);
  const [isHovered, setIsHovered] = React.useState(false);

  /**
   * Cycles the headline keyword smoothly on a fixed timer without jerky letter-by-letter typing.
   * Uses a dedicated container height to prevent any layout shift below.
   */
  React.useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
    }, 2200);

    return () => clearInterval(timer);
  }, []);

  /**
   * Gently auto-advances the luxury card spotlight when not hovered by the user.
   */
  React.useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % BANNER_CARDS.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isHovered]);

  const handlePrevCard = () => {
    setActiveCardIndex((prev) =>
      prev === 0 ? BANNER_CARDS.length - 1 : prev - 1
    );
  };

  const handleNextCard = () => {
    setActiveCardIndex((prev) =>
      prev === BANNER_CARDS.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#FAF7F5] dark:bg-[#161215] pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-[#D2D3D0] dark:border-[#382F36] transition-colors">
      
      {/* Decorative Botanical Foliage - Left */}
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

      {/* Center Hero Heading & Call to Action (Fixed Height to Prevent Vertical Jumps) */}
      <div className="relative max-w-4xl mx-auto px-4 text-center mb-10 sm:mb-14">
        
        {/* Script Subtitle */}
        <p className="font-serif italic text-2xl sm:text-3xl text-[#99616E] dark:text-[#C4B6D0] font-light mb-2.5 tracking-wide">
          A wedding celebration & planning sanctuary
        </p>

        {/* Stable Header Container with Fixed Vertical Space */}
        <div className="min-h-[120px] sm:min-h-[140px] md:min-h-[155px] flex items-center justify-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-[0.08em] sm:tracking-[0.14em] uppercase text-[#231A20] dark:text-[#F8F5F7] font-serif leading-[1.25]">
            PREMIUM WEDDING <br className="hidden sm:inline" />
            PLANNING FOR{" "}
            {/* Smooth animated rotating phrase with zero height reflow */}
            <span className="inline-flex relative h-[1.25em] min-w-[280px] sm:min-w-[420px] overflow-hidden align-middle items-center justify-center sm:justify-start">
              <AnimatePresence mode="wait">
                <motion.span
                  key={phraseIndex}
                  initial={{ y: 28, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -28, opacity: 0 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block text-[#99616E] dark:text-[#C4B6D0] font-medium border-b-2 border-[#99616E]/40 pb-0.5"
                >
                  {ROTATING_PHRASES[phraseIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>
        </div>

        {/* Subtle Supporting Subtext */}
        <p className="max-w-xl mx-auto text-xs sm:text-sm text-[#756770] dark:text-[#A797A2] tracking-wide mb-8">
          Curating unforgettable moments, trusted vendors, and effortless guest experiences for your once-in-a-lifetime journey.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/browse-services"
            className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#1F191D] hover:bg-[#99616E] text-white text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#99616E]/20"
          >
            <span>EXPLORE DIRECTORY</span>
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <Link
            href="/browse-services"
            className="inline-flex items-center gap-1.5 px-6 py-3.5 border border-[#D2D3D0] hover:border-[#99616E] hover:text-[#99616E] text-[#231A20] dark:text-[#F8F5F7] text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase transition-colors"
          >
            <span>VIEW VENDORS</span>
          </Link>
        </div>
      </div>

      {/* Luxury Editorial Showcase (Non-Marquee, Controlled Spotlight Carousel) */}
      <div
        className="relative w-full max-w-7xl mx-auto px-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header Ribbon for the gallery */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#99616E]">
            <Sparkles className="size-3.5" />
            <span>Curated Wedding Visions</span>
          </div>

          {/* Manual Control Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevCard}
              aria-label="Previous wedding vision"
              className="flex size-9 items-center justify-center rounded-full border border-[#D2D3D0] dark:border-[#382F36] bg-white/90 dark:bg-[#201A1E]/90 text-[#231A20] dark:text-[#F8F5F7] shadow-xs hover:border-[#99616E] hover:text-[#99616E] transition-colors cursor-pointer"
            >
              <ChevronLeft className="size-4.5" />
            </button>
            <button
              type="button"
              onClick={handleNextCard}
              aria-label="Next wedding vision"
              className="flex size-9 items-center justify-center rounded-full border border-[#D2D3D0] dark:border-[#382F36] bg-white/90 dark:bg-[#201A1E]/90 text-[#231A20] dark:text-[#F8F5F7] shadow-xs hover:border-[#99616E] hover:text-[#99616E] transition-colors cursor-pointer"
            >
              <ChevronRight className="size-4.5" />
            </button>
          </div>
        </div>

        {/* Spotlight Stage - Fixed Height, Centered Card Deck */}
        <div className="relative h-[380px] sm:h-[430px] md:h-[480px] w-full overflow-hidden rounded-3xl border border-[#D2D3D0]/70 dark:border-[#382F36] bg-white/40 dark:bg-[#201A1E]/40 backdrop-blur-xs p-4 flex items-center justify-center">
          
          {/* Card Deck with active spotlighting */}
          <div className="relative w-full h-full flex items-center justify-center">
            {BANNER_CARDS.map((card, index) => {
              // Calculate circular offset relative to active card
              const total = BANNER_CARDS.length;
              let offset = (index - activeCardIndex) % total;
              if (offset > total / 2) offset -= total;
              if (offset < -total / 2) offset += total;

              // Only render cards within visible neighborhood (-2 to +2)
              const isVisible = Math.abs(offset) <= 2;
              if (!isVisible) return null;

              const isCenter = offset === 0;

              return (
                <motion.div
                  key={card.title}
                  layout
                  animate={{
                    x: `${offset * 105}%`,
                    scale: isCenter ? 1 : Math.max(0.78, 1 - Math.abs(offset) * 0.16),
                    opacity: isCenter ? 1 : Math.max(0.4, 1 - Math.abs(offset) * 0.35),
                    zIndex: 10 - Math.abs(offset),
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 28,
                  }}
                  onClick={() => setActiveCardIndex(index)}
                  className={`absolute w-64 sm:w-80 md:w-[360px] h-[340px] sm:h-[390px] md:h-[440px] rounded-2xl overflow-hidden shadow-xl cursor-pointer select-none transition-shadow duration-300 ${
                    isCenter
                      ? "ring-2 ring-[#99616E] shadow-2xl shadow-[#99616E]/20"
                      : "hover:opacity-80"
                  }`}
                >
                  {/* Image */}
                  <Image
                    src={card.url}
                    alt={card.title}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 280px, 400px"
                    className="object-cover transition-transform duration-700 ease-out hover:scale-105"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {/* Top Category Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-[10px] tracking-[0.18em] font-semibold uppercase text-white/95 border border-white/20">
                      {card.category}
                    </span>
                  </div>

                  {/* Bottom Title & Details */}
                  <div className="absolute bottom-5 left-5 right-5 z-10 text-white">
                    <p className="font-serif text-xl sm:text-2xl font-normal tracking-wide leading-snug drop-shadow-sm">
                      {card.title}
                    </p>
                    <div className="h-0.5 w-8 bg-[#99616E] mt-2.5" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Indicator Dots Bar */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {BANNER_CARDS.map((card, idx) => (
            <button
              key={card.title}
              type="button"
              onClick={() => setActiveCardIndex(idx)}
              aria-label={`Jump to ${card.title}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeCardIndex === idx
                  ? "w-8 bg-[#99616E]"
                  : "w-2 bg-[#D2D3D0] dark:bg-[#423940] hover:bg-[#C4B6D0]"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
