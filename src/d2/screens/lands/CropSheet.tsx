import { useEffect, useState } from 'react';
import type { Crop, Season } from '@/types';
import { validateAcres, validateRequired } from '@/lib/validation';
import { Sheet } from '../../ui/Sheet';
import { Button } from '../../ui/Button';
import { GroupLabel, SelectField, TextField } from '../../ui/Field';
import { Toggle } from '../../ui/Controls';
import { Note } from '../../ui/Blocks';
import s from './Lands.module.css';

const COMMON = ['Rice', 'Wheat', 'Cotton', 'Soybean', 'Tur (pigeon pea)', 'Chickpea (gram)', 'Green gram (moong)', 'Maize', 'Jowar', 'Sugarcane', 'Mustard', 'Onion', 'Other'];

interface Props {
  open: boolean;
  onClose: () => void;
  maxAcres: number;
  crop?: Crop;
  onSave: (c: Crop) => void;
  onDelete?: (c: Crop) => void;
}

export function CropSheet({ open, onClose, maxAcres, crop, onSave, onDelete }: Props) {
  const [name, setName] = useState('');
  const [other, setOther] = useState('');
  const [variety, setVariety] = useState('');
  const [season, setSeason] = useState<Season>('Kharif');
  const [acres, setAcres] = useState('');
  const [sowing, setSowing] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [confirm, setConfirm] = useState(false);

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
    setConfirm(false);
  }, [open, crop]);

  const save = () => {
    const e = {
      name: name ? (name === 'Other' ? validateRequired(other, 'the crop name') : null) : 'Choose a crop.',
      variety: validateRequired(variety, 'the variety (as written on the seed bag)'),
      acres: validateAcres(acres, maxAcres),
    };
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;
    onSave({ id: crop?.id ?? `c-${Date.now().toString(36)}`, name: name === 'Other' ? other.trim() : name, variety: variety.trim(), season, areaAcres: Number(acres), sowingDate: sowing || undefined });
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      kicker={crop ? 'Edit' : 'New crop'}
      title={crop ? `Edit ${crop.name}` : 'Add a crop'}
      footer={
        confirm && crop && onDelete ? (
          <>
            <Button variant="secondary" onClick={() => setConfirm(false)}>
              Keep crop
            </Button>
            <Button variant="danger" onClick={() => onDelete(crop)}>
              Yes, remove
            </Button>
          </>
        ) : (
          <>
            {crop && onDelete && (
              <Button variant="secondary" onClick={() => setConfirm(true)}>
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
        <div className="fj-stack" style={{ ['--gap' as string]: '8px' }}>
          <GroupLabel>Season</GroupLabel>
          <Toggle label="Season" value={season} onChange={setSeason} options={[{ value: 'Kharif', label: 'Kharif' }, { value: 'Rabi', label: 'Rabi' }, { value: 'Zaid', label: 'Zaid' }]} />
        </div>
        <div className={s.grid2}>
          <TextField label="Area" inputMode="decimal" suffix="acres" value={acres} onChange={(e) => setAcres(e.target.value.replace(/[^\d.]/g, ''))} error={errors.acres} hint={`Up to ${maxAcres}`} />
          <TextField label="Sown on" optional type="date" value={sowing} onChange={(e) => setSowing(e.target.value)} />
        </div>
        {confirm && (
          <Note tone="danger" title="Remove this crop from the field?">
            Season records already made are not affected.
          </Note>
        )}
      </div>
    </Sheet>
  );
}
