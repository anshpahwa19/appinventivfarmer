import { useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, Lightbulb, Share2, ArrowRight } from 'lucide-react';
import type { ContentItem } from '@/types';
import { Screen } from '@/components/layout/Screen';
import { Scene } from '@/components/media/Scene';
import { VideoPlayer } from '@/components/media/VideoPlayer';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Misc';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { CompactCard } from '@/components/content/Cards';
import { ShareSheet, shareOrOpen, shareUrl } from '@/components/content/ShareSheet';
import { CATEGORY_LABEL, readMinutes } from '@/data/content';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { actions, useStore } from '@/services/store';
import { formatDate, formatDuration } from '@/lib/format';
import { ParallaxHero } from '@/components/motion/ParallaxHero';
import s from './ContentDetail.module.css';

const KIND_FROM_PATH: Record<string, ContentItem['kind']> = { news: 'news', articles: 'article', videos: 'video' };
const RELATED_TITLE = { news: 'More news', article: 'More guides', video: 'Up next' };

function Gallery({ item }: { item: ContentItem }) {
  const slides = item.gallery?.length ? item.gallery : [item.scene];
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className={s.hero}>
      <div
        ref={ref}
        className={s.slides}
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        aria-label={slides.length > 1 ? `Image ${index + 1} of ${slides.length}` : undefined}
      >
        {slides.map((sc, i) => (
          <div className={s.slide} key={i}>
            <ParallaxHero>
              <Scene scene={sc} aspect="portrait" detail="high" style={{ position: 'absolute', inset: 0 }} />
            </ParallaxHero>
          </div>
        ))}
      </div>
      <div className={s.heroScrim} />
      {slides.length > 1 && (
        <div className={s.dots} aria-hidden>
          {slides.map((_, i) => (
            <span key={i} className={`${s.dot} ${i === index ? s.dotActive : ''}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function Body({ item }: { item: ContentItem }) {
  return (
    <div className={s.prose}>
      {item.body.map((b, i) => {
        if (b.type === 'p') return <p key={i}>{b.text}</p>;
        if (b.type === 'h') return <h2 key={i}>{b.text}</h2>;
        if (b.type === 'list') {
          const Tag = b.ordered ? 'ol' : 'ul';
          return (
            <Tag key={i}>
              {b.items.map((li, j) => (
                <li key={j}>{li}</li>
              ))}
            </Tag>
          );
        }
        return (
          <aside key={i} className={s.tip}>
            <Lightbulb aria-hidden />
            <div>
              <strong>{b.title}</strong>
              <p>{b.text}</p>
            </div>
          </aside>
        );
      })}
    </div>
  );
}

export default function ContentDetail() {
  const { id = '' } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const kind = KIND_FROM_PATH[pathname.split('/')[1]] ?? 'news';
  const q = useQuery(`content-item:${id}`, () => api.getContent(id));
  const saved = useStore((st) => st.bookmarks.includes(id));
  const [shareOpen, setShareOpen] = useState(false);
  const item = q.data;
  const url = shareUrl(pathname);

  const toggleSave = () => {
    const added = actions.toggleBookmark(id);
    toast(
      added
        ? { message: 'Saved to bookmarks', tone: 'success', action: { label: 'View', onClick: () => navigate('/bookmarks') } }
        : { message: 'Removed from bookmarks', tone: 'info', action: { label: 'Undo', onClick: () => actions.toggleBookmark(id) } },
    );
  };

  const share = () => item && shareOrOpen({ title: item.title, text: item.summary, url }, () => setShareOpen(true));

  const headerActions = (onImage: boolean) => (
    <>
      <IconButton label={saved ? 'Remove bookmark' : 'Save to bookmarks'} variant={onImage ? 'onImage' : 'plain'} active={saved} onClick={toggleSave} disabled={!item}>
        <Bookmark fill={saved ? 'currentColor' : 'none'} />
      </IconButton>
      <IconButton label="Share" variant={onImage ? 'onImage' : 'plain'} onClick={share} disabled={!item}>
        <Share2 />
      </IconButton>
    </>
  );

  const isVideo = kind === 'video';
  const related = item ? api.related(item, 5) : [];

  return (
    <Screen title={item?.title ?? ''} back backTo="/learn" overlay={!isVideo && !!item} actions={headerActions} progress={!isVideo && !!item}>
      {q.status === 'loading' && (
        <div>
          <Skeleton h={isVideo ? 220 : 380} r={0} />
          <div className="gutter stack" style={{ marginTop: 24, ['--gap' as string]: '12px' }}>
            <Skeleton w={120} h={26} r={14} />
            <Skeleton h={32} />
            <Skeleton h={32} w="70%" />
            <Skeleton h={18} style={{ marginTop: 16 }} />
            <Skeleton h={18} />
            <Skeleton h={18} w="80%" />
          </div>
        </div>
      )}
      {q.status === 'error' && (
        <div className="gutter" style={{ paddingTop: 8 }}>
          <ErrorState error={q.error} onRetry={q.refetch} />
        </div>
      )}
      {item && (
        <article>
          {isVideo && item.video ? (
            <VideoPlayer src={item.video.src} title={item.title} poster={item.scene} durationHint={item.video.durationSec} sample />
          ) : (
            <Gallery item={item} />
          )}
          <motion.div className={`${s.sheet} ${isVideo ? s.videoSheet : ''}`} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}>
            <div className={s.meta}>
              <span className={s.cat}>{CATEGORY_LABEL[item.category]}</span>
              <span>{formatDate(item.publishedAt)}</span>
              <span aria-hidden>·</span>
              <span>{isVideo ? `${formatDuration(item.video?.durationSec ?? 0)} video` : `${readMinutes(item)} min read`}</span>
            </div>
            <h1 className={s.title}>{item.title}</h1>
            <div className={s.byline}>
              <Avatar name={item.author.name.replace('Kisani Urjaa ', '')} size={40} />
              <div>
                <div className={s.byName}>{item.author.name}</div>
                <div className={s.byRole}>{item.author.role}</div>
              </div>
            </div>
            <p className={s.lede}>{item.summary}</p>
            <Body item={item} />
            {item.cta && (
              <div style={{ marginTop: 24 }}>
                <Button size="lg" block iconRight={<ArrowRight aria-hidden />} to={item.cta.to}>
                  {item.cta.label}
                </Button>
              </div>
            )}
            {item.source && <p className={s.source}>Source: {item.source.name}</p>}
            <div className={s.actions}>
              <Button variant={saved ? 'tonal' : 'secondary'} icon={<Bookmark aria-hidden fill={saved ? 'currentColor' : 'none'} />} onClick={toggleSave} aria-pressed={saved}>
                {saved ? 'Saved' : 'Save'}
              </Button>
              <Button variant="secondary" icon={<Share2 aria-hidden />} onClick={share}>
                Share
              </Button>
            </div>
          </motion.div>
          {related.length > 0 && (
            <section className={s.related} aria-label={RELATED_TITLE[item.kind]}>
              <h2 className={s.relatedTitle}>{RELATED_TITLE[item.kind]}</h2>
              <div className="hscroll">
                {related.map((r) => (
                  <CompactCard key={r.id} item={r} />
                ))}
              </div>
            </section>
          )}
        </article>
      )}
      {item && <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} title={item.title} url={url} />}
    </Screen>
  );
}
