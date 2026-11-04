import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bookmark, Search } from 'lucide-react';
import type { Category, ContentItem, ContentKind } from '@/types';
import { CATEGORY_LABEL } from '@/data/content';
import { api } from '@/services/api';
import { usePrime, useQuery } from '@/services/query';
import { Screen } from '../../layout/Screen';
import { IconButton, Button } from '../../ui/Button';
import { Chip, ChipRow } from '../../ui/Controls';
import { SearchBox } from '../../ui/SearchBox';
import { DateRangeSheet, rangeLabel, type DateRange } from '../../ui/DateRange';
import { EmptyState, ErrorState, Skel, SkelList, StaleNote } from '../../ui/Blocks';
import { CoverStory, GuideCard, IndexStory, StoryRow, VideoTile } from '../../content/Cards';
import { JournalNav } from '../../content/JournalNav';
import { InView } from '../../motion/Reveal';
import s from './Learn.module.css';

const PARAM_TO_KIND: Record<string, ContentKind> = { news: 'news', videos: 'video', articles: 'article' };
const KIND_TO_PARAM: Record<ContentKind, string> = { news: 'news', video: 'videos', article: 'articles' };
const NOUN: Record<ContentKind, string> = { news: 'news stories', video: 'videos', article: 'guides' };

function NewsLayout({ items }: { items: ContentItem[] }) {
  const [lead, ...rest] = [...items.filter((i) => i.featured), ...items.filter((i) => !i.featured)];
  return (
    <>
      {lead && <CoverStory item={lead} />}
      <div className={s.mag}>
        {rest.slice(0, 3).map((n, i) => (
          <InView key={n.id}>
            <StoryRow item={n} flip={i % 2 === 1} />
          </InView>
        ))}
      </div>
      {rest.length > 3 && (
        <section className={s.indexBlock} aria-label="More news">
          <p className={s.blockKicker}>Also in this issue</p>
          {rest.slice(3).map((n, i) => (
            <InView key={n.id}>
              <IndexStory item={n} index={i + 1} />
            </InView>
          ))}
        </section>
      )}
    </>
  );
}

function VideoLayout({ items }: { items: ContentItem[] }) {
  const [lead, ...rest] = [...items.filter((i) => i.featured), ...items.filter((i) => !i.featured)];
  const groups = useMemo(() => {
    const g = new Map<Category, ContentItem[]>();
    rest.forEach((v) => g.set(v.category, [...(g.get(v.category) ?? []), v]));
    return [...g.entries()];
  }, [rest]);
  return (
    <div className={s.cinema}>
      {lead && (
        <div className={s.cinemaLead}>
          <p className={s.cinemaKicker}>Featured film</p>
          <VideoTile item={lead} ratio="16/9" night />
        </div>
      )}
      {groups.map(([cat, list], gi) => (
        <section key={cat} className={s.collection} aria-label={CATEGORY_LABEL[cat]}>
          <h2 className={s.collectionTitle}>
            <span>{String(gi + 1).padStart(2, '0')}</span> {CATEGORY_LABEL[cat]}
          </h2>
          <div className="fj-rail" style={{ ['--gap' as string]: '14px', alignItems: 'flex-start' }}>
            {list.map((v, i) => (gi % 2 === 0 && i === 0 ? <VideoTile key={v.id} item={v} ratio="9/16" width={168} night /> : <VideoTile key={v.id} item={v} ratio="16/9" width={270} night />))}
          </div>
        </section>
      ))}
    </div>
  );
}

function GuideLayout({ items }: { items: ContentItem[] }) {
  const [lead, second, ...rest] = [...items.filter((i) => i.featured), ...items.filter((i) => !i.featured)];
  return (
    <>
      {lead && (
        <div className={s.guideLead}>
          <CoverStory item={lead} kicker="Guide" ratio="4/5" bleed={false} />
        </div>
      )}
      {second && (
        <div className={s.guidePair}>
          <GuideCard item={second} width={180} />
          <div className={s.guideNote}>
            <p className={s.blockKicker}>How-to</p>
            <p className={s.guideQuote}>Practical guides written with the agronomy desk. Follow label rates and local advice.</p>
          </div>
        </div>
      )}
      <div className={s.mag}>
        {rest.map((g, i) => (
          <InView key={g.id}>
            <StoryRow item={g} flip={i % 2 === 0} />
          </InView>
        ))}
      </div>
    </>
  );
}

