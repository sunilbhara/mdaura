"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  HiOutlineClipboardCheck, HiOutlineClipboardCopy, HiOutlineCode, HiOutlineDownload, HiOutlineMinus,
  HiOutlinePlay, HiOutlinePlus, HiOutlineX,
} from "react-icons/hi";
import { renderDiagram, animateDiagram, rasterizeSvg } from "@/lib/markdown/diagrams";

const MIN = 0.1;
const MAX = 8;
type View = { s: number; x: number; y: number };

/** Give the SVG its natural pixel size so the canvas transform is the only thing scaling it. */
function naturalSvg(svg: string) {
  const vb = svg.match(/viewBox="([\d.\s,-]+)"/)?.[1].split(/[\s,]+/).map(Number);
  const w = vb?.[2] || 800;
  const h = vb?.[3] || 600;
  const html = svg.replace(/<svg\b([^>]*)>/, (_m, attrs: string) => {
    const cleaned = attrs.replace(/\s(width|height)="[^"]*"/g, "").replace(/\sstyle="[^"]*"/, "");
    return `<svg${cleaned} width="${w}" height="${h}" style="max-width:none;display:block">`;
  });
  return { html, w, h };
}

function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function DiagramCanvas({ svg, code, kind, onClose }: { svg: string; code: string; kind: string; onClose: () => void }) {
  const { html, w, h } = useMemo(() => naturalSvg(svg), [svg]);
  const stage = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const [view, setView] = useState<View>({ s: 1, x: 0, y: 0 });
  const [source, setSource] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const fit = useCallback(() => {
    const r = stage.current?.getBoundingClientRect();
    if (!r) return;
    const s = Math.min(MAX, Math.max(MIN, Math.min((r.width - 96) / w, (r.height - 96) / h)));
    setView({ s, x: (r.width - w * s) / 2, y: (r.height - h * s) / 2 });
  }, [w, h]);

  const zoomAt = useCallback((factor: number, cx?: number, cy?: number) => {
    setView((v) => {
      const r = stage.current?.getBoundingClientRect();
      const px = cx ?? (r ? r.width / 2 : 0);
      const py = cy ?? (r ? r.height / 2 : 0);
      const s = Math.min(MAX, Math.max(MIN, v.s * factor));
      const k = s / v.s;
      return { s, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
    });
  }, []);

  const actual = useCallback(() => {
    const r = stage.current?.getBoundingClientRect();
    if (!r) return;
    setView({ s: 1, x: (r.width - w) / 2, y: Math.max(48, (r.height - h) / 2) });
  }, [w, h]);

  useLayoutEffect(() => {
    fit();
  }, [fit]);

  useEffect(() => {
    const t = window.setTimeout(() => animateDiagram(content.current), 100);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, []);

  // Non-passive wheel listener so the page does not scroll while zooming.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
        zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0018)), e.clientX - r.left, e.clientY - r.top);
      } else {
        setView((v) => ({ ...v, x: v.x - e.deltaX }));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt, source]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      const k = e.key.toLowerCase();
      if (k === "escape") onClose();
      else if (k === "+" || k === "=") zoomAt(1.2);
      else if (k === "-" || k === "_") zoomAt(1 / 1.2);
      else if (k === "0") actual();
      else if (k === "f") fit();
      else if (k === "r") animateDiagram(content.current);
      else if (k === "s") setSource((s) => !s);
      else if (k.startsWith("arrow")) {
        const d = e.shiftKey ? 120 : 40;
        setView((v) => ({ ...v, x: v.x + (k === "arrowleft" ? d : k === "arrowright" ? -d : 0), y: v.y + (k === "arrowup" ? d : k === "arrowdown" ? -d : 0) }));
      } else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, zoomAt, fit, actual]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const download = async (type: "svg" | "png") => {
    setBusy(type);
    try {
      // Exports always use the light theme so they read well on paper and slides.
      const light = await renderDiagram(code, false);
      if (type === "svg") save(new Blob([light], { type: "image/svg+xml" }), `diagram.svg`);
      else {
        const { bytes } = await rasterizeSvg(light, 3);
        save(new Blob([bytes.buffer as ArrayBuffer], { type: "image/png" }), `diagram.png`);
      }
    } finally {
      setBusy(null);
    }
  };

  const tool = "icon-btn h-8 w-8";

  return createPortal(
    <div className="diagram-modal" role="dialog" aria-modal="true" aria-label={`${kind} diagram`}>
      <div className="diagram-modal-bar">
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate text-[14px] font-medium text-ink">{kind} diagram</span>
          <span className="hidden text-[12.5px] text-muted md:inline">Drag to pan, scroll to zoom, F to fit</span>
        </div>
        <div className="flex items-center gap-1">
          {!source && (
            <div className="mr-1 flex items-center rounded-[10px] border border-rule bg-surface p-0.5">
              <button type="button" className={tool} onClick={() => zoomAt(1 / 1.2)} aria-label="Zoom out"><HiOutlineMinus size={15} /></button>
              <button type="button" onClick={actual} className="h-8 min-w-14 rounded-md px-1 text-[12.5px] font-medium tabular-nums text-ink-2 hover:bg-surface-2" title="Actual size (0)">
                {Math.round(view.s * 100)}%
              </button>
              <button type="button" className={tool} onClick={() => zoomAt(1.2)} aria-label="Zoom in"><HiOutlinePlus size={15} /></button>
              <button type="button" onClick={fit} className="h-8 rounded-md px-2 text-[12.5px] font-medium text-ink-2 hover:bg-surface-2" title="Fit to screen (F)">Fit</button>
            </div>
          )}
          {!source && <button type="button" className={tool} onClick={() => animateDiagram(content.current)} aria-label="Replay animation" title="Replay (R)"><HiOutlinePlay size={16} /></button>}
          <button type="button" className={tool} aria-pressed={source} onClick={() => setSource((s) => !s)} aria-label="Show source" title="Source (S)"><HiOutlineCode size={16} /></button>
          <button type="button" className={tool} onClick={copy} aria-label="Copy Mermaid source" title="Copy source">
            {copied ? <HiOutlineClipboardCheck size={16} /> : <HiOutlineClipboardCopy size={16} />}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => download("svg")} disabled={!!busy}><HiOutlineDownload size={14} /> SVG</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => download("png")} disabled={!!busy}>{busy === "png" ? "Saving…" : "PNG"}</button>
          <span className="mx-1 h-5 w-px bg-rule" />
          <button type="button" className={tool} onClick={onClose} aria-label="Close (Esc)"><HiOutlineX size={18} /></button>
        </div>
      </div>

      {source ? (
        <div className="diagram-source">
          <pre><code>{code}</code></pre>
        </div>
      ) : (
        <div
          ref={stage}
          className="diagram-stage"
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (d) setView((v) => ({ ...v, x: d.vx + e.clientX - d.x, y: d.vy + e.clientY - d.y }));
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
          onDoubleClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            zoomAt(e.shiftKey ? 1 / 1.6 : 1.6, e.clientX - r.left, e.clientY - r.top);
          }}
        >
          <div
            ref={content}
            className="diagram-canvas"
            style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})` }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}
    </div>,
    document.body,
  );
}
