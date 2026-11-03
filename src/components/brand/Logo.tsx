/** Kisani Urjaa mark: sun over a field furrow. Recreate from the official logo source when available. */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="18" fill="#173a29" />
      <circle cx="40" cy="22" r="8" fill="#f4c24d" />
      <path d="M14 46c8-2 14-8 18-18 1 10 6 16 18 18" fill="none" stroke="#f6f3ea" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 50h40" stroke="#5faf7a" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ size = 36, light }: { size?: number; light?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: light ? '#fff' : 'var(--fg)' }}>
      <LogoMark size={size} />
      <span style={{ font: `750 ${Math.round(size * 0.5)}px/1 var(--font)`, letterSpacing: '-0.02em' }}>Kisani Urjaa</span>
    </span>
  );
}
