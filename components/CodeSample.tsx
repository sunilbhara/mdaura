"use client";

import { useMemo, useState } from "react";
import hljs from "highlight.js/lib/common";
import { HiOutlineCheck, HiOutlineClipboardCopy } from "react-icons/hi";

export function CodeSample({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => {
    try {
      if (language && hljs.getLanguage(language)) return hljs.highlight(code, { language, ignoreIllegals: true }).value;
      return hljs.highlightAuto(code).value;
    } catch {
      return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
  }, [code, language]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="doc-code">
      <div className="doc-code-bar">
        <span className="doc-code-lang">{language || "text"}</span>
        <button type="button" onClick={copy} className="doc-code-copy" aria-label="Copy code">
          {copied ? <HiOutlineCheck size={14} /> : <HiOutlineClipboardCopy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre><code className="hljs" dangerouslySetInnerHTML={{ __html: html }} /></pre>
    </div>
  );
}
