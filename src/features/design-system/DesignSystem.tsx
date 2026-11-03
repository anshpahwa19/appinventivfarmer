import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock3, Info, Plus, XCircle } from 'lucide-react';
import type { SceneKind, SceneTime } from '@/types';
import { Screen } from '@/components/layout/Screen';
import { Scene } from '@/components/media/Scene';
import { Lottie } from '@/components/media/Lottie';
import { Button } from '@/components/ui/Button';
import { TextField, SelectField } from '@/components/ui/TextField';
import { SearchField } from '@/components/ui/SearchField';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Chip, ChipRow } from '@/components/ui/Chip';
import { StatusBadge, Switch, ProgressRing } from '@/components/ui/Misc';
import { Callout } from '@/components/ui/Blocks';
import { Skeleton } from '@/components/ui/Skeleton';
import { Sheet } from '@/components/ui/Sheet';
import { useToast } from '@/components/ui/Toast';
import { OrderCard } from '@/components/content/Cards';
import { _seed } from '@/services/api';
import type { AnimationName } from '@/lottie/animations';
import s from './DesignSystem.module.css';

const RAW: [string, string][][] = [
  [['forest-900', '#10291d'], ['forest-800', '#173a29'], ['forest-700', '#1f4d36'], ['forest-600', '#2a6345']],
  [['botanical-500', '#3c8a5a'], ['botanical-400', '#5faf7a'], ['botanical-200', '#cfe6d2'], ['botanical-100', '#e5f1e4']],
  [['cream-50', '#fbf9f3'], ['cream-100', '#f6f3ea'], ['cream-200', '#efeadd'], ['charcoal-900', '#18201a']],
  [['harvest-600', '#b54e15'], ['harvest-500', '#dd6a24'], ['sun-400', '#f4c24d'], ['earth-500', '#8a6a49']],
];

const TYPE = [
  ['t-display', 'Display', '34 / 37 · 700'],
  ['t-title', 'Page title', '28 / 32 · 700'],
  ['t-heading', 'Section heading', '20 / 25 · 700'],
  ['t-subheading', 'Card title', '17 / 22 · 650'],
  ['t-body-lg', 'Reading text for articles', '17 / 29 · 450'],
  ['t-body', 'Body text for the interface', '16 / 24 · 500'],
  ['t-support', 'Supporting text', '14 / 20 · 500'],
  ['t-caption', 'Caption · minimum size', '13 / 18 · 600'],
  ['t-overline', 'Overline label', '12 / 14 · 700 caps'],
];

const ANIMS: AnimationName[] = ['success', 'emptyBox', 'bell', 'forms', 'offline', 'sprout', 'pin', 'search', 'calendar', 'bookmark'];
const KINDS: SceneKind[] = ['paddy', 'wheat', 'mustard', 'cotton', 'soil', 'harvest', 'village', 'workshop', 'canal', 'monsoon'];
const TIMES: SceneTime[] = ['dawn', 'morning', 'day', 'golden', 'dusk', 'overcast'];

