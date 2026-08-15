import { PaginatedResponse, Product, ProductFilters } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface FetchProductsParams extends ProductFilters {
  page: number;
  limit: number;
}

export async function fetchProducts(
  params: FetchProductsParams
): Promise<PaginatedResponse<Product>> {
  const query = new URLSearchParams();
  query.set("page", String(params.page));
  query.set("limit", String(params.limit));
  if (params.category) query.set("category", params.category);
  if (params.minPrice != null) query.set("minPrice", String(params.minPrice));
  if (params.maxPrice != null) query.set("maxPrice", String(params.maxPrice));
  if (params.search) query.set("search", params.search);
  if (params.sort) query.set("sort", params.sort);

  const res = await fetch(`${API_BASE}/api/products?${query.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
  return res.json();
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/api/products/categories`);
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
  const json = await res.json();
  return json.categories;
}
