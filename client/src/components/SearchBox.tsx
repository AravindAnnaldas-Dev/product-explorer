"use client";

import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export default function SearchBox({
  onSearch,
  initialValue = "",
}: {
  onSearch: (value: string) => void;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);

  // Debounced so every keystroke doesn't trigger a network request — only
  // fires 300ms after the user stops typing.
  const debounced = useDebouncedCallback((next: string) => onSearch(next), 300);

  useEffect(() => {
    debounced(value);
  }, [value, debounced]);

  return (
    <div className="relative">
      <label htmlFor="product-search" className="sr-only">
        Search products
      </label>
      <svg
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        id="product-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search products..."
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] py-2 pl-9 pr-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] transition-colors focus-visible:border-transparent"
      />
    </div>
  );
}
