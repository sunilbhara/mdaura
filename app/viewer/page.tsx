"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiOutlineArrowUp, HiOutlineEye, HiOutlineMenuAlt2, HiOutlineMinus, HiOutlinePlus, HiOutlineSearch, HiOutlineShare } from "react-icons/hi";
import { saveAs } from "file-saver";
import { LogoMark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DocumentView } from "@/components/DocumentView";
import { DeckView } from "@/components/DeckView";
import { docStore, useDocument } from "@/components/DocumentStore";
import { ProgressBar } from "@/components/viewer/ProgressBar";
import { OutlinePanel } from "@/components/viewer/OutlinePanel";
import { FindDialog } from "@/components/viewer/FindDialog";
import { ExportMenu } from "@/components/viewer/ExportMenu";
import { ShortcutsDialog } from "@/components/viewer/ShortcutsDialog";
import { ShareDialog } from "@/components/viewer/ShareDialog";
import { useOutline } from "@/hooks/useOutline";
import { isDeck } from "@/lib/export/deck";
import { visibleById } from "@/lib/dom";

const isTyping = (e: KeyboardEvent) => {
  const t = e.target as HTMLElement | null;
  return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
};

export default function ViewerPage() {
  const router = useRouter();
  const { content, fileName, imageMap } = useDocument();
  const { headings, stats } = useOutline(content);
  const [outline, setOutline] = useState(() => typeof window === "undefined" || window.innerWidth >= 1024);
  const [focus, setFocus] = useState(false);
  const [search, setSearch] = useState(false);
  const [shortcuts, setShortcuts] = useState(false);
  const [share, setShare] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showTop, setShowTop] = useState(false);

  // Read the store directly: during hydration `content` is still the empty server snapshot.
  useEffect(() => {
    if (!docStore.get().content) router.replace("/");
  }, [content, router]);

  const toggleFocus = useCallback(() => {
    const next = !focus;
    setFocus(next);
    setOutline(!next && window.innerWidth >= 1024);
  }, [focus]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch((s) => !s);
        return;
      }
      if (isTyping(e) || e.ctrlKey || e.metaKey || e.altKey || document.querySelector(".diagram-modal")) return;
      if (e.key === "?") setShortcuts((s) => !s);
      else if (e.key === "[") setOutline((o) => !o);
      else if (e.key === ".") toggleFocus();
      else if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(150, z + 10));
      else if (e.key === "-") setZoom((z) => Math.max(70, z - 10));
    };
    const onScroll = () => setShowTop(window.scrollY > 900);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [toggleFocus]);

  useEffect(() => {
    if (!content || !location.hash) return;
    const t = window.setTimeout(() => visibleById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView(), 300);
    return () => window.clearTimeout(t);
  }, [content]);

  const back = useCallback(() => router.push("/"), [router]);

  if (!content) return null;
  if (isDeck(content)) {
    return <DeckView content={content} fileName={fileName} imageMap={imageMap} onBack={back} />;
  }

  const name = fileName || "document.md";
  const downloadMd = () => saveAs(new Blob([content], { type: "text/markdown;charset=utf-8" }), name);
  const downloadWord = async () => {
    const { exportDocx } = await import("@/lib/export/docx");
    await exportDocx(content, name, imageMap);
  };

  return (
    <>
      <ProgressBar />
      <header
        className={`site-header no-print fixed inset-x-0 top-0 z-50 h-14 transition-opacity duration-200 ${focus ? "opacity-0 hover:opacity-100 focus-within:opacity-100" : ""}`}
      >
        <div className="flex h-full items-center justify-between gap-3 px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-1.5">
            <button type="button" className="icon-btn" aria-pressed={outline} onClick={() => setOutline((o) => !o)} aria-label="Show outline" title="Outline ( [ )">
              <HiOutlineMenuAlt2 size={18} />
            </button>
            <Link href="/" className="ml-1 shrink-0 rounded-lg" aria-label="MDAura home"><LogoMark size={26} /></Link>
            <span className="mx-2 hidden h-5 w-px bg-rule sm:block" />
            <span className="truncate text-[14px] font-medium text-ink" title={name}>{name}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearch(true)}
              className="hidden h-8 items-center gap-2 rounded-lg border border-rule bg-surface pl-2.5 pr-1.5 text-[13px] text-muted transition-colors hover:border-rule-strong md:inline-flex"
            >
              <HiOutlineSearch size={15} /> Search
              <span className="ml-3 flex gap-0.5"><kbd className="kbd">Ctrl</kbd><kbd className="kbd">K</kbd></span>
            </button>
            <button type="button" className="icon-btn md:hidden" onClick={() => setSearch(true)} aria-label="Search"><HiOutlineSearch size={18} /></button>
            <button type="button" className="icon-btn" aria-pressed={focus} onClick={toggleFocus} aria-label="Focus mode" title="Focus mode ( . )">
              <HiOutlineEye size={18} />
            </button>
            <button type="button" className="icon-btn hidden sm:inline-grid" onClick={() => setShortcuts(true)} aria-label="Keyboard shortcuts" title="Shortcuts ( ? )">
              <span className="text-[15px] font-semibold">?</span>
            </button>
            <ThemeToggle />
            <span className="mx-1 h-5 w-px bg-rule" />
            <ExportMenu onMarkdown={downloadMd} onWord={downloadWord} onPrint={() => window.print()} />
            <button type="button" className="btn btn-primary btn-sm ml-1" onClick={() => setShare(true)}>
              <HiOutlineShare size={14} /> Share
            </button>
          </div>
        </div>
      </header>

      <OutlinePanel headings={headings} stats={stats} open={outline} onClose={() => setOutline(false)} />
      <FindDialog open={search} onClose={() => setSearch(false)} content={content} />
      <ShortcutsDialog open={shortcuts} onClose={() => setShortcuts(false)} />
      <ShareDialog open={share} onClose={() => setShare(false)} onWord={downloadWord} onPrint={() => window.print()} onMarkdown={downloadMd} />

      <main className={`min-h-screen pt-14 transition-[padding] duration-200 ${outline ? "lg:pl-72" : ""}`}>
        <article className="mx-auto max-w-[46rem] px-6 pb-32 pt-14 sm:px-10 lg:pt-20" style={{ fontSize: `${zoom}%` }}>
          <DocumentView content={content} imageMap={imageMap} />
        </article>
      </main>

      <div className="no-print fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
        {showTop && (
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top" className="icon-btn popover h-10 w-10 rounded-full">
            <HiOutlineArrowUp size={17} />
          </button>
        )}
        <div className="popover flex items-center gap-0.5 rounded-full p-1" role="group" aria-label="Text size">
          <button type="button" onClick={() => setZoom((z) => Math.max(70, z - 10))} aria-label="Smaller text" className="icon-btn h-8 w-8 rounded-full"><HiOutlineMinus size={14} /></button>
          <button type="button" onClick={() => setZoom(100)} className="h-8 min-w-12 rounded-full px-1 text-[12.5px] font-medium tabular-nums text-ink-2 hover:bg-surface-2" title="Reset text size">{zoom}%</button>
          <button type="button" onClick={() => setZoom((z) => Math.min(150, z + 10))} aria-label="Larger text" className="icon-btn h-8 w-8 rounded-full"><HiOutlinePlus size={14} /></button>
        </div>
      </div>
    </>
  );
}
