import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/api";
import { ProductFilters } from "@/lib/types";

const PAGE_SIZE = 20;

export function useProducts(filters: ProductFilters) {
  return useInfiniteQuery({
    // Filters are part of the query key: React Query caches each unique
    // filter combination separately, so flipping back to a previous filter
    // (e.g. clearing search) serves instantly from cache instead of
    // refetching.
    queryKey: ["products", filters],
    queryFn: ({ pageParam }) =>
      fetchProducts({ ...filters, page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });
}
