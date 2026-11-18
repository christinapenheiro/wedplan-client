"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

interface ServiceGalleryProps {
  images: string[];
  title: string;
  categoryLabel: string;
}

/**
 * Image gallery with a large cover, previous/next controls and clickable
 * thumbnails. Purely presentational — the selected image lives in local state.
 */
export default function ServiceGallery({
  images,
  title,
  categoryLabel,
}: ServiceGalleryProps) {
  const [active, setActive] = useState(0);
  const validImages = images.filter(Boolean);

  if (validImages.length === 0) {
    return (
      <div className="flex aspect-[16/11] w-full flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-gradient-to-br from-[#F2EEF3] via-[#FAF8FA] to-[#E7DFEA] text-muted-foreground dark:from-[#2E252C] dark:via-[#221B20] dark:to-[#3B3040]">
        <Sparkles className="size-9 text-primary/40" />
        <p className="text-sm font-medium">No photos available yet</p>
        <p className="text-xs">{categoryLabel}</p>
      </div>
    );
  }

  const index = active % validImages.length;
  const current = validImages[index];

  const goTo = (next: number) =>
    setActive((next + validImages.length) % validImages.length);

  return (
    <div className="space-y-3">
      {/* Cover */}
      <div className="group relative aspect-[16/11] w-full overflow-hidden rounded-3xl border border-border bg-muted shadow-sm">
        <Image
          src={current}
          alt={`${title || "Service"} photo ${index + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5" />

        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
          <Images className="size-3" />
          {validImages.length} {validImages.length === 1 ? "photo" : "photos"}
        </span>

        <span className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md">
          {index + 1} / {validImages.length}
        </span>

        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:thin] sm:gap-3">
          {validImages.map((url, thumbIndex) => (
            <button
              key={`${url}-${thumbIndex}`}
              type="button"
              onClick={() => setActive(thumbIndex)}
              aria-label={`Show photo ${thumbIndex + 1}`}
              aria-current={thumbIndex === index}
              className={cn(
                "relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border bg-muted transition sm:w-24",
                thumbIndex === index
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={url}
                alt={`${title || "Service"} thumbnail ${thumbIndex + 1}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
