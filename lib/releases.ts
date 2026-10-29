export type ChangeKind = "new" | "improved" | "fixed";
export type Change = { kind: ChangeKind; text: string };
export type Release = {
  version: string;
  date: string; // ISO
  title: string;
  summary: string;
  highlight?: { heading: string; body: string };
  changes: Change[];
};

export const KIND_LABEL: Record<ChangeKind, string> = { new: "New", improved: "Improved", fixed: "Fixed" };

/** Newest first. Edit here to publish release notes; the header badge reads RELEASES[0]. */
export const RELEASES: Release[] = [
  {
    version: "0.2.0",
    date: "2026-10-29",
    title: "A proper diagram viewer",
    summary:
      "Big diagrams get room to breathe, the reader gets an export menu and focus mode, and the site now has documentation and release notes.",
    highlight: {
      heading: "Full-screen diagrams you can explore",
      body: "Open any Mermaid diagram full screen, then drag to pan, scroll to zoom and press F to fit it to the window. Download it as SVG or PNG, or flip to the source and copy it.",
    },
    changes: [
      { kind: "new", text: "Full-screen diagram viewer with pan, wheel zoom, fit-to-screen and keyboard controls." },
      { kind: "new", text: "Download any diagram as SVG or PNG, or copy its Mermaid source." },
      { kind: "new", text: "Export menu in the reader: Word, PDF or Markdown." },
      { kind: "new", text: "Focus mode hides the outline so the page gets the whole screen." },
      { kind: "new", text: "Press ? in the reader to see every keyboard shortcut." },
      { kind: "new", text: "Documentation and release notes, published on the site." },
      { kind: "new", text: "A Share button that explains share links are coming, with export options for now." },
      { kind: "improved", text: "Wide diagrams stay readable: below 60% size they scroll sideways instead of shrinking." },
      { kind: "improved", text: "The open document survives a page reload." },
      { kind: "improved", text: "A cleaner look throughout, in light and dark themes." },
      { kind: "fixed", text: "Several diagrams on one page no longer cancel each other's reveal animation." },
      { kind: "fixed", text: "The flowing light on flowchart connectors now appears on first load, not only after replay." },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-10-14",
    title: "First release",
    summary: "Open a Markdown file and read it with an outline, search, highlighted code and diagrams that draw themselves in.",
    changes: [
      { kind: "new", text: "Drag-and-drop reader for .md, .markdown, .mdx and .txt files, or a whole folder with its images." },
      { kind: "new", text: "Outline that follows your scroll position, and Ctrl K search." },
      { kind: "new", text: "Mermaid diagrams with a reveal animation and a replay button." },
      { kind: "new", text: "Presentation mode for Marp files, with PowerPoint export." },
      { kind: "new", text: "Word export with diagrams rendered as images." },
      { kind: "new", text: "Every document is sanitised before rendering, and diagrams run in Mermaid's strict mode." },
      { kind: "new", text: "Light and dark themes." },
    ],
  },
];

export const LATEST = RELEASES[0];

export const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
