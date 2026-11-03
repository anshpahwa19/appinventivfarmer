import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';
import s from './Field.module.css';

interface Common {
  label: string;
  hint?: string;
  error?: string | null;
  optional?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  maxLength?: number;
  /** Show a "12/500" counter under the field (on by default for text areas). */
  showCount?: boolean;
  className?: string;
}

function FieldShell({
  id,
  label,
  hint,
  error,
  optional,
  prefix,
  suffix,
  count,
  maxLength,
  showCount,
  className,
  children,
}: Common & { id: string; count?: number; children: ReactNode }) {
  const counter = showCount && maxLength !== undefined;
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  return (
    <div className={`${s.field} ${error ? s.invalid : ''} ${className ?? ''}`}>
      <label htmlFor={id} className={s.label}>
        {label} {optional && <span className={s.optional}>(optional)</span>}
      </label>
      <div className={s.control}>
        {prefix && (
          <span className={s.affix}>
            {prefix}
            <span className={s.prefixDivider} aria-hidden />
          </span>
        )}
        {children}
        {suffix && <span className={s.affix}>{suffix}</span>}
      </div>
      {(error || hint || counter) && (
        <div className={s.meta}>
          {error ? (
            <span id={errId} className={s.error} role="alert">
              <AlertCircle aria-hidden /> {error}
            </span>
          ) : hint ? (
            <span id={hintId}>{hint}</span>
          ) : (
            <span />
          )}
          {counter && (
            <span className={s.counter} aria-live="polite">
              {count ?? 0}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

type InputProps = Common & Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'>;

export const TextField = forwardRef<HTMLInputElement, InputProps>(function TextField(
  { label, hint, error, optional, prefix, suffix, maxLength, showCount, className, id: idProp, value, ...rest },
  ref,
) {
  const auto = useId();
  const id = idProp ?? auto;
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} prefix={prefix} suffix={suffix} maxLength={maxLength} showCount={showCount} count={String(value ?? '').length} className={className}>
      <input ref={ref} id={id} value={value} maxLength={maxLength} aria-invalid={!!error || undefined} aria-describedby={describedBy} {...rest} />
    </FieldShell>
  );
});

type AreaProps = Common & TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextArea = forwardRef<HTMLTextAreaElement, AreaProps>(function TextArea(
  { label, hint, error, optional, maxLength, showCount = true, className, id: idProp, value, ...rest },
  ref,
) {
  const auto = useId();
  const id = idProp ?? auto;
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} maxLength={maxLength} showCount={showCount} count={String(value ?? '').length} className={className}>
      <textarea ref={ref} id={id} value={value} maxLength={maxLength} rows={4} aria-invalid={!!error || undefined} aria-describedby={describedBy} {...rest} />
    </FieldShell>
  );
});

interface SelectProps extends Common {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

/** Native select (best accessibility and large native pickers on phones), styled to match. */
export function SelectField({ label, hint, error, optional, className, id: idProp, value, onChange, options, placeholder, prefix }: SelectProps) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} className={className} prefix={prefix}>
      <select id={id} className={s.select} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error || undefined}>
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
      <ChevronDown className={s.chevron} aria-hidden />
    </FieldShell>
  );
}
