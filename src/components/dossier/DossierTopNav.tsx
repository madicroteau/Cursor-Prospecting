"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  DOSSIER_SECTIONS,
  type DossierSectionId,
} from "@/lib/dossier-sections";

export function DossierTopNav({
  activeSection,
}: {
  activeSection: DossierSectionId;
}) {
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const querySuffix = query ? `?${query}` : "";

  return (
    <nav
      aria-label="Dossier sections"
      className="border-b border-border bg-surface/40"
    >
      <div className="overflow-x-auto">
        <ul className="flex min-w-max items-stretch gap-1 px-1">
          {DOSSIER_SECTIONS.map((section) => {
            const isActive = section.id === activeSection;
            return (
              <li key={section.id}>
                <Link
                  href={`/dossier/${section.id}${querySuffix}`}
                  className={`inline-flex whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-accent text-white"
                      : "border-transparent text-text-muted hover:border-border hover:text-text-secondary"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {section.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
