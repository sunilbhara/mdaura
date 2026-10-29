import { useEffect, useState } from "react";

/** Returns the id of the heading currently nearest the top of the viewport. */
export function useActiveHeading(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (ids.length === 0) return;
    const onScroll = () => {
      let current: string | null = null;
      for (const id of ids) {
        // Next.js can keep a hidden copy of a previous route in the DOM with the same ids,
        // so use the first heading with this id that is actually laid out.
        const el = Array.from(document.querySelectorAll<HTMLElement>(`[id="${CSS.escape(id)}"]`)).find((n) => n.getClientRects().length > 0);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= 120) current = id;
        else break;
      }
      setActive(current ?? ids[0]);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ids]);

  return active;
}
