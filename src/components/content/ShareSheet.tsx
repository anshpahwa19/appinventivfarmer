import { Copy, Facebook, MessageCircle, Twitter } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { useToast } from '@/components/ui/Toast';
import s from './ShareSheet.module.css';

/** Public link format for shared content. Replace the host when the web app is live. */
export const SHARE_HOST = 'https://kisaniurjaa.example';

export function shareUrl(path: string) {
  return `${SHARE_HOST}${path}`;
}

/** Uses the phone's share menu when available, otherwise shows our share sheet. */
export async function shareOrOpen(data: { title: string; text: string; url: string }, openSheet: () => void) {
  const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void>; canShare?: (d: ShareData) => boolean };
  if (nav.share && (!nav.canShare || nav.canShare(data))) {
    try {
      await nav.share(data);
      return;
    } catch (e) {
      if ((e as DOMException)?.name === 'AbortError') return;
    }
  }
  openSheet();
}

export function ShareSheet({ open, onClose, title, url }: { open: boolean; onClose: () => void; title: string; url: string }) {
  const toast = useToast();
  const text = `${title} — Kisani Urjaa`;
  const targets = [
    { label: 'WhatsApp', icon: <MessageCircle />, href: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, color: '#1f8f4e' },
    { label: 'Facebook', icon: <Facebook />, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, color: '#1b5fc9' },
    { label: 'X', icon: <Twitter />, href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, color: '#1f2328' },
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
    <Sheet open={open} onClose={onClose} title="Share" description="Send this to friends and family who farm.">
      <div className={s.targets}>
        {targets.map((t) => (
          <a key={t.label} className={s.target} href={t.href} target="_blank" rel="noreferrer" onClick={onClose}>
            <span className={s.targetIcon} style={{ background: t.color }} aria-hidden>
              {t.icon}
            </span>
            {t.label}
          </a>
        ))}
        <button type="button" className={s.target} onClick={copy}>
          <span className={s.targetIcon} style={{ background: 'var(--primary)', color: 'var(--on-primary)' }} aria-hidden>
            <Copy />
          </span>
          Copy link
        </button>
      </div>
      <div className={s.link}>
        <input readOnly value={url} aria-label="Link" onFocus={(e) => e.currentTarget.select()} />
      </div>
    </Sheet>
  );
}
