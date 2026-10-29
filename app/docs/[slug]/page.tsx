import { readFile } from "node:fs/promises";
import path from "node:path";
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_DOCS, docNeighbours } from "@/lib/docs";
import { DocsShell } from "@/components/docs/DocsShell";
import { SiteHeader } from "@/components/SiteHeader";

export function generateStaticParams() {
  return ALL_DOCS.map((d) => ({ slug: d.slug }));
}

async function loadDoc(slug: string) {
  "use cache";
  return readFile(path.join(process.cwd(), "content", "docs", `${slug}.md`), "utf8");
}

export async function generateMetadata({ params }: PageProps<"/docs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const meta = ALL_DOCS.find((d) => d.slug === slug);
  return meta ? { title: `${meta.title} | MDAura Docs`, description: meta.description } : {};
}

async function DocContent({ params }: { params: PageProps<"/docs/[slug]">["params"] }) {
  const { slug } = await params;
  const meta = ALL_DOCS.find((d) => d.slug === slug);
  if (!meta) notFound();
  const content = await loadDoc(slug);
  return <DocsShell slug={slug} meta={meta} content={content} {...docNeighbours(slug)} />;
}

// Every slug is prerendered; the fallback only shows during a client navigation that has not prefetched yet.
export default function DocPage({ params }: PageProps<"/docs/[slug]">) {
  return (
    <Suspense fallback={<SiteHeader wide />}>
      <DocContent params={params} />
    </Suspense>
  );
}