export default function Learn() {
  const [params, setParams] = useSearchParams();
  const kind = PARAM_TO_KIND[params.get('tab') ?? 'news'] ?? 'news';
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [range, setRange] = useState<DateRange>({});
  const [filterOpen, setFilterOpen] = useState(false);

  const all = useQuery('content:all', () => api.listContent());
  const events = useQuery('events', () => api.listEvents());
  const key = `content:${kind}:${category}:${q}:${range.from ?? ''}:${range.to ?? ''}`;
  const results = useQuery(key, () => api.listContent({ kind, category, q, from: range.from, to: range.to }));
  usePrime('content-item:', all.data);

  const counts = useMemo(() => {
    const c: Record<ContentKind, number> = { news: 0, video: 0, article: 0 };
    all.data?.forEach((i) => c[i.kind]++);
    return c;
  }, [all.data]);
  const categories = useMemo(() => [...new Set((all.data ?? []).filter((i) => i.kind === kind).map((i) => i.category))], [all.data, kind]);

  const filtered = !!q || category !== 'all' || !!range.from;
  const items = results.data ?? [];
  const clear = () => {
    setQ('');
    setCategory('all');
    setRange({});
  };
  const label = rangeLabel(range);

  return (
    <Screen
      title="Journal"
      variant="masthead"
      kicker="Kisani Urjaa"
      deck="News, films and guides from the field"
      tabRoot
      scrollKey={`/d2/learn?${kind}`}
      night={kind === 'video'}
      mastheadAside={
        <div className={s.mastActions}>
          <IconButton label="Search everything" to="/search" variant={kind === 'video' ? 'night' : 'surface'}>
            <Search />
          </IconButton>
          <IconButton label="My bookmarks" to="/bookmarks" variant={kind === 'video' ? 'night' : 'surface'}>
            <Bookmark />
          </IconButton>
        </div>
      }
    >
      <div className={kind === 'video' ? s.navNight : undefined}>
        <JournalNav
          value={kind}
          counts={all.data ? { ...counts, events: events.data?.length } : undefined}
          onKind={(k) => {
            setParams({ tab: KIND_TO_PARAM[k] }, { replace: true });
            setCategory('all');
          }}
        />
      </div>

      <div className={`${s.tools} ${kind === 'video' ? s.toolsNight : ''}`}>
        <SearchBox value={q} onChange={setQ} placeholder={`Search ${NOUN[kind]}`} onFilter={() => setFilterOpen(true)} filterLabel={label} />
      </div>
      {categories.length > 1 && (
        <ChipRow label="Categories" className={s.chips}>
          <Chip night={kind === 'video'} selected={category === 'all'} onClick={() => setCategory('all')}>
            All
          </Chip>
          {categories.map((c) => (
            <Chip night={kind === 'video'} key={c} selected={category === c} onClick={() => setCategory(c)}>
              {CATEGORY_LABEL[c]}
            </Chip>
          ))}
        </ChipRow>
      )}

      {filtered && results.status === 'success' && (
        <div className={s.summary} aria-live="polite">
          <span>
            {items.length} {items.length === 1 ? 'result' : 'results'}
            {label ? ` · ${label}` : ''}
          </span>
          <button type="button" onClick={clear}>
            Clear filters
          </button>
        </div>
      )}
      <StaleNote error={results.data ? results.error : undefined} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={`${kind}-${filtered}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }} className={s.body}>
          {results.status === 'loading' && (
            <div className="fj-gutter fj-stack" style={{ ['--gap' as string]: '24px' }}>
              <Skel h={420} r="var(--r-xl)" night={kind === 'video'} />
              <SkelList count={3} />
            </div>
          )}
          {results.status === 'error' && (
            <div className="fj-gutter">
              <ErrorState error={results.error} onRetry={results.refetch} />
            </div>
          )}
          {results.status === 'success' && items.length === 0 && (
            <div className="fj-gutter">
              <EmptyState
                animation="search"
                title={filtered ? 'Nothing matches' : `No ${NOUN[kind]} yet`}
                body={filtered ? 'Try another word, category or dates.' : 'New items appear here as soon as they’re published.'}
                action={filtered ? <Button onClick={clear}>Clear filters</Button> : undefined}
              />
            </div>
          )}
          {results.status === 'success' &&
            items.length > 0 &&
            (filtered ? (
              <div className={s.mag}>
                {items.map((i, n) => (
                  <StoryRow key={i.id} item={i} flip={n % 2 === 1} />
                ))}
              </div>
            ) : kind === 'news' ? (
              <NewsLayout items={items} />
            ) : kind === 'video' ? (
              <VideoLayout items={items} />
            ) : (
              <GuideLayout items={items} />
            ))}
        </motion.div>
      </AnimatePresence>

      <DateRangeSheet open={filterOpen} onClose={() => setFilterOpen(false)} value={range} onApply={setRange} title={`${NOUN[kind][0].toUpperCase()}${NOUN[kind].slice(1)} published between`} />
    </Screen>
  );
}
