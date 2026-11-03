import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import s from './IconButton.module.css';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string;
  children: ReactNode;
  variant?: 'surface' | 'plain' | 'tonal' | 'glass' | 'onImage';
  size?: 'sm' | 'md' | 'lg';
  badge?: number;
  active?: boolean;
  to?: string;
}

export const IconButton = forwardRef<HTMLButtonElement, Props>(function IconButton(
  { label, children, variant = 'plain', size = 'md', badge, active, to, className, type = 'button', ...rest },
  ref,
) {
  const cls = [s.icon, s[variant], size !== 'md' && s[size], active && s.active, className].filter(Boolean).join(' ');
  const badgeEl = badge ? (
    <span className={s.badge} aria-hidden>
      {badge > 9 ? '9+' : badge}
    </span>
  ) : null;
  const a11y = badge ? `${label}, ${badge} unread` : label;
  if (to)
    return (
      <Link to={to} className={cls} aria-label={a11y}>
        {children}
        {badgeEl}
      </Link>
    );
  return (
    <button ref={ref} type={type} className={cls} aria-label={a11y} aria-pressed={active} title={label} {...rest}>
      {children}
      {badgeEl}
    </button>
  );
});
