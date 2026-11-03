import { MessageCircle } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { Accordion } from '@/components/ui/Blocks';
import { Button } from '@/components/ui/Button';
import { FAQS } from '@/data/help';
import s from './Account.module.css';

export default function Help() {
  return (
    <Screen title="Help & FAQs" back backTo="/account">
      <div className={s.page}>
        <div>
          <h1 className="t-title">How can we help?</h1>
          <p className="t-support c-3" style={{ marginTop: 6 }}>
            Answers to the questions farmers ask most.
          </p>
        </div>
        <div className="stack" style={{ ['--gap' as string]: '10px' }}>
          {FAQS.map((f, i) => (
            <Accordion key={f.q} title={f.q} defaultOpen={i === 0}>
              <p className="t-body c-2">{f.a}</p>
            </Accordion>
          ))}
        </div>
        <div className={s.card}>
          <h2 className={s.cardTitle}>Still need help?</h2>
          <p className={s.cardSub}>Our support team and your Kisani Didi speak Marathi, Hindi and English.</p>
          <div style={{ marginTop: 14 }}>
            <Button icon={<MessageCircle aria-hidden />} to="/account/contact">
              Contact us
            </Button>
          </div>
        </div>
      </div>
    </Screen>
  );
}
