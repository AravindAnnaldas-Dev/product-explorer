import { Product } from "./types";

// Deterministic PRNG (mulberry32) so the mock catalog is stable across
// server restarts — useful for reproducible demos and Lighthouse runs.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);

const CATEGORIES = [
  "Electronics",
  "Home & Kitchen",
  "Apparel",
  "Sports & Outdoors",
  "Books",
  "Toys & Games",
  "Beauty",
  "Automotive",
];

const ADJECTIVES = [
  "Premium",
  "Classic",
  "Compact",
  "Deluxe",
  "Portable",
  "Wireless",
  "Eco",
  "Pro",
  "Ultra",
  "Essential",
];

const NOUNS = [
  "Backpack",
  "Headphones",
  "Blender",
  "Lamp",
  "Sneakers",
  "Watch",
  "Camera",
  "Speaker",
  "Chair",
  "Notebook",
  "Bottle",
  "Jacket",
  "Keyboard",
  "Monitor",
  "Tent",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function generateProducts(count: number): Product[] {
  const products: Product[] = [];
  for (let i = 1; i <= count; i++) {
    const adjective = pick(ADJECTIVES);
    const noun = pick(NOUNS);
    const category = pick(CATEGORIES);
    const price = Math.round((rand() * 490 + 9.99) * 100) / 100;
    const rating = Math.round((rand() * 4 + 1) * 10) / 10;

    products.push({
      id: i,
      name: `${adjective} ${noun} ${i}`,
      category,
      price,
      rating,
      // picsum.photos seeded by id => stable image per product, no external
      // API calls needed at request time.
      image: `https://picsum.photos/seed/product-${i}/480/480`,
    });
  }
  return products;
}

// Generated once at module load and held in memory — this is a mock API,
// so there's no database; the array itself is the "store".
export const products: Product[] = generateProducts(500);
