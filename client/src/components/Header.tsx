import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div>
          <p className="text-lg font-semibold tracking-tight">Product Explorer</p>
          <p className="text-sm text-[var(--text-muted)]">500 products, zero jank</p>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
