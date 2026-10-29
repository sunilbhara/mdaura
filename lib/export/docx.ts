import { saveAs } from "file-saver";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import {
  AlignmentType, BorderStyle, Document, ExternalHyperlink, Footer, Header, HeadingLevel, ImageRun, LevelFormat,
  Packer, PageNumber, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType,
  type ParagraphChild,
} from "docx";
import type { Root, RootContent, PhrasingContent, TableRow as MdRow } from "mdast";
import { renderDiagram, rasterizeSvg } from "@/lib/markdown/diagrams";
import { stashInlineImages, resolveImage, stripFrontMatter } from "@/lib/markdown/images";

type Img = { bytes: Uint8Array; width: number; height: number };
type Style = { bold?: boolean; italics?: boolean; strike?: boolean; code?: boolean; size?: number; color?: string };

const HEADINGS = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4, HeadingLevel.HEADING_5, HeadingLevel.HEADING_6];
const H_SIZE = [48, 36, 30, 26, 23, 21];
const BORDER = { style: BorderStyle.SINGLE, size: 4, color: "D5DBE1" };

function dataUrlToBytes(url: string): Uint8Array | null {
  const m = url.match(/^data:image\/[\w+.-]+;base64,(.*)$/);
  if (!m) return null;
  const bin = atob(m[1]);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function loadImage(url: string): Promise<Img | null> {
  try {
    let blob: Blob;
    if (url.startsWith("data:")) {
      if (url.startsWith("data:image/svg+xml")) {
        const svg = decodeURIComponent(url.split(",")[1] ?? "");
        return await rasterizeSvg(url.includes(";base64") ? atob(url.split(",")[1]) : svg);
      }
      const bytes = dataUrlToBytes(url);
      if (!bytes) return null;
      blob = new Blob([bytes.buffer as ArrayBuffer]);
    } else {
      const res = await fetch(url);
      if (!res.ok) return null;
      blob = await res.blob();
    }
    const bmp = await createImageBitmap(blob);
    // Re-encode to PNG so docx always gets a supported format.
    const canvas = document.createElement("canvas");
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    canvas.getContext("2d")!.drawImage(bmp, 0, 0);
    const png = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej()), "image/png"));
    return { bytes: new Uint8Array(await png.arrayBuffer()), width: bmp.width, height: bmp.height };
  } catch {
    return null;
  }
}

const fit = (w: number, h: number, max = 560) => {
  const k = w > max ? max / w : 1;
  return { width: Math.round(w * k), height: Math.round(h * k) };
};

