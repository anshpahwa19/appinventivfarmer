/**
 * Speech to text for "Ask Didi", using the browser's Web Speech API where it
 * exists. There is no voice or AI backend: the words are only written down so
 * the farmer can send them to their Kisani Didi, who replies herself.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { isOffline } from '@/services/api';

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'done' | 'unsupported' | 'denied' | 'error';
export type VoiceError = 'no-speech' | 'offline' | 'other';

export interface VoiceState {
  status: VoiceStatus;
  /** Words heard so far (interim while listening, final when done). */
  text: string;
  error?: VoiceError;
}

/* Minimal typing for the parts of the Web Speech API we use. */
interface RecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface RecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<RecognitionResultLike>;
}
export interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((e: RecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionCtor = new () => RecognitionLike;

export function getRecognition(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Maps a Web Speech API error code to our states. */
export function classifyError(code: string): { status: VoiceStatus; error?: VoiceError } {
  if (code === 'not-allowed' || code === 'service-not-allowed' || code === 'audio-capture') return { status: 'denied' };
  if (code === 'no-speech') return { status: 'error', error: 'no-speech' };
  if (code === 'network') return { status: 'error', error: 'offline' };
  if (code === 'aborted') return { status: 'idle' };
  return { status: 'error', error: 'other' };
}

const initial = (): VoiceState => ({ status: getRecognition() ? 'idle' : 'unsupported', text: '' });

export function useVoice(lang: string) {
  const [state, setState] = useState<VoiceState>(initial);
  const rec = useRef<RecognitionLike | null>(null);
  const finalText = useRef('');
  const settled = useRef(false);
  const watchdog = useRef<ReturnType<typeof setTimeout>>();

  const clear = () => {
    if (watchdog.current) clearTimeout(watchdog.current);
  };

  const teardown = useCallback(() => {
    clear();
    const r = rec.current;
    rec.current = null;
    if (r) {
      r.onresult = r.onerror = r.onend = null;
      try {
        r.abort();
      } catch {
        /* already stopped */
      }
    }
  }, []);

  useEffect(() => teardown, [teardown]);

  const start = useCallback(() => {
    const Ctor = getRecognition();
    if (!Ctor) return setState({ status: 'unsupported', text: '' });
    if (isOffline()) return setState({ status: 'error', error: 'offline', text: '' });
    teardown();
    finalText.current = '';
    settled.current = false;
    const r = new Ctor();
    r.lang = lang;
    r.interimResults = true;
    r.continuous = false;
    r.maxAlternatives = 1;
    r.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalText.current += res[0].transcript;
        else interim += res[0].transcript;
      }
      setState((s) => (s.status === 'listening' || s.status === 'processing' ? { ...s, text: (finalText.current + interim).trim() } : s));
    };
    r.onerror = (e) => {
      settled.current = true;
      clear();
      const c = classifyError(e.error);
      setState({ status: c.status, error: c.error, text: '' });
    };
    r.onend = () => {
      clear();
      if (settled.current) return;
      settled.current = true;
      setState((s) => {
        const text = (finalText.current || s.text).trim();
        return text ? { status: 'done', text } : { status: 'error', error: 'no-speech', text: '' };
      });
    };
    rec.current = r;
    try {
      r.start();
      setState({ status: 'listening', text: '' });
    } catch {
      setState({ status: 'error', error: 'other', text: '' });
    }
  }, [lang, teardown]);

  /** Stop listening and keep what was heard. */
  const stop = useCallback(() => {
    const r = rec.current;
    if (!r) return;
    setState((s) => ({ ...s, status: 'processing' }));
    try {
      r.stop();
    } catch {
      /* ignore */
    }
    // Some browsers never fire `end`; don't leave the farmer waiting.
    watchdog.current = setTimeout(() => {
      if (settled.current) return;
      settled.current = true;
      setState((s) => (s.text ? { status: 'done', text: s.text } : { status: 'error', error: 'no-speech', text: '' }));
    }, 5000);
  }, []);

  const reset = useCallback(() => {
    teardown();
    setState(initial());
  }, [teardown]);

  return { state, start, stop, reset, supported: !!getRecognition() };
}
