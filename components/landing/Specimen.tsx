/**
 * The hero piece: one small document shown twice, as the Markdown someone wrote
 * and as MDAura renders it. Static on purpose; the real reader is one click away.
 */
const SOURCE = `# Release checklist

Ship on **Thursday** after
the freeze.

| Step     | Owner | Status |
|----------|-------|--------|
| Tag      | Priya | done   |
| Migrate  | Omar  | ready  |
| Announce | Lena  | draft  |

\`\`\`mermaid
flowchart LR
  T[Tag] --> M[Migrate]
  M --> A[Announce]
\`\`\`

> Roll back with \`make revert\`.`;

export function Specimen() {
  return (
    <figure className="overflow-hidden rounded-[18px] border border-rule bg-surface shadow-[0_1px_2px_rgba(16,21,27,0.04),0_30px_60px_-40px_rgba(16,21,27,0.35)]">
      <div className="grid sm:grid-cols-[0.82fr_1fr]">
        <div className="border-b border-rule bg-surface-2/60 sm:border-b-0 sm:border-r">
          <div className="flex items-center justify-between border-b border-rule px-4 py-2.5">
            <span className="font-mono text-[12px] text-muted">release.md</span>
            <span className="text-[11.5px] text-muted">Source</span>
          </div>
          <pre className="m-0 overflow-hidden px-4 py-4 font-mono text-[11.5px] leading-[1.7] text-ink-2">{SOURCE}</pre>
        </div>

        <div>
          <div className="flex items-center justify-between border-b border-rule px-5 py-2.5">
            <span className="text-[12px] font-medium text-ink">Release checklist</span>
            <span className="text-[11.5px] text-accent-ink">In MDAura</span>
          </div>
          <div className="px-5 py-5" aria-hidden="true">
            <h3 className="font-display text-[25px] font-medium leading-tight tracking-[-0.015em] text-ink">Release checklist</h3>
            <p className="mt-2.5 text-[13.5px] text-ink-2">Ship on <strong className="font-semibold text-ink">Thursday</strong> after the freeze.</p>
            <table className="mt-4 w-full border-separate border-spacing-0 overflow-hidden rounded-lg border border-rule text-left text-[12.5px]">
              <thead className="bg-surface-2 text-ink">
                <tr><th className="px-3 py-1.5 font-semibold">Step</th><th className="px-3 py-1.5 font-semibold">Owner</th><th className="px-3 py-1.5 font-semibold">Status</th></tr>
              </thead>
              <tbody className="text-ink-2">
                {[["Tag", "Priya", "done"], ["Migrate", "Omar", "ready"], ["Announce", "Lena", "draft"]].map(([s, o, st]) => (
                  <tr key={s}>
                    <td className="border-t border-rule px-3 py-1.5 font-medium text-ink">{s}</td>
                    <td className="border-t border-rule px-3 py-1.5">{o}</td>
                    <td className="border-t border-rule px-3 py-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] ${st === "done" ? "bg-accent-soft text-accent-ink" : "bg-surface-2 text-muted"}`}>{st}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <svg viewBox="0 0 300 52" className="mt-5 w-full" role="img" aria-label="Tag, then Migrate, then Announce">
              <defs>
                <marker id="sp-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
                  <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)" />
                </marker>
              </defs>
              {([["Tag", 2], ["Migrate", 106], ["Announce", 210]] as const).map(([t, x]) => (
                <g key={t}>
                  <rect x={x} y="8" width="86" height="34" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.2" />
                  <text x={x + 43} y="29.5" textAnchor="middle" fontSize="12" fill="var(--ink)" fontFamily="Inter, sans-serif">{t}</text>
                </g>
              ))}
              <path d="M88 25 H104" stroke="var(--accent)" strokeWidth="1.6" markerEnd="url(#sp-arrow)" />
              <path d="M192 25 H208" stroke="var(--accent)" strokeWidth="1.6" markerEnd="url(#sp-arrow)" />
            </svg>
            <p className="mt-4 border-l-[3px] border-accent pl-3 text-[13px] text-ink-2">
              Roll back with <code className="rounded border border-rule bg-surface-2 px-1 py-0.5 font-mono text-[11.5px] text-ink">make revert</code>.
            </p>
          </div>
        </div>
      </div>
    </figure>
  );
}
