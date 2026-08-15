import { Router } from "express";
import { products } from "./data";
import { Product, PaginatedResponse } from "./types";

const router = Router();

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;

const SORTS: Record<string, (a: Product, b: Product) => number> = {
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  "rating-desc": (a, b) => b.rating - a.rating,
  "name-asc": (a, b) => a.name.localeCompare(b.name),
};

function clampInt(value: unknown, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(String(value), 10);
  if (!Number.isFinite(n) || Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

router.get("/products", (req, res) => {
  const { category, minPrice, maxPrice, search, sort } = req.query;

  // --- Validation & guardrails ---
  // page/limit are clamped rather than rejected outright so a client that
  // sends a garbage value still gets a sane, bounded response instead of a
  // 500 or an accidental full-table scan (limit is capped at MAX_LIMIT).
  const page = clampInt(req.query.page, 1, 1, Number.MAX_SAFE_INTEGER);
  const limit = clampInt(req.query.limit, DEFAULT_LIMIT, 1, MAX_LIMIT);

  // --- Filtering (applied BEFORE pagination) ---
  // If we paginated first and filtered the page slice afterward, `total`
  // would reflect the unfiltered catalog and a filtered page could come
  // back empty or short even though more matches exist further in. Filter
  // the full set first, then paginate the filtered result.
  let filtered: Product[] = products;

  if (typeof category === "string" && category.trim()) {
    const wanted = category.toLowerCase();
    filtered = filtered.filter((p) => p.category.toLowerCase() === wanted);
  }

  if (minPrice !== undefined) {
    const min = Number.parseFloat(String(minPrice));
    if (Number.isFinite(min)) filtered = filtered.filter((p) => p.price >= min);
  }

  if (maxPrice !== undefined) {
    const max = Number.parseFloat(String(maxPrice));
    if (Number.isFinite(max)) filtered = filtered.filter((p) => p.price <= max);
  }

  if (typeof search === "string" && search.trim()) {
    const term = search.trim().toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(term));
  }

  // --- Sorting (applied BEFORE pagination, after filtering) ---
  // Sorting must also happen before slicing, otherwise "top rated" would
  // only sort within whatever page happened to be requested.
  const sortFn = typeof sort === "string" ? SORTS[sort] : undefined;
  const sorted = sortFn
    ? [...filtered].sort(sortFn)
    : [...filtered].sort((a, b) => a.id - b.id); // stable default order

  // --- Pagination ---
  // Offset/limit pagination chosen over cursor-based: the catalog is a
  // small, static in-memory array with no concurrent writes, so "page N"
  // is cheap to compute and lets the UI show page numbers / jump to page N
  // directly. Cursor-based pagination would be the better choice for a
  // large, frequently-mutated dataset (avoids skipped/duplicated items as
  // records are inserted/deleted), but that complexity isn't needed here.
  const total = sorted.length;
  const start = (page - 1) * limit;
  const data = sorted.slice(start, start + limit);
  const hasMore = start + data.length < total;

  const response: PaginatedResponse<Product> = { data, total, page, limit, hasMore };
  res.json(response);
});

router.get("/products/categories", (_req, res) => {
  const categories = Array.from(new Set(products.map((p) => p.category))).sort();
  res.json({ categories });
});

router.get("/products/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const product = products.find((p) => p.id === id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(product);
});

export default router;
