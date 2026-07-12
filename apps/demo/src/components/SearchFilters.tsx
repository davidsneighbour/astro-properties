import type { RangeIndex } from "@davidsneighbour/astro-properties/lib/filter.js";
import {
  formatArea,
  formatCurrency,
} from "@davidsneighbour/astro-properties/lib/format.js";
import { paginate } from "@davidsneighbour/astro-properties/lib/pagination.js";
import { useEffect, useMemo, useState } from "react";
import {
  buildPagefindFilters,
  buildPagefindSort,
  extractListingId,
  findListing,
  matchesRange,
  type SortOption,
} from "@/lib/search";

interface PagefindSearchOptions {
  filters?: Record<string, string[]> | undefined;
  sort?: Record<string, "asc" | "desc"> | undefined;
}

interface PagefindModule {
  init: () => Promise<void>;
  search: (
    term: string | null,
    options?: PagefindSearchOptions,
  ) => Promise<{
    results: {
      id: string;
      data: () => Promise<{
        url: string;
        excerpt: string;
        meta: Record<string, string>;
      }>;
    }[];
  }>;
}

/**
 * `dist/pagefind/pagefind.js` only exists after a production build (the
 * `postbuild` script runs `pagefind --site dist`), so it can't be a static
 * import. Routing the specifier through a variable keeps TypeScript from
 * trying (and failing) to resolve it at type-check time.
 */
const PAGEFIND_MODULE_URL = "/pagefind/pagefind.js";

async function loadPagefind(): Promise<PagefindModule> {
  return import(/* @vite-ignore */ PAGEFIND_MODULE_URL);
}

interface ResultView {
  id: string;
  url: string;
  title: string;
  excerpt: string;
  image?: string | undefined;
  price?: string | undefined;
  beds?: string | undefined;
  baths?: string | undefined;
  area?: string | undefined;
}

export interface SearchFiltersProps {
  types: string[];
  statuses: string[];
  categories: string[];
  locations: string[];
  bedOptions: number[];
}

const STATIC_LISTINGS_ID = "static-listings";
const STATIC_PAGINATION_ID = "static-pagination";
const PAGE_SIZE = 6;

