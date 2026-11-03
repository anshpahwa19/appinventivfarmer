import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, Copy, Lock, MessageCircle, Package, Phone, ShieldCheck, Sprout } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { ListRow } from '@/components/ui/Blocks';
import { Avatar } from '@/components/ui/Misc';
import { useToast } from '@/components/ui/Toast';
import { useStore } from '@/services/store';
import { KISANI_DIDI } from '@/data/people';
import { formatPhone } from '@/lib/format';
import s from './providers.module.css';

export interface ContactPerson {
  name: string;
  role: string;
  phone: string;
  message?: string;
}

interface UIContextValue {
  openCreate: () => void;
  createOpen: boolean;
  /** Runs `action` if the user is verified, otherwise explains how to get verified. */
  requireVerified: (reason: string, action: () => void) => void;
  openContact: (person?: ContactPerson) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside <UIProvider>');
  return ctx;
}

export const KD_CONTACT: ContactPerson = { name: KISANI_DIDI.name, role: 'Your Kisani Didi', phone: KISANI_DIDI.phone };

export function UIProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const toast = useToast();
  const verified = useStore((st) => st.session.verified);
  const [createOpen, setCreateOpen] = useState(false);
  const [gate, setGate] = useState<string | null>(null);
  const [contact, setContact] = useState<ContactPerson | null>(null);

  const requireVerified = useCallback(
    (reason: string, action: () => void) => {
      if (verified) action();
      else setGate(reason);
    },
    [verified],
  );

  const openContact = useCallback((person?: ContactPerson) => setContact(person ?? KD_CONTACT), []);

  const value = useMemo<UIContextValue>(() => ({ openCreate: () => setCreateOpen(true), createOpen, requireVerified, openContact }), [createOpen, requireVerified, openContact]);

  const go = (to: string, needsVerification: boolean, reason: string) => {
    setCreateOpen(false);
    if (needsVerification && !verified) setTimeout(() => setGate(reason), 260);
    else navigate(to);
  };

  const copyNumber = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(formatPhone(phone));
      toast({ message: 'Number copied', tone: 'success' });
    } catch {
      toast({ message: `Number: ${formatPhone(phone)}`, tone: 'info' });
    }
  };

  return (
    <UIContext.Provider value={value}>
      {children}

      <Sheet open={createOpen} onClose={() => setCreateOpen(false)} title="Create" description="What would you like to do?">
        <div className={s.createList}>
          <ListRow
            icon={<Package aria-hidden />}
            title="Order FOM"
            subtitle={verified ? 'Organic manure delivered to your farm' : 'Needs a verified number'}
            onClick={() => go('/orders/fom/new', true, 'Ordering FOM needs a verified mobile number')}
            trailing={!verified ? <Lock className={s.lock} aria-label="Locked" /> : undefined}
          />
          <ListRow
            icon={<CalendarPlus aria-hidden />}
            title="Book a field service"
            subtitle={verified ? 'Choose a field, date and time' : 'Needs a verified number'}
            onClick={() => go('/bookings/new', true, 'Booking needs a verified mobile number')}
            trailing={!verified ? <Lock className={s.lock} aria-label="Locked" /> : undefined}
          />
          <ListRow icon={<Sprout aria-hidden />} title="Add a field" subtitle="Register land and the crops on it" onClick={() => go('/lands/new', false, '')} />
        </div>
      </Sheet>

      <Sheet
        open={!!gate}
        onClose={() => setGate(null)}
        variant="dialog"
        icon={<ShieldCheck />}
        iconTone={{ bg: 'var(--warning-bg)', fg: 'var(--warning-fg)' }}
        title="Verify your number to continue"
        description={
          <>
            {gate}. Verify now with a one-time code (OTP), or your Kisani Didi can verify you on her next visit.
          </>
        }
        footer={
          <div className={s.gateActions}>
            <Button
              variant="primary"
              block
              data-autofocus
              onClick={() => {
                setGate(null);
                navigate('/account/verify');
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
          </div>
        }
      />

      <Sheet open={!!contact} onClose={() => setContact(null)} title={contact ? `Contact ${contact.name.split(' ')[0]}` : 'Contact'} hideTitle>
        {contact && (
          <div className={s.contact}>
            <Avatar name={contact.name} size={72} />
            <div className={s.contactName}>{contact.name}</div>
            <div className={s.contactRole}>{contact.role}</div>
            <div className={s.number}>
              <span className="tnum">{formatPhone(contact.phone)}</span>
              <button type="button" className={s.copy} onClick={() => copyNumber(contact.phone)} aria-label="Copy number">
                <Copy aria-hidden />
              </button>
            </div>
            <div className={s.contactActions}>
              <Button variant="primary" size="lg" block icon={<Phone aria-hidden />} onClick={() => (window.location.href = `tel:+91${contact.phone}`)}>
                Call
              </Button>
              <a className={s.whatsapp} href={`https://wa.me/91${contact.phone}?text=${encodeURIComponent(contact.message ?? 'Namaste, I need help with my Kisani Urjaa account.')}`} target="_blank" rel="noreferrer">
                <MessageCircle aria-hidden /> WhatsApp
              </a>
            </div>
            <p className={s.note}>Calls open your phone’s dialer. Sample number shown in this prototype.</p>
          </div>
        )}
      </Sheet>
    </UIContext.Provider>
  );
}
