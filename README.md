# Product Explorer

A performance-optimized product browsing app. Monorepo with a Next.js 14 (App
Router) frontend and a lightweight Express + TypeScript mock API serving 500
products with pagination, filtering, sorting, and search.

```
product-explorer/
├── server/   # Express + TS mock API
└── client/   # Next.js 14 + TS + Tailwind + React Query
```

## Live demo

- **Live demo:** _add your deployed URL here (e.g. Vercel for client, Render/Fly for server)_
- **Screenshots:** _add screenshots of the light and dark themes here_

## Setup

Requires Node 18+.

```bash
# 1. Install and run the API
cd server
npm install
npm run dev          # http://localhost:4000

# 2. In a second terminal, install and run the client
cd client
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev           # http://localhost:3000
```

Open http://localhost:3000. The header's sun/moon icon toggles theme
(persisted to `localStorage`); the search box, category/price filters, and
sort dropdown all combine, and the grid loads more products as you scroll.

## API reference

`GET /api/products?page=1&limit=20&category=Electronics&minPrice=10&maxPrice=200&search=lamp&sort=price-asc`

| Param | Type | Notes |
|---|---|---|
| `page` | int | clamped to ≥ 1 |
| `limit` | int | clamped to 1–50 |
| `category` | string | exact match, case-insensitive |
| `minPrice` / `maxPrice` | number | inclusive range |
| `search` | string | case-insensitive substring match on name |
| `sort` | enum | `price-asc`, `price-desc`, `rating-desc`, `name-asc` |

Response:

```json
{
  "data": [ { "id": 1, "name": "...", "category": "...", "price": 42.5, "rating": 4.2, "image": "..." } ],
  "total": 500,
  "page": 1,
  "limit": 20,
  "hasMore": true
}
```

### Backend design decisions

**Pagination — offset/limit, not cursor-based.** The catalog is a small,
static in-memory array with no concurrent writes, so "page N" is cheap to
compute and lets the UI (or a future page-number control) jump to any page
directly. Cursor-based pagination is the better choice for a large,
frequently-mutated dataset (it avoids skipped/duplicated rows as records are
inserted or deleted between requests), but that complexity isn't justified
here — see [server/src/products.ts](server/src/products.ts).

**Filter → sort → paginate, strictly in that order.** Filtering and sorting
run against the *full* dataset before the page is sliced off. If pagination
happened first, `total` would report the size of the whole catalog instead
of the filtered set, and a filtered page could come back short or empty even
though more matches exist elsewhere in the array. Sorting has to happen
before slicing for the same reason — "top rated" needs to be sorted
globally, not just within whatever 20-item window was requested.

**Validation is clamping, not rejecting.** `limit` is capped at 50 and `page`
at a minimum of 1 via `clampInt()` rather than returning 400s for bad input.
A client (or a scraper) sending `limit=99999` gets a bounded, sane response
instead of a full-table dump or an error — the guardrail protects the server
without breaking the contract.

## Frontend architecture

- **React Query (`useInfiniteQuery`)** drives the product grid. The full
  filter object is part of the query key, so switching between previously
  seen filter combinations (e.g. clearing a search term) serves instantly
  from cache instead of refetching — see [client/src/hooks/useProducts.ts](client/src/hooks/useProducts.ts).
- **Debounced search** ([client/src/components/SearchBox.tsx](client/src/components/SearchBox.tsx))
  waits 300ms after the last keystroke before firing a request.
- **Infinite scroll** uses an `IntersectionObserver` sentinel
  ([client/src/hooks/useInfiniteScrollSentinel.ts](client/src/hooks/useInfiniteScrollSentinel.ts))
  instead of a scroll-event listener — the browser only notifies on real
  intersection changes rather than firing on every scroll frame.
- **Theming** is CSS-variable based (`globals.css`), toggled via a `.dark`
  class on `<html>`, and persisted to `localStorage`. A tiny inline script in
  `layout.tsx` applies the stored theme before hydration to avoid a
  flash-of-wrong-theme on reload.

## Performance techniques applied

In plain terms, this is what makes the app fast and why:

1. **Optimized images** — product photos are resized and compressed to
   exactly the size shown on screen instead of loading the full-resolution
   original. Measured: 324 KB raw → 32.5 KB optimized per image, ~10x smaller.
2. **Lazy-loaded images** — only the first row of products loads
   immediately; everything below the fold loads its photo only once you
   scroll to it, instead of downloading all 500 images upfront.
3. **Code splitting** — the interactive part of the page (search, filters,
   grid) downloads as a separate chunk from the header, so the header can
   appear without waiting on it.
4. **Self-hosted font** — the Inter font is bundled at build time instead of
   fetched from Google Fonts at page load, removing a network round-trip
   that would otherwise delay text rendering.
