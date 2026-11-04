import { useParams } from 'react-router-dom';
import { LEGAL } from '@/data/help';
import { Screen, PageTitle } from '../../layout/Screen';
import { EmptyState } from '../../ui/Blocks';
import s from './Account.module.css';

export default function Legal() {
  const { doc = '' } = useParams();
  const c = LEGAL[doc as keyof typeof LEGAL];
  return (
    <Screen title={c?.title ?? 'Legal'} backTo="/account">
      {!c ? (
        <div className="fj-gutter">
          <EmptyState animation="search" title="Page not found" />
        </div>
      ) : (
        <>
          <PageTitle kicker={`Summary · updated ${c.updated}`} title={c.title} />
          <div className={s.sub}>
            <div className={s.prose}>
              {c.sections.map((sec, i) => (
                <div key={sec.h}>
                  <h2>
                    <span style={{ fontWeight: 300, color: 'var(--fj-primary)', marginRight: 8 }}>{String(i + 1).padStart(2, '0')}</span>
                    {sec.h}
                  </h2>
                  <p style={{ marginTop: 8 }}>{sec.p}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Screen>
  );
}
