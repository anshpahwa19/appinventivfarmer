import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BookmarkX } from 'lucide-react';
import type { ContentKind } from '@/types';
import { Screen } from '@/components/layout/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SearchField } from '@/components/ui/SearchField';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { EmptyState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { MediaRow } from '@/components/content/Cards';
import { api } from '@/services/api';
import { actions, useStore } from '@/services/store';

const TABS: { value: ContentKind; label: string; noun: string; browse: string }[] = [
  { value: 'news', label: 'News', noun: 'news', browse: 'news' },
  { value: 'video', label: 'Videos', noun: 'videos', browse: 'videos' },
  { value: 'article', label: 'Articles', noun: 'articles', browse: 'articles' },
];

export default function Bookmarks() {
  const navigate = useNavigate();
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
    <Screen title="My bookmarks" back backTo="/account">
      <div className="gutter stack" style={{ ['--gap' as string]: '12px', paddingTop: 4 }}>
        <SegmentedControl label="Bookmark type" value={tab} onChange={setTab} segments={TABS.map((t) => ({ value: t.value, label: t.label, count: counts[t.value] }))} />
        {counts[tab] > 2 && <SearchField value={q} onChange={setQ} placeholder={`Search saved ${meta.noun}`} />}
      </div>
      <div className="gutter stack" style={{ ['--gap' as string]: '16px', marginTop: 16 }}>
        <AnimatePresence initial={false} mode="popLayout">
          {list.map((item) => (
            <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <MediaRow item={item} />
              </div>
              <IconButton label={`Remove ${item.title} from bookmarks`} onClick={() => remove(item.id)}>
                <BookmarkX />
              </IconButton>
            </motion.div>
          ))}
        </AnimatePresence>
        {list.length === 0 && (
          <EmptyState
            animation="bookmark"
            title={q ? 'No saved items match' : `No saved ${meta.noun} yet`}
            body={q ? 'Try another word.' : `Tap the bookmark icon on any ${meta.noun === 'news' ? 'news story' : meta.noun.slice(0, -1)} to keep it here for later.`}
            action={!q && <Button onClick={() => navigate(`/learn?tab=${meta.value === 'video' ? 'videos' : meta.value === 'article' ? 'articles' : 'news'}`)}>Browse {meta.browse}</Button>}
          />
        )}
      </div>
    </Screen>
  );
}
