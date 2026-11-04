import type { ContentKind } from '@/types';
import { SectionTabs } from '../ui/Controls';
import { useNav } from '../nav';
import s from './JournalNav.module.css';

export type JournalSection = ContentKind | 'events';

const PARAM: Record<ContentKind, string> = { news: 'news', video: 'videos', article: 'articles' };

/**
 * The Journal's section navigation, shared by Learn and Events so the
 * publication reads as one place: News · Videos · Guides · Events.
 */
export function JournalNav({ value, counts, onKind }: { value: JournalSection; counts?: Partial<Record<JournalSection, number>>; onKind?: (k: ContentKind) => void }) {
  const nav = useNav();
  return (
    <div className={s.sticky}>
      <SectionTabs
        label="Journal sections"
        value={value}
        onChange={(v) => {
          if (v === 'events') nav('/events');
          else if (onKind) onKind(v);
          else nav(`/learn?tab=${PARAM[v]}`, { replace: true });
        }}
        items={[
          { value: 'news', label: 'News', count: counts?.news },
          { value: 'video', label: 'Videos', count: counts?.video },
          { value: 'article', label: 'Guides', count: counts?.article },
          { value: 'events', label: 'Events', count: counts?.events },
        ]}
      />
    </div>
  );
}
