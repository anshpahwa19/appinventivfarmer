import { Screen } from '@/components/layout/Screen';
import { Logo } from '@/components/brand/Logo';
import { Scene } from '@/components/media/Scene';
import s from './Account.module.css';

export default function About() {
  return (
    <Screen title="About" back backTo="/account">
      <div className={s.page}>
        <div style={{ position: 'relative', height: 180, borderRadius: 28, overflow: 'hidden' }}>
          <Scene scene={{ kind: 'harvest', seed: 5, time: 'golden' }} aspect="wide" detail="high" style={{ position: 'absolute', inset: 0 }} />
          <div style={{ position: 'absolute', left: 18, bottom: 16 }}>
            <Logo size={40} light />
          </div>
        </div>
        <div className={s.prose}>
          <p>Kisani Urjaa works with farmers to turn crop residue into energy and organic manure, so fields are cleared without burning and soil gets richer.</p>
          <p>This app brings together your fields, season records, FOM orders, field bookings, local weather and advice in one place, with your Kisani Didi a tap away.</p>
          <h2>Credits</h2>
        </div>
        <div className={s.credits}>
          <p>
            <strong>Typeface:</strong> Plus Jakarta Sans (SIL Open Font License)
          </p>
          <p>
            <strong>Icons:</strong> Lucide (ISC License)
          </p>
          <p>
            <strong>Illustrations and animations:</strong> drawn in code for this app
          </p>
          <p>
            <strong>Weather:</strong> Open-Meteo, with a sample forecast when offline
          </p>
        </div>
        <p className="t-caption c-3">Version 2.0 · prototype build with sample data</p>
      </div>
    </Screen>
  );
}
