import { Screen } from '@/components/layout/Screen';
import { Logo } from '@/components/brand/Logo';
import s from './Account.module.css';

export default function About() {
  return (
    <Screen title="About" back backTo="/account">
      <div className={s.page}>
        <div className={s.brand}>
          <Logo height={170} />
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
