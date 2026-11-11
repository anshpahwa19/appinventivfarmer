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
import { SearchBox } from '../../ui/SearchBox';
import { DateRangeSheet, rangeLabel, type DateRange } from '../../ui/DateRange';
import { EmptyState, ErrorState, SectionHead, Skel, SkelList, StaleNote } from '../../ui/Blocks';
import { CoverStory, GuideCard, IndexStory, StoryRow, VideoTile } from '../../content/Cards';
import { JournalNav } from '../../content/JournalNav';
import { InView } from '../../motion/Reveal';
import s from './Learn.module.css';

const PARAM_TO_KIND: Record<string, ContentKind> = { news: 'news', videos: 'video', articles: 'article' };
const KIND_TO_PARAM: Record<ContentKind, string> = { news: 'news', video: 'videos', article: 'articles' };
const NOUN: Record<ContentKind, string> = { news: 'news stories', video: 'videos', article: 'articles' };

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
          <SectionHead title="Also in this issue" inset={false} />
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
          <SectionHead title="Featured film" inset={false} />
          <VideoTile item={lead} ratio="16/9" />
        </div>
      )}
      {groups.map(([cat, list]) => (
        <section key={cat} className={s.collection} aria-label={CATEGORY_LABEL[cat]}>
          <SectionHead title={CATEGORY_LABEL[cat]} meta={`${list.length} ${list.length === 1 ? 'video' : 'videos'}`} />
          {/* One film fills the width; several sit in a rail of equal tiles, so no column is left empty. */}
          {list.length === 1 ? (
            <div className={s.collectionSolo}>
              <VideoTile item={list[0]} ratio="16/9" />
            </div>
          ) : (
            <div className="fj-rail" style={{ ['--gap' as string]: '14px', alignItems: 'flex-start' }}>
              {list.map((v) => (
                <VideoTile key={v.id} item={v} ratio="16/9" width={270} />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

function GuideLayout({ items }: { items: ContentItem[] }) {
  const [lead, ...others] = [...items.filter((i) => i.featured), ...items.filter((i) => !i.featured)];
  const pair = others.slice(0, 2);
  const rest = others.slice(2);
  return (
    <>
      {lead && (
        <div className={s.guideLead}>
          <CoverStory item={lead} kicker="Article" ratio="4/5" bleed={false} />
        </div>
      )}
      {/* Two equal cards side by side; a single one spans the row. */}
      {pair.length > 0 && (
        <div className={`${s.guidePair} ${pair.length === 1 ? s.guidePairSolo : ''}`}>
          {pair.map((g) => (
            <GuideCard key={g.id} item={g} width="100%" />
          ))}
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
  const [range, setRange] = useState<DateRange>({});
  const [filterOpen, setFilterOpen] = useState(false);

  const all = useQuery('content:all', () => api.listContent());
  const key = `content:${kind}:all:${q}:${range.from ?? ''}:${range.to ?? ''}`;
  const results = useQuery(key, () => api.listContent({ kind, q, from: range.from, to: range.to }));
  usePrime('content-item:', all.data);

  const counts = useMemo(() => {
    const c: Record<ContentKind, number> = { news: 0, video: 0, article: 0 };
    all.data?.forEach((i) => c[i.kind]++);
    return c;
  }, [all.data]);
  const filtered = !!q || !!range.from;
  const items = results.data ?? [];
  const clear = () => {
    setQ('');
    setRange({});
  };
  const label = rangeLabel(range);

  return (
    <Screen
      title="Learn"
      variant="masthead"
      deck="News, films and articles from the field"
      tabRoot
      scrollKey={`/d2/learn?${kind}`}
      mastheadAside={
        <div className={s.mastActions}>
          <IconButton label="Search everything" to="/search" variant="surface">
            <Search />
          </IconButton>
          <IconButton label="My bookmarks" to="/bookmarks" variant="surface">
            <Bookmark />
          </IconButton>
        </div>
      }
    >
        <JournalNav
          value={kind}
          counts={all.data ? counts : undefined}
          onKind={(k) => setParams({ tab: KIND_TO_PARAM[k] }, { replace: true })}
        />

      <div className={s.tools}>
        <SearchBox value={q} onChange={setQ} placeholder={`Search ${NOUN[kind]}`} onFilter={() => setFilterOpen(true)} filterLabel={label} />
      </div>

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
              <Skel h={420} r="var(--r-xl)" />
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
                body={filtered ? 'Try another word or dates.' : 'New items appear here as soon as they’re published.'}
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
