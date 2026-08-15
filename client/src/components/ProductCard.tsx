import { memo } from "react";
import Image from "next/image";
import { Product } from "@/lib/types";

function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] transition-shadow hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--border)]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          // Only the first-row cards get priority (LCP candidates); the
          // rest lazy-load as they enter the viewport, and next/image
          // serves a right-sized, modern-format (avif/webp) asset either way.
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="truncate text-sm font-medium text-[var(--text)]">{product.name}</h3>
        <p className="text-xs text-[var(--text-muted)]">{product.category}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-semibold text-[var(--text)]">
            ${product.price.toFixed(2)}
          </span>
          <span
            className="flex items-center gap-1 text-xs text-[var(--text-muted)]"
            aria-label={`Rated ${product.rating} out of 5`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2 15 9 22 10 17 15 18.5 22 12 18.3 5.5 22 7 15 2 10 9 9Z" />
            </svg>
            {product.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </article>
  );
}

// Memoized: prevents re-rendering every card when only e.g. the debounced
// search input's raw value changes upstream but the resulting product list
// hasn't.
export default memo(ProductCard);
