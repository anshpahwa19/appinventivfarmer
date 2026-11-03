import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useTransform } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import type { Category, ContentKind } from '@/types';
import { Screen, useScreenScroll } from '@/components/layout/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SearchField } from '@/components/ui/SearchField';
import { Chip, ChipRow } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { DateRangeSheet, rangeLabel, type DateRange } from '@/components/ui/DateRange';
import { SkeletonRows, Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState, StaleBanner } from '@/components/ui/States';
import { FeatureCard, MediaRow } from '@/components/content/Cards';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { CATEGORY_LABEL } from '@/data/content';
import { api } from '@/services/api';
import { usePrime, useQuery } from '@/services/query';
import s from './Learn.module.css';

const TABS: { value: ContentKind; label: string; plural: string }[] = [
  { value: 'news', label: 'News', plural: 'news stories' },
  { value: 'video', label: 'Videos', plural: 'videos' },
  { value: 'article', label: 'Articles', plural: 'articles' },
];
const PARAM_TO_KIND: Record<string, ContentKind> = { news: 'news', videos: 'video', articles: 'article' };
const KIND_TO_PARAM: Record<ContentKind, string> = { news: 'news', video: 'videos', article: 'articles' };

function StickyTabs({ children }: { children: React.ReactNode }) {
  const scrollY = useScreenScroll();
  const bg = useTransform(scrollY, [70, 100], [0, 1]);
  return (
    <div className={s.sticky}>
      <motion.div className={s.stickyBg} style={{ opacity: bg }} aria-hidden />
      <div className={s.stickyInner}>{children}</div>
    </div>
  );
}