export default function DesignSystem() {
  const toast = useToast();
  const [seg, setSeg] = useState('one');
  const [sw, setSw] = useState(true);
  const [chip, setChip] = useState('all');
  const [sheet, setSheet] = useState(false);
  const [q, setQ] = useState('');
  return (
    <Screen title="Design system" subtitle="Kisani Urjaa 2.0 · tokens, components and motion" largeTitle back backTo="/account">
      <div className={s.page}>
        <section>
          <p className={s.intro}>Morning field light: a warm cream ground, deep forest green for actions, botanical green for growth and success, and harvest orange only where attention is needed.</p>
        </section>

        <section>
          <h2 className={s.h2}>Principles</h2>
          <div className={s.principles}>
            {[
              ['Plain words', 'Name things the way farmers do. One action per button.'],
              ['Big targets', 'Tap areas of 44 px or more, primary buttons 52–56 px.'],
              ['Status in words', 'Every status has an icon and a label, never colour alone.'],
              ['Calm by default', 'Motion explains change. It turns off with Reduce animations.'],
            ].map(([t, d]) => (
              <div key={t} className={s.principle}>
                <strong>{t}</strong>
                <span>{d}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className={s.h2}>Colour</h2>
          <p className={s.lede}>Raw palette. Components use semantic tokens that switch for dark mode.</p>
          <div className="stack" style={{ ['--gap' as string]: '10px' }}>
            {RAW.map((row, i) => (
              <div key={i} className={s.swatches}>
                {row.map(([n, hex]) => (
                  <div key={n} className={s.swatch}>
                    <div className={s.chip} style={{ background: hex }} />
                    <span className={s.swatchName}>{n}</span>
                    <span className={s.swatchHex}>{hex}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <h3 className={s.h3}>Semantic status (adapts to theme)</h3>
          <div className={s.pairs}>
            <div className={s.pair} style={{ background: 'var(--success-bg)', color: 'var(--success-fg)' }}>
              Success · approved
            </div>
            <div className={s.pair} style={{ background: 'var(--warning-bg)', color: 'var(--warning-fg)' }}>
              Warning · pending
            </div>
            <div className={s.pair} style={{ background: 'var(--danger-bg)', color: 'var(--danger-fg)' }}>
              Danger · rejected
            </div>
            <div className={s.pair} style={{ background: 'var(--info-bg)', color: 'var(--info-fg)' }}>
              Info · upcoming
            </div>
          </div>
        </section>

        <section>
          <h2 className={s.h2}>Typography</h2>
          <p className={s.lede}>Plus Jakarta Sans, one family. Sizes in rem, so “Large text” scales everything.</p>
          {TYPE.map(([cls, sample, meta]) => (
            <div key={cls} className={s.typeRow}>
              <span className={cls}>{sample}</span>
              <span className={s.typeMeta}>
                .{cls} · {meta}
              </span>
            </div>
          ))}
        </section>

        <section>
          <h2 className={s.h2}>Space & shape</h2>
          <p className={s.lede}>4 px grid. 20 px page gutter. Radius grows with the size of the surface.</p>
          <div className={s.space} aria-hidden>
            {[4, 8, 12, 16, 20, 24, 32, 40, 48].map((v) => (
              <div key={v} className={s.spaceBar} style={{ height: v }} title={`${v}px`} />
            ))}
          </div>
          <div className={s.radii} style={{ marginTop: 14 }}>
            {[
              ['12', 'var(--r-sm)'],
              ['16', 'var(--r-md)'],
              ['22', 'var(--r-lg)'],
              ['28', 'var(--r-xl)'],
            ].map(([l, r]) => (
              <div key={l} className={s.radius} style={{ borderRadius: r }}>
                {l}px
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className={s.h2}>Buttons</h2>
          <div className={s.stack}>
            <div className={s.wrap}>
              <Button>Primary</Button>
              <Button variant="accent">Accent</Button>
              <Button variant="secondary">Secondary</Button>
            </div>
            <div className={s.wrap}>
              <Button variant="tonal">Tonal</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
            <div className={s.wrap}>
              <Button size="sm" icon={<Plus aria-hidden />}>
                Small
              </Button>
              <Button loading>Saving…</Button>
              <Button disabled>Disabled</Button>
            </div>
            <Button size="lg" block iconRight={<ArrowRight aria-hidden />}>
              Large, full width
            </Button>
          </div>
        </section>

        <section>
          <h2 className={s.h2}>Inputs & selection</h2>
          <div className={s.stack}>
            <SearchField value={q} onChange={setQ} placeholder="Search news" onFilter={() => undefined} activeFilters={1} />
            <TextField label="Quantity" suffix="kg" placeholder="e.g. 250" hint="Minimum 50 kg" />
            <TextField label="PIN code" value="44300" readOnly error="PIN code should be 6 digits." />
            <SelectField label="State" value="Maharashtra" onChange={() => undefined} options={[{ value: 'Maharashtra', label: 'Maharashtra' }]} />
            <SegmentedControl label="Demo" value={seg} onChange={setSeg} segments={[{ value: 'one', label: 'News', count: 8 }, { value: 'two', label: 'Videos', count: 6 }, { value: 'three', label: 'Articles' }]} />
            <div style={{ margin: '0 calc(var(--gutter) * -1)' }}>
              <ChipRow label="Demo chips">
                {['all', 'pending', 'approved'].map((c) => (
                  <Chip key={c} selected={chip === c} onClick={() => setChip(c)} count={c === 'all' ? undefined : 2}>
                    {c[0].toUpperCase() + c.slice(1)}
                  </Chip>
                ))}
              </ChipRow>
            </div>
            <div className={s.wrap}>
              <Switch checked={sw} onChange={setSw} label="Demo switch" />
              <ProgressRing value={3} total={8} />
            </div>
          </div>
        </section>

        <section>
          <h2 className={s.h2}>Status & feedback</h2>
          <div className={s.stack}>
            <div className={s.wrap}>
              <StatusBadge tone="success" icon={<CheckCircle2 aria-hidden />}>
                Approved
              </StatusBadge>
              <StatusBadge tone="warning" icon={<Clock3 aria-hidden />}>
                Pending approval
              </StatusBadge>
              <StatusBadge tone="danger" icon={<XCircle aria-hidden />}>
                Rejected
              </StatusBadge>
              <StatusBadge tone="live">Live now</StatusBadge>
            </div>
            <Callout tone="info" icon={<Info aria-hidden />} title="Callout">
              Explains what happens next, in one or two sentences.
            </Callout>
            <div className={s.wrap}>
              <Button variant="secondary" onClick={() => toast({ message: 'Saved to bookmarks', tone: 'success', action: { label: 'Undo', onClick: () => undefined } })}>
                Show toast
              </Button>
              <Button variant="secondary" onClick={() => setSheet(true)}>
                Open bottom sheet
              </Button>
            </div>
            <div className="stack" style={{ ['--gap' as string]: '8px' }}>
              <Skeleton h={18} w="60%" />
              <Skeleton h={18} />
              <Skeleton h={90} r={20} />
            </div>
            <OrderCard order={_seed.SERVER_ORDERS[1]} />
          </div>
        </section>

        <section>
          <h2 className={s.h2}>Motion</h2>
          <div className={s.motion}>
            <p>
              <strong>Durations:</strong> 120 ms press · 200 ms state · 320 ms page · 480 ms emphasis.
            </p>
            <p>
              <strong>Easing:</strong> decelerate (0.22, 1, 0.36, 1) for things arriving; accelerate for things leaving. Sheets and tabs use springs.
            </p>
            <p>
              <strong>Pages:</strong> push slides 56 px with a fade; back reverses it; tab switches cross-fade.
            </p>
            <motion.div className={s.demoBox} animate={{ x: [0, 120, 0] }} transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1], repeat: Infinity, repeatDelay: 0.6 }} aria-hidden />
          </div>
          <h3 className={s.h3}>Lottie animations (authored in code)</h3>
          <div className={s.lotties}>
            {ANIMS.map((a) => (
              <div key={a} className={s.lottie}>
                <Lottie name={a} size={84} />
                {a}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className={s.h2}>Illustration system</h2>
          <p className={s.lede}>Ten landscapes of Indian farmland, drawn in code. Each slot also accepts a real photo.</p>
          <div className={s.scenes}>
            {KINDS.map((k, i) => (
              <div key={k} className={s.sceneCell}>
                <div className={s.sceneBox}>
                  <Scene scene={{ kind: k, seed: 10 + i }} aspect="wide" style={{ position: 'absolute', inset: 0 }} />
                </div>
                {k}
              </div>
            ))}
          </div>
          <h3 className={s.h3}>Time of day</h3>
          <div className={s.times}>
            {TIMES.map((t) => (
              <div key={t} className={s.sceneCell}>
                <div className={s.sceneBox}>
                  <Scene scene={{ kind: 'paddy', seed: 4, time: t }} aspect="wide" style={{ position: 'absolute', inset: 0 }} />
                </div>
                {t}
              </div>
            ))}
          </div>
        </section>
      </div>
      <Sheet open={sheet} onClose={() => setSheet(false)} title="Bottom sheet" description="Drag down, tap outside, press Esc or use the close button." footer={<Button block onClick={() => setSheet(false)}>Done</Button>}>
        <p className="t-body c-2">Sheets hold short tasks without leaving the screen: filters, confirmations, sharing.</p>
      </Sheet>
    </Screen>
  );
}
