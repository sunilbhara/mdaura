import { useMemo } from "react";
import { createSlugger, plainHeadingText } from "@/lib/markdown/slug";
import { stripFrontMatter } from "@/lib/markdown/images";

export type Heading = { id: string; text: string; level: number };

export function parseOutline(markdown: string): Heading[] {
  const slug = createSlugger();
  const out: Heading[] = [];
  let fence: string | null = null;
  for (const line of stripFrontMatter(markdown).split("\n")) {
    const f = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (f) {
      if (!fence) fence = f[1][0];
      else if (f[1][0] === fence) fence = null;
      continue;
    }
    if (fence) continue;
    const m = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*$/);
    if (!m) continue;
    const text = plainHeadingText(m[2]);
    out.push({ id: slug(text), text, level: m[1].length });
  }
  return out;
}

export function useOutline(markdown: string) {
  return useMemo(() => {
    const headings = parseOutline(markdown);
    const words = (markdown.match(/\S+/g) ?? []).length;
    return {
      headings,
      stats: { words, readingMinutes: Math.max(1, Math.round(words / 220)), sections: headings.length },
    };
  }, [markdown]);
}
