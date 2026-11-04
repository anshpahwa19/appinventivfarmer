import { MessageCircle } from 'lucide-react';
import { FAQS } from '@/data/help';
import { Screen, PageTitle } from '../../layout/Screen';
import { Accordion } from '../../ui/Blocks';
import { Button } from '../../ui/Button';
import { Photo } from '../../photo/Photo';
import s from './Account.module.css';

export default function Help() {
  return (
    <Screen title="Help & FAQs" backTo="/account">
      <PageTitle kicker="Help" title="How can we help?" deck="Answers to the questions farmers ask most." />
      <div className={s.sub}>
        <div className={s.helpPhoto}>
          <Photo id="village-meeting" ratio="16/9" alt="A Kisani Didi answering farmers’ questions" />
        </div>
        <div className="fj-stack" style={{ ['--gap' as string]: '10px' }}>
          {FAQS.map((f, i) => (
            <Accordion key={f.q} title={f.q} defaultOpen={i === 0}>
              <p className="fj-body fj-c2">{f.a}</p>
            </Accordion>
          ))}
        </div>
        <section className={s.profile}>
          <h2 className={s.cardTitle}>Still need help?</h2>
          <p style={{ marginTop: 6, color: 'var(--fj-on-night-2)' }}>Our support team and your Kisani Didi speak Marathi, Hindi and English.</p>
          <div style={{ marginTop: 16 }}>
            <Button variant="accent" icon={<MessageCircle aria-hidden />} to="/account/contact">
              Contact us
            </Button>
          </div>
        </section>
      </div>
    </Screen>
  );
}
