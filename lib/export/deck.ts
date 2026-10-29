export type DeckSlide = { index: number; markdown: string; type: "title" | "section" | "content"; title: string };
export type DeckMeta = { title: string; theme?: string; paginate?: boolean; [k: string]: unknown };

const FM = /^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/;

export function isDeck(md: string): boolean {
  const m = md.match(FM);
  return !!m && /^\s*marp\s*:\s*true\s*$/im.test(m[1]);
}

function parseMeta(block: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of block.split("\n")) {
    const m = line.match(/^\s*([\w-]+)\s*:\s*(.*?)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

export function parseDeck(md: string): { slides: DeckSlide[]; meta: DeckMeta } {
  const fm = md.match(FM);
  const raw = parseMeta(fm?.[1] ?? "");
  const body = fm ? md.slice(fm[0].length) : md;

  // Split on `---` lines that are outside code fences.
  const chunks: string[] = [];
  let cur: string[] = [];
  let fence: string | null = null;
  for (const line of body.split("\n")) {
    const f = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (f) {
      if (!fence) fence = f[1][0];
      else if (f[1][0] === fence) fence = null;
    }
    if (!fence && /^\s{0,3}-{3,}\s*$/.test(line)) {
      chunks.push(cur.join("\n"));
      cur = [];
    } else cur.push(line);
  }
  chunks.push(cur.join("\n"));

  const slides: DeckSlide[] = chunks
    .map((c) => c.replace(/<!--[\s\S]*?-->/g, "").trim())
    .filter(Boolean)
    .map((markdown, index) => {
      const h = markdown.match(/^#{1,3}\s+(.+)$/m);
      const rest = markdown.split("\n").filter((l) => l.trim() && !/^#{1,6}\s/.test(l));
      const type: DeckSlide["type"] = index === 0 ? "title" : rest.length <= 1 && /^#{1,2}\s/m.test(markdown) ? "section" : "content";
      return { index, markdown, type, title: h?.[1].replace(/[*_`]/g, "") ?? `Slide ${index + 1}` };
    });

  const title = raw.title || slides[0]?.title || "Presentation";
  return { slides, meta: { ...raw, title, paginate: raw.paginate === "true" } };
}
