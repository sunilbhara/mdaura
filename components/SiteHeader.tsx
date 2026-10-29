"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { LATEST } from "@/lib/releases";

const NAV = [
  { href: "/docs", label: "Docs" },
  { href: "/releases", label: "Releases" },
];

export function SiteHeader({ wide = false }: { wide?: boolean }) {
  const path = usePathname();
  return (
    <header className="site-header no-print fixed inset-x-0 top-0 z-50 h-16">
      <div className={`mx-auto flex h-full ${wide ? "max-w-7xl" : "max-w-6xl"} items-center justify-between gap-4 px-5 sm:px-8`}>
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="MDAura home"><Logo size={28} /></Link>
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
            {NAV.map((n) => {
              const active = path === n.href || path.startsWith(n.href + "/");
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-3 py-1.5 text-[14px] transition-colors ${active ? "text-ink" : "text-muted hover:text-ink"}`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-1.5">
          <Link
            href={`/releases#v${LATEST.version}`}
            className="mr-1 hidden items-center gap-2 rounded-full border border-rule py-1 pl-1.5 pr-3 text-[12.5px] text-ink-2 transition-colors hover:border-rule-strong md:inline-flex"
          >
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent-ink">v{LATEST.version}</span>
            {LATEST.title}
          </Link>
          <ThemeToggle />
          <nav className="flex items-center sm:hidden" aria-label="Main mobile">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="px-2 py-1.5 text-[14px] text-muted hover:text-ink">{n.label}</Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
