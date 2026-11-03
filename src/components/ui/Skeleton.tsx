import type { CSSProperties } from 'react';

export function Skeleton({ w = '100%', h = 16, r = 10, style }: { w?: number | string; h?: number | string; r?: number; style?: CSSProperties }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} aria-hidden />;
}

/** List of media rows, used while lists load. */
export function SkeletonRows({ count = 4, thumb = 96 }: { count?: number; thumb?: number }) {
  return (
    <div className="stack" style={{ ['--gap' as string]: '16px' }} aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="row" style={{ ['--gap' as string]: '16px', alignItems: 'flex-start' }}>
          <Skeleton w={thumb} h={thumb} r={16} />
          <div className="stack grow" style={{ ['--gap' as string]: '8px', paddingTop: 4 }}>
            <Skeleton h={14} w="40%" />
            <Skeleton h={18} />
            <Skeleton h={18} w="75%" />
            <Skeleton h={12} w="30%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 3, h = 140 }: { count?: number; h?: number }) {
  return (
    <div className="stack" style={{ ['--gap' as string]: '12px' }} aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} h={h} r={22} />
      ))}
    </div>
  );
}
