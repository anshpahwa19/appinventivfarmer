import { useState } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { Screen, PageTitle } from '../../layout/Screen';
import { Button } from '../../ui/Button';
import { Chip, SectionTabs, Switch, Toggle } from '../../ui/Controls';
import { TextField } from '../../ui/Field';
import { Note, Receipt, Segments, StatusTag, Tracker } from '../../ui/Blocks';
import { FjLottie } from '../../lottie/Lottie';
import { ANIMATIONS, type AnimationName } from '../../lottie/animations';
import { Photo } from '../../photo/Photo';
import s from './DesignSystem.module.css';

const COLOURS = [
  { group: 'Paper', items: [['Ivory', '#FBF7F1'], ['Sand', '#F3EADF'], ['Sand 200', '#EADFD1']] },
  { group: 'Ink', items: [['Espresso', '#3A2E28'], ['Ink 2', '#62544B'], ['Ink 3', '#76665B']] },
  { group: 'Action', items: [['Clay', '#A8573A'], ['Deep clay', '#94492C'], ['Clay tint', '#F7E6DA']] },
  { group: 'Highlight', items: [['Apricot', '#F2C79B'], ['Apricot 300', '#F6D8B6'], ['Sage', '#9AA88A']] },
  { group: 'Status', items: [['Success', '#5D8A55'], ['Warning', '#E0A548'], ['Danger', '#C0503D'], ['Info', '#6F93A8']] },
];
const RADII = [
  ['--r-xs', '8', 'tags'],
  ['--r-sm', '12', 'small buttons, icons'],
  ['--r-md', '16', 'buttons, fields'],
  ['--r-lg', '22', 'images, options'],
  ['--r-xl', '28', 'cards, sheets, dock'],
  ['--r-2xl', '34', 'splash plate'],
  ['--r-pill', '999', 'chips, search'],
];
const TYPE = [
  ['Display · 44 / 800', 'fj-display', 'Good morning'],
  ['Title · 32 / 780', 'fj-title', 'Events near you'],
  ['Headline · 24 / 740', 'fj-headline', 'Latest from the field'],
  ['Lede · 19 / 380', 'fj-lede', 'Calm and dry. Spray in the morning.'],
  ['Body · 16 / 500', 'fj-body', 'Book a slot and a team will bale the straw.'],
  ['Kicker · 12 / 760', 'fj-kicker', 'Cover story'],
];

