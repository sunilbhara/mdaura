"use client";

import { useEffect, useRef, useState } from "react";
import { HiOutlineArrowsExpand, HiOutlineClipboardCheck, HiOutlineClipboardCopy, HiOutlinePlay } from "react-icons/hi";
import { renderDiagram, animateDiagram } from "@/lib/markdown/diagrams";
import { DiagramCanvas } from "./diagram/DiagramCanvas";
import { useTheme } from "./ThemeProvider";

const KINDS: [RegExp, string][] = [
  [/^(flowchart|graph)\b/, "Flowchart"], [/^sequenceDiagram/, "Sequence"], [/^classDiagram/, "Class"],
  [/^stateDiagram/, "State"], [/^erDiagram/, "Entity relationship"], [/^gantt/, "Gantt"], [/^pie/, "Pie"],
  [/^mindmap/, "Mind map"], [/^gitGraph/, "Git graph"], [/^timeline/, "Timeline"], [/^journey/, "User journey"],
  [/^quadrantChart/, "Quadrant"], [/^xychart/, "XY chart"], [/^sankey/, "Sankey"], [/^C4/, "C4"],
  [/^block/, "Block"], [/^architecture/, "Architecture"], [/^kanban/, "Kanban"], [/^packet/, "Packet"],
];

const MIN_INLINE_SCALE = 0.6;

export function diagramKind(code: string) {
  const first = code.replace(/^---[\s\S]*?---\s*/, "").replace(/^\s*%%.*$/gm, "").trim();
  return KINDS.find(([re]) => re.test(first))?.[1] ?? "Mermaid";
}

export function Diagram({ code }: { code: string }) {
  const { theme } = useTheme();
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const kind = diagramKind(code);

  useEffect(() => {
    let alive = true;
    renderDiagram(code, theme === "dark")
      .then((s) => {
        if (!alive) return;
        setSvg(s);
        setError(null);
      })
      .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : "Diagram error"));
    return () => {
      alive = false;
    };
  }, [code, theme]);

  // Wide diagrams would shrink to an unreadable size: never go below MIN_INLINE_SCALE, scroll instead.
  useEffect(() => {
    const root = contentRef.current;
    const el = root?.querySelector("svg");
    if (!root || !el) return;
    const natural = el.viewBox.baseVal?.width || 0;
    const fitScale = () => {
      const avail = root.parentElement?.clientWidth ?? 0;
      if (!natural || !avail) return;
      const wide = avail / natural < MIN_INLINE_SCALE;
      // Never upscale past natural size; below the minimum scale, fix the width and let the frame scroll.
      el.style.maxWidth = wide ? "none" : `${natural}px`;
      el.style.width = wide ? `${Math.round(natural * MIN_INLINE_SCALE)}px` : "100%";
      root.parentElement?.classList.toggle("is-wide", wide);
    };
    fitScale();
    const ro = new ResizeObserver(fitScale);
    if (root.parentElement) ro.observe(root.parentElement);
    return () => ro.disconnect();
  }, [svg]);

  // Wait a frame or two: geometry must be laid out before getTotalLength() is meaningful.
  useEffect(() => {
    if (!svg) return;
    const t = window.setTimeout(() => animateDiagram(contentRef.current), 80);
    return () => window.clearTimeout(t);
  }, [svg]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  if (error) {
    return (
      <div className="diagram-error" role="note">
        <p className="font-medium text-ink">This {kind.toLowerCase()} diagram has a syntax error</p>
        <p className="mt-1 text-[13px] text-muted">{error.split("\n")[0]}</p>
        <pre>{code}</pre>
      </div>
    );
  }

  return (
    <figure className="diagram-card">
      <figcaption className="diagram-card-head">
        <span className="text-[12.5px] font-medium text-muted">{kind}</span>
        <span className="flex items-center gap-0.5">
          <button type="button" className="icon-btn h-7 w-7" onClick={() => animateDiagram(contentRef.current)} aria-label="Replay animation" title="Replay"><HiOutlinePlay size={14} /></button>
          <button type="button" className="icon-btn h-7 w-7" onClick={copy} aria-label="Copy Mermaid source" title="Copy source">
            {copied ? <HiOutlineClipboardCheck size={14} /> : <HiOutlineClipboardCopy size={14} />}
          </button>
          <button type="button" className="icon-btn h-7 w-7" onClick={() => setOpen(true)} disabled={!svg} aria-label="Open full screen" title="Full screen">
            <HiOutlineArrowsExpand size={14} />
          </button>
        </span>
      </figcaption>
      {svg ? (
        <div
          role="button"
          tabIndex={0}
          className="diagram-card-body"
          onClick={() => setOpen(true)}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setOpen(true))}
          aria-label={`Open ${kind.toLowerCase()} diagram full screen`}
        >
          <div ref={contentRef} className="diagram-svg" dangerouslySetInnerHTML={{ __html: svg }} />
        </div>
      ) : (
        <div className="diagram-card-loading" aria-busy="true">Rendering diagram</div>
      )}
      {open && svg && <DiagramCanvas svg={svg} code={code} kind={kind} onClose={() => setOpen(false)} />}
    </figure>
  );
}
