import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ChevronDown } from 'lucide-react';
import s from './Field.module.css';

interface Common {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  optional?: boolean;
}

function Message({ id, error, hint }: { id: string; error?: string | null; hint?: ReactNode }) {
  return (
    <AnimatePresence initial={false} mode="wait">
      {error ? (
        <motion.p key="e" id={id} className={s.error} role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <AlertCircle aria-hidden /> {error}
        </motion.p>
      ) : hint ? (
        <motion.p key="h" id={id} className={s.hint} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {hint}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

function Label({ htmlFor, label, optional }: { htmlFor: string; label: string; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className={s.label}>
      {label}
      {optional && <span className={s.optional}>Optional</span>}
    </label>
  );
}

interface TextFieldProps extends Common, Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** Large numeric entry (quantities, phone). */
  big?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField({ label, hint, error, optional, prefix, suffix, big, id, className, ...rest }, ref) {
  const auto = useId();
  const fid = id ?? auto;
  const msg = `${fid}-msg`;
  return (
    <div className={`${s.field} ${className ?? ''}`}>
      <Label htmlFor={fid} label={label} optional={optional} />
      <div className={`${s.box} ${big ? s.big : ''} ${error ? s.invalid : ''} ${rest.readOnly ? s.readOnly : ''}`}>
        {prefix && <span className={s.affix}>{prefix}</span>}
        <input ref={ref} id={fid} className={s.input} aria-invalid={!!error || undefined} aria-describedby={error || hint ? msg : undefined} {...rest} />
        {suffix && <span className={s.affix}>{suffix}</span>}
      </div>
      <Message id={msg} error={error} hint={hint} />
    </div>
  );
});

interface TextAreaProps extends Common, TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function TextArea({ label, hint, error, optional, id, maxLength, value, ...rest }: TextAreaProps) {
  const auto = useId();
  const fid = id ?? auto;
  const msg = `${fid}-msg`;
  const length = typeof value === 'string' ? value.length : 0;
  return (
    <div className={s.field}>
      <Label htmlFor={fid} label={label} optional={optional} />
      <div className={`${s.box} ${s.area} ${error ? s.invalid : ''}`}>
        <textarea id={fid} className={s.textarea} rows={3} maxLength={maxLength} value={value} aria-describedby={msg} {...rest} />
      </div>
      <div className={s.areaFoot}>
        <Message id={msg} error={error} hint={hint} />
        {maxLength && (
          <span className={s.counter} aria-live="polite">
            {length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

export function SelectField({ label, value, onChange, options, placeholder, error, hint, optional }: Common & { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string }) {
  const fid = useId();
  const msg = `${fid}-msg`;
  return (
    <div className={s.field}>
      <Label htmlFor={fid} label={label} optional={optional} />
      <div className={`${s.box} ${error ? s.invalid : ''}`}>
        <select id={fid} className={`${s.input} ${s.select}`} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error || undefined} aria-describedby={msg}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className={s.chev} aria-hidden />
      </div>
      <Message id={msg} error={error} hint={hint} />
    </div>
  );
}

/** Small uppercase label for groups of custom controls. */
export function GroupLabel({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <span id={id} className={s.groupLabel}>
      {children}
    </span>
  );
}

export function FieldError({ children }: { children?: string | null }) {
  if (!children) return null;
  return (
    <p className={s.error} role="alert">
      <AlertCircle aria-hidden /> {children}
    </p>
  );
}
