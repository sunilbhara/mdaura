"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HiOutlineMenuAlt2, HiOutlineX } from "react-icons/hi";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DocumentView } from "@/components/DocumentView";
import { DOC_SECTIONS, type DocMeta } from "@/lib/docs";
import { useOutline } from "@/hooks/useOutline";
import { useActiveHeading } from "@/hooks/useActiveHeading";
import { scrollToHeading } from "@/lib/dom";

type Props = { slug: string; meta: DocMeta; content: string; prev: DocMeta | null; next: DocMeta | null };

function DocsNav({ slug, onNavigate }: { slug: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Documentation" className="space-y-7">
      {DOC_SECTIONS.map((s) => (
        <div key={s.title}>
          <h2 className="px-3 text-[13px] font-semibold text-ink">{s.title}</h2>
          <ul className="mt-2 space-y-px border-l border-rule">
            {s.pages.map((p) => {
              const active = p.slug === slug;
              return (
                <li key={p.slug}>
                  <Link
                    href={`/docs/${p.slug}`}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`-ml-px block border-l py-1.5 pl-3 text-[14px] transition-colors ${
                      active ? "border-accent font-medium text-ink" : "border-transparent text-muted hover:border-rule-strong hover:text-ink"
                    }`}
                  >
                    {p.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function OnThisPage({ content }: { content: string }) {
  const { headings } = useOutline(content);
  const items = headings.filter((h) => h.level === 2 || h.level === 3);
  const ids = useMemo(() => items.map((h) => h.id), [items]);
  const active = useActiveHeading(ids);
  if (items.length < 2) return null;
  return (
    <nav aria-label="On this page">
      <h2 className="text-[13px] font-semibold text-ink">On this page</h2>
      <ul className="mt-3 space-y-1.5">
        {items.map((h) => (
          <li key={h.id} style={{ paddingLeft: h.level === 3 ? 12 : 0 }}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                if (scrollToHeading(h.id)) e.preventDefault();
              }}
              className={`block text-[13px] leading-snug transition-colors ${active === h.id ? "text-accent-ink" : "text-muted hover:text-ink"}`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function DocsShell({ slug, meta, content, prev, next }: Props) {
  const [menu, setMenu] = useState(false);
  const section = DOC_SECTIONS.find((s) => s.pages.some((p) => p.slug === slug))?.title;

  return (
    <>
      <SiteHeader wide />
      <div className="mx-auto max-w-7xl px-5 pt-16 sm:px-8">
        <div className="sticky top-16 z-30 -mx-5 flex items-center gap-2 border-b border-rule bg-bg/90 px-5 py-2.5 backdrop-blur lg:hidden">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMenu(true)}>
            <HiOutlineMenuAlt2 size={15} /> Menu
          </button>
          <span className="truncate text-[13.5px] text-muted">{section} / <span className="text-ink">{meta.title}</span></span>
        </div>

        {menu && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-black/30" onClick={() => setMenu(false)} />
            <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto border-r border-rule bg-bg px-4 py-5">
              <div className="mb-5 flex justify-end">
                <button type="button" className="icon-btn" onClick={() => setMenu(false)} aria-label="Close menu"><HiOutlineX size={18} /></button>
              </div>
              <DocsNav slug={slug} onNavigate={() => setMenu(false)} />
            </div>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,1fr)_12rem]">
          <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] overflow-y-auto py-10 pr-2 lg:block">
            <DocsNav slug={slug} />
          </aside>

          <main className="min-w-0 py-10 lg:py-14">
            <article className="max-w-[44rem]">
              <p className="mb-3 text-[13.5px] font-medium text-accent-ink">{section}</p>
              <DocumentView content={content} />
            </article>
            <nav className="mt-16 grid max-w-[44rem] gap-3 border-t border-rule pt-8 sm:grid-cols-2" aria-label="Previous and next page">
              {prev ? (
                <Link href={`/docs/${prev.slug}`} className="rounded-xl border border-rule p-4 transition-colors hover:border-rule-strong">
                  <span className="block text-[12.5px] text-muted">Previous</span>
                  <span className="mt-0.5 block text-[15px] font-medium text-ink">{prev.title}</span>
                </Link>
              ) : <span />}
              {next && (
                <Link href={`/docs/${next.slug}`} className="rounded-xl border border-rule p-4 text-right transition-colors hover:border-rule-strong">
                  <span className="block text-[12.5px] text-muted">Next</span>
                  <span className="mt-0.5 block text-[15px] font-medium text-ink">{next.title}</span>
                </Link>
              )}
            </nav>
          </main>

          <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] overflow-y-auto py-14 xl:block">
            <OnThisPage content={content} />
          </aside>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
