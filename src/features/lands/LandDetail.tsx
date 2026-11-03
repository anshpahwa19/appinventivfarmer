import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, Leaf, Pencil, Plus, ChevronRight } from 'lucide-react';
import type { Crop } from '@/types';
import { Screen } from '@/components/layout/Screen';
import { Scene } from '@/components/media/Scene';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Misc';
import { DetailGrid, ListGroup, ListRow } from '@/components/ui/Blocks';
import { EmptyState } from '@/components/ui/States';
import { Sheet } from '@/components/ui/Sheet';
import { TextField } from '@/components/ui/TextField';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/services/api';
import { invalidate, useQuery } from '@/services/query';
import { actions, useStore } from '@/services/store';
import { formatDate } from '@/lib/format';
import { validateAcres, validatePincode, validateRequired } from '@/lib/validation';
import { CropSheet } from './CropSheet';
import { ParallaxHero } from '@/components/motion/ParallaxHero';
import s from './Lands.module.css';

export default function LandDetail() {
  const { id = '' } = useParams();
  const toast = useToast();
  const land = useStore((st) => st.lands.find((l) => l.id === id));
  const forms = useQuery('forms', () => api.listForms());
  const [cropSheet, setCropSheet] = useState<{ open: boolean; crop?: Crop }>({ open: false });
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState({ name: '', area: '', ownership: 'Owned' as 'Owned' | 'Leased', line: '', village: '', pincode: '' });
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  if (!land) {
    return (
      <Screen title="Field" back backTo="/lands">
        <div className="gutter">
          <EmptyState animation="search" title="Field not found" body="It may have been removed." action={<Button to="/lands">See all fields</Button>} />
        </div>
      </Screen>
    );
  }

  const linked = (forms.data ?? []).filter((f) => f.landId === land.id);

  const toggleActive = (v: boolean) => {
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
      back
      backTo="/lands"
      overlay
      actions={(onImage) => (
        <IconButton label="Edit field" variant={onImage ? 'onImage' : 'plain'} onClick={openEdit}>
          <Pencil />
        </IconButton>
      )}
    >
      <div className={s.hero}>
        <ParallaxHero>
          <Scene scene={land.scene} aspect="wide" detail="high" style={{ position: 'absolute', inset: 0, filter: land.active ? undefined : 'grayscale(0.6)' }} />
        </ParallaxHero>
        <div className={s.heroScrim} />
      </div>
      <motion.div className={s.sheet} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
        <div className={s.titleRow}>
          <div>
            <h1 className={s.title}>{land.name}</h1>
            <p className="t-support c-3" style={{ marginTop: 4 }}>
              {land.address.village}, {land.address.district}
            </p>
          </div>
        </div>

        <div className={s.stats}>
          <div className={s.stat}>
            <div className={s.statValue}>{land.areaAcres}</div>
            <div className={s.statLabel}>acres</div>
          </div>
          <div className={s.stat}>
            <div className={s.statValue}>{land.crops.length}</div>
            <div className={s.statLabel}>{land.crops.length === 1 ? 'crop' : 'crops'}</div>
          </div>
          <div className={s.stat}>
            <div className={s.statValue} style={{ fontSize: '1.0625rem', paddingTop: 2 }}>
              {land.ownership}
            </div>
            <div className={s.statLabel}>ownership</div>
          </div>
        </div>

        <div className={s.activeRow}>
          <div className={s.activeText}>
            <strong>{land.active ? 'Active field' : 'Inactive field'}</strong>
            {land.active ? 'Shows up when you book services.' : 'Hidden from bookings until you turn it on.'}
          </div>
          <Switch checked={land.active} onChange={toggleActive} label="Field is active" />
        </div>

        <section className="stack" style={{ ['--gap' as string]: '12px' }}>
          <h2 className={s.h2}>
            Crops
            <Button size="sm" variant="tonal" icon={<Plus aria-hidden />} onClick={() => setCropSheet({ open: true })}>
              Add crop
            </Button>
          </h2>
          {land.crops.length === 0 && <EmptyState animation="emptyBox" title="No crops added" body="Add what you grow here so bookings and advice match your field." size={110} />}
          {land.crops.map((c) => (
            <div key={c.id} className={s.crop}>
              <span className={s.cropIcon} aria-hidden>
                <Leaf />
              </span>
              <div className={s.cropText}>
                <div className={s.cropName}>
                  {c.name}
                  <span className={s.season}>{c.season}</span>
                </div>
                <div className={s.cropMeta}>
                  {c.variety} · {c.areaAcres} acres{c.sowingDate ? ` · sown ${formatDate(c.sowingDate, 'short')}` : ''}
                </div>
              </div>
              <IconButton label={`Edit ${c.name}`} onClick={() => setCropSheet({ open: true, crop: c })}>
                <Pencil />
              </IconButton>
            </div>
          ))}
        </section>

        <section className="stack" style={{ ['--gap' as string]: '12px' }}>
          <h2 className={s.h2}>Address</h2>
          <DetailGrid
            items={[
              { label: 'Address', value: land.address.line, full: true },
              { label: 'Village', value: land.address.village },
              { label: 'Taluka', value: land.address.taluka },
              { label: 'District', value: land.address.district },
              { label: 'State', value: land.address.state },
              { label: 'PIN code', value: land.address.pincode },
            ]}
          />
        </section>

        {linked.length > 0 && (
          <ListGroup title="Season records">
            {linked.map((f) => (
              <ListRow key={f.id} icon={<ClipboardList />} title={`Form cycle #${f.number} · ${f.crop.name}`} subtitle={f.crop.season} to={`/forms/${f.id}`} trailing={<ChevronRight aria-hidden style={{ width: 20, height: 20, color: 'var(--fg-3)' }} />} />
            ))}
          </ListGroup>
        )}
      </motion.div>

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
        title="Edit field"
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
          <div className="stack" style={{ ['--gap' as string]: '8px' }}>
            <span style={{ font: 'var(--t-label)' }}>Ownership</span>
            <SegmentedControl label="Ownership" value={draft.ownership} onChange={(v) => setDraft({ ...draft, ownership: v })} segments={[{ value: 'Owned', label: 'Owned' }, { value: 'Leased', label: 'Leased' }]} />
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
