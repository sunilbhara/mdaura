"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineDocumentAdd, HiOutlineFolderOpen } from "react-icons/hi";
import { useDocument } from "./DocumentStore";

const MAX_BYTES = 50 * 1024 * 1024;
const MD_RE = /\.(md|markdown|mdx|txt)$/i;
const IMG_RE = /\.(png|jpe?g|gif|webp|svg|avif)$/i;

const readDataUrl = (f: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(r.error);
    r.readAsDataURL(f);
  });

export const SAMPLES = [
  { path: "/samples/handbook.md", name: "orbit-platform-handbook.md", label: "Engineering handbook", detail: "Long document, 15 diagrams" },
  { path: "/samples/example.md", name: "welcome-to-mdaura.md", label: "Quick tour", detail: "Two-minute read" },
  { path: "/samples/mermaid-showcase.md", name: "mermaid-showcase.md", label: "Diagram gallery", detail: "Every diagram type" },
  { path: "/samples/deck-demo.md", name: "deck-demo.md", label: "Slide deck", detail: "Opens as a presentation" },
];

export function useOpenDocument() {
  const router = useRouter();
  const { loadContent } = useDocument();
  return (text: string, name: string, imageMap: Record<string, string> = {}) => {
    loadContent(text, name, { imageMap });
    router.push("/viewer");
  };
}

export function Dropzone() {
  const open = useOpenDocument();
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);

  const openFile = async (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!MD_RE.test(file.name)) return setError(`${file.name} is not a Markdown file. Choose a .md, .markdown, .mdx or .txt file.`);
    if (file.size > MAX_BYTES) return setError(`${file.name} is larger than 50 MB.`);
    open(await file.text(), file.name);
  };

  const openFolder = async (files: FileList | null) => {
    setError(null);
    const list = Array.from(files ?? []);
    const md = list.filter((f) => MD_RE.test(f.name)).sort((a, b) => a.webkitRelativePath.length - b.webkitRelativePath.length)[0];
    if (!md) return setError("That folder has no Markdown file in it.");
    const imageMap: Record<string, string> = {};
    await Promise.all(
      list.filter((f) => IMG_RE.test(f.name)).map(async (f) => {
        const url = await readDataUrl(f);
        imageMap[f.webkitRelativePath.split("/").slice(1).join("/")] = url;
        imageMap[f.name] = url;
      }),
    );
    open(await md.text(), md.name, imageMap);
  };

  const openSample = async (path: string, name: string) => {
    setError(null);
    setLoading(path);
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error();
      open(await res.text(), name);
    } catch {
      setError("The sample did not load. Check your connection and try again.");
      setLoading(null);
    }
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); openFile(e.dataTransfer.files[0]); }}
        className={`rounded-[16px] border border-dashed p-5 transition-colors ${drag ? "border-accent bg-accent-soft" : "border-rule-strong bg-surface"}`}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-ink-2"><HiOutlineDocumentAdd size={22} /></span>
            <div>
              <p className="text-[15px] font-medium text-ink">{drag ? "Drop to open" : "Drop a Markdown file here"}</p>
              <p className="text-[13px] text-muted">.md, .markdown, .mdx or .txt, up to 50 MB</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-primary flex-1 sm:flex-none" onClick={() => fileRef.current?.click()}>Choose file</button>
            <button type="button" className="btn btn-ghost" onClick={() => folderRef.current?.click()} title="Open a folder with a .md file and its images">
              <HiOutlineFolderOpen size={16} /> Folder
            </button>
          </div>
        </div>
        <input ref={fileRef} type="file" accept=".md,.markdown,.mdx,.txt" hidden onChange={(e) => openFile(e.target.files?.[0])} />
        {/* @ts-expect-error non-standard but widely supported attribute */}
        <input ref={folderRef} type="file" hidden multiple webkitdirectory="" onChange={(e) => openFolder(e.target.files)} />
      </div>
      {error && <p role="alert" className="mt-3 text-[13.5px] text-rose-600 dark:text-rose-400">{error}</p>}

      <div className="mt-6">
        <p className="text-[13px] text-muted">No file handy? Open one of ours.</p>
        <ul className="mt-2 border-t border-rule">
          {SAMPLES.map((s) => (
            <li key={s.path} className="border-b border-rule">
              <button
                type="button"
                onClick={() => openSample(s.path, s.name)}
                disabled={loading !== null}
                className="group flex w-full items-baseline justify-between gap-3 py-2.5 text-left"
              >
                <span className="text-[14px] text-ink group-hover:text-accent-ink">{loading === s.path ? "Opening…" : s.label}</span>
                <span className="text-[12.5px] text-muted">{s.detail}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