export async function exportDocx(markdown: string, fileName: string, imageMap: Record<string, string> = {}) {
  const body = stripFrontMatter(markdown);
  const { text, map } = stashInlineImages(body);
  const tree = unified().use(remarkParse).use(remarkGfm).parse(text) as Root;

  // Pre-resolve images and mermaid diagrams (async work done up-front, builders stay sync).
  const images = new Map<string, Img | null>();
  const diagrams = new Map<string, Img | null>();
  const jobs: Promise<void>[] = [];
  const scan = (nodes: RootContent[] | PhrasingContent[]) => {
    for (const n of nodes) {
      if (n.type === "image") {
        const url = resolveImage(n.url, map, imageMap);
        if (!images.has(url)) {
          images.set(url, null);
          jobs.push(loadImage(url).then((r) => void images.set(url, r)));
        }
      } else if (n.type === "code" && /^(mermaid|mmd)$/i.test(n.lang ?? "")) {
        if (!diagrams.has(n.value)) {
          diagrams.set(n.value, null);
          jobs.push(
            renderDiagram(n.value, false)
              .then((svg) => rasterizeSvg(svg))
              .then((r) => void diagrams.set(n.value, r))
              .catch(() => {}),
          );
        }
      }
      if ("children" in n && Array.isArray(n.children)) scan(n.children as RootContent[]);
    }
  };
  scan(tree.children);
  await Promise.all(jobs);

  const title = (tree.children.find((n) => n.type === "heading" && n.depth === 1) as { children: PhrasingContent[] } | undefined)
    ?.children.map((c) => ("value" in c ? c.value : "")).join("") || fileName.replace(/\.[^.]+$/, "");

  const inline = (nodes: PhrasingContent[], st: Style = {}): ParagraphChild[] =>
    nodes.flatMap((n): ParagraphChild[] => {
      switch (n.type) {
        case "text": return [new TextRun({ text: n.value, bold: st.bold, italics: st.italics, strike: st.strike, size: st.size, color: st.color })];
        case "strong": return inline(n.children, { ...st, bold: true });
        case "emphasis": return inline(n.children, { ...st, italics: true });
        case "delete": return inline(n.children, { ...st, strike: true });
        case "inlineCode": return [new TextRun({ text: n.value, font: "Consolas", size: 20, shading: { type: ShadingType.CLEAR, fill: "F0F2F4", color: "auto" } })];
        case "break": return [new TextRun({ break: 1 })];
        case "link":
          return [new ExternalHyperlink({ link: n.url, children: n.children.flatMap((c) => c.type === "text" ? [new TextRun({ text: c.value, style: "Hyperlink", color: "0B7C71", underline: {} })] : (inline([c], st) as TextRun[])) })];
        case "image": {
          const img = images.get(resolveImage(n.url, map, imageMap));
          if (!img) return [new TextRun({ text: `[image: ${n.alt ?? n.url.slice(0, 40)}]`, italics: true, color: "6B7684" })];
          return [new ImageRun({ type: "png", data: img.bytes, transformation: fit(img.width, img.height) })];
        }
        default: return "value" in n && typeof n.value === "string" ? [new TextRun(n.value)] : [];
      }
    });

  const block = (n: RootContent, listLevel = -1, quote = false): (Paragraph | Table)[] => {
    switch (n.type) {
      case "heading":
        return [new Paragraph({ heading: HEADINGS[n.depth - 1], spacing: { before: 280, after: 120 }, children: inline(n.children, { bold: true, size: H_SIZE[n.depth - 1], color: "10151B" }) })];
      case "paragraph":
        return [new Paragraph({
          spacing: { after: 120, line: 300 },
          ...(quote ? { border: { left: { style: BorderStyle.SINGLE, size: 18, color: "0E9F90", space: 8 } }, indent: { left: 360 } } : {}),
          children: inline(n.children),
        })];
      case "blockquote":
        return n.children.flatMap((c) => block(c, listLevel, true));
      case "code": {
        if (/^(mermaid|mmd)$/i.test(n.lang ?? "")) {
          const d = diagrams.get(n.value);
          if (d) return [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 160 }, children: [new ImageRun({ type: "png", data: d.bytes, transformation: fit(d.width, d.height) })] })];
        }
        return n.value.split("\n").map((l, i, a) =>
          new Paragraph({
            shading: { type: ShadingType.CLEAR, fill: "F4F6F8", color: "auto" },
            spacing: { before: i === 0 ? 120 : 0, after: i === a.length - 1 ? 160 : 0 },
            children: [new TextRun({ text: l || " ", font: "Consolas", size: 19 })],
          }),
        );
      }
      case "list":
        return n.children.flatMap((li) =>
          li.children.flatMap((c, i) => {
            if (c.type === "paragraph") {
              const prefix = i === 0 && typeof li.checked === "boolean" ? [new TextRun(li.checked ? "☑ " : "☐ ")] : [];
              return [new Paragraph({
                numbering: { reference: n.ordered ? "ol" : "ul", level: Math.min(listLevel + 1, 4) },
                spacing: { after: 60 },
                children: [...prefix, ...inline(c.children)],
              })];
            }
            return block(c, listLevel + 1, quote);
          }),
        );
      case "table": {
        const rows = (n.children as MdRow[]).map((r, ri) =>
          new TableRow({
            tableHeader: ri === 0,
            children: r.children.map((cell) =>
              new TableCell({
                borders: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER },
                shading: ri === 0 ? { type: ShadingType.CLEAR, fill: "F0F2F4", color: "auto" } : undefined,
                margins: { top: 60, bottom: 60, left: 100, right: 100 },
                children: [new Paragraph({ children: inline(cell.children as PhrasingContent[], { bold: ri === 0 }) })],
              }),
            ),
          }),
        );
        return [new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }), new Paragraph({ children: [] })];
      }
      case "thematicBreak":
        return [new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "D5DBE1", space: 1 } }, children: [] })];
      case "html":
        return [];
      default:
        return [];
    }
  };
  const children = tree.children.flatMap((n) => block(n));
  const bullets = (ref: string, fmt: (typeof LevelFormat)[keyof typeof LevelFormat], chars?: string[]) => ({
    reference: ref,
    levels: Array.from({ length: 5 }, (_, level) => ({
      level,
      format: fmt,
      text: chars ? chars[level % chars.length] : `%${level + 1}.`,
      alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 540 + level * 360, hanging: 270 } } },
    })),
  });

  const doc = new Document({
    title,
    styles: { default: { document: { run: { font: "Calibri", size: 22, color: "36404B" } } } },
    numbering: { config: [bullets("ul", LevelFormat.BULLET, ["•", "◦", "▪"]), bullets("ol", LevelFormat.DECIMAL)] },
    sections: [{
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: title, size: 16, color: "6B7684" })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES], size: 16, color: "6B7684" })] })] }) },
      children,
    }],
  });

  saveAs(await Packer.toBlob(doc), fileName.replace(/\.[^.]+$/, "") + ".docx");
}
