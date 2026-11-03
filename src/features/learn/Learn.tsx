import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import type { Category, ContentKind } from '@/types';
import { Screen } from '@/components/layout/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SearchField } from '@/components/ui/SearchField';
import { Chip, ChipRow } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { DateRangeSheet, rangeLabel, type DateRange } from '@/components/ui/DateRange';
import { SkeletonRows } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState, StaleBanner } from '@/components/ui/States';
import { FeatureCard, MediaRow } from '@/components/content/Cards';
import { CATEGORY_LABEL } from '@/data/content';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import s from './Learn.module.css';

const TABS: { value: ContentKind; label: string; plural: string }[] = [
  { value: 'news', label: 'News', plural: 'news stories' },
  { value: 'video', label: 'Videos', plural: 'videos' },
  { value: 'article', label: 'Articles', plural: 'articles' },
];

const PARAM_TO_KIND: Record<string, ContentKind> = { news: 'news', videos: 'video', articles: 'article' };
const KIND_TO_PARAM: Record<ContentKind, string> = { news: 'news', video: 'videos', article: 'articles' };

export default function Learn() {
  const [params, setParams] = useSearchParams();
  const kind = PARAM_TO_KIND[params.get('tab') ?? 'news'] ?? 'news';
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [range, setRange] = useState<DateRange>({});
  const [filterOpen, setFilterOpen] = useState(false);

  const all = useQuery('content:all', () => api.listContent());
  const key = `content:${kind}:${category}:${q}:${range.from ?? ''}:${range.to ?? ''}`;
  const results = useQuery(key, () => api.listContent({ kind, category, q, from: range.from, to: range.to }));

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
  const featured = !filtered ? items.find((i) => i.featured) ?? items[0] : undefined;
  const rest = featured ? items.filter((i) => i.id !== featured.id) : items;
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
      tabRoot
      scrollKey={`/learn?${kind}`}
      largeActions={
        <IconButton label="My bookmarks" variant="surface" to="/bookmarks">
          <Bookmark />
        </IconButton>
      }
    >
      <div className={s.controls}>
        <SegmentedControl
          label="Content type"
          value={kind}
          onChange={(v) => {
            setParams({ tab: KIND_TO_PARAM[v] }, { replace: true });
            setCategory('all');
          }}
          segments={TABS.map((t) => ({ value: t.value, label: t.label, count: all.data ? counts[t.value] : undefined }))}
        />
        <SearchField value={q} onChange={setQ} placeholder={`Search ${tab.plural}`} label={`Search ${tab.plural}`} onFilter={() => setFilterOpen(true)} activeFilters={range.from ? 1 : 0} />
        {categories.length > 1 && (
          <div className={s.chips}>
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
          </div>
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

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={kind} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} className={s.list}>
          {results.status === 'loading' && <SkeletonRows count={4} thumb={kind === 'video' ? 112 : 104} />}
          {results.status === 'error' && <ErrorState error={results.error} onRetry={results.refetch} />}
          {results.status === 'success' && items.length === 0 && (
            <EmptyState
              animation="search"
              title={filtered ? 'No matches' : `No ${tab.plural} yet`}
              body={filtered ? 'Try a different word, category or date range.' : 'New items appear here as soon as they are published.'}
              action={filtered ? <Button onClick={clearAll}>Clear filters</Button> : undefined}
            />
          )}
          {featured && <FeatureCard item={featured} height={kind === 'video' ? 300 : 360} eyebrow={kind === 'video' ? 'Featured video' : 'Featured'} />}
          {featured && rest.length > 0 && <h2 className={s.subhead}>{kind === 'video' ? 'Recently added' : 'Latest'}</h2>}
          {rest.map((item) => (
            <MediaRow key={item.id} item={item} />
          ))}
        </motion.div>
      </AnimatePresence>

      <DateRangeSheet open={filterOpen} onClose={() => setFilterOpen(false)} value={range} onApply={setRange} title={`Filter ${tab.plural} by date`} />
    </Screen>
  );
}
