"use client";

import { Children, isValidElement, useMemo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { HiOutlineLink } from "react-icons/hi";
import { CodeSample } from "./CodeSample";
import { Diagram } from "./Diagram";
import { Figure } from "./Figure";
import { stashInlineImages, resolveImage, stripFrontMatter } from "@/lib/markdown/images";
import { createSlugger } from "@/lib/markdown/slug";
import { scrollToHeading } from "@/lib/dom";

type HNode = { type: string; tagName?: string; properties?: Record<string, unknown>; children?: HNode[]; value?: string };

const textOf = (n: HNode): string => (n.type === "text" ? (n.value ?? "") : (n.children ?? []).map(textOf).join(""));

/** Custom rehype plugin: inject a slug id on every heading (runs AFTER sanitize, which would prefix ids). */
function rehypeHeadingIds() {
  return (tree: HNode) => {
    const slug = createSlugger();
    const walk = (n: HNode) => {
      if (n.type === "element" && n.tagName && /^h[1-6]$/.test(n.tagName)) {
        n.properties = { ...(n.properties ?? {}), id: slug(textOf(n)) };
      }
      n.children?.forEach(walk);
    };
    walk(tree);
  };
}

// Shared documents are untrusted: allow safe HTML only (no script/iframe/on*/javascript:), keep class + alignment attrs.
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // No className on arbitrary elements: utility classes like "fixed inset-0" would let a document
    // draw over the app. The default schema already allows language-*, task-list and footnote classes.
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "align"],
    img: [...(defaultSchema.attributes?.img ?? []), "width", "height", "loading"],
  },
};

const MMD = new Set(["mermaid", "mmd"]);
function Heading({ level, id, children }: { level: 1 | 2 | 3 | 4 | 5 | 6; id?: string; children?: React.ReactNode }) {
  const Tag = `h${level}` as const;
  const copyLink = () => {
    if (!id) return;
    const url = `${location.origin}${location.pathname}#${id}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    scrollToHeading(id);
  };
  return (
    <Tag id={id} className={`doc-h doc-h${level} group relative`}>
      {id && level > 1 && (
        <button type="button" onClick={copyLink} aria-label="Copy link to this section" className="doc-anchor no-print">
          <HiOutlineLink size={15} />
        </button>
      )}
      {children}
    </Tag>
  );
}

function buildComponents(placeholders: Record<string, string>, imageMap: Record<string, string>): Components {
  const h = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    const C = ({ id, children }: { id?: string; children?: React.ReactNode }) => (
      <Heading level={level} id={id}>{children}</Heading>
    );
    C.displayName = `H${level}`;
    return C;
  };
  return {
    h1: h(1), h2: h(2), h3: h(3), h4: h(4), h5: h(5), h6: h(6),
    pre: ({ children }) => <>{children}</>,
    code({ className, children }) {
      const lang = /language-([\w-]+)/.exec(className ?? "")?.[1];
      const text = String(children ?? "").replace(/\n$/, "");
      if (lang && MMD.has(lang.toLowerCase())) return <Diagram code={text} />;
      if (lang || text.includes("\n")) return <CodeSample code={text} language={lang} />;
      return <code className="doc-code-inline">{children}</code>;
    },
    table: ({ children }) => (
      <div className="doc-table-wrap"><table className="doc-table">{children}</table></div>
    ),
    blockquote: ({ children }) => <blockquote className="doc-quote">{children}</blockquote>,
    a: ({ href, children }) => {
      const external = !!href && /^https?:/i.test(href);
      return (
        <a href={href} className="doc-link" {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {children}
        </a>
      );
    },
    ul: ({ children }) => <ul className="doc-ul">{children}</ul>,
    ol: ({ children }) => <ol className="doc-ol">{children}</ol>,
    li: ({ children }) => <li className="doc-li">{children}</li>,
    p: ({ children }) => {
      // An image alone in a paragraph must not be wrapped in <p> containing block-level lightbox.
      const onlyImg = Children.toArray(children).every((c) => isValidElement(c));
      return onlyImg ? <div className="doc-p">{children}</div> : <p className="doc-p">{children}</p>;
    },
    hr: () => <div className="doc-hr" aria-hidden="true"><span /><span /><span /></div>,
    img: ({ src, alt }) => {
      const real = resolveImage(typeof src === "string" ? src : "", placeholders, imageMap);
      return real ? <Figure src={real} alt={alt} /> : null;
    },
  };
}

export function DocumentView({ content, imageMap = {} }: { content: string; imageMap?: Record<string, string> }) {
  const { text, map } = useMemo(() => stashInlineImages(stripFrontMatter(content)), [content]);
  const components = useMemo(() => buildComponents(map, imageMap), [map, imageMap]);
  return (
    <div className="doc">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, [rehypeSanitize, schema], rehypeHeadingIds]}
      components={components}
    >
      {text}
    </ReactMarkdown>
    </div>
  );
}