export function SearchFilters({
  types,
  statuses,
  categories,
  locations,
  bedOptions,
}: SearchFiltersProps) {
  const [pagefind, setPagefind] = useState<PagefindModule | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [minBeds, setMinBeds] = useState("");
  const [sort, setSort] = useState<SortOption>("relevance");
  const [results, setResults] = useState<ResultView[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [rangeIndex, setRangeIndex] = useState<RangeIndex | null>(null);
  const [priceMin, setPriceMin] = useState<number | undefined>(undefined);
  const [priceMax, setPriceMax] = useState<number | undefined>(undefined);
  const [areaMin, setAreaMin] = useState<number | undefined>(undefined);
  const [areaMax, setAreaMax] = useState<number | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch("/listings-index.json")
      .then((response) => response.json())
      .then((index: RangeIndex) => {
        if (cancelled) return;
        setRangeIndex(index);
        setPriceMin(index.price.min);
        setPriceMax(index.price.max);
        setAreaMin(index.area.min);
        setAreaMax(index.area.max);
      })
      .catch(() => {
        // Range sliders simply don't render without an index — text search and facets still work.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadPagefind()
      .then(async (mod) => {
        await mod.init();
        if (!cancelled) setPagefind(mod);
      })
      .catch(() => {
        if (!cancelled) setUnavailable(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const staticGrid = document.getElementById(STATIC_LISTINGS_ID);
    staticGrid?.classList.toggle("hidden", pagefind != null);
    const staticPagination = document.getElementById(STATIC_PAGINATION_ID);
    staticPagination?.classList.toggle("hidden", pagefind != null);
  }, [pagefind]);

  const selection = useMemo(
    () => ({
      type: type || undefined,
      status: status || undefined,
      category: category || undefined,
      location: location || undefined,
      minBeds: minBeds ? Number(minBeds) : undefined,
    }),
    [type, status, category, location, minBeds],
  );

  useEffect(() => {
    if (!pagefind) return;
    let cancelled = false;
    setLoading(true);

    const filters = buildPagefindFilters(selection);
    const sortOption = buildPagefindSort(sort);

    const timer = setTimeout(() => {
      pagefind
        .search(query.trim() || null, { filters, sort: sortOption })
        .then(async (response) => {
          const data = await Promise.all(
            response.results.map(async (result) => {
              const entry = await result.data();
              return {
                id: result.id,
                url: entry.url,
                title: entry.meta["title"] ?? "Untitled listing",
                excerpt: entry.excerpt,
                image: entry.meta["image"],
                price: entry.meta["price"],
                beds: entry.meta["beds"],
                baths: entry.meta["baths"],
                area: entry.meta["area"],
              } satisfies ResultView;
            }),
          );
          if (!cancelled) {
            setResults(data);
            setLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setResults([]);
            setLoading(false);
          }
        });
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pagefind, query, selection, sort]);

  const displayedResults = useMemo(() => {
    if (!results || !rangeIndex) return results;
    const rangeSelection = { priceMin, priceMax, areaMin, areaMax };
    return results.filter((result) => {
      const listing = findListing(rangeIndex, extractListingId(result.url));
      return !listing || matchesRange(listing, rangeSelection, rangeIndex);
    });
  }, [results, rangeIndex, priceMin, priceMax, areaMin, areaMax]);

  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [displayedResults]);

  const { items: pagedResults, pageInfo } = useMemo(
    () => paginate(displayedResults ?? [], page, PAGE_SIZE),
    [displayedResults, page],
  );

  function reset() {
    setQuery("");
    setType("");
    setStatus("");
    setCategory("");
    setLocation("");
    setMinBeds("");
    setSort("relevance");
    if (rangeIndex) {
      setPriceMin(rangeIndex.price.min);
      setPriceMax(rangeIndex.price.max);
      setAreaMin(rangeIndex.area.min);
      setAreaMax(rangeIndex.area.max);
    }
  }

  if (unavailable) {
    return (
      <p className="mb-6 rounded-md border border-dashed border-input p-4 text-sm text-muted-foreground">
        Live search needs a production build to generate the Pagefind index (
        <code>npm run build</code>) — showing all listings below.
      </p>
    );
  }

  return (
    <div className="mb-6">
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="flex flex-col text-sm">
          Search
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search listings…"
            className="rounded-md border border-input px-2 py-1"
          />
        </label>
        <label className="flex flex-col text-sm">
          Type
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="rounded-md border border-input px-2 py-1"
          >
            <option value="">Any</option>
            {types.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-md border border-input px-2 py-1"
          >
            <option value="">Any</option>
            {statuses.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm">
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-md border border-input px-2 py-1"
          >
            <option value="">Any</option>
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm">
          Location
          <select
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="rounded-md border border-input px-2 py-1"
          >
            <option value="">Any</option>
            {locations.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm">
          Min beds
          <select
            value={minBeds}
            onChange={(event) => setMinBeds(event.target.value)}
            className="rounded-md border border-input px-2 py-1"
          >
            <option value="">Any</option>
            {bedOptions.map((option) => (
              <option key={option} value={option}>
                {option}+
              </option>
            ))}
          </select>
        </label>
        {rangeIndex &&
          priceMin != null &&
          priceMax != null &&
          rangeIndex.price.min < rangeIndex.price.max && (
            <div className="flex flex-col text-sm">
              <span>Price range</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  aria-label="Minimum price"
                  min={rangeIndex.price.min}
                  max={rangeIndex.price.max}
                  value={priceMin}
                  onChange={(event) =>
                    setPriceMin(Math.min(Number(event.target.value), priceMax))
                  }
                />
                <input
                  type="range"
                  aria-label="Maximum price"
                  min={rangeIndex.price.min}
                  max={rangeIndex.price.max}
                  value={priceMax}
                  onChange={(event) =>
                    setPriceMax(Math.max(Number(event.target.value), priceMin))
                  }
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {formatCurrency(priceMin, "USD")} –{" "}
                {formatCurrency(priceMax, "USD")}
              </span>
            </div>
          )}
        {rangeIndex &&
          areaMin != null &&
          areaMax != null &&
          rangeIndex.area.min < rangeIndex.area.max && (
            <div className="flex flex-col text-sm">
              <span>Area range</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  aria-label="Minimum area"
                  min={rangeIndex.area.min}
                  max={rangeIndex.area.max}
                  value={areaMin}
                  onChange={(event) =>
                    setAreaMin(Math.min(Number(event.target.value), areaMax))
                  }
                />
                <input
                  type="range"
                  aria-label="Maximum area"
                  min={rangeIndex.area.min}
                  max={rangeIndex.area.max}
                  value={areaMax}
                  onChange={(event) =>
                    setAreaMax(Math.max(Number(event.target.value), areaMin))
                  }
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {formatArea(areaMin, "sqm")} – {formatArea(areaMax, "sqm")}
              </span>
            </div>
          )}
        <label className="flex flex-col text-sm">
          Sort
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="rounded-md border border-input px-2 py-1"
          >
            <option value="relevance">Relevance</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </label>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-input px-3 py-1 text-sm"
        >
          Reset
        </button>
      </form>

      <p className="mt-3 text-sm text-muted-foreground">
        {loading || displayedResults === null
          ? "Searching…"
          : `${displayedResults.length} ${displayedResults.length === 1 ? "listing" : "listings"} found`}
      </p>

      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {pagedResults.map((result) => (
          <li key={result.id} className="rounded-lg border border-input p-3">
            <a href={result.url} className="flex gap-3">
              {result.image && (
                <img
                  src={result.image}
                  alt=""
                  className="h-20 w-28 shrink-0 rounded object-cover"
                />
              )}
              <span className="flex flex-col">
                <span className="font-medium">{result.title}</span>
                {result.price && (
                  <span className="text-sm">{result.price}</span>
                )}
                <span className="text-xs text-muted-foreground">
                  {[
                    result.beds && `${result.beds} bd`,
                    result.baths && `${result.baths} ba`,
                    result.area,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
                {query.trim() && result.excerpt && (
                  <span
                    className="mt-1 text-xs text-muted-foreground [&_mark]:bg-yellow-200"
                    dangerouslySetInnerHTML={{ __html: result.excerpt }}
                  />
                )}
              </span>
            </a>
          </li>
        ))}
      </ul>

      {pageInfo.totalPages > 1 && (
        <nav
          aria-label="Search results pagination"
          className="mt-4 flex items-center justify-center gap-4 text-sm"
        >
          <button
            type="button"
            disabled={!pageInfo.hasPrevious}
            onClick={() => setPage((current) => current - 1)}
            className="rounded-md border border-input px-3 py-1 disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {pageInfo.page} of {pageInfo.totalPages}
          </span>
          <button
            type="button"
            disabled={!pageInfo.hasNext}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-md border border-input px-3 py-1 disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
