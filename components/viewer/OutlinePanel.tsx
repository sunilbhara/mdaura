"use client";

import { useMemo } from "react";
import type { Heading } from "@/hooks/useOutline";
import { useActiveHeading } from "@/hooks/useActiveHeading";
import { scrollToHeading } from "@/lib/dom";

type Stats = { words: number; readingMinutes: number; sections: number };

export function OutlinePanel({ headings, stats, open, onClose }: { headings: Heading[]; stats: Stats; open: boolean; onClose: () => void }) {
  const ids = useMemo(() => headings.map((h) => h.id), [headings]);
  const active = useActiveHeading(ids);
  const toc = headings.filter((h) => h.level <= 3);
  const minLevel = toc.length ? Math.min(...toc.map((h) => h.level)) : 1;
  const activeIdx = ids.indexOf(active ?? "");
  const progress = ids.length ? Math.round(((activeIdx + 1) / ids.length) * 100) : 0;

  const go = (id: string) => {
    if (!scrollToHeading(id)) return;
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <>
      {open && <div className="no-print fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={`no-print fixed bottom-0 left-0 top-14 z-40 flex w-72 flex-col border-r border-rule bg-bg transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Document outline"
        aria-hidden={!open}
      >
        <div className="flex items-baseline justify-between px-5 pb-3 pt-6">
          <h2 className="text-[13px] font-semibold text-ink">Contents</h2>
          <span className="text-[12px] tabular-nums text-muted">{progress}%</span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-6">
          {toc.length === 0 && <p className="px-2 text-[13px] text-muted">This document has no headings.</p>}
          <ul>
            {toc.map((h) => {
              const isActive = active === h.id;
              return (
                <li key={h.id}>
                  <button
                    type="button"
                    tabIndex={open ? 0 : -1}
                    onClick={() => go(h.id)}
                    style={{ paddingLeft: 10 + (h.level - minLevel) * 14 }}
                    aria-current={isActive ? "location" : undefined}
                    className={`relative block w-full rounded-md py-[5px] pr-2 text-left text-[13.5px] leading-snug transition-colors ${
                      isActive ? "font-medium text-ink" : h.level === minLevel ? "text-ink-2 hover:text-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    {isActive && <span className="absolute inset-y-1 left-0 w-[2px] rounded-full bg-accent" aria-hidden="true" />}
                    {h.text}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-rule px-5 py-3.5 text-[12.5px] text-muted">
          {stats.words.toLocaleString()} words, about {stats.readingMinutes} min
        </div>
      </aside>
    </>
  );
}
