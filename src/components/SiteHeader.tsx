import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="relative z-10 border-b border-border/60 bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 ring-1 ring-accent/30">
            <svg
              aria-hidden="true"
              className="h-4 w-4 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-wide text-white">
            Account Intel
          </span>
        </Link>

        <span className="hidden rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs font-medium text-text-muted sm:inline-block">
          Interview demo · AdventHealth
        </span>
      </div>
    </header>
  );
}
