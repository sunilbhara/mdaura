/**
 * Next.js can keep a hidden copy of a previous route in the DOM, so an id may appear twice.
 * Return the first element with this id that is actually laid out.
 */
export function visibleById(id: string): HTMLElement | null {
  const all = document.querySelectorAll<HTMLElement>(`[id="${CSS.escape(id)}"]`);
  return Array.from(all).find((n) => n.getClientRects().length > 0) ?? null;
}

/** Smooth-scroll to a heading, leaving room for the fixed header. */
export function scrollToHeading(id: string, offset = 84) {
  const el = visibleById(id);
  if (!el) return false;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: "smooth" });
  history.replaceState(null, "", `#${id}`);
  return true;
}
