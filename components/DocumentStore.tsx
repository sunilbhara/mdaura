"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

type State = { content: string; fileName: string; isShared: boolean; imageMap: Record<string, string> };
type LoadOpts = { isShared?: boolean; imageMap?: Record<string, string> };

/**
 * The open document lives in a tiny external store, mirrored to sessionStorage so a reload
 * (or a dev hot-reload) keeps it. sessionStorage is per tab and is cleared when the tab closes.
 */
const KEY = "mdaura_doc";
const MAX_PERSIST = 4_500_000; // stay under the ~5 MB sessionStorage quota
const empty: State = { content: "", fileName: "", isShared: false, imageMap: {} };

let current: State | null = null;
const listeners = new Set<() => void>();

function restore(): State {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return { ...empty, ...(JSON.parse(raw) as State) };
  } catch {}
  return empty;
}

export const docStore = {
  get(): State {
    if (current === null) current = typeof window === "undefined" ? empty : restore();
    return current;
  },
  set(next: State) {
    current = next;
    try {
      const raw = JSON.stringify(next);
      if (next.content && raw.length <= MAX_PERSIST) sessionStorage.setItem(KEY, raw);
      else sessionStorage.removeItem(KEY);
    } catch {}
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

const getServer = () => empty;

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useDocument() {
  const state = useSyncExternalStore(docStore.subscribe, docStore.get, getServer);
  const loadContent = useCallback((content: string, fileName: string, opts?: LoadOpts) => {
    docStore.set({ content, fileName, isShared: !!opts?.isShared, imageMap: opts?.imageMap ?? {} });
  }, []);
  const clearContent = useCallback(() => docStore.set(empty), []);
  return useMemo(() => ({ ...state, loadContent, clearContent }), [state, loadContent, clearContent]);
}