5. **Memoized product cards** — cards don't needlessly re-render when
   something unrelated changes elsewhere on the page (e.g. typing in the
   search box before it's finished debouncing).
6. **Debounced search** — typing "lamp" fires one request 300ms after you
   stop typing, not four requests for every keystroke.
7. **Cached requests (React Query)** — switching back to a filter
   combination you've already viewed serves instantly from cache instead of
   re-fetching from the server.
8. **Efficient infinite scroll** — uses the browser's `IntersectionObserver`
   to load more products only when the bottom of the list actually comes
   into view, instead of checking scroll position on every frame.

The table below maps each of these to the exact file and the specific
problem it solves:

| Technique | Where | What it addresses |
|---|---|---|
| `next/image` with `sizes`, `fill`, and per-breakpoint hints | [ProductCard.tsx](client/src/components/ProductCard.tsx) | Serves a right-sized, modern-format image instead of the original asset. Measured: a 1200×1200 source image is **324 KB** fetched directly vs. **32.5 KB** through `next/image` at its rendered size — a **~10x** payload reduction per image, the single biggest lever on a page whose content is almost entirely product photos. |
| `priority` on above-the-fold cards only, lazy-loaded elsewhere | [ProductCard.tsx](client/src/components/ProductCard.tsx) | Only the LCP-candidate images (first row) skip lazy-loading; everything below the fold is fetched as it scrolls into view, avoiding wasted bandwidth on images the user may never see. |
| Route-level code splitting via `next/dynamic` | [page.tsx](client/src/app/page.tsx) | The interactive grid (React Query + filters + card components) ships in a separate chunk from the page shell, so the header paints without waiting on it. |
| `next/font` (self-hosted Inter) | [layout.tsx](client/src/app/layout.tsx) | Inlines the font-face at build time instead of a render-blocking request to Google Fonts, removing a network round-trip from the critical rendering path and avoiding font-swap layout shift. |
| `React.memo` on `ProductCard` | [ProductCard.tsx](client/src/components/ProductCard.tsx) | Prevents all 20+ visible cards from re-rendering when unrelated state changes upstream (e.g. the raw search input value before it's debounced). |
| React Query caching (`staleTime`/`gcTime`) | [QueryProvider.tsx](client/src/components/QueryProvider.tsx), [useProducts.ts](client/src/hooks/useProducts.ts) | Repeated filter combinations are served from cache; `useCategories` is cached indefinitely since the category list never changes. |
| Debounced search input | [SearchBox.tsx](client/src/components/SearchBox.tsx) | Collapses a burst of keystrokes into a single network request. |
| `IntersectionObserver`-based infinite scroll | [useInfiniteScrollSentinel.ts](client/src/hooks/useInfiniteScrollSentinel.ts) | No scroll-event listener running on every frame. |

## Measuring performance with Lighthouse

The scores below should come from **your own machine** — Lighthouse traces
are sensitive to local CPU load and network conditions, and running it
inside a shared/virtualized CI or sandbox environment (which is how this
project was built) produced inconsistent scores run-to-run and isn't a fair
representation of real-world performance. Here's how to get a clean,
reproducible number:

1. Build and serve the production bundle (Lighthouse against `next dev` is
   misleadingly slow — dev mode skips minification and code-splitting
   optimizations):
   ```bash
   cd client
   npm run build
   npm run start        # serves the production build on :3000
   ```
2. Make sure the API (`server`) is also running on :4000 so the page has
   real data to render.
3. Open the page in **Chrome Incognito** (avoids extensions skewing the
   trace) at http://localhost:3000.
4. Open DevTools → **Lighthouse** tab → check "Performance" → mode
   "Navigation" → device "Desktop" (or "Mobile" for a mobile score) → **Analyze
   page load**.
5. Record the Performance score and the Core Web Vitals (FCP, LCP, TBT, CLS,
   Speed Index) shown in the report.
6. To get a genuine **before** number for comparison, temporarily revert one
   optimization at a time (e.g. swap `next/image` for a plain `<img>`,
   remove the `next/dynamic` split, or drop `React.memo`), rebuild, and
   re-run step 4. This isolates exactly how much each technique is worth on
   your hardware.

### Results

| Metric | Before | After | Change |
|---|---|---|---|
| Performance score | _run steps above_ | _run steps above_ | |
| First Contentful Paint | | | |
| Largest Contentful Paint | | | |
| Total Blocking Time | | | |
| Cumulative Layout Shift | | | |
| Speed Index | | | |

**Verified, environment-independent measurement:** fetching a representative
product image directly (1200×1200, as a naive `<img>` implementation would)
costs **324 KB**; the same image through `next/image` at its actual rendered
size costs **32.5 KB** — a 10x reduction, multiplied across every product
card on the page.

## Accessibility

- Semantic HTML (`<header>`, `<main>`, `<article>` per card).
- Visible focus rings on all interactive elements (`:focus-visible` in
  `globals.css`), meeting WCAG 2.4.7.
- Labelled form controls (`<label htmlFor>` on search/category/price/sort),
  `aria-live="polite"` on the results count, `role="status"` on loading
  skeletons, `role="alert"` on the error state.
- Theme toggle exposes `aria-pressed` and a descriptive `aria-label`.
- Respects `prefers-reduced-motion` (shimmer/transition animations disabled).
- Both light and dark palettes use near-black/off-white neutrals with a
  single accent color chosen for AA contrast against both backgrounds.
