import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookmarkX } from 'lucide-react';
import type { ContentKind } from '@/types';
import { api } from '@/services/api';
import { actions, useStore } from '@/services/store';
import { Screen, PageTitle } from '../../layout/Screen';
import { SectionTabs } from '../../ui/Controls';
import { SearchBox } from '../../ui/SearchBox';
import { Button, IconButton } from '../../ui/Button';
import { EmptyState } from '../../ui/Blocks';
import { useToast } from '../../ui/Toast';
import { StoryRow } from '../../content/Cards';
import s from './Bookmarks.module.css';

const TABS: { value: ContentKind; label: string; noun: string; param: string }[] = [
  { value: 'news', label: 'News', noun: 'news', param: 'news' },
  { value: 'video', label: 'Videos', noun: 'videos', param: 'videos' },
  { value: 'article', label: 'Articles', noun: 'articles', param: 'articles' },
];

export default function Bookmarks() {
  const toast = useToast();
  const ids = useStore((st) => st.bookmarks);
  const [tab, setTab] = useState<ContentKind>('news');
  const [q, setQ] = useState('');
  const saved = useMemo(() => ids.map((id) => api.contentById(id)).filter((x): x is NonNullable<typeof x> => !!x), [ids]);
  const counts = useMemo(() => {
    const c: Record<ContentKind, number> = { news: 0, video: 0, article: 0 };
    saved.forEach((i) => c[i.kind]++);
    return c;
  }, [saved]);
  const list = saved.filter((i) => i.kind === tab && (!q || `${i.title} ${i.summary}`.toLowerCase().includes(q.toLowerCase())));
  const meta = TABS.find((t) => t.value === tab)!;

  const remove = (id: string) => {
    actions.toggleBookmark(id);
    toast({ message: 'Removed from bookmarks', tone: 'info', action: { label: 'Undo', onClick: () => actions.toggleBookmark(id) } });
  };

  return (
    <Screen title="Bookmarks" backTo="/account">
      <PageTitle kicker="Saved for later" title="My bookmarks" deck={`${saved.length} saved · kept on this phone`} />
      <SectionTabs label="Bookmark type" value={tab} onChange={setTab} size="md" items={TABS.map((t) => ({ value: t.value, label: t.label, count: counts[t.value] }))} />
      {counts[tab] > 2 && (
        <div className="fj-gutter" style={{ paddingTop: 16 }}>
          <SearchBox value={q} onChange={setQ} placeholder={`Search saved ${meta.noun}`} />
        </div>
      )}
      <div className={s.list}>
        <AnimatePresence initial={false} mode="popLayout">
          {list.map((item) => (
            <motion.div key={item.id} layout className={s.item} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -60, transition: { duration: 0.22 } }}>
              <div className={s.grow}>
                <StoryRow item={item} />
              </div>
              <IconButton label={`Remove ${item.title} from bookmarks`} variant="plain" onClick={() => remove(item.id)}>
                <BookmarkX />
              </IconButton>
            </motion.div>
          ))}
        </AnimatePresence>
        {list.length === 0 && (
          <EmptyState
            animation="bookmark"
            title={q ? 'No saved items match' : `No saved ${meta.noun} yet`}
            body={q ? 'Try another word.' : 'Tap the bookmark on any story, video or guide to keep it here for later.'}
            action={!q && <Button to={`/learn?tab=${meta.param}`}>Browse {meta.noun}</Button>}
          />
        )}
      </div>
    </Screen>
  );
}
