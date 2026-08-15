"use client";

import { useCallback, useMemo, useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useInfiniteScrollSentinel } from "@/hooks/useInfiniteScrollSentinel";
import { ProductFilters } from "@/lib/types";
import SearchBox from "./SearchBox";
import FilterPanel from "./FilterPanel";
import { ProductGrid, ProductGridSkeleton } from "./ProductGrid";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";

const DEFAULT_FILTERS: ProductFilters = {
  category: null,
  minPrice: null,
  maxPrice: null,
  search: "",
  sort: null,
};

export default function ProductExplorer() {
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);

  const patchFilters = useCallback((patch: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const { data, isLoading, isError, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
    useProducts(filters);

  // Flatten paginated results once per data change, not on every render —
  // avoids re-allocating the array for unrelated re-renders (e.g. theme toggle).
  const products = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);
  const total = data?.pages[0]?.total ?? 0;

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sentinelRef = useInfiniteScrollSentinel(loadMore, Boolean(hasNextPage) && !isLoading);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4">
        <div className="max-w-md">
          <SearchBox onSearch={(search) => patchFilters({ search })} />
        </div>
        <FilterPanel filters={filters} onChange={patchFilters} />
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-[var(--text-muted)]" aria-live="polite">
        {!isLoading && !isError && <span>{total} product{total === 1 ? "" : "s"} found</span>}
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <ProductGridSkeleton />
      ) : products.length === 0 ? (
        <EmptyState onReset={resetFilters} />
      ) : (
        <>
          <ProductGrid products={products} />
          <div ref={sentinelRef} className="h-1" />
          {isFetchingNextPage && (
            <div className="mt-4">
              <ProductGridSkeleton count={5} />
            </div>
          )}
          {!hasNextPage && (
            <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
              You&apos;ve reached the end of the catalog.
            </p>
          )}
        </>
      )}
    </main>
  );
}