export default function DesignSystem() {
  const [tab, setTab] = useState<'a' | 'b'>('a');
  const [t, setT] = useState<'kg' | 'MT'>('kg');
  const [on, setOn] = useState(true);
  return (
    <Screen title="Design system" backTo="/account">
      <PageTitle kicker="Direction 02" title="Field Journal" deck="An editorial, photography-led system. Shared with Direction 01: only the typeface and the corner radii." />
      <div className={s.page}>
        <section>
          <h2 className={s.h2}>
            <span>01</span> Colour
          </h2>
          <div className={s.colours}>
            {COLOURS.map((g) => (
              <div key={g.group}>
                <p className={s.group}>{g.group}</p>
                <div className={s.swatches}>
                  {g.items.map(([n, hex]) => (
                    <div key={n} className={s.swatch}>
                      <span style={{ background: hex }} />
                      <strong>{n}</strong>
                      <small>{hex}</small>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className={s.note}>Light, warm and quiet: photographs carry the colour. Every text pair meets WCAG 2.2 AA; apricot is never used for text on paper.</p>
        </section>

        <section>
          <h2 className={s.h2}>
            <span>02</span> Type · Plus Jakarta Sans
          </h2>
          <div className={s.type}>
            {TYPE.map(([label, cls, sample]) => (
              <div key={label}>
                <small>{label}</small>
                <p className={cls}>{sample}</p>
              </div>
            ))}
            <div>
              <small>Numeral · 64 / 220</small>
              <p className={s.numeral}>06 NOV</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className={s.h2}>
            <span>03</span> Radius · same tokens as Direction 01
          </h2>
          <div className={s.radii}>
            {RADII.map(([tok, px, use]) => (
              <div key={tok} className={s.radius}>
                <span style={{ borderRadius: `var(${tok})` }} />
                <strong>{tok}</strong>
                <small>
                  {px}px · {use}
                </small>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className={s.h2}>
            <span>04</span> Photography
          </h2>
          <div className={s.photos}>
            <Photo id="harvest-baler" ratio="4/5" shade="bottom" label className={s.p1} />
            <Photo id="soil-sample" ratio="1/1" className={s.p2} />
            <Photo id="mustard-field" ratio="16/9" className={s.p3} />
          </div>
          <p className={s.note}>Full-bleed covers, asymmetric crops and collages. Images are AI-generated concept photographs for this review, to be replaced with licensed photography (Me → About lists every slot).</p>
        </section>

        <section>
          <h2 className={s.h2}>
            <span>05</span> Components
          </h2>
          <div className="fj-stack" style={{ ['--gap' as string]: '14px' }}>
            <div className={s.row}>
              <Button iconRight={<ArrowRight aria-hidden />}>Primary</Button>
              <Button variant="secondary">Secondary</Button>
            </div>
            <div className={s.row}>
              <Button variant="tonal" icon={<Plus aria-hidden />} size="sm">
                Tonal
              </Button>
              <Button variant="ghost" size="sm">
                Ghost
              </Button>
              <Button variant="danger" size="sm">
                Danger
              </Button>
            </div>
            <div className={s.nightRow}>
              <Button variant="accent" size="sm">
                Accent
              </Button>
              <Button variant="glass" size="sm">
                Glass
              </Button>
            </div>
            <SectionTabs label="Example tabs" size="md" value={tab} onChange={setTab} items={[{ value: 'a', label: 'News', count: 8 }, { value: 'b', label: 'Videos', count: 6 }]} />
            <div className={s.row}>
              <Toggle label="Unit" value={t} onChange={setT} options={[{ value: 'kg', label: 'kg' }, { value: 'MT', label: 'Tonnes' }]} />
              <Switch checked={on} onChange={setOn} label="Example switch" />
            </div>
            <div className={s.row}>
              <Chip selected count={3}>
                Pending
              </Chip>
              <Chip>Approved</Chip>
            </div>
            <div className={s.row}>
              <StatusTag tone="success">Approved</StatusTag>
              <StatusTag tone="warning">Pending</StatusTag>
              <StatusTag tone="danger">Rejected</StatusTag>
              <StatusTag tone="live">Live now</StatusTag>
            </div>
            <TextField label="Quantity" suffix="kg" placeholder="250" error="Minimum order is 50 kg." defaultValue="20" />
            <Segments done={3} total={8} label="3 of 8" />
            <Tracker steps={[{ label: 'Placed', state: 'done' }, { label: 'Approval', state: 'current' }, { label: 'Dispatch', state: 'upcoming' }]} />
            <Receipt rows={[{ label: 'Subtotal', value: '₹25,000', formula: '250 kg × ₹100' }, { label: 'Delivery', value: '₹100' }, { label: 'Total', value: '₹25,100', total: true }]} />
            <Note tone="info" title="Note">
              Explains, never blames. Colour plus an icon or word.
            </Note>
          </div>
        </section>

        <section>
          <h2 className={s.h2}>
            <span>06</span> Motion · Lottie written for this direction
          </h2>
          <div className={s.lotties}>
            {(Object.keys(ANIMATIONS) as AnimationName[]).map((n) => (
              <div key={n} className={s.lottie}>
                <FjLottie name={n} size={88} />
                <small>{n}</small>
              </div>
            ))}
          </div>
          <p className={s.note}>Pages rise like sheets and recede; headlines reveal word by word from masks; photos unmask and settle; tabs slide an ink bar. Reduce animations (or the phone setting) turns all of it off.</p>
        </section>
      </div>
    </Screen>
  );
}
