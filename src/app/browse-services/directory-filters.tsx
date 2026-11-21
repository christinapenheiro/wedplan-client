"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  ChevronDown,
  Loader2,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { CATEGORY_META } from "@/lib/service-categories";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest listings" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "oldest", label: "Oldest listings" },
] as const;

interface DirectoryFiltersProps {
  initialSearch?: string;
  initialCategory?: string;
  initialLocation?: string;
  initialSort?: string;
  totalResults: number;
}

export function DirectoryFilters({
  initialSearch = "",
  initialCategory = "",
  initialLocation = "",
  initialSort = "newest",
  totalResults,
}: DirectoryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all" || (key === "sort" && value === "newest")) {
        current.delete(key);
      } else {
        current.set(key, value.trim());
      }
    }

    const searchString = current.toString();
    const targetUrl = searchString ? `${pathname}?${searchString}` : pathname;

    startTransition(() => {
      router.push(targetUrl, { scroll: false });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search")?.toString() ?? "";
    const location = formData.get("location")?.toString() ?? "";
    const category = formData.get("category")?.toString() ?? "";
    const sort = formData.get("sort")?.toString() ?? "";

    updateFilters({ search, location, category, sort });
  };

  const handleClearAll = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const hasActiveFilters = Boolean(
    initialSearch ||
      (initialCategory && initialCategory !== "all") ||
      initialLocation ||
      (initialSort && initialSort !== "newest")
  );

  const activeCategoryLabel =
    initialCategory && initialCategory in CATEGORY_META
      ? CATEGORY_META[initialCategory as keyof typeof CATEGORY_META].label
      : initialCategory;

  const activeSortLabel =
    SORT_OPTIONS.find((s) => s.value === initialSort)?.label ?? initialSort;

  return (
    <div className="space-y-4">
      {/* Main Filter Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="rounded-2xl border border-border/80 bg-background/80 p-3 shadow-lg shadow-primary/5 backdrop-blur-md transition-all sm:p-4"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-center">
          {/* Keyword Search (4 cols) */}
          <div className="relative flex h-12 items-center gap-2.5 rounded-xl bg-card/90 px-3.5 ring-1 ring-border/70 transition focus-within:ring-2 focus-within:ring-primary/50 sm:col-span-2 lg:col-span-4">
            <Search className="size-4 shrink-0 text-primary" />
            <input
              type="text"
              name="search"
              defaultValue={initialSearch}
              key={`search-${initialSearch}`}
              placeholder="Search by title, vendor, or keyword…"
              className="h-full w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
            />
          </div>

          {/* Category Dropdown (3 cols) */}
          <div className="relative flex h-12 items-center rounded-xl bg-card/90 ring-1 ring-border/70 transition focus-within:ring-2 focus-within:ring-primary/50 sm:col-span-1 lg:col-span-3">
            <SlidersHorizontal className="pointer-events-none absolute left-3.5 size-4 shrink-0 text-primary" />
            <select
              name="category"
              defaultValue={initialCategory || ""}
              key={`cat-${initialCategory}`}
              onChange={(e) => updateFilters({ category: e.target.value })}
              className="h-full w-full appearance-none bg-transparent pl-10 pr-9 text-sm text-foreground outline-none"
            >
              <option value="">All categories</option>
              {Object.entries(CATEGORY_META).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 size-3.5 text-muted-foreground" />
          </div>

          {/* Location Input (2.5 cols) */}
          <div className="relative flex h-12 items-center gap-2.5 rounded-xl bg-card/90 px-3.5 ring-1 ring-border/70 transition focus-within:ring-2 focus-within:ring-primary/50 sm:col-span-1 lg:col-span-3">
            <MapPin className="size-4 shrink-0 text-primary" />
            <input
              type="text"
              name="location"
              defaultValue={initialLocation}
              key={`loc-${initialLocation}`}
              placeholder="City or region…"
              className="h-full w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
            />
          </div>

          {/* Search Button (2 cols) */}
          <div className="sm:col-span-2 lg:col-span-2">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-70"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-3.5" />
              )}
              {isPending ? "Searching…" : "Search"}
            </button>
          </div>
        </div>

        {/* Secondary Bar: Sorting & Quick Status */}
        <div className="mt-3.5 flex flex-col gap-3 border-t border-border/50 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {totalResults} {totalResults === 1 ? "result" : "results"} found
            </span>
            {isPending && (
              <span className="inline-flex items-center gap-1.5 font-medium text-primary">
                <Loader2 className="size-3 animate-spin" />
                Updating from server…
              </span>
            )}
          </div>

          {/* Sorting Control */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <label
              htmlFor="sort-select"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
            >
              <ArrowUpDown className="size-3.5 text-primary" />
              <span>Sort by:</span>
            </label>

            <div className="relative">
              <select
                id="sort-select"
                name="sort"
                value={initialSort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="h-9 appearance-none rounded-lg border border-border/80 bg-card/90 py-1 pl-3 pr-8 text-xs font-medium text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>
      </form>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Active filters:
          </span>

          {initialSearch && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Keyword: &ldquo;{initialSearch}&rdquo;
              <button
                type="button"
                onClick={() => updateFilters({ search: "" })}
                aria-label="Remove search filter"
                className="rounded-full p-0.5 hover:bg-primary/20"
              >
                <X className="size-3" />
              </button>
            </span>
          )}

          {initialCategory && initialCategory !== "all" && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Category: {activeCategoryLabel}
              <button
                type="button"
                onClick={() => updateFilters({ category: "" })}
                aria-label="Remove category filter"
                className="rounded-full p-0.5 hover:bg-primary/20"
              >
                <X className="size-3" />
              </button>
            </span>
          )}

          {initialLocation && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Location: &ldquo;{initialLocation}&rdquo;
              <button
                type="button"
                onClick={() => updateFilters({ location: "" })}
                aria-label="Remove location filter"
                className="rounded-full p-0.5 hover:bg-primary/20"
              >
                <X className="size-3" />
              </button>
            </span>
          )}

          {initialSort && initialSort !== "newest" && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/40 bg-secondary/20 px-3 py-1 text-xs font-medium text-foreground">
              Sort: {activeSortLabel}
              <button
                type="button"
                onClick={() => updateFilters({ sort: "newest" })}
                aria-label="Reset sort to newest"
                className="rounded-full p-0.5 hover:bg-secondary/40"
              >
                <X className="size-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <RotateCcw className="size-3" />
            Reset all
          </button>
        </div>
      )}
    </div>
  );
}
