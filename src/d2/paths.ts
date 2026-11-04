/**
 * Direction 02 lives under /d2 and mirrors every Direction 01 route, so the
 * same screen can be opened in either direction. Shared data (notification
 * links, content CTAs) stores Direction 01 paths; `to()` maps them.
 */
export const D2 = '/d2';

export function isD2Path(pathname: string): boolean {
  return pathname === D2 || pathname.startsWith(`${D2}/`);
}

/** '/orders' → '/d2/orders'. Already-prefixed paths and external URLs pass through. */
export function to(path: string): string {
  if (/^https?:/.test(path) || isD2Path(path)) return path;
  if (path === '/' || path === '') return D2;
  return `${D2}${path.startsWith('/') ? path : `/${path}`}`;
}

/** '/d2/orders' → '/orders'. */
export function fromD2(pathname: string): string {
  if (!isD2Path(pathname)) return pathname;
  const rest = pathname.slice(D2.length);
  return rest || '/';
}

export const TAB_ROOTS = ['/home', '/learn', '/orders', '/account'].map(to);

export function isTabRoot(pathname: string): boolean {
  return TAB_ROOTS.includes(pathname);
}
