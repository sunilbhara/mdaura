"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HiOutlineSearch } from "react-icons/hi";
import { parseOutline } from "@/hooks/useOutline";
import { stripFrontMatter } from "@/lib/markdown/images";
import { scrollToHeading } from "@/lib/dom";

type Hit = { id: string | null; heading: string; snippet: string; before: string; match: string; after: string };

function search(markdown: string, q: string): Hit[] {
  const needle = q.trim().toLowerCase();
  if (needle.length < 2) return [];
  const headings = parseOutline(markdown);
  const hits: Hit[] = [];
  let hIdx = -1;
  let fence = false;
  for (const raw of stripFrontMatter(markdown).split("\n")) {
    if (/^\s{0,3}(`{3,}|~{3,})/.test(raw)) fence = !fence;
    const hm = !fence && raw.match(/^\s{0,3}#{1,6}\s+/);
    if (hm) hIdx++;
    const line = raw.replace(/^\s{0,3}#{1,6}\s+/, "").replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1");
    const i = line.toLowerCase().indexOf(needle);
    if (i === -1) continue;
    const cur = headings[Math.max(hIdx, 0)];
    hits.push({
      id: hIdx >= 0 ? (cur?.id ?? null) : null,
      heading: hIdx >= 0 ? (cur?.text ?? "") : "Top",
      snippet: line,
      before: line.slice(Math.max(0, i - 40), i),
      match: line.slice(i, i + needle.length),
      after: line.slice(i + needle.length, i + needle.length + 60),
    });
    if (hits.length >= 40) break;
  }
  return hits;
}

export function FindDialog({ open, onClose, content }: { open: boolean; onClose: () => void; content: string }) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const hits = useMemo(() => (open ? search(content, q) : []), [content, q, open]);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const go = (id: string | null) => {
    onClose();
    if (!id) return window.scrollTo({ top: 0, behavior: "smooth" });
    scrollToHeading(id);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/30 px-4 pt-[12vh] backdrop-blur-[2px]" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Search document"
        className="popover w-full max-w-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-rule px-4">
          <HiOutlineSearch size={18} className="text-muted" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter" && hits[0]) go(hits[0].id);
            }}
            placeholder="Search this document…"
            className="h-14 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
          />
          <kbd className="kbd">Esc</kbd>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {q.trim().length >= 2 && hits.length === 0 && <li className="px-3 py-6 text-center text-[13.5px] text-muted">Nothing in this document matches that.</li>}
          {hits.map((h, i) => (
            <li key={i}>
              <button type="button" onClick={() => go(h.id)} className="block w-full rounded-lg px-3 py-2.5 text-left hover:bg-surface-2">
                <span className="block text-[12px] font-medium text-accent-ink">{h.heading}</span>
                <span className="block truncate text-[13.5px] text-ink-2">
                  {h.before}
                  <mark className="rounded bg-accent-soft px-0.5 font-medium text-ink">{h.match}</mark>
                  {h.after}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
