import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import s from './Button.module.css';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'tonal' | 'ghost' | 'danger' | 'glass';

interface CommonProps {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  children?: ReactNode;
  className?: string;
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined };
type LinkProps = CommonProps & { to: string; href?: undefined; replace?: boolean; state?: unknown; onClick?: () => void; 'aria-label'?: string };
/** External link styled as a button (opens in a new tab). */
type AnchorProps = CommonProps & { href: string; to?: undefined; onClick?: () => void; 'aria-label'?: string };

function classes({ variant = 'primary', size = 'md', block, loading, className }: CommonProps) {
  return [s.btn, s[variant], s[size], block && s.block, loading && s.loading, className].filter(Boolean).join(' ');
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps | LinkProps | AnchorProps>(function Button(props, ref) {
  const { variant, size, block, icon, iconRight, loading, children, className, ...rest } = props;
  const cls = classes({ variant, size, block, loading, className });
  const content = (
    <>
      {loading ? <span className={s.spinner} aria-hidden /> : icon}
      {children && <span>{children}</span>}
      {!loading && iconRight}
    </>
  );
  if ('href' in rest && rest.href !== undefined) {
    const { href, onClick, ...aria } = rest as AnchorProps;
    return (
      <a href={href} target="_blank" rel="noreferrer" onClick={onClick} className={cls} {...aria}>
        {content}
      </a>
    );
  }
  if ('to' in rest && rest.to !== undefined) {
    const { to, replace, state, onClick, ...aria } = rest as LinkProps;
    return (
      <Link to={to} replace={replace} state={state} onClick={onClick} className={cls} {...aria}>
        {content}
      </Link>
    );
  }
  const { type = 'button', disabled, ...btn } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button ref={ref} type={type} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...btn}>
      {content}
    </button>
  );
});
