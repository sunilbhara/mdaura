import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Dropzone } from "@/components/Dropzone";
import { Specimen } from "@/components/landing/Specimen";

const READER = [
  { term: "An outline that keeps your place", def: "Every heading becomes a link in the sidebar, and the current section stays highlighted as you scroll." },
  { term: "Diagrams that draw themselves", def: "Mermaid flowcharts, sequences, state machines, ER models, Gantt charts and more. Open any of them full screen to pan and zoom." },
  { term: "Search inside the document", def: "Press Ctrl K, type a few letters and jump straight to the section that mentions them." },
  { term: "Tables and code that hold up", def: "Wide tables scroll instead of breaking the page. Code blocks are highlighted and copy with one click." },
  { term: "Slides from the same file", def: "A Marp file opens as a full-screen deck you can present from the browser or export to PowerPoint." },
];

const IN = ["Markdown and GitHub-flavoured Markdown", "MDX and plain text", "Marp slide decks", "A folder with a .md file and its images"];
const OUT = ["Word document, diagrams included", "PowerPoint deck", "PDF, through your browser's print dialog", "The original Markdown", "A share link, coming soon"];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="hero-aura" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-6xl gap-14 px-5 pb-20 pt-32 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16 lg:pt-40">
            <div>
              <h1 className="font-display text-[44px] font-medium leading-[1.04] tracking-[-0.02em] text-ink sm:text-[60px]">
                Markdown, read the way it was meant to look.
              </h1>
              <p className="mt-6 max-w-[34rem] text-[17px] leading-[1.65] text-ink-2">
                Open a .md file and get a proper document: an outline, search, highlighted code and diagrams that draw themselves in.
                Everything happens in your browser, and nothing is uploaded.
              </p>
              <div className="mt-9 max-w-[34rem]">
                <Dropzone />
              </div>
            </div>
            <Specimen />
          </div>
        </section>

        <section className="border-t border-rule">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
            <div>
              <h2 className="font-display text-[34px] font-medium leading-tight tracking-[-0.015em] text-ink">A reader, not an editor.</h2>
              <p className="mt-4 max-w-sm text-[15.5px] leading-relaxed text-ink-2">
                Write in whatever tool you like. MDAura is for the moment someone has to read what you wrote.
              </p>
              <Link href="/docs" className="mt-6 inline-block text-[14.5px] font-medium text-accent-ink underline decoration-rule-strong underline-offset-4 hover:decoration-accent">
                Read the documentation
              </Link>
            </div>
            <dl className="divide-y divide-rule border-y border-rule">
              {READER.map((r) => (
                <div key={r.term} className="grid gap-1 py-5 sm:grid-cols-[15rem_1fr] sm:gap-8">
                  <dt className="text-[15px] font-medium text-ink">{r.term}</dt>
                  <dd className="text-[15px] leading-relaxed text-ink-2">{r.def}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="border-t border-rule bg-surface">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="text-[15px] font-semibold text-ink">Opens</h2>
              <ul className="mt-4 divide-y divide-rule border-t border-rule">
                {IN.map((x) => <li key={x} className="py-3 text-[15px] text-ink-2">{x}</li>)}
              </ul>
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-ink">Exports</h2>
              <ul className="mt-4 divide-y divide-rule border-t border-rule">
                {OUT.map((x) => <li key={x} className="py-3 text-[15px] text-ink-2">{x}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section className="border-t border-rule">
          <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
            <p className="max-w-3xl font-display text-[30px] font-normal leading-[1.3] tracking-[-0.01em] text-ink sm:text-[38px]">
              Free, open source, and private by design. Your file is read by your browser and goes nowhere else.
            </p>
            <p className="mt-6 text-[15px] text-ink-2">
              Share links are coming next. Until then, export to Word, PDF or Markdown and send the file.{" "}
              <Link href="/docs/sharing" className="text-accent-ink underline decoration-rule-strong underline-offset-4 hover:decoration-accent">What is planned</Link>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
