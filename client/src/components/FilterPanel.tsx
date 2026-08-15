"use client";

import { useCategories } from "@/hooks/useCategories";
import { ProductFilters, SortOption } from "@/lib/types";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Top Rated" },
  { value: "name-asc", label: "Name: A to Z" },
];

interface Props {
  filters: ProductFilters;
  onChange: (patch: Partial<ProductFilters>) => void;
}

const selectClass =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text)] transition-colors";
const labelClass = "mb-1.5 block text-xs font-medium text-[var(--text-muted)]";

export default function FilterPanel({ filters, onChange }: Props) {
  const { data: categories, isLoading } = useCategories();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div>
        <label htmlFor="category" className={labelClass}>
          Category
        </label>
        <select
          id="category"
          className={selectClass}
          value={filters.category ?? ""}
          disabled={isLoading}
          onChange={(e) => onChange({ category: e.target.value || null })}
        >
          <option value="">All categories</option>
          {categories?.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="minPrice" className={labelClass}>
          Min price
        </label>
        <input
          id="minPrice"
          type="number"
          min={0}
          inputMode="decimal"
          className={selectClass}
          value={filters.minPrice ?? ""}
          onChange={(e) =>
            onChange({ minPrice: e.target.value === "" ? null : Number(e.target.value) })
          }
        />
      </div>

      <div>
        <label htmlFor="maxPrice" className={labelClass}>
          Max price
        </label>
        <input
          id="maxPrice"
          type="number"
          min={0}
          inputMode="decimal"
          className={selectClass}
          value={filters.maxPrice ?? ""}
          onChange={(e) =>
            onChange({ maxPrice: e.target.value === "" ? null : Number(e.target.value) })
          }
        />
      </div>

      <div>
        <label htmlFor="sort" className={labelClass}>
          Sort by
        </label>
        <select
          id="sort"
          className={selectClass}
          value={filters.sort ?? ""}
          onChange={(e) => onChange({ sort: (e.target.value || null) as SortOption | null })}
        >
          <option value="">Default</option>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
