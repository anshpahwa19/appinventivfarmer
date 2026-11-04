import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Maximize, Minimize, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { formatDuration } from '@/lib/format';
import { Photo } from '../photo/Photo';
import { Button } from '../ui/Button';
import s from './VideoPlayer.module.css';

/** Direction 02 sample clips, one per video photo slot (see scripts/make-d2-clips.py). */
const CLIPS = new Set(['harvest-baler', 'soil-sample', 'cotton-drip', 'paddy-closeup', 'paddy-field', 'wheat-grain']);
export function clipFor(slot: string, fallback: string) {
  return CLIPS.has(slot) ? `media/fj/${slot}.mp4` : fallback;
}

interface Props {
  src: string;
  title: string;
  poster: string;
  durationHint?: number;
}

/** Cinema player: play/pause, scrub, ±10 s, mute, full screen, loading and failure states. */
export function VideoPlayer({ src, title, poster, durationHint = 0 }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(durationHint);
  const [waiting, setWaiting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [chrome, setChrome] = useState(true);
  const [fs, setFs] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const url = /^https?:/.test(src) ? src : `${import.meta.env.BASE_URL}${src}`;

  const poke = useCallback(() => {
    setChrome(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setChrome(false), 2600);
  }, []);

  useEffect(() => {
    const on = () => setFs(document.fullscreenElement === wrap.current);
    document.addEventListener('fullscreenchange', on);
    return () => {
      document.removeEventListener('fullscreenchange', on);
      clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (!playing) {
      clearTimeout(timer.current);
      setChrome(true);
    } else poke();
  }, [playing, poke]);

  const toggle = async () => {
    const v = video.current;
    if (!v) return;
    setStarted(true);
    if (v.paused) {
      try {
        await v.play();
      } catch {
        setFailed(true);
      }
    } else v.pause();
  };

  const seek = (t: number) => {
    const v = video.current;
    if (!v || !Number.isFinite(t)) return;
    v.currentTime = Math.max(0, Math.min(duration || v.duration || 0, t));
    setTime(v.currentTime);
    poke();
  };

  const fullscreen = async () => {
    const el = wrap.current;
    const v = video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (el?.requestFullscreen) await el.requestFullscreen();
      else v?.webkitEnterFullscreen?.();
    } catch {
      v?.webkitEnterFullscreen?.();
    }
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault();
      toggle();
    } else if (e.key === 'ArrowRight') seek(time + 5);
    else if (e.key === 'ArrowLeft') seek(time - 5);
    else if (e.key === 'm') setMuted((m) => !m);
    else if (e.key === 'f') fullscreen();
  };

  const pct = duration ? (time / duration) * 100 : 0;

  return (
    <div ref={wrap} className={`${s.player} ${fs ? s.fs : ''}`} onKeyDown={onKey} onPointerMove={() => playing && poke()} role="region" aria-label={`Video: ${title}`}>
      <video
        ref={video}
        className={s.video}
        src={url}
        playsInline
        preload="metadata"
        muted={muted}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => Number.isFinite(e.currentTarget.duration) && setDuration(e.currentTarget.duration)}
        onWaiting={() => setWaiting(true)}
        onPlaying={() => setWaiting(false)}
        onCanPlay={() => setWaiting(false)}
        onError={() => setFailed(true)}
        onClick={toggle}
      />
      <AnimatePresence>
        {!started && (
          <motion.div className={s.poster} exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: 0.4 }}>
            <Photo id={poster} ratio="fill" shade="bottom" decorative />
            <motion.button type="button" className={s.bigPlay} onClick={toggle} aria-label={`Play ${title}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} whileTap={{ scale: 0.9 }} transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.2 }}>
              <Play fill="currentColor" aria-hidden />
            </motion.button>
            <span className={s.sample}>Sample clip · {formatDuration(durationHint)}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {waiting && started && !failed && <span className={s.spinner} role="status" aria-label="Loading video" />}
      {failed && (
        <div className={s.failed} role="alert">
          <p>This video couldn’t play. Check your connection.</p>
          <Button
            variant="night"
            size="sm"
            icon={<RotateCcw aria-hidden />}
            onClick={() => {
              setFailed(false);
              video.current?.load();
            }}
          >
            Try again
          </Button>
        </div>
      )}
      {started && !failed && (
        <motion.div className={s.bar} animate={{ opacity: chrome ? 1 : 0, y: chrome ? 0 : 10 }} transition={{ duration: 0.25 }}>
          <button type="button" className={s.ctl} onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <Pause fill="currentColor" aria-hidden /> : <Play fill="currentColor" aria-hidden />}
          </button>
          <span className={s.time}>{formatDuration(time)}</span>
          <div className={s.track}>
            <span className={s.fill} style={{ width: `${pct}%` }} />
            <input type="range" min={0} max={duration || 0} step={0.1} value={time} onChange={(e) => seek(Number(e.target.value))} aria-label="Seek" aria-valuetext={`${formatDuration(time)} of ${formatDuration(duration)}`} />
          </div>
          <span className={s.time}>{formatDuration(duration)}</span>
          <button type="button" className={s.ctl} onClick={() => setMuted((m) => !m)} aria-label={muted ? 'Unmute' : 'Mute'}>
            {muted ? <VolumeX aria-hidden /> : <Volume2 aria-hidden />}
          </button>
          <button type="button" className={s.ctl} onClick={fullscreen} aria-label={fs ? 'Exit full screen' : 'Full screen'}>
            {fs ? <Minimize aria-hidden /> : <Maximize aria-hidden />}
          </button>
        </motion.div>
      )}
    </div>
  );
}
