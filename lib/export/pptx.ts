import { saveAs } from "file-saver";
import type { DeckMeta, DeckSlide } from "./deck";

const ACCENT = "3DD6C3";
const VIOLET = "8B8FF7";
const BG = "0B0E12";
const TEXT = "C3CBD4";

const clean = (s: string) =>
  s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[*_`~]/g, "")
    .trim();

export async function exportPptx(slides: DeckSlide[], meta: DeckMeta, fileName: string) {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";
  pptx.title = meta.title;

  for (const s of slides) {
    const slide = pptx.addSlide();
    slide.background = { color: BG };
    const lines = s.markdown.split("\n");
    const heading = lines.find((l) => /^#{1,6}\s/.test(l));
    const title = heading ? clean(heading.replace(/^#+\s*/, "")) : s.title;
    const body = lines.filter((l) => l !== heading && l.trim() && !/^```/.test(l));

    if (s.type === "title" || s.type === "section") {
      slide.addText(title, { x: 0.8, y: 2.0, w: 8.4, h: 1.2, fontFace: "Calibri", fontSize: s.type === "title" ? 40 : 34, bold: true, color: ACCENT });
      slide.addShape(pptx.ShapeType.rect, { x: 0.8, y: 3.25, w: 1.6, h: 0.05, fill: { color: VIOLET } });
      const sub = body.map((l) => clean(l.replace(/^[-*+]\s+|^\d+\.\s+/, ""))).filter(Boolean).join("\n");
      if (sub) slide.addText(sub, { x: 0.8, y: 3.5, w: 8.4, h: 1.2, fontFace: "Calibri", fontSize: 18, color: TEXT, valign: "top" });
      continue;
    }

    slide.addText(title, { x: 0.6, y: 0.35, w: 8.8, h: 0.8, fontFace: "Calibri", fontSize: 28, bold: true, color: ACCENT });
    slide.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.15, w: 1.2, h: 0.04, fill: { color: VIOLET } });

    const runs = body
      .filter((l) => !/^\|?\s*:?-{2,}/.test(l))
      .map((l) => {
        const bullet = /^\s*[-*+]\s+/.test(l);
        const num = /^\s*\d+\.\s+/.test(l);
        const indent = Math.floor((l.match(/^\s*/)?.[0].length ?? 0) / 2);
        const text = clean(l.replace(/^\s*([-*+]|\d+\.)\s+/, "").replace(/^\|/, "").replace(/\|$/, "").replace(/\|/g, "  ·  "));
        return { text, options: { bullet: bullet || num ? (num ? { type: "number" as const } : true) : false, indentLevel: indent, breakLine: true, color: TEXT } };
      })
      .filter((r) => r.text);
    if (runs.length) slide.addText(runs, { x: 0.6, y: 1.4, w: 8.8, h: 3.8, fontFace: "Calibri", fontSize: 18, valign: "top", paraSpaceAfter: 6 });
  }

  const blob = (await pptx.write({ outputType: "blob" })) as Blob;
  saveAs(blob, fileName.replace(/\.[^.]+$/, "") + ".pptx");
}
