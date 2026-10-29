/** Mermaid render queue, living-reveal animation and SVG→PNG rasteriser. Browser-only. */

// MDAura palette for Mermaid, tuned to the site tokens in globals.css.
const DARK_VARS = {
  primaryColor: "#122b2a",
  primaryTextColor: "#e6edf3",
  primaryBorderColor: "#2bb8a8",
  lineColor: "#3dd6c3",
  secondaryColor: "#1a2030",
  tertiaryColor: "#121820",
  mainBkg: "#122b2a",
  nodeBorder: "#2bb8a8",
  clusterBkg: "rgba(61,214,195,0.05)",
  clusterBorder: "#24585a",
  titleColor: "#5eead4",
  edgeLabelBackground: "#161b22",
  attributeBackgroundColorOdd: "#141a22",
  attributeBackgroundColorEven: "#10151b",
};
const LIGHT_VARS = {
  primaryColor: "#e6f6f3",
  primaryTextColor: "#0f2f2b",
  primaryBorderColor: "#3bb3a5",
  lineColor: "#0e9f90",
  secondaryColor: "#f2f4f7",
  tertiaryColor: "#fafbfc",
  mainBkg: "#e6f6f3",
  nodeBorder: "#3bb3a5",
  clusterBkg: "#f3faf9",
  clusterBorder: "#9fd9d1",
  titleColor: "#0b7c71",
  edgeLabelBackground: "#ffffff",
};

// Mermaid mutates global state, so renders are serialised.
let queue: Promise<unknown> = Promise.resolve();
let seq = 0;

export function renderDiagram(code: string, isDark: boolean): Promise<string> {
  const task = queue.then(async () => {
    const mermaid = (await import("mermaid")).default;
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? "dark" : "default",
      // "strict": diagrams come from untrusted (shared) documents.
      securityLevel: "strict",
      fontFamily: "Inter, system-ui, sans-serif",
      themeVariables: isDark ? DARK_VARS : LIGHT_VARS,
    });
    const { svg } = await mermaid.render(`mdaura-dgm-${++seq}`, code.trim());
    return svg;
  });
  queue = task.catch(() => {});
  return task;
}

const NODE_SEL = "g.node, g.cluster, g.statediagram-cluster, g.classGroup, g.stateGroup, g.actor-man, g.actor";
const EDGE_SEL =
  ".edgePaths path, path.flowchart-link, .edgePath path, path.relation, .messageLine0, .messageLine1, .transition";
const LABEL_SEL = ".edgeLabel, .edgeLabels, .messageText, .loopText";

// Timers are tracked per diagram root: several diagrams reveal at once and must not cancel each other.
const rootTimers = new WeakMap<HTMLElement, Set<number>>();

function addFlowTrail(edge: SVGGeometryElement, len: number) {
  const parent = edge.parentNode;
  if (!parent) return;
  const clone = edge.cloneNode(true) as SVGGeometryElement;
  clone.removeAttribute("id");
  clone.removeAttribute("marker-end");
  clone.removeAttribute("marker-start");
  clone.setAttribute("class", "diagram-trail");
  clone.style.strokeDasharray = "3 34";
  clone.style.strokeDashoffset = "0";
  clone.style.animationDelay = `${(len % 5) * 0.25}s`;
  parent.appendChild(clone);
}

