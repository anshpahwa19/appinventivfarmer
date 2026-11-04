import logoUrl from '@/assets/brand/kisani-urjaa-logo.webp';
import markUrl from '@/assets/brand/kisani-urjaa-mark.webp';
import s from './Logo.module.css';

/**
 * Official Kisani Urjaa logo (client artwork). Its brown wordmark and black
 * tagline need a light surface, so over photos or dark screens use `plate`.
 */
export function Logo({ height = 160, className }: { height?: number; className?: string }) {
  return <img src={logoUrl} alt="Kisani Urjaa: From Waste to Wealth, for Farmers’ Health" className={className} style={{ height, width: 'auto' }} draggable={false} />;
}

/** The pickaxe “K”, fist and wheat on their own, for small sizes. */
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return <img src={markUrl} alt="" aria-hidden className={className} style={{ height: size, width: 'auto' }} draggable={false} />;
}

/** Mark on a cream rounded tile, readable on any background. Optional name beside it. */
export function LogoPlate({ size = 48, name = false, light = false }: { size?: number; name?: boolean; light?: boolean }) {
  return (
    <span className={s.lockup}>
      <span className={s.plate} style={{ width: size, height: size, borderRadius: size * 0.3 }}>
        <LogoMark size={size * 0.82} />
      </span>
      {name && (
        <span className={s.name} style={{ color: light ? '#fff' : undefined, fontSize: Math.round(size * 0.4) }}>
          Kisani <span className={s.urjaa}>Urjaa</span>
        </span>
      )}
      <span className="sr-only">Kisani Urjaa</span>
    </span>
  );
}

export { logoUrl, markUrl };
