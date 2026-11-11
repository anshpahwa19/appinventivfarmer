import { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { motion, useTransform } from 'framer-motion';
import { ArrowRight, Bookmark, Lightbulb, Share2 } from 'lucide-react';
import type { ContentItem } from '@/types';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { actions, useStore } from '@/services/store';
import { formatDate } from '@/lib/format';
import { slotFor } from '../../photo/catalog';
import { Photo, PhotoCredit } from '../../photo/Photo';
import { Screen, useScreenScroll } from '../../layout/Screen';
import { RevealText } from '../../motion/Reveal';
import { Button, IconButton } from '../../ui/Button';
import { Avatar, ErrorState, Skel } from '../../ui/Blocks';
import { useToast } from '../../ui/Toast';
import { IndexStory, StoryRow } from '../../content/Cards';
import { category, contentMeta, photoOf } from '../../content/meta';
import { ShareSheet, shareOrOpen, shareUrl } from '../../content/Share';
import { useNav } from '../../nav';
import s from './Story.module.css';

const HERO = 540;

function Hero({ item }: { item: ContentItem }) {
  const scrollY = useScreenScroll();
  const y = useTransform(scrollY, [0, HERO], [0, 160]);
  const slides = item.gallery?.length ? item.gallery : [item.scene];
  const [index, setIndex] = useState(0);
  return (
    <header className={s.hero}>
      <motion.div className={s.heroMedia} style={{ y }}>
        <div className={s.slides} onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))} aria-label={slides.length > 1 ? `Photo ${index + 1} of ${slides.length}` : undefined}>
          {slides.map((sc, i) => (
            <div key={i} className={s.slide}>
              <Photo id={i === 0 ? photoOf(item) : slotFor(sc)} src={sc.src} ratio="fill" shade="full" label="hero" drift={i === 0} priority={i === 0} />
            </div>
          ))}
        </div>
      </motion.div>
      <div className={s.heroText}>
        <p className={s.heroKicker}>
          <span>{item.kind === 'article' ? 'Article' : 'News'}</span> {category(item)}
        </p>
        <RevealText text={item.title} className={s.title} delay={0.15} stagger={0.04} />
        <p className={s.heroMeta}>
          {formatDate(item.publishedAt)} · {contentMeta(item)}
        </p>
        {slides.length > 1 && (
          <div className={s.dots} aria-hidden>
            {slides.map((_, i) => (
              <span key={i} className={i === index ? s.dotOn : ''} />
            ))}
            <span className={s.swipe}>Swipe for more photos</span>
          </div>
        )}
      </div>
    </header>
  );
}

export function StoryBody({ item }: { item: ContentItem }) {
  let h = 0;
  return (
    <div className={s.prose}>
      {item.body.map((b, i) => {
        if (b.type === 'p') return <p key={i} className={i === 0 ? s.dropcap : undefined}>{b.text}</p>;
        if (b.type === 'h') {
          h += 1;
          return (
            <h2 key={i}>
              <span>{String(h).padStart(2, '0')}</span>
              {b.text}
            </h2>
          );
        }
        if (b.type === 'list') {
          const Tag = b.ordered ? 'ol' : 'ul';
          return (
            <Tag key={i} className={b.ordered ? s.ol : s.ul}>
              {b.items.map((li, j) => (
                <li key={j}>
                  <span className={s.marker} aria-hidden>
                    {b.ordered ? j + 1 : ''}
                  </span>
                  <span>{li}</span>
                </li>
              ))}
            </Tag>
          );
        }
        return (
          <aside key={i} className={s.tip}>
            <p className={s.tipKicker}>
              <Lightbulb aria-hidden /> Field note
            </p>
            <strong>{b.title}</strong>
            <p>{b.text}</p>
          </aside>
        );
      })}
    </div>
  );
}

