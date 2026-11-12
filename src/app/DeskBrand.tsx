import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { actions } from '@/services/store';
import { clearQueryCache } from '@/services/query';
import { isD2Path } from '@/d2/paths';
import s from './DeskBrand.module.css';

/**
 * Beside the device mock-up on wide screens, in both directions: the client
 * logo, the app name and a reset for reviewers. Reset clears everything
 * changed in the prototype and restarts this direction from the welcome
 * screens, after an inline confirmation.
 */
export function DeskBrand() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [confirming, setConfirming] = useState(false);

  // Step back from the confirmation if it is left alone.
  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(false), 6000);
    return () => clearTimeout(t);
  }, [confirming]);

  const reset = () => {
    setConfirming(false);
    actions.resetAll();
    clearQueryCache();
    navigate(isD2Path(pathname) ? '/d2' : '/', { replace: true });
  };

  return (
    <aside className={s.aside} aria-label="Kisani Urjaa">
      <div className={s.plate}>
        <Logo height={120} />
      </div>
      <p className={s.name}>Kisani Urjaa</p>
      {confirming ? (
        <div className={s.confirm} role="group" aria-label="Reset prototype">
          <p className={s.confirmText}>Clear every change and start again from the welcome screens?</p>
          <div className={s.confirmRow}>
            <button type="button" className={`${s.btn} ${s.btnDanger}`} onClick={reset} autoFocus>
              <RotateCcw aria-hidden /> Reset
            </button>
            <button type="button" className={s.btn} onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className={s.btn} onClick={() => setConfirming(true)}>
          <RotateCcw aria-hidden /> Reset prototype
        </button>
      )}
    </aside>
  );
}
