import { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, Share2 } from 'lucide-react';
import { api } from '@/services/api';
import { useQuery } from '@/services/query';
import { formatDate, formatDuration, formatRelative } from '@/lib/format';
import { Screen } from '../../layout/Screen';
import { Button, IconButton } from '../../ui/Button';
import { ErrorState, Skel } from '../../ui/Blocks';
import { VideoPlayer, clipFor } from '../../content/VideoPlayer';
import { Photo } from '../../photo/Photo';
import { category, contentPath, photoOf } from '../../content/meta';
import { ShareSheet, shareOrOpen, shareUrl } from '../../content/Share';
import { RevealText } from '../../motion/Reveal';
import { Link } from 'react-router-dom';
import { to } from '../../paths';
import { useBookmark, StoryBody } from './Story';
import s from './Video.module.css';

/** Video detail in cinema mode: a night page with the player up top. */
export default function Video() {
  const { id = '' } = useParams();
  const { pathname } = useLocation();
  const q = useQuery(`content-item:${id}`, () => api.getContent(id));
  const { saved, toggle } = useBookmark(id);
  const [shareOpen, setShareOpen] = useState(false);
  const [more, setMore] = useState(false);
  const item = q.data;
  const url = shareUrl(pathname.replace(/^\/d2/, ''));
  const share = () => item && shareOrOpen({ title: item.title, text: item.summary, url }, () => setShareOpen(true));
  const upNext = item ? api.related(item, 5) : [];

  return (
    <Screen
      title={item?.title ?? 'Video'}
      night
      backTo="/learn?tab=videos"
      actions={
        <>
          <IconButton label={saved ? 'Remove bookmark' : 'Save to bookmarks'} variant="night" active={saved} onClick={toggle} disabled={!item}>
            <Bookmark fill={saved ? 'currentColor' : 'none'} />
          </IconButton>
          <IconButton label="Share" variant="night" onClick={share} disabled={!item}>
            <Share2 />
          </IconButton>
        </>
      }
    >
      {q.status === 'loading' && (
        <div className="fj-stack" style={{ ['--gap' as string]: '14px' }}>
          <Skel h={221} r="0" night />
          <div className="fj-gutter fj-stack">
            <Skel h={26} night />
            <Skel h={18} w="60%" night />
          </div>
        </div>
      )}
      {q.status === 'error' && (
        <div className="fj-gutter">
          <ErrorState error={q.error} onRetry={q.refetch} />
        </div>
      )}
      {item && item.video && (
        <>
          <motion.div initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <VideoPlayer src={clipFor(photoOf(item), item.video.src)} title={item.title} poster={photoOf(item)} durationHint={item.video.durationSec} />
          </motion.div>
          <div className={s.info}>
            <p className={s.kicker}>
              {category(item)} · {formatDuration(item.video.durationSec)}
            </p>
            <RevealText text={item.title} className={s.title} as="h2" stagger={0.04} />
            <p className={s.meta}>
              {item.author.name} · {formatDate(item.publishedAt)}
            </p>
            <div className={s.actions}>
              <Button variant={saved ? 'accent' : 'glass'} size="sm" icon={<Bookmark aria-hidden fill={saved ? 'currentColor' : 'none'} />} onClick={toggle} aria-pressed={saved}>
                {saved ? 'Saved' : 'Save'}
              </Button>
              <Button variant="glass" size="sm" icon={<Share2 aria-hidden />} onClick={share}>
                Share
              </Button>
            </div>
            <p className={s.summary}>{item.summary}</p>
            {item.body.length > 0 && (
              <>
                {more && (
                  <div className={s.notes}>
                    <StoryBody item={item} />
                  </div>
                )}
                <button type="button" className={s.more} onClick={() => setMore((m) => !m)} aria-expanded={more}>
                  {more ? 'Show less' : 'Read the notes'}
                </button>
              </>
            )}
          </div>
          {upNext.length > 0 && (
            <section className={s.next} aria-label="Up next">
              <p className={s.kicker}>Up next</p>
              <ol>
                {upNext.map((v, i) => (
                  <li key={v.id}>
                    <Link to={to(contentPath(v))} className={s.nextRow}>
                      <span className={s.nextNum}>{String(i + 1).padStart(2, '0')}</span>
                      <span className={s.nextThumb}>
                        <Photo id={photoOf(v)} src={v.scene.src} ratio="16/9" decorative />
                        <span className={s.nextDur}>{formatDuration(v.video?.durationSec ?? 0)}</span>
                      </span>
                      <span className={s.nextText}>
                        <span className={s.nextTitle}>{v.title}</span>
                        <span className={s.nextMeta}>{formatRelative(v.publishedAt)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          )}
          <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} title={item.title} url={url} />
        </>
      )}
    </Screen>
  );
}
