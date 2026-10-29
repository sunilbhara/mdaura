"use client";

import { useEffect, useRef, useState } from "react";
import { HiOutlineChevronDown, HiOutlineDocumentText, HiOutlineDownload, HiOutlinePrinter } from "react-icons/hi";

type Item = { id: string; label: string; hint: string; icon: React.ReactNode; run: () => Promise<void> | void };

export function ExportMenu({ onMarkdown, onWord, onPrint }: { onMarkdown: () => void; onWord: () => Promise<void>; onPrint: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const items: Item[] = [
    { id: "word", label: "Word document", hint: ".docx with diagrams as images", icon: <HiOutlineDocumentText size={17} />, run: onWord },
    { id: "pdf", label: "PDF", hint: "Opens your browser's print dialog", icon: <HiOutlinePrinter size={17} />, run: onPrint },
    { id: "md", label: "Markdown", hint: "The original file", icon: <HiOutlineDownload size={17} />, run: onMarkdown },
  ];

  const run = async (it: Item) => {
    setBusy(it.id);
    try {
      await it.run();
    } finally {
      setBusy(null);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button type="button" className="btn btn-ghost btn-sm" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {busy ? "Exporting…" : "Export"} <HiOutlineChevronDown size={14} />
      </button>
      {open && (
        <div role="menu" className="popover absolute right-0 top-[calc(100%+6px)] z-50 w-72 p-1.5">
          {items.map((it) => (
            <button
              key={it.id}
              type="button"
              role="menuitem"
              disabled={!!busy}
              onClick={() => run(it)}
              className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-surface-2 disabled:opacity-60"
            >
              <span className="mt-0.5 text-muted">{it.icon}</span>
              <span>
                <span className="block text-[14px] font-medium text-ink">{busy === it.id ? "Preparing…" : it.label}</span>
                <span className="block text-[12.5px] text-muted">{it.hint}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
