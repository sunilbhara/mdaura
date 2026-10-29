/**
 * Replace inline base64 images with short placeholders so huge data URLs stay out of the AST.
 * The renderer's `img` component resolves placeholders back through the returned map.
 */
export function stashInlineImages(markdown: string): { text: string; map: Record<string, string> } {
  const map: Record<string, string> = {};
  let n = 0;
  const stash = (url: string) => {
    const key = `__mdaura_img_${n++}__`;
    map[key] = url;
    return key;
  };
  const text = markdown
    .replace(/(!\[[^\]]*\]\()(data:image\/[^)\s]+)(\s+"[^"]*")?\)/g, (_m, pre, url, title) => `${pre}${stash(url)}${title ?? ""})`)
    .replace(/(<img\b[^>]*?\bsrc=["'])(data:image\/[^"']+)(["'])/gi, (_m, pre, url, post) => `${pre}${stash(url)}${post}`);
  return { text, map };
}

/** Strip YAML front matter. */
export function stripFrontMatter(md: string): string {
  return md.replace(/^---\s*\n[\s\S]*?\n---\s*(\n|$)/, "");
}

/** Resolve an image src against the folder-upload image map (path or basename match). */
export function resolveImage(src: string, placeholders: Record<string, string>, imageMap: Record<string, string>): string {
  if (placeholders[src]) return placeholders[src];
  if (/^(https?:|data:|blob:)/i.test(src)) return src;
  const clean = decodeURI(src).replace(/^\.\//, "").replace(/^\/+/, "");
  if (imageMap[clean]) return imageMap[clean];
  const base = clean.split("/").pop() ?? clean;
  return imageMap[base] ?? src;
}
