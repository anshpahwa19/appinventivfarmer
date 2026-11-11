import { Logo } from '@/components/brand/Logo';
import s from './DeskBrand.module.css';

/** Beside the device mock-up on wide screens, in both directions: the client logo and the app name. */
export function DeskBrand() {
  return (
    <aside className={s.aside} aria-label="Kisani Urjaa">
      <div className={s.plate}>
        <Logo height={120} />
      </div>
      <p className={s.name}>Kisani Urjaa</p>
    </aside>
  );
}
