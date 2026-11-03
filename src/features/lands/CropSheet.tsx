import { useEffect, useState } from 'react';
import type { Crop, Season } from '@/types';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { SelectField, TextField } from '@/components/ui/TextField';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { validateAcres, validateRequired } from '@/lib/validation';
import s from './Lands.module.css';

const COMMON = ['Rice', 'Wheat', 'Cotton', 'Soybean', 'Tur (pigeon pea)', 'Chickpea (gram)', 'Green gram (moong)', 'Maize', 'Jowar', 'Sugarcane', 'Mustard', 'Onion', 'Other'];

interface Props {
  open: boolean;
  onClose: () => void;
  maxAcres: number;
  crop?: Crop;
  onSave: (crop: Crop) => void;
  onDelete?: (crop: Crop) => void;
}

export function CropSheet({ open, onClose, maxAcres, crop, onSave, onDelete }: Props) {
  const [name, setName] = useState('');
  const [other, setOther] = useState('');
  const [variety, setVariety] = useState('');
  const [season, setSeason] = useState<Season>('Kharif');
  const [acres, setAcres] = useState('');
  const [sowing, setSowing] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    const known = crop && COMMON.includes(crop.name);
    setName(crop ? (known ? crop.name : 'Other') : '');
    setOther(crop && !known ? crop.name : '');
    setVariety(crop?.variety ?? '');
    setSeason(crop?.season ?? 'Kharif');
    setAcres(crop ? String(crop.areaAcres) : '');
    setSowing(crop?.sowingDate ?? '');
    setErrors({});
    setConfirmDelete(false);
  }, [open, crop]);

  const save = () => {
    const finalName = name === 'Other' ? other.trim() : name;
    const e = {
      name: name ? (name === 'Other' ? validateRequired(other, 'the crop name') : null) : 'Choose a crop.',
      variety: validateRequired(variety, 'the variety (as written on the seed bag)'),
      acres: validateAcres(acres, maxAcres),
    };
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;
    onSave({ id: crop?.id ?? `c-${Date.now().toString(36)}`, name: finalName, variety: variety.trim(), season, areaAcres: Number(acres), sowingDate: sowing || undefined });
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={crop ? 'Edit crop' : 'Add a crop'}
      footer={
        confirmDelete && crop && onDelete ? (
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Keep crop
            </Button>
            <Button variant="danger" onClick={() => onDelete(crop)}>
              Yes, remove
            </Button>
          </>
        ) : (
          <>
            {crop && onDelete && (
              <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                Remove
              </Button>
            )}
            <Button onClick={save}>{crop ? 'Save changes' : 'Add crop'}</Button>
          </>
        )
      }
    >
      <div className={s.form}>
        <SelectField label="Crop" value={name} onChange={setName} options={COMMON.map((c) => ({ value: c, label: c }))} placeholder="Choose a crop" error={errors.name && name !== 'Other' ? errors.name : null} />
        {name === 'Other' && <TextField label="Crop name" value={other} onChange={(e) => setOther(e.target.value)} error={errors.name} placeholder="e.g. Groundnut" />}
        <TextField label="Variety" value={variety} onChange={(e) => setVariety(e.target.value)} error={errors.variety} placeholder="As written on the seed bag" />
        <div className="stack" style={{ ['--gap' as string]: '8px' }}>
          <span style={{ font: 'var(--t-label)' }}>Season</span>
          <SegmentedControl label="Season" value={season} onChange={setSeason} segments={[{ value: 'Kharif', label: 'Kharif' }, { value: 'Rabi', label: 'Rabi' }, { value: 'Zaid', label: 'Zaid' }]} />
        </div>
        <div className={s.grid2}>
          <TextField label="Area" inputMode="decimal" suffix="acres" value={acres} onChange={(e) => setAcres(e.target.value.replace(/[^\d.]/g, ''))} error={errors.acres} hint={`Max ${maxAcres}`} />
          <TextField label="Sowing date" optional type="date" value={sowing} onChange={(e) => setSowing(e.target.value)} />
        </div>
        {confirmDelete && <p style={{ color: 'var(--danger-fg)', font: 'var(--t-label)' }}>Remove this crop from the field? Season records already made are not affected.</p>}
      </div>
    </Sheet>
  );
}
