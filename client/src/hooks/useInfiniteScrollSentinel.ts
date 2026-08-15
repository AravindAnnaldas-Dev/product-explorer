import { useEffect, useRef } from "react";

// Fires `onIntersect` when the sentinel element scrolls into view — drives
// infinite scroll without a scroll-event listener (cheaper: the browser
// only notifies on actual intersection changes, no per-frame scroll math).
export function useInfiniteScrollSentinel(onIntersect: () => void, enabled: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onIntersect();
      },
      { rootMargin: "400px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [onIntersect, enabled]);

  return ref;
}
