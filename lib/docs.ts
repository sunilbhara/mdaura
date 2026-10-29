export type DocMeta = { slug: string; title: string; description: string };
export type DocSection = { title: string; pages: DocMeta[] };

/** Sidebar order. Each slug maps to content/docs/<slug>.md. */
export const DOC_SECTIONS: DocSection[] = [
  {
    title: "Getting started",
    pages: [
      { slug: "getting-started", title: "Introduction", description: "What MDAura is and how to open your first document." },
      { slug: "opening-files", title: "Opening files", description: "Single files, folders with images, and the size limit." },
    ],
  },
  {
    title: "Reading",
    pages: [
      { slug: "reader", title: "The reader", description: "Outline, search, focus mode and text size." },
      { slug: "supported-markdown", title: "Supported Markdown", description: "Every syntax MDAura renders, with examples." },
      { slug: "diagrams", title: "Diagrams", description: "Mermaid support, the full-screen viewer and diagram exports." },
      { slug: "presentations", title: "Presentations", description: "Turn a Marp file into a slide deck." },
    ],
  },
  {
    title: "Exporting and sharing",
    pages: [
      { slug: "exporting", title: "Exporting", description: "Word, PDF, PowerPoint and Markdown." },
      { slug: "sharing", title: "Sharing", description: "What share links will do, and how to share a document today." },
    ],
  },
  {
    title: "Reference",
    pages: [
      { slug: "keyboard-shortcuts", title: "Keyboard shortcuts", description: "Every shortcut in the reader and the diagram viewer." },
      { slug: "privacy", title: "Privacy and security", description: "What stays on your machine and what does not." },
      { slug: "faq", title: "FAQ", description: "Answers to common questions." },
    ],
  },
];

export const ALL_DOCS = DOC_SECTIONS.flatMap((s) => s.pages);

export function docNeighbours(slug: string) {
  const i = ALL_DOCS.findIndex((d) => d.slug === slug);
  return { prev: i > 0 ? ALL_DOCS[i - 1] : null, next: i >= 0 && i < ALL_DOCS.length - 1 ? ALL_DOCS[i + 1] : null };
}
