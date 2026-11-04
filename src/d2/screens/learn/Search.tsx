import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { CATEGORY_LABEL } from '@/data/content';
import { Screen } from '../../layout/Screen';
import { SearchBox } from '../../ui/SearchBox';
import { Chip, ChipRow } from '../../ui/Controls';
import { EmptyState, ErrorState, SkelList } from '../../ui/Blocks';
import { EventLine, StoryRow } from '../../content/Cards';
import { Photo } from '../../photo/Photo';
import s from './Search.module.css';

const TOPICS = [
  { label: CATEGORY_LABEL['residue'], q: 'straw', photo: 'harvest-bales' },
  { label: CATEGORY_LABEL['soil'], q: 'soil', photo: 'soil-texture' },
  { label: CATEGORY_LABEL['crop-care'], q: 'crop', photo: 'paddy-closeup' },
  { label: CATEGORY_LABEL['water'], q: 'drip', photo: 'canal-irrigation' },
  { label: CATEGORY_LABEL['weather'], q: 'rain', photo: 'monsoon-sky' },
  { label: CATEGORY_LABEL['machinery'], q: 'seeder', photo: 'machinery-tractor' },
  { label: CATEGORY_LABEL['market'], q: 'storage', photo: 'wheat-grain' },
  { label: CATEGORY_LABEL['announcements'], q: 'FOM', photo: 'village-delivery' },
];
const SUGGESTIONS = ['straw', 'soil', 'spray', 'FOM', 'drip', 'wheat'];
type Scope = 'all' | 'news' | 'video' | 'article' | 'events';

/** One search across the Journal: stories, films, guides and events. */
export default function Search() {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [scope, setScope] = useState<Scope>('all');
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 220);
    return () => clearTimeout(t);
  }, [q]);

  const content = useQuery(`content:search:${debounced}`, () => api.listContent({ q: debounced }), { enabled: !!debounced });
  const events = useQuery('events', () => api.listEvents());
  const needle = debounced.toLowerCase();
  const evHits = useMemo(() => (needle ? (events.data ?? []).filter((e) => `${e.title} ${e.summary} ${e.topic} ${e.location.village}`.toLowerCase().includes(needle)) : []), [events.data, needle]);
  const hits = (content.data ?? []).filter((c) => scope === 'all' || c.kind === scope);
  const showEvents = scope === 'all' || scope === 'events';
  const total = (scope === 'events' ? 0 : hits.length) + (showEvents ? evHits.length : 0);
  const counts = { news: 0, video: 0, article: 0 } as Record<'news' | 'video' | 'article', number>;
  (content.data ?? []).forEach((c) => counts[c.kind]++);

  return (
    <Screen title="Search" backTo="/learn">
      <div className={s.top}>
        <h2 className={s.title}>Search the Journal</h2>
        <SearchBox value={q} onChange={setQ} placeholder="Stories, videos, guides, events" autoFocus />
      </div>
      {!debounced && (
        <div className={s.suggest}>
          <p className={s.kicker}>Farmers often look for</p>
          <div className={s.words}>
            {SUGGESTIONS.map((w, i) => (
              <motion.button key={w} type="button" className={s.word} onClick={() => setQ(w)} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                {w}
              </motion.button>
            ))}
          </div>
          <p className={s.kicker} style={{ marginTop: 28 }}>
            Topics
          </p>
          <div className={s.topics}>
            {TOPICS.map((t) => (
              <button key={t.label} type="button" className={s.topic} onClick={() => setQ(t.q)}>
                <Photo id={t.photo} ratio="4/3" shade="bottom" decorative />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {debounced && (
        <>
          <ChipRow label="Show" className={s.chips}>
            <Chip selected={scope === 'all'} onClick={() => setScope('all')}>
              All
            </Chip>
            <Chip selected={scope === 'news'} onClick={() => setScope('news')} count={counts.news}>
              News
            </Chip>
            <Chip selected={scope === 'video'} onClick={() => setScope('video')} count={counts.video}>
              Videos
            </Chip>
            <Chip selected={scope === 'article'} onClick={() => setScope('article')} count={counts.article}>
              Guides
            </Chip>
            <Chip selected={scope === 'events'} onClick={() => setScope('events')} count={evHits.length}>
              Events
            </Chip>
          </ChipRow>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={`${debounced}-${scope}-${content.status}`} className={s.results} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {content.status === 'loading' && <SkelList count={3} />}
              {content.status === 'error' && <ErrorState error={content.error} onRetry={content.refetch} />}
              {content.status === 'success' && (
                <>
                  <p className={s.count} aria-live="polite">
                    {total} {total === 1 ? 'result' : 'results'} for “{debounced}”
                  </p>
                  {total === 0 && <EmptyState animation="search" title="No matches" body="Try a shorter word, or one of the topics." compact />}
                  {scope !== 'events' && hits.map((h, i) => <StoryRow key={h.id} item={h} flip={i % 2 === 1} />)}
                  {showEvents && evHits.length > 0 && (
                    <>
                      {scope === 'all' && <p className={s.kicker} style={{ marginTop: 20 }}>Events</p>}
                      {evHits.map((e) => (
                        <EventLine key={e.id} event={e} />
                      ))}
                    </>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </Screen>
  );
}
