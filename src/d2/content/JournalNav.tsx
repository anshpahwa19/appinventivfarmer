import type { ContentKind } from '@/types';
import { SectionTabs } from '../ui/Controls';
import { useNav } from '../nav';
import s from './JournalNav.module.css';

export type JournalSection = ContentKind;

const PARAM: Record<ContentKind, string> = { news: 'news', video: 'videos', article: 'articles' };

/** Learn's section navigation: News · Videos · Articles. */
export function JournalNav({ value, counts, onKind, className }: { value: JournalSection; counts?: Partial<Record<JournalSection, number>>; onKind?: (k: ContentKind) => void; className?: string }) {
  const nav = useNav();
  return (
    <div className={`${s.sticky} ${className ?? ''}`}>
      <SectionTabs
        label="Learn sections"
        value={value}
        onChange={(v) => {
          if (onKind) onKind(v);
          else nav(`/learn?tab=${PARAM[v]}`, { replace: true });
        }}
        items={[
          { value: 'news', label: 'News', count: counts?.news },
          { value: 'video', label: 'Videos', count: counts?.video },
          { value: 'article', label: 'Articles', count: counts?.article },
        ]}
      />
    </div>
  );
}
