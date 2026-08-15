import dynamic from "next/dynamic";
import Header from "@/components/Header";
import { ProductGridSkeleton } from "@/components/ProductGrid";

// Code-split the interactive explorer out of the initial page bundle — it
// pulls in React Query + all filter/grid components, none of which are
// needed to paint the header, so it's fetched in a separate chunk.
const ProductExplorer = dynamic(() => import("@/components/ProductExplorer"), {
  loading: () => (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <ProductGridSkeleton />
    </main>
  ),
});

export default function Home() {
  return (
    <>
      <Header />
      <ProductExplorer />
    </>
  );
}
