export default function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] py-20 text-center"
    >
      <p className="text-sm font-medium text-[var(--text)]">Something went wrong</p>
      <p className="text-sm text-[var(--text-muted)]">
        We couldn&apos;t load products. Check that the API server is running.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
      >
        Try again
      </button>
    </div>
  );
}
