"use client";

import { useEffect, useMemo, useState } from "react";
import { HiOutlineArrowLeft, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineDownload } from "react-icons/hi";
import { DocumentView } from "./DocumentView";
import { parseDeck } from "@/lib/export/deck";
import { exportPptx } from "@/lib/export/pptx";

export function DeckView({ content, fileName, imageMap, onBack }: { content: string; fileName: string; imageMap: Record<string, string>; onBack: () => void }) {
  const { slides, meta } = useMemo(() => parseDeck(content), [content]);
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const last = slides.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") setI((v) => Math.min(last, v + 1));
      else if (e.key === "ArrowLeft" || e.key === "PageUp") setI((v) => Math.max(0, v - 1));
      else if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [last, onBack]);

  const handleExport = async () => {
    setBusy(true);
    try {
      await exportPptx(slides, meta, fileName);
    } finally {
      setBusy(false);
    }
  };

  const slide = slides[i];
  return (
    <div className="deck">
      <div className="deck-bar">
        <button type="button" onClick={onBack} className="deck-btn"><HiOutlineArrowLeft size={16} /> Back</button>
        <span className="deck-title">{meta.title}</span>
        <button type="button" onClick={handleExport} disabled={busy} className="deck-btn deck-btn-primary">
          <HiOutlineDownload size={16} /> {busy ? "Exporting…" : "PPTX"}
        </button>
      </div>
      <div className="deck-stage">
        <button type="button" className="deck-nav" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} aria-label="Previous slide"><HiOutlineChevronLeft size={22} /></button>
        <div className="deck-frame">
          <div className={`deck-slide deck-type-${slide?.type ?? "content"}`}>
            {slide && <DocumentView content={slide.markdown} imageMap={imageMap} />}
          </div>
          <span className="deck-count">{i + 1} / {slides.length}</span>
        </div>
        <button type="button" className="deck-nav" onClick={() => setI(Math.min(last, i + 1))} disabled={i === last} aria-label="Next slide"><HiOutlineChevronRight size={22} /></button>
      </div>
      <div className="deck-progress"><div style={{ width: `${((i + 1) / Math.max(1, slides.length)) * 100}%` }} /></div>
    </div>
  );
}
