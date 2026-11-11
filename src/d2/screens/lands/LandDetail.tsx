import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, useTransform } from 'framer-motion';
import { ClipboardList, Leaf, Pencil, Plus } from 'lucide-react';
import type { Crop, Land } from '@/types';
import { api } from '@/services/api';
import { invalidate, useQuery } from '@/services/query';
import { actions, useStore } from '@/services/store';
import { formatDate } from '@/lib/format';
import { validateAcres, validatePincode, validateRequired } from '@/lib/validation';
import { Screen, useScreenScroll } from '../../layout/Screen';
import { Photo } from '../../photo/Photo';
import { Button, IconButton } from '../../ui/Button';
import { EmptyState, Receipt, Row, RowGroup, SectionHead } from '../../ui/Blocks';
import { Switch, Toggle } from '../../ui/Controls';
import { GroupLabel, TextField } from '../../ui/Field';
import { Sheet } from '../../ui/Sheet';
import { useToast } from '../../ui/Toast';
import { RevealText } from '../../motion/Reveal';
import { photoOf } from '../../content/meta';
import { CropSheet } from './CropSheet';
import s from './Lands.module.css';

const HERO = 460;

function Hero({ land }: { land: Land }) {
  const scrollY = useScreenScroll();
  const y = useTransform(scrollY, [0, HERO], [0, 130]);
  return (
    <header className={s.hero}>
      <motion.div className={s.heroMedia} style={{ y }}>
        <Photo id={photoOf(land)} src={land.scene.src} ratio="fill" shade="full" drift priority label="hero" muted={!land.active} />
      </motion.div>
      <div className={s.heroText}>
        <p className={s.heroAcres}>
          {land.areaAcres}
          <span>acres</span>
        </p>
        <RevealText text={land.name} className={s.heroTitle} delay={0.15} />
        <p className={s.heroSub}>
          {land.address.village}, {land.address.district} · {land.ownership}
        </p>
      </div>
    </header>
  );
}