export default function Learn() {
  const [params, setParams] = useSearchParams();
  const kind = PARAM_TO_KIND[params.get('tab') ?? 'news'] ?? 'news';
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [range, setRange] = useState<DateRange>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const prevKind = useRef(kind);
  const dir = TABS.findIndex((t) => t.value === kind) >= TABS.findIndex((t) => t.value === prevKind.current) ? 1 : -1;
  prevKind.current = kind;

  const all = useQuery('content:all', () => api.listContent());
  const key = `content:${kind}:${category}:${q}:${range.from ?? ''}:${range.to ?? ''}`;
  const results = useQuery(key, () => api.listContent({ kind, category, q, from: range.from, to: range.to }));
  usePrime('content-item:', all.data);

  const counts = useMemo(() => {
    const c: Record<ContentKind, number> = { news: 0, video: 0, article: 0 };
    all.data?.forEach((i) => c[i.kind]++);
    return c;
  }, [all.data]);
  const categories = useMemo(() => {
    const set = new Set<Category>();
    all.data?.filter((i) => i.kind === kind).forEach((i) => set.add(i.category));
    return [...set];
  }, [all.data, kind]);

  const filtered = !!q || category !== 'all' || !!range.from;
  const items = results.data ?? [];
  const featured = !filtered ? [...items.filter((i) => i.featured), ...items.filter((i) => !i.featured)].slice(0, 3) : [];
  const rest = items.filter((i) => !featured.includes(i));
  const tab = TABS.find((t) => t.value === kind)!;

  const clearAll = () => {
    setQ('');
    setCategory('all');
    setRange({});
  };

  return (
    <Screen
      title="Learn"
      subtitle="News, videos and guides for your farm"
      largeTitle
      band
      tabRoot
      scrollKey={`/learn?${kind}`}
      largeActions={
        <IconButton label="My bookmarks" variant="surface" to="/bookmarks">
          <Bookmark />
        </IconButton>
      }
    >
      <StickyTabs>
        <SegmentedControl
          label="Content type"
          value={kind}
          onChange={(v) => {
            setParams({ tab: KIND_TO_PARAM[v] }, { replace: true });
            setCategory('all');
            setSlide(0);
          }}
          segments={TABS.map((t) => ({ value: t.value, label: t.label, count: all.data ? counts[t.value] : undefined }))}
        />
      </StickyTabs>

      <div className={s.tools}>
        <div className={s.search}>
          <SearchField value={q} onChange={setQ} placeholder={`Search ${tab.plural}`} label={`Search ${tab.plural}`} onFilter={() => setFilterOpen(true)} activeFilters={range.from ? 1 : 0} />
        </div>
        {categories.length > 1 && (
          <ChipRow label="Categories">
            <Chip selected={category === 'all'} onClick={() => setCategory('all')}>
              All
            </Chip>
            {categories.map((c) => (
              <Chip key={c} selected={category === c} onClick={() => setCategory(c)}>
                {CATEGORY_LABEL[c]}
              </Chip>
            ))}
          </ChipRow>
        )}
      </div>

      {filtered && results.status === 'success' && (
        <div className={s.summary} aria-live="polite">
          <span>
            {items.length} {items.length === 1 ? 'result' : 'results'}
            {rangeLabel(range) ? ` · ${rangeLabel(range)}` : ''}
          </span>
          <button type="button" onClick={clearAll}>
            Clear filters
          </button>
        </div>
      )}

      <StaleBanner error={results.data ? results.error : undefined} />

      <AnimatePresence mode="wait" initial={false} custom={dir}>
        <motion.div
          key={kind}
          custom={dir}
          initial={{ opacity: 0, x: dir * 36 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -24 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {results.status === 'loading' && (
            <div className={s.state}>
              <Skeleton h={380} r={28} style={{ marginTop: 14, marginBottom: 20 }} />
              <SkeletonRows count={3} />
            </div>
          )}
          {results.status === 'error' && (
            <div className={s.state}>
              <ErrorState error={results.error} onRetry={results.refetch} />
            </div>
          )}
          {results.status === 'success' && items.length === 0 && (
            <div className={s.state}>
              <EmptyState
                animation="search"
                title={filtered ? 'No matches' : `No ${tab.plural} yet`}
                body={filtered ? 'Try a different word, category or date range.' : 'New items appear here as soon as they are published.'}
                action={filtered ? <Button onClick={clearAll}>Clear filters</Button> : undefined}
              />
            </div>
          )}

          {featured.length > 0 && (
            <>
              <div
                className={s.carousel}
                onScroll={(e) => {
                  const el = e.currentTarget;
                  const w = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? el.clientWidth;
                  setSlide(Math.round(el.scrollLeft / (w + 12)));
                }}
                aria-label={`Featured ${tab.plural}`}
              >
                {featured.map((item, i) => (
                  <motion.div key={item.id} className={s.slide} initial={{ opacity: 0, scale: 0.94, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.07, type: 'spring', stiffness: 260, damping: 26 }}>
                    <FeatureCard item={item} height={kind === 'video' ? 330 : 400} eyebrow={i === 0 ? (kind === 'video' ? 'Featured video' : 'Featured') : 'Popular'} />
                  </motion.div>
                ))}
              </div>
              {featured.length > 1 && (
                <div className={s.dots} aria-hidden>
                  {featured.map((f, i) => (
                    <span key={f.id} className={`${s.dot} ${i === slide ? s.dotOn : ''}`} />
                  ))}
                </div>
              )}
            </>
          )}

          {rest.length > 0 && (
            <>
              {!filtered && (
                <div className={s.sectionHead}>
                  <h2 className={s.sectionTitle}>{kind === 'video' ? 'Recently added' : 'Latest'}</h2>
                  <span className={s.sectionMeta}>{rest.length} more</span>
                </div>
              )}
              <Stagger key={key} className={s.list}>
                {rest.map((item) => (
                  <StaggerItem key={item.id} className={s.rowWrap}>
                    <MediaRow item={item} />
                  </StaggerItem>
                ))}
              </Stagger>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <DateRangeSheet open={filterOpen} onClose={() => setFilterOpen(false)} value={range} onApply={setRange} title={`Filter ${tab.plural} by date`} />
    </Screen>
  );
}
