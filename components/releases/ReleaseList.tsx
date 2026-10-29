"use client";

import { useState } from "react";
import { HiOutlineLink } from "react-icons/hi";
import { KIND_LABEL, RELEASES, formatDate, type ChangeKind } from "@/lib/releases";

const FILTERS: (ChangeKind | "all")[] = ["all", "new", "improved", "fixed"];
const KIND_STYLE: Record<ChangeKind, string> = {
  new: "text-accent-ink",
  improved: "text-violet",
  fixed: "text-amber-700 dark:text-amber-400",
};

export function ReleaseList() {
  const [filter, setFilter] = useState<ChangeKind | "all">("all");

  return (
    <>
      <div className="mt-12 flex flex-wrap items-center gap-1 border-b border-rule pb-4" role="group" aria-label="Filter changes">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-[13.5px] transition-colors ${
              filter === f ? "bg-ink text-bg" : "text-muted hover:bg-surface-2 hover:text-ink"
            }`}
          >
            {f === "all" ? "All changes" : KIND_LABEL[f]}
          </button>
        ))}
      </div>

      <ol className="relative">
        {RELEASES.map((r, i) => {
          const changes = r.changes.filter((c) => filter === "all" || c.kind === filter);
          const groups = (["new", "improved", "fixed"] as ChangeKind[])
            .map((k) => ({ kind: k, items: changes.filter((c) => c.kind === k) }))
            .filter((g) => g.items.length);
          return (
            <li key={r.version} id={`v${r.version}`} className="grid scroll-mt-24 gap-4 border-b border-rule py-14 md:grid-cols-[11rem_1fr] md:gap-10">
              <div className="md:sticky md:top-24 md:self-start">
                <a href={`#v${r.version}`} className="group inline-flex items-center gap-2 text-[15px] font-semibold text-ink">
                  v{r.version}
                  <HiOutlineLink size={14} className="text-muted opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                </a>
                <p className="mt-1 text-[13.5px] text-muted">
                  <time dateTime={r.date}>{formatDate(r.date)}</time>
                </p>
                {i === 0 && <span className="mt-3 inline-block rounded-full bg-accent-soft px-2.5 py-0.5 text-[12px] font-medium text-accent-ink">Latest</span>}
              </div>

              <div className="min-w-0">
                <h2 className="font-display text-[28px] font-medium leading-tight tracking-[-0.015em] text-ink sm:text-[32px]">{r.title}</h2>
                <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-ink-2">{r.summary}</p>

                {r.highlight && filter === "all" && (
                  <div className="mt-7 rounded-2xl border border-rule bg-surface p-6">
                    <h3 className="text-[16px] font-semibold text-ink">{r.highlight.heading}</h3>
                    <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-2">{r.highlight.body}</p>
                  </div>
                )}

                {groups.length === 0 ? (
                  <p className="mt-7 text-[14.5px] text-muted">No {filter !== "all" && KIND_LABEL[filter].toLowerCase()} changes in this release.</p>
                ) : (
                  <div className="mt-8 space-y-7">
                    {groups.map((g) => (
                      <section key={g.kind}>
                        <h3 className={`text-[14px] font-semibold ${KIND_STYLE[g.kind]}`}>{KIND_LABEL[g.kind]}</h3>
                        <ul className="mt-2.5 space-y-2.5">
                          {g.items.map((c) => (
                            <li key={c.text} className="relative pl-5 text-[15px] leading-relaxed text-ink-2">
                              <span className="absolute left-0 top-[0.7em] h-1.5 w-1.5 rounded-full bg-rule-strong" aria-hidden="true" />
                              {c.text}
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
