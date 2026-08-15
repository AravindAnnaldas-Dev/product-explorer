export default function ProductCardSkeleton() {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]"
      aria-hidden="true"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--border)]">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
      <div className="flex flex-col gap-2 p-3">
        <div className="h-3.5 w-3/4 rounded bg-[var(--border)]" />
        <div className="h-3 w-1/2 rounded bg-[var(--border)]" />
        <div className="mt-2 flex items-center justify-between">
          <div className="h-4 w-12 rounded bg-[var(--border)]" />
          <div className="h-3 w-8 rounded bg-[var(--border)]" />
        </div>
      </div>
    </div>
  );
}
