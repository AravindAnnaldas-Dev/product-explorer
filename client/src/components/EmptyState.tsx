export default function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--border)] py-20 text-center">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="m20 20-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <p className="text-sm font-medium text-[var(--text)]">No products found</p>
      <p className="text-sm text-[var(--text-muted)]">Try adjusting your filters or search term.</p>
      <button
        type="button"
        onClick={onReset}
        className="mt-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
      >
        Reset filters
      </button>
    </div>
  );
}
