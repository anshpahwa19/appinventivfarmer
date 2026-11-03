import { Mail, MessageCircle, Phone, UserRound } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { ListGroup, ListRow } from '@/components/ui/Blocks';
import { useUI, KD_CONTACT } from '@/app/providers';
import { SUPPORT } from '@/data/people';
import s from './Account.module.css';

export default function Contact() {
  const { openContact } = useUI();
  return (
    <Screen title="Contact us" back backTo="/account">
      <div className={s.page}>
        <ListGroup title="Fastest">
          <ListRow icon={<UserRound />} title="Your Kisani Didi" subtitle={`${KD_CONTACT.name} · knows your farm`} onClick={() => openContact(KD_CONTACT)} />
        </ListGroup>
        <ListGroup title="Support team">
          <ListRow icon={<Phone />} title={`Call ${SUPPORT.phoneLabel}`} subtitle={`Toll-free · ${SUPPORT.hours}`} onClick={() => openContact({ name: 'Kisani Urjaa support', role: SUPPORT.hours, phone: SUPPORT.phone })} />
          <ListRow icon={<MessageCircle />} title="WhatsApp support" subtitle="Reply within a working day" onClick={() => openContact({ name: 'Kisani Urjaa support', role: 'WhatsApp', phone: SUPPORT.whatsapp })} />
          <ListRow icon={<Mail />} title="Email" subtitle={SUPPORT.email} onClick={() => (window.location.href = `mailto:${SUPPORT.email}`)} />
        </ListGroup>
        <p className="t-caption c-3">Contact details in this prototype are placeholders.</p>
      </div>
    </Screen>
  );
}
