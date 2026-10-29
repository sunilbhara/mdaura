"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { HiOutlineX } from "react-icons/hi";

const GROUPS: { title: string; rows: [string[], string][] }[] = [
  {
    title: "Reading",
    rows: [
      [["Ctrl", "K"], "Search the document"],
      [["["], "Show or hide the outline"],
      [["."], "Focus mode"],
      [["+"], "Larger text"],
      [["-"], "Smaller text"],
      [["?"], "This list"],
    ],
  },
  {
    title: "Full-screen diagram",
    rows: [
      [["F"], "Fit to screen"],
      [["0"], "Actual size"],
      [["+", "-"], "Zoom in or out"],
      [["R"], "Replay the animation"],
      [["S"], "Show the source"],
      [["Esc"], "Close"],
    ],
  },
];

export function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[110] grid place-items-center bg-black/40 px-4 backdrop-blur-[2px]" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" className="popover w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-ink">Keyboard shortcuts</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><HiOutlineX size={18} /></button>
        </div>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <h3 className="text-[13px] font-medium text-muted">{g.title}</h3>
              <dl className="mt-2 divide-y divide-rule">
                {g.rows.map(([keys, label]) => (
                  <div key={label} className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-[13.5px] text-ink-2">{label}</dt>
                    <dd className="flex gap-1">{keys.map((k) => <kbd key={k} className="kbd">{k}</kbd>)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
