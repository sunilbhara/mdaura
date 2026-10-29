import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ReleaseList } from "@/components/releases/ReleaseList";

export const metadata: Metadata = {
  title: "Release notes | MDAura",
  description: "Every change to MDAura, newest first.",
};

export default function ReleasesPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-32 sm:px-8 lg:pt-36">
        <h1 className="font-display text-[44px] font-medium leading-[1.05] tracking-[-0.02em] text-ink sm:text-[54px]">Release notes</h1>
        <p className="mt-4 max-w-xl text-[16.5px] leading-relaxed text-ink-2">
          What changed in MDAura and when. Each version links to itself, so you can point someone at a specific release.
        </p>
        <ReleaseList />
      </main>
      <SiteFooter />
    </>
  );
}
