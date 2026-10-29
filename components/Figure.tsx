/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HiOutlineArrowsExpand, HiOutlineMinus, HiOutlinePlus, HiOutlineX } from "react-icons/hi";

export function Figure({ src, alt }: { src: string; alt?: string }) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <span className="doc-figure">
        <img src={src} alt={alt ?? ""} loading="lazy" />
        <button type="button" className="figure-expand" onClick={() => { setZoom(1); setOpen(true); }} aria-label="Expand image">
          <HiOutlineArrowsExpand size={16} />
        </button>
      </span>
      {open &&
        createPortal(
          <div className="lightbox" onClick={() => setOpen(false)}>
            <div className="lightbox-bar" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} aria-label="Zoom out"><HiOutlineMinus size={16} /></button>
              <span>{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom((z) => Math.min(4, z + 0.25))} aria-label="Zoom in"><HiOutlinePlus size={16} /></button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close"><HiOutlineX size={16} /></button>
            </div>
            <div className="lightbox-body">
              <img src={src} alt={alt ?? ""} style={{ transform: `scale(${zoom})` }} onClick={(e) => e.stopPropagation()} />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
