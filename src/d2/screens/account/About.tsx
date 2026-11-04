import logoUrl from '@/assets/brand/kisani-urjaa-logo.webp';
import { Screen, PageTitle } from '../../layout/Screen';
import { Photo } from '../../photo/Photo';
import { SLOTS, hasFile } from '../../photo/catalog';
import { CREDITS } from '../../photo/credits';
import { StatusTag } from '../../ui/Blocks';
import s from './Account.module.css';

export default function About() {
  const filled = SLOTS.filter((x) => hasFile(x.id) && !CREDITS[x.id]?.ai).length;
  const ai = SLOTS.filter((x) => hasFile(x.id) && CREDITS[x.id]?.ai).length;
  return (
    <Screen title="About" backTo="/account">
      <PageTitle kicker="Kisani Urjaa" title="About" />
      <div className={s.sub}>
        <div className={s.brand}>
          <img src={logoUrl} alt="Kisani Urjaa: From Waste to Wealth, for Farmers’ Health" />
        </div>
        <div className={s.prose}>
          <p>Kisani Urjaa works with farmers to turn crop residue into energy and organic manure, so fields are cleared without burning and soil gets richer.</p>
          <p>This app brings together your fields, season records, FOM orders, field bookings, local weather and advice, with your Kisani Didi a tap away.</p>
          <h2>Credits</h2>
        </div>
        <div className={s.credits}>
          <p>
            <strong>Typeface:</strong> Plus Jakarta Sans (SIL Open Font License)
          </p>
          <p>
            <strong>Icons:</strong> Lucide (ISC License), plus navigation glyphs drawn for this app
          </p>
          <p>
            <strong>Animations:</strong> written in code for Direction 02 (lottie-web, MIT)
          </p>
          <p>
            <strong>Weather:</strong> Open-Meteo, with a sample forecast when offline
          </p>
          <p>
            <strong>Sample videos:</strong> rendered placeholders; real footage to be supplied
          </p>
        </div>
        <section className={s.prose} aria-labelledby="fj-photos">
          <h2 id="fj-photos">Photography</h2>
          <p>
            {filled} of {SLOTS.length} photo slots have a licensed photograph. {ai} use an AI-generated concept image made for this design review: they don’t show real people or places, and each must be replaced with a licensed or commissioned photo before launch. The brief under each slot is the shot to commission.
          </p>
        </section>
        <ul className={s.slots}>
          {SLOTS.map((x) => {
            const credit = CREDITS[x.id];
            const file = hasFile(x.id);
            return (
              <li key={x.id} className={s.slotRow}>
                <Photo id={x.id} ratio="1/1" decorative />
                <div className={s.slotText}>
                  <span className={s.slotId}>{x.id}</span>
                  <span className={s.slotSubject}>{x.subject}</span>
                  <span className={s.slotStatus}>
                    {file && credit?.ai ? (
                      <StatusTag tone="warning">AI concept · replace before launch</StatusTag>
                    ) : file && credit ? (
                      <StatusTag tone="success">
                        {credit.author} · {credit.licence}
                      </StatusTag>
                    ) : file ? (
                      <StatusTag tone="danger">Credit missing</StatusTag>
                    ) : (
                      <StatusTag tone="warning">Photo needed</StatusTag>
                    )}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="fj-caption fj-c3">Version 2.0 · Direction 02 prototype with sample data</p>
      </div>
    </Screen>
  );
}
