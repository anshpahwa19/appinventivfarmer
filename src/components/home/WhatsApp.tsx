import { KISANI_DIDI } from '@/data/people';

/** WhatsApp mark, drawn as a line icon to sit with the Lucide set. */
export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3.6 20.4 4.9 16A8.6 8.6 0 1 1 8.2 19.2Z" />
      <path
        d="M9.1 8.6c.3-.6.9-.6 1.2 0l.6 1.3c.1.3 0 .6-.2.8l-.5.5c.4.9 1.3 1.8 2.2 2.2l.5-.5c.2-.2.5-.3.8-.2l1.3.6c.6.3.6.9 0 1.2-.8.6-1.9.8-2.9.3-1.8-.8-3.2-2.2-4-4-.4-1-.2-2.1.3-2.9Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

/** Opens a WhatsApp chat with the farmer's Kisani Didi, with a greeting typed in. */
export function didiWhatsAppUrl(greeting: string): string {
  return `https://wa.me/91${KISANI_DIDI.phone}?text=${encodeURIComponent(greeting)}`;
}
