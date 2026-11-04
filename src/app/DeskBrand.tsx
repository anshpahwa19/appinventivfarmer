import { Moon, Sun } from 'lucide-react';
import { actions } from '@/services/store';
import { useResolvedTheme } from '@/lib/theme';
import { Logo } from '@/components/brand/Logo';
import s from './DeskBrand.module.css';

/**
 * Beside the device mock-up on wide screens, in both directions: the client
 * logo, the app name and a light / dark switch for the app inside the frame.
 */
export function DeskBrand() {
  const theme = useResolvedTheme();
  const options = [
    { value: 'light', label: 'Light', icon: <Sun aria-hidden /> },
    { value: 'dark', label: 'Dark', icon: <Moon aria-hidden /> },
  ] as const;
  return (
    <aside className={`${s.aside} ${theme === 'dark' ? s.dark : ''}`} aria-label="Kisani Urjaa">
      <div className={s.plate}>
        <Logo height={120} />
      </div>
      <p className={s.name}>Kisani Urjaa</p>
      <div className={s.toggle} role="group" aria-label="Appearance">
        {options.map((o) => (
          <button key={o.value} type="button" className={s.option} aria-pressed={theme === o.value} onClick={() => actions.setPrefs({ theme: o.value })}>
            {o.icon}
            {o.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