export default function LandDetail() {
  const { id = '' } = useParams();
  const toast = useToast();
  const land = useStore((st) => st.lands.find((l) => l.id === id));
  const forms = useQuery('forms', () => api.listForms());
  const [cropSheet, setCropSheet] = useState<{ open: boolean; crop?: Crop }>({ open: false });
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState({ name: '', area: '', ownership: 'Owned' as 'Owned' | 'Leased', line: '', village: '', pincode: '' });
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  if (!land)
    return (
      <Screen title="Field" backTo="/lands">
        <div className="fj-gutter">
          <EmptyState animation="search" title="Field not found" body="It may have been removed." action={<Button to="/lands">See all fields</Button>} />
        </div>
      </Screen>
    );

  const linked = (forms.data ?? []).filter((f) => f.landId === land.id);
  const toggle = (v: boolean) => {
    actions.updateLand(land.id, { active: v });
    invalidate('lands');
    toast({ message: v ? `${land.name} is active` : `${land.name} marked inactive`, tone: v ? 'success' : 'info', action: { label: 'Undo', onClick: () => actions.updateLand(land.id, { active: !v }) } });
  };
  const openEdit = () => {
    setDraft({ name: land.name, area: String(land.areaAcres), ownership: land.ownership, line: land.address.line, village: land.address.village, pincode: land.address.pincode });
    setErrors({});
    setEditOpen(true);
  };
  const saveEdit = () => {
    const e = { name: validateRequired(draft.name, 'a field name'), area: validateAcres(draft.area), village: validateRequired(draft.village, 'the village'), pincode: validatePincode(draft.pincode) };
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;
    actions.updateLand(land.id, { name: draft.name.trim(), areaAcres: Number(draft.area), ownership: draft.ownership, address: { ...land.address, line: draft.line.trim(), village: draft.village.trim(), pincode: draft.pincode } });
    invalidate('lands');
    setEditOpen(false);
    toast({ message: 'Field details saved', tone: 'success' });
  };

  return (
    <Screen
      title={land.name}
      variant="overlay"
      heroHeight={HERO}
      backTo="/lands"
      actions={(onImage) => (
        <IconButton label="Edit field" variant={onImage ? 'glass' : 'plain'} onClick={openEdit}>
          <Pencil />
        </IconButton>
      )}
    >
      <Hero land={land} />
      <div className={s.sheet}>
        <div className={`${s.active} ${land.active ? s.activeOn : ''}`}>
          <div>
            <strong>{land.active ? 'Active field' : 'Inactive field'}</strong>
            <span>{land.active ? 'Shows up when you book services.' : 'Hidden from bookings until you turn it on.'}</span>
          </div>
          <Switch checked={land.active} onChange={toggle} label="Field is active" />
        </div>

        <section>
          <SectionHead
            title="Crops"
            inset={false}
            aside={
              <Button size="sm" variant="tonal" icon={<Plus aria-hidden />} onClick={() => setCropSheet({ open: true })}>
                Add crop
              </Button>
            }
          />
          {land.crops.length === 0 && <EmptyState animation="sprout" title="No crops added" body="Add what you grow so bookings and advice match this field." compact />}
          <ul className={s.crops}>
            {land.crops.map((c, i) => (
              <li key={c.id} className={s.crop}>
                <span className={s.cropNum}>{String(i + 1).padStart(2, '0')}</span>
                <span className={s.cropText}>
                  <span className={s.cropName}>
                    {c.name}
                    <span className={s.season}>{c.season}</span>
                  </span>
                  <span className={s.cropMeta}>
                    {c.variety} · {c.areaAcres} acres{c.sowingDate ? ` · sown ${formatDate(c.sowingDate, 'short')}` : ''}
                  </span>
                </span>
                <IconButton label={`Edit ${c.name}`} variant="plain" onClick={() => setCropSheet({ open: true, crop: c })}>
                  <Pencil />
                </IconButton>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <SectionHead title="Address" inset={false} />
          <Receipt
            rows={[
              { label: 'Address', value: land.address.line || '—', stacked: true },
              { label: 'Village', value: land.address.village },
              { label: 'Taluka', value: land.address.taluka },
              { label: 'District', value: land.address.district },
              { label: 'State', value: land.address.state },
              { label: 'PIN code', value: land.address.pincode },
            ]}
          />
        </section>

        {linked.length > 0 && (
          <RowGroup title="Season records">
            {linked.map((f) => (
              <Row key={f.id} icon={<ClipboardList />} title={`Form cycle #${f.number} · ${f.crop.name}`} subtitle={f.crop.season} to={`/forms/${f.id}`} />
            ))}
          </RowGroup>
        )}
        <p className={s.leaf}>
          <Leaf aria-hidden /> Changes to this field are saved on this phone.
        </p>
      </div>

      <CropSheet
        open={cropSheet.open}
        crop={cropSheet.crop}
        maxAcres={land.areaAcres}
        onClose={() => setCropSheet({ open: false })}
        onSave={(crop) => {
          actions.upsertCrop(land.id, crop);
          invalidate('lands');
          setCropSheet({ open: false });
          toast({ message: cropSheet.crop ? 'Crop updated' : `${crop.name} added`, tone: 'success' });
        }}
        onDelete={(crop) => {
          actions.removeCrop(land.id, crop.id);
          invalidate('lands');
          setCropSheet({ open: false });
          toast({ message: `${crop.name} removed`, tone: 'info', action: { label: 'Undo', onClick: () => actions.upsertCrop(land.id, crop) } });
        }}
      />

      <Sheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        kicker="Edit"
        title={land.name}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save</Button>
          </>
        }
      >
        <div className={s.form}>
          <TextField label="Field name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} error={errors.name} />
          <TextField label="Area" inputMode="decimal" suffix="acres" value={draft.area} onChange={(e) => setDraft({ ...draft, area: e.target.value.replace(/[^\d.]/g, '') })} error={errors.area} />
          <div className="fj-stack" style={{ ['--gap' as string]: '8px' }}>
            <GroupLabel>Ownership</GroupLabel>
            <Toggle label="Ownership" value={draft.ownership} onChange={(v) => setDraft({ ...draft, ownership: v })} options={[{ value: 'Owned', label: 'Owned' }, { value: 'Leased', label: 'Leased' }]} />
          </div>
          <TextField label="Address" optional value={draft.line} onChange={(e) => setDraft({ ...draft, line: e.target.value })} placeholder="Survey or gat number, landmark" />
          <div className={s.grid2}>
            <TextField label="Village" value={draft.village} onChange={(e) => setDraft({ ...draft, village: e.target.value })} error={errors.village} />
            <TextField label="PIN code" inputMode="numeric" maxLength={6} value={draft.pincode} onChange={(e) => setDraft({ ...draft, pincode: e.target.value.replace(/\D/g, '') })} error={errors.pincode} />
          </div>
        </div>
      </Sheet>
    </Screen>
  );
}
