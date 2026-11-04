import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { ArrowUpRight, Copy, Lock, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { useStore } from '@/services/store';
import { KISANI_DIDI } from '@/data/people';
import { formatPhone } from '@/lib/format';
import { Sheet } from './ui/Sheet';
import { Button } from './ui/Button';
import { Avatar } from './ui/Blocks';
import { useToast } from './ui/Toast';
import { Photo } from './photo/Photo';
import { useNav } from './nav';
import s from './providers.module.css';

export interface ContactPerson {
  name: string;
  role: string;
  phone: string;
  message?: string;
}

interface UI {
  openCreate: () => void;
  createOpen: boolean;
  requireVerified: (reason: string, action: () => void) => void;
  openContact: (person?: ContactPerson) => void;
}

const Ctx = createContext<UI | null>(null);

export function useUI(): UI {
  const v = useContext(Ctx);
  if (!v) throw new Error('useUI outside <UIProvider>');
  return v;
}

export const KD_CONTACT: ContactPerson = { name: KISANI_DIDI.name, role: 'Your Kisani Didi', phone: KISANI_DIDI.phone };

export function UIProvider({ children }: { children: ReactNode }) {
  const nav = useNav();
  const toast = useToast();
  const verified = useStore((st) => st.session.verified);
  const [createOpen, setCreateOpen] = useState(false);
  const [gate, setGate] = useState<string | null>(null);
  const [contact, setContact] = useState<ContactPerson | null>(null);

  const requireVerified = useCallback((reason: string, action: () => void) => (verified ? action() : setGate(reason)), [verified]);
  const openContact = useCallback((p?: ContactPerson) => setContact(p ?? KD_CONTACT), []);
  const value = useMemo<UI>(() => ({ openCreate: () => setCreateOpen(true), createOpen, requireVerified, openContact }), [createOpen, requireVerified, openContact]);

  const go = (path: string, needsVerified: boolean, reason: string) => {
    setCreateOpen(false);
    if (needsVerified && !verified) setTimeout(() => setGate(reason), 280);
    else nav(path);
  };

  const copy = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(formatPhone(phone));
      toast({ message: 'Number copied', tone: 'success' });
    } catch {
      toast({ message: `Number: ${formatPhone(phone)}`, tone: 'info' });
    }
  };

  const options = [
    { photo: 'fom-product', title: 'Order FOM', sub: 'Organic manure, delivered to your village', path: '/orders/fom/new', locked: !verified, reason: 'Ordering FOM needs a verified mobile number' },
    { photo: 'machinery-tractor', title: 'Book a field service', sub: 'Straw baling and clearing, on a date you choose', path: '/bookings/new', locked: !verified, reason: 'Booking needs a verified mobile number' },
    { photo: 'paddy-field', title: 'Add a field', sub: 'Register land and the crops on it', path: '/lands/new', locked: false, reason: '' },
  ];

  return (
    <Ctx.Provider value={value}>
      {children}

      <Sheet open={createOpen} onClose={() => setCreateOpen(false)} kicker="New" title="What do you want to start?">
        <div className={s.create}>
          {options.map((o, i) => (
            <button key={o.title} type="button" className={s.option} onClick={() => go(o.path, o.locked, o.reason)}>
              <Photo id={o.photo} ratio="1/1" className={s.optionPhoto} decorative />
              <span className={s.optionText}>
                <span className={s.optionIndex}>0{i + 1}</span>
                <span className={s.optionTitle}>{o.title}</span>
                <span className={s.optionSub}>{o.locked ? 'Needs a verified number' : o.sub}</span>
              </span>
              {o.locked ? <Lock className={s.optionIcon} aria-label="Locked" /> : <ArrowUpRight className={s.optionIcon} aria-hidden />}
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet
        open={!!gate}
        onClose={() => setGate(null)}
        variant="dialog"
        icon={<ShieldCheck />}
        tone="warning"
        title="Verify your number first"
        description={<>{gate}. Verify now with a one-time code (OTP), or your Kisani Didi can verify you on her next visit.</>}
        footer={
          <>
            <Button
              block
              data-autofocus
              onClick={() => {
                setGate(null);
                nav('/account/verify');
              }}
            >
              Verify with OTP
            </Button>
            <Button
              variant="secondary"
              block
              icon={<Phone aria-hidden />}
              onClick={() => {
                setGate(null);
                setContact(KD_CONTACT);
              }}
            >
              Contact Kisani Didi
            </Button>
            <Button variant="ghost" block onClick={() => setGate(null)}>
              Not now
            </Button>
          </>
        }
      />

      <Sheet open={!!contact} onClose={() => setContact(null)} title={contact ? `Contact ${contact.name}` : 'Contact'} hideTitle>
        {contact && (
          <div className={s.contact}>
            <div className={s.contactHead}>
              <Avatar name={contact.name} size={72} night />
              <div>
                <p className={s.contactRole}>{contact.role}</p>
                <p className={s.contactName}>{contact.name}</p>
              </div>
            </div>
            <div className={s.number}>
              <span>{formatPhone(contact.phone)}</span>
              <button type="button" onClick={() => copy(contact.phone)} aria-label="Copy number">
                <Copy aria-hidden />
              </button>
            </div>
            <div className={s.contactActions}>
              <Button variant="accent" size="lg" block icon={<Phone aria-hidden />} onClick={() => (window.location.href = `tel:+91${contact.phone}`)}>
                Call
              </Button>
              <Button variant="night" size="lg" block icon={<MessageCircle aria-hidden />} href={`https://wa.me/91${contact.phone}?text=${encodeURIComponent(contact.message ?? 'Namaste, I need help with my Kisani Urjaa account.')}`}>
                WhatsApp
              </Button>
            </div>
            <p className={s.contactNote}>Calls open your phone’s dialer. Sample number in this prototype.</p>
          </div>
        )}
      </Sheet>
    </Ctx.Provider>
  );
}