export function useBookmark(id: string) {
  const toast = useToast();
  const nav = useNav();
  const saved = useStore((st) => st.bookmarks.includes(id));
  const toggle = () => {
    const added = actions.toggleBookmark(id);
    toast(
      added
        ? { message: 'Saved to bookmarks', tone: 'success', action: { label: 'View', onClick: () => nav('/bookmarks') } }
        : { message: 'Removed from bookmarks', tone: 'info', action: { label: 'Undo', onClick: () => actions.toggleBookmark(id) } },
    );
  };
  return { saved, toggle };
}

export default function Story() {
  const { id = '' } = useParams();
  const { pathname } = useLocation();
  const q = useQuery(`content-item:${id}`, () => api.getContent(id));
  const { saved, toggle } = useBookmark(id);
  const [shareOpen, setShareOpen] = useState(false);
  const item = q.data;
  const url = shareUrl(pathname.replace(/^\/d2/, ''));
  const share = () => item && shareOrOpen({ title: item.title, text: item.summary, url }, () => setShareOpen(true));
  const related = item ? api.related(item, 4) : [];

  return (
    <Screen
      title={item?.title ?? ''}
      variant={item ? 'overlay' : 'detail'}
      heroHeight={HERO}
      backTo="/learn"
      progress={!!item}
      actions={(onImage) => (
        <>
          <IconButton label={saved ? 'Remove bookmark' : 'Save to bookmarks'} variant={onImage ? 'glass' : 'plain'} active={saved} onClick={toggle} disabled={!item}>
            <Bookmark fill={saved ? 'currentColor' : 'none'} />
          </IconButton>
          <IconButton label="Share" variant={onImage ? 'glass' : 'plain'} onClick={share} disabled={!item}>
            <Share2 />
          </IconButton>
        </>
      )}
    >
      {q.status === 'loading' && (
        <div className="fj-stack" style={{ ['--gap' as string]: '14px' }}>
          <Skel h={HERO - 60} r="0" />
          <div className="fj-gutter fj-stack" style={{ ['--gap' as string]: '12px' }}>
            <Skel h={22} w="80%" />
            <Skel h={18} />
            <Skel h={18} />
            <Skel h={18} w="60%" />
          </div>
        </div>
      )}
      {q.status === 'error' && (
        <div className="fj-gutter">
          <ErrorState error={q.error} onRetry={q.refetch} />
        </div>
      )}
      {item && (
        <article>
          <Hero item={item} />
          <div className={s.sheet}>
            <PhotoCredit id={photoOf(item)} className={s.credit} />
            <div className={s.byline}>
              <Avatar name={item.author.name.replace('Kisani Urjaa ', '')} size={44} />
              <div>
                <p className={s.byName}>{item.author.name}</p>
                <p className={s.byRole}>{item.author.role}</p>
              </div>
            </div>
            <p className={s.lede}>{item.summary}</p>
            <StoryBody item={item} />
            {item.cta && (
              <div className={s.cta}>
                <Button size="lg" block iconRight={<ArrowRight aria-hidden />} to={item.cta.to}>
                  {item.cta.label}
                </Button>
              </div>
            )}
            {item.source && <p className={s.source}>Source: {item.source.name}</p>}
            <div className={s.endActions}>
              <Button variant={saved ? 'tonal' : 'secondary'} icon={<Bookmark aria-hidden fill={saved ? 'currentColor' : 'none'} />} onClick={toggle} aria-pressed={saved}>
                {saved ? 'Saved' : 'Save for later'}
              </Button>
              <Button variant="secondary" icon={<Share2 aria-hidden />} onClick={share}>
                Share
              </Button>
            </div>
          </div>
          {related.length > 0 && (
            <section className={s.related} aria-label="Read next">
              <p className={s.relatedKicker}>Read next</p>
              <StoryRow item={related[0]} />
              {related.slice(1).map((r, i) => (
                <IndexStory key={r.id} item={r} index={i + 1} />
              ))}
            </section>
          )}
          <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} title={item.title} url={url} />
        </article>
      )}
    </Screen>
  );
}
