import { Copy, Facebook, MessageCircle, Twitter } from 'lucide-react';
import { Sheet } from '../ui/Sheet';
import { useToast } from '../ui/Toast';
import s from './Share.module.css';

export const SHARE_HOST = 'https://kisaniurjaa.example';
export const shareUrl = (path: string) => `${SHARE_HOST}${path}`;

/** Phone share menu when available, otherwise our sheet. */
export async function shareOrOpen(data: { title: string; text: string; url: string }, open: () => void) {
  const n = navigator as Navigator & { share?: (d: ShareData) => Promise<void>; canShare?: (d: ShareData) => boolean };
  if (n.share && (!n.canShare || n.canShare(data))) {
    try {
      await n.share(data);
      return;
    } catch (e) {
      if ((e as DOMException)?.name === 'AbortError') return;
    }
  }
  open();
}

export function ShareSheet({ open, onClose, title, url }: { open: boolean; onClose: () => void; title: string; url: string }) {
  const toast = useToast();
  const text = `${title} — Kisani Urjaa`;
  const targets = [
    { label: 'WhatsApp', icon: <MessageCircle />, href: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}` },
    { label: 'Facebook', icon: <Facebook />, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { label: 'X', icon: <Twitter />, href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
  ];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ message: 'Link copied', tone: 'success' });
      onClose();
    } catch {
      toast({ message: 'Couldn’t copy. Select the link and copy it.', tone: 'info' });
    }
  };
  return (
    <Sheet open={open} onClose={onClose} kicker="Share" title={title}>
      <div className={s.list}>
        {targets.map((t) => (
          <a key={t.label} className={s.target} href={t.href} target="_blank" rel="noreferrer" onClick={onClose}>
            <span className={s.icon} aria-hidden>
              {t.icon}
            </span>
            {t.label}
          </a>
        ))}
        <button type="button" className={s.target} onClick={copy}>
          <span className={`${s.icon} ${s.copy}`} aria-hidden>
            <Copy />
          </span>
          Copy link
        </button>
      </div>
      <input className={s.url} readOnly value={url} aria-label="Link" onFocus={(e) => e.currentTarget.select()} />
    </Sheet>
  );
}
