import { useParams } from 'react-router-dom';
import { Screen } from '@/components/layout/Screen';
import { EmptyState } from '@/components/ui/States';
import { LEGAL } from '@/data/help';
import s from './Account.module.css';

export default function Legal() {
  const { doc = '' } = useParams();
  const content = LEGAL[doc as keyof typeof LEGAL];
  return (
    <Screen title={content?.title ?? 'Legal'} back backTo="/account">
      <div className={s.page}>
        {!content ? (
          <EmptyState animation="search" title="Page not found" />
        ) : (
          <div className={s.prose}>
            <h1 className="t-title">{content.title}</h1>
            <p className="t-caption c-3" style={{ marginTop: 6 }}>
              Summary · updated {content.updated}
            </p>
            {content.sections.map((sec) => (
              <div key={sec.h}>
                <h2>{sec.h}</h2>
                <p>{sec.p}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Screen>
  );
}
