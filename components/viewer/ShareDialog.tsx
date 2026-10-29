"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { HiOutlineDocumentText, HiOutlineDownload, HiOutlineLink, HiOutlinePrinter, HiOutlineX } from "react-icons/hi";

/**
 * Share links are not built yet. This dialog says so plainly and points at the
 * ways to hand a document to someone today.
 */
export function ShareDialog({ open, onClose, onWord, onPrint, onMarkdown }: {
  open: boolean;
  onClose: () => void;
  onWord: () => void;
  onPrint: () => void;
  onMarkdown: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const pick = (fn: () => void) => () => {
    onClose();
    fn();
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] grid place-items-center bg-black/40 px-4 backdrop-blur-[2px]" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        className="share-dialog popover relative w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="share-art" aria-hidden="true">
          <span className="share-ring" />
          <span className="share-chip"><HiOutlineLink size={20} /></span>
        </div>

        <button ref={closeRef} type="button" className="icon-btn absolute right-3 top-3" onClick={onClose} aria-label="Close">
          <HiOutlineX size={18} />
        </button>

        <div className="px-7 pb-7 pt-6">
          <span className="inline-block rounded-full bg-accent-soft px-2.5 py-0.5 text-[12px] font-medium text-accent-ink">Coming soon</span>
          <h2 id="share-title" className="mt-3 font-display text-[26px] font-medium leading-tight tracking-[-0.015em] text-ink">
            Share links are on the way
          </h2>
          <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-2">
            Soon you will be able to send a link that opens this document in MDAura for anyone, with no account needed. Until then, export a copy.
          </p>

          <div className="mt-5 divide-y divide-rule overflow-hidden rounded-xl border border-rule">
            {[
              { label: "Word document", hint: "Diagrams included as images", icon: <HiOutlineDocumentText size={17} />, run: onWord },
              { label: "PDF", hint: "Through your browser's print dialog", icon: <HiOutlinePrinter size={17} />, run: onPrint },
              { label: "Markdown", hint: "The original file", icon: <HiOutlineDownload size={17} />, run: onMarkdown },
            ].map((o) => (
              <button key={o.label} type="button" onClick={pick(o.run)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2">
                <span className="text-muted">{o.icon}</span>
                <span className="flex-1">
                  <span className="block text-[14px] font-medium text-ink">{o.label}</span>
                  <span className="block text-[12.5px] text-muted">{o.hint}</span>
                </span>
              </button>
            ))}
          </div>

          <p className="mt-5 text-[13px] text-muted">
            Follow progress in the{" "}
            <Link href="/releases" className="text-accent-ink underline decoration-rule-strong underline-offset-4 hover:decoration-accent">release notes</Link>.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
