import Link from "next/link";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="no-print border-t border-rule">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div className="max-w-xs">
          <Logo size={24} />
          <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
            A reader for Markdown files. Reading and exporting happen in your browser.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-14 gap-y-2 text-[13.5px]">
          <span className="font-medium text-ink">Product</span>
          <span className="font-medium text-ink">Resources</span>
          <Link href="/" className="text-muted hover:text-ink">Open a file</Link>
          <Link href="/docs" className="text-muted hover:text-ink">Documentation</Link>
          <Link href="/docs/diagrams" className="text-muted hover:text-ink">Diagrams</Link>
          <Link href="/releases" className="text-muted hover:text-ink">Release notes</Link>
          <Link href="/docs/exporting" className="text-muted hover:text-ink">Exporting</Link>
          <Link href="/docs/privacy" className="text-muted hover:text-ink">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
