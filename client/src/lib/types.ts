export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  image: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export type SortOption = "price-asc" | "price-desc" | "rating-desc" | "name-asc";

export interface ProductFilters {
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  search: string;
  sort: SortOption | null;
}