/** Opacity/blur-in nodes, draw edges, fade labels. Never touches `transform` (mermaid positions nodes with it). */
export function animateDiagram(root: HTMLElement | null) {
  if (!root) return;
  rootTimers.get(root)?.forEach((t) => window.clearTimeout(t));
  const timers = new Set<number>();
  rootTimers.set(root, timers);
  const later = (fn: () => void, ms: number) => {
    timers.add(window.setTimeout(fn, ms));
  };
  root.querySelectorAll(".diagram-trail").forEach((n) => n.remove());
  const svg = root.querySelector("svg");
  if (!svg) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const mine = new Set<SVGElement>();
  const track = (el: SVGElement) => {
    mine.add(el);
    return el;
  };
  const showAll = () => {
    mine.forEach((el) => {
      el.style.opacity = "";
      el.style.filter = "";
      el.style.transition = "";
      el.style.strokeDasharray = "";
      el.style.strokeDashoffset = "";
      el.classList.remove("diagram-drawing");
    });
  };

  try {
    const nodes = Array.from(svg.querySelectorAll<SVGElement>(NODE_SEL));
    const edges = Array.from(svg.querySelectorAll<SVGGeometryElement>(EDGE_SEL));
    const labels = Array.from(svg.querySelectorAll<SVGElement>(LABEL_SEL));

    // A previous (interrupted) reveal may have left inline styles; measure from a clean slate.
    [...nodes, ...edges, ...labels].forEach((el) => {
      el.style.opacity = "";
      el.style.filter = "";
      el.style.transition = "";
      el.style.strokeDasharray = "";
      el.style.strokeDashoffset = "";
      el.classList.remove("diagram-drawing");
    });

    if (nodes.length === 0 && edges.length === 0) {
      const el = track(svg as unknown as SVGElement);
      el.style.opacity = "0";
      el.style.filter = "blur(6px)";
      el.style.transition = "opacity 600ms ease-out, filter 600ms ease-out";
      later(() => {
        el.style.opacity = "1";
        el.style.filter = "blur(0)";
      }, 40);
      later(showAll, 1100);
      return;
    }

    nodes.forEach((n, i) => {
      track(n);
      n.style.opacity = "0";
      n.style.filter = "blur(6px)";
      n.style.transition = "opacity 560ms cubic-bezier(0.2,0.8,0.2,1), filter 560ms cubic-bezier(0.2,0.8,0.2,1)";
      later(() => {
        n.style.opacity = "1";
        n.style.filter = "blur(0)";
      }, i * 70 + 40);
    });

    const edgeStart = nodes.length * 70 + 200;
    edges.forEach((edge, i) => {
      track(edge);
      const at = edgeStart + i * 90;
      let len = 0;
      try {
        len = edge.getTotalLength();
      } catch {
        len = 0;
      }
      const computed = getComputedStyle(edge).strokeDasharray;
      const dashed = !!edge.getAttribute("stroke-dasharray") || !["none", "0", "0px", ""].includes(computed);
      if (!len || len > 100000 || dashed) {
        edge.style.opacity = "0";
        edge.style.transition = "opacity 600ms ease";
        later(() => (edge.style.opacity = "1"), at);
        return;
      }
      edge.style.strokeDasharray = `${len}`;
      edge.style.strokeDashoffset = `${len}`;
      edge.classList.add("diagram-drawing");
      later(() => {
        edge.style.transition = "stroke-dashoffset 700ms cubic-bezier(0.4,0,0.2,1)";
        edge.style.strokeDashoffset = "0";
      }, at);
      later(() => {
        edge.style.strokeDasharray = "";
        edge.style.strokeDashoffset = "";
        edge.style.transition = "";
        edge.classList.remove("diagram-drawing");
        const flowable = edge.classList.contains("flowchart-link") || !!edge.closest(".edgePaths");
        if (flowable) addFlowTrail(edge, len);
      }, at + 740);
    });

    const labelsAt = edgeStart + edges.length * 90 + 140;
    labels.forEach((l) => {
      track(l);
      l.style.opacity = "0";
      l.style.transition = "opacity 600ms ease";
      later(() => (l.style.opacity = "1"), labelsAt);
    });

    later(showAll, labelsAt + 1400);
  } catch {
    showAll();
  }
}

/** Rasterise an SVG string to PNG bytes (white background) for DOCX export. */
export async function rasterizeSvg(svgText: string, scale = 2): Promise<{ bytes: Uint8Array; width: number; height: number }> {
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const el = doc.documentElement;
  const vb = el.getAttribute("viewBox")?.split(/[\s,]+/).map(Number);
  const w = vb?.[2] || parseFloat(el.getAttribute("width") || "800") || 800;
  const h = vb?.[3] || parseFloat(el.getAttribute("height") || "600") || 600;
  el.setAttribute("width", String(w));
  el.setAttribute("height", String(h));
  if (!el.getAttribute("xmlns")) el.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const xml = new XMLSerializer().serializeToString(el);
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("SVG rasterisation failed"));
    i.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/png"));
  return { bytes: new Uint8Array(await blob.arrayBuffer()), width: w, height: h };
}
