export function UnavailableState({
  title,
  message,
}: {
  title?: string;
  message: string;
}) {
  return (
    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-text-secondary">
      {title ? <p className="font-medium text-amber-100">{title}</p> : null}
      <p className={title ? "mt-2" : undefined}>{message}</p>
    </div>
  );
}

export function SourceLink({ href, label }: { href: string; label: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block break-all text-xs text-blue-400 hover:text-blue-300"
    >
      {label || href}
    </a>
  );
}
