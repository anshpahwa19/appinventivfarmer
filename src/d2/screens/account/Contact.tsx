import { Mail, MessageCircle, Phone, UserRound } from 'lucide-react';
import { SUPPORT } from '@/data/people';
import { Screen, PageTitle } from '../../layout/Screen';
import { Row, RowGroup } from '../../ui/Blocks';
import { KD_CONTACT, useUI } from '../../providers';
import { Photo } from '../../photo/Photo';
import s from './Account.module.css';

export default function Contact() {
  const { openContact } = useUI();
  return (
    <Screen title="Contact us" backTo="/account">
      <PageTitle kicker="Help" title="Contact us" />
      <div className={s.sub}>
        <div className={s.helpPhoto}>
          <Photo id="village-meeting" ratio="16/9" alt="Your Kisani Didi with farmers" />
        </div>
        <RowGroup title="Fastest">
          <Row icon={<UserRound />} title="Your Kisani Didi" subtitle={`${KD_CONTACT.name} · knows your farm`} onClick={() => openContact(KD_CONTACT)} />
        </RowGroup>
        <RowGroup title="Support team">
          <Row icon={<Phone />} title={`Call ${SUPPORT.phoneLabel}`} subtitle={`Toll-free · ${SUPPORT.hours}`} onClick={() => openContact({ name: 'Kisani Urjaa support', role: SUPPORT.hours, phone: SUPPORT.phone })} />
          <Row icon={<MessageCircle />} title="WhatsApp support" subtitle="Reply within a working day" onClick={() => openContact({ name: 'Kisani Urjaa support', role: 'WhatsApp', phone: SUPPORT.whatsapp })} />
          <Row icon={<Mail />} title="Email" subtitle={SUPPORT.email} onClick={() => (window.location.href = `mailto:${SUPPORT.email}`)} />
        </RowGroup>
        <p className="fj-caption fj-c3">Contact details in this prototype are placeholders.</p>
      </div>
    </Screen>
  );
}
