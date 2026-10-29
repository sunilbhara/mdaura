/**
 * MDAura mark: a page inside an open ring of light, the "aura" around a document.
 */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" className="logo-shadow">
      <defs>
        <linearGradient id="mdaura-ring" x1="8" y1="40" x2="40" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3dd6c3" />
          <stop offset="1" stopColor="#8b8ff7" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="42" height="42" rx="12" fill="#10151b" />
      <rect x="3.5" y="3.5" width="41" height="41" rx="11.5" stroke="#ffffff" strokeOpacity="0.08" />
      <circle cx="24" cy="24" r="14" stroke="url(#mdaura-ring)" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="70 18" transform="rotate(118 24 24)" />
      <rect x="17.5" y="15" width="13" height="18" rx="2.6" fill="#f4f7f8" />
      <rect x="20" y="18.6" width="6.4" height="2" rx="1" fill="#0e9f90" />
      <rect x="20" y="23" width="8" height="1.6" rx="0.8" fill="#9aa4ae" />
      <rect x="20" y="26.6" width="5.6" height="1.6" rx="0.8" fill="#9aa4ae" />
    </svg>
  );
}

export const APP_VERSION = "0.2.0";

export function Logo({ size = 32, showVersion = false }: { size?: number; showVersion?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="text-[16px] font-semibold tracking-[-0.01em] text-ink">MDAura</span>
      {showVersion && (
        <span className="rounded-md border border-rule px-1.5 py-0.5 text-[10px] font-medium text-muted">v{APP_VERSION}</span>
      )}
    </span>
  );
}
