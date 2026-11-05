import { useEffect } from 'react';
import { AlertTriangle, ArrowRight, Loader2, Mic, MicOff, MessageCircle, Phone, RotateCcw, Square, WifiOff } from 'lucide-react';
import { matchIntent, type HomeT, type VoiceIntent } from '@/i18n/home';
import { useVoice } from '@/lib/voice';
import s from './HomeShared.module.css';

interface Props {
  t: HomeT;
  open: boolean;
  onSend: (text: string) => void;
  onCall: () => void;
  onMessage: () => void;
  onIntent: (intent: VoiceIntent) => void;
}

/**
 * Body of the "Ask Didi" sheet. States: idle, listening, processing, done
 * (words captured), unsupported, permission denied and error. Every state
 * ends in something real: send the words to Didi, call her, or try again.
 */
export function VoicePanel({ t, open, onSend, onCall, onMessage, onIntent }: Props) {
  const v = t.voice;
  const { state, start, stop, reset } = useVoice(t.speechLang);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const { status, text, error } = state;
  const intent = status === 'done' ? matchIntent(text) : null;
  const listening = status === 'listening';
  const busy = status === 'processing';
  const blocked = status === 'unsupported' || status === 'denied' || status === 'error';

  const statusLine =
    status === 'idle' ? v.tap : listening ? v.listening : busy ? v.processing : status === 'done' ? v.youSaid : '';

  const problem =
    status === 'unsupported'
      ? { icon: <MicOff aria-hidden />, title: v.unsupportedTitle, body: v.unsupportedBody, retry: false }
      : status === 'denied'
        ? { icon: <MicOff aria-hidden />, title: v.deniedTitle, body: v.deniedBody, retry: true }
        : status === 'error' && error === 'offline'
          ? { icon: <WifiOff aria-hidden />, title: v.offlineTitle, body: v.offlineBody, retry: true }
          : status === 'error' && error === 'no-speech'
            ? { icon: <Mic aria-hidden />, title: v.noSpeechTitle, body: v.noSpeechBody, retry: true }
            : status === 'error'
              ? { icon: <AlertTriangle aria-hidden />, title: v.errorTitle, body: v.errorBody, retry: true }
              : null;

  return (
    <div className={s.voice} data-status={status}>
      <p className={s.voiceIntro}>{v.intro}</p>

      {!blocked && (
        <div className={s.micStage}>
          <span className={s.micRings} aria-hidden data-on={listening || undefined}>
            <span />
            <span />
          </span>
          <button
            type="button"
            className={`${s.micBig} ${listening ? s.micLive : ''}`}
            onClick={listening ? stop : start}
            disabled={busy}
            aria-label={listening ? v.micStop : v.mic}
            aria-pressed={listening}
            data-autofocus
          >
            {busy ? <Loader2 aria-hidden className={s.spin} /> : listening ? <Square aria-hidden /> : <Mic aria-hidden />}
          </button>
          <p className={s.micLang}>{v.listenIn(t.langName)}</p>
        </div>
      )}

      <div className={s.voiceStatus} role="status" aria-live="polite">
        {!blocked && statusLine && <p className={s.voiceLine}>{statusLine}</p>}
        {(listening || busy || status === 'done') && (
          <blockquote className={s.transcript} lang={t.contentLang} data-empty={!text || undefined}>
            {text || '…'}
          </blockquote>
        )}
        {problem && (
          <div className={s.problem}>
            <span className={s.problemIcon}>{problem.icon}</span>
            <div>
              <strong>{problem.title}</strong>
              <p>{problem.body}</p>
            </div>
          </div>
        )}
      </div>

      {listening && (
        <button type="button" className={`${s.vBtn} ${s.vSecondary}`} onClick={stop}>
          <Square aria-hidden /> {v.stop}
        </button>
      )}

      {status === 'done' && (
        <div className={s.voiceActions}>
          {intent && (
            <button type="button" className={s.intent} onClick={() => onIntent(intent)}>
              <span>
                <span className={s.intentKicker}>{v.shortcut}</span>
                {v.open[intent]}
              </span>
              <ArrowRight aria-hidden />
            </button>
          )}
          <button type="button" className={`${s.vBtn} ${s.vPrimary}`} onClick={() => onSend(text)}>
            <MessageCircle aria-hidden /> {v.send}
          </button>
          <div className={s.vRow}>
            <button type="button" className={`${s.vBtn} ${s.vSecondary}`} onClick={start}>
              <RotateCcw aria-hidden /> {v.again}
            </button>
            <button type="button" className={`${s.vBtn} ${s.vSecondary}`} onClick={onCall}>
              <Phone aria-hidden /> {v.callDidi}
            </button>
          </div>
          <p className={s.voiceNote}>{v.edit}</p>
        </div>
      )}

      {problem && (
        <div className={s.voiceActions}>
          <button type="button" className={`${s.vBtn} ${s.vPrimary}`} onClick={onCall}>
            <Phone aria-hidden /> {v.callDidi}
          </button>
          <div className={s.vRow}>
            <button type="button" className={`${s.vBtn} ${s.vSecondary}`} onClick={onMessage}>
              <MessageCircle aria-hidden /> {t.message}
            </button>
            {problem.retry && (
              <button type="button" className={`${s.vBtn} ${s.vSecondary}`} onClick={start}>
                <RotateCcw aria-hidden /> {v.again}
              </button>
            )}
          </div>
        </div>
      )}

      <p className={s.voiceNote}>{v.privacy}</p>
      {t.reviewNote && <p className={s.voiceNote}>{t.reviewNote}</p>}
    </div>
  );
}
