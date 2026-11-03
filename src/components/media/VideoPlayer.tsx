import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Maximize, Minimize, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import type { SceneSpec } from '@/types';
import { formatDuration } from '@/lib/format';
import { Scene } from './Scene';
import { Button } from '@/components/ui/Button';
import s from './VideoPlayer.module.css';

interface Props {
  src: string;
  title: string;
  poster: SceneSpec;
  durationHint?: number;
  sample?: boolean;
}

/** Accessible custom player: play/pause, seek, mute, fullscreen, loading and error states. */
export function VideoPlayer({ src, title, poster, durationHint = 0, sample }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(durationHint);
  const [waiting, setWaiting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [controls, setControls] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const url = /^https?:/.test(src) ? src : `${import.meta.env.BASE_URL}${src}`;

  const poke = useCallback(() => {
    setControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControls(false), 2600);
  }, []);

  useEffect(() => {
    const onFs = () => setFullscreen(document.fullscreenElement === wrap.current);
    document.addEventListener('fullscreenchange', onFs);
    return () => {
      document.removeEventListener('fullscreenchange', onFs);
      clearTimeout(hideTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!playing) {
      clearTimeout(hideTimer.current);
      setControls(true);
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

  const toggleFullscreen = async () => {
    const el = wrap.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    const v = video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (el?.requestFullscreen) {
        await el.requestFullscreen();
        await (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> })?.lock?.('landscape').catch(() => undefined);
      } else v?.webkitEnterFullscreen?.();
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
    else if (e.key === 'f') toggleFullscreen();
  };

  const pct = duration ? (time / duration) * 100 : 0;

  return (
    <div ref={wrap} className={s.player} onKeyDown={onKey} onPointerMove={() => playing && poke()} role="region" aria-label={`Video player: ${title}`}>
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
        aria-label={title}
      />
      <AnimatePresence>
        {!started && (
          <motion.div className={s.poster} initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <Scene scene={poster} aspect="wide" detail="high" style={{ position: 'absolute', inset: 0 }} />
            <div className={s.posterScrim} />
          </motion.div>
        )}
      </AnimatePresence>
      {sample && <span className={s.sample}>Sample clip</span>}
      <div className={s.tapLayer} onClick={() => (started ? (playing ? (controls ? toggle() : poke()) : toggle()) : toggle())} aria-hidden />
      {waiting && playing && <div className={s.spinner} aria-hidden />}
      <AnimatePresence>
        {(!playing || !started) && !failed && (
          <motion.button
            type="button"
            className={s.bigPlay}
            onClick={toggle}
            aria-label={`Play video: ${title}`}
            initial={{ opacity: 0, scale: 0.85, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 1.1, x: '-50%', y: '-50%' }}
            transition={{ duration: 0.2 }}
          >
            <Play fill="currentColor" style={{ marginLeft: 4 }} />
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {started && controls && !failed && (
          <motion.div className={s.bar} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <button type="button" className={s.ctl} onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
            </button>
            <span className={s.time}>
              {formatDuration(time)} / {formatDuration(duration)}
            </span>
            <input
              className={s.seek}
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={time}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Seek"
              aria-valuetext={`${formatDuration(time)} of ${formatDuration(duration)}`}
              style={{ ['--p' as string]: `${pct}%` }}
            />
            <button type="button" className={s.ctl} onClick={() => setMuted((m) => !m)} aria-label={muted ? 'Unmute' : 'Mute'} aria-pressed={muted}>
              {muted ? <VolumeX /> : <Volume2 />}
            </button>
            <button type="button" className={s.ctl} onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}>
              {fullscreen ? <Minimize /> : <Maximize />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {failed && (
        <div className={s.error} role="alert">
          <strong>This video can’t play right now</strong>
          <span>Check your internet connection and try again.</span>
          <Button
            variant="glass"
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
    </div>
  );
}
