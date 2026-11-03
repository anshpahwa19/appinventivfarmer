import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, apiError } from './api';

/**
 * Tiny stale-while-revalidate cache. Screens show cached data at once on
 * revisit (no skeleton flash) and refresh in the background. Mutations call
 * `invalidate(prefix)` so lists update.
 */
interface Entry {
  data: unknown;
  updatedAt: number;
}

const cache = new Map<string, Entry>();
const subscribers = new Map<string, Set<() => void>>();
const STALE_MS = 30_000;

export function invalidate(prefix: string): void {
  for (const key of [...cache.keys()]) if (key.startsWith(prefix)) cache.get(key)!.updatedAt = 0;
  for (const [key, subs] of subscribers) if (key.startsWith(prefix)) subs.forEach((fn) => fn());
}

export function clearQueryCache(): void {
  cache.clear();
  for (const subs of subscribers.values()) subs.forEach((fn) => fn());
}

/** Seed detail entries from list data so detail screens open without a loading state. */
export function prime<T extends { id: string }>(prefix: string, items: T[] | undefined): void {
  if (!items) return;
  const now = Date.now();
  for (const item of items) {
    const key = `${prefix}${item.id}`;
    if (!cache.has(key)) cache.set(key, { data: item, updatedAt: now });
  }
}

export function usePrime<T extends { id: string }>(prefix: string, items: T[] | undefined): void {
  useEffect(() => prime(prefix, items), [prefix, items]);
}

export function peek<T>(key: string): T | undefined {
  return cache.get(key)?.data as T | undefined;
}

type Status = 'loading' | 'success' | 'error';

export interface QueryResult<T> {
  data: T | undefined;
  error: ApiError | undefined;
  status: Status;
  isRefreshing: boolean;
  refetch: () => void;
}

interface QState<T> {
  key: string;
  data: T | undefined;
  error: ApiError | undefined;
  status: Status;
  isRefreshing: boolean;
}

function fromCache<T>(key: string): QState<T> {
  const hit = cache.get(key);
  return hit
    ? { key, data: hit.data as T, error: undefined, status: 'success', isRefreshing: false }
    : { key, data: undefined, error: undefined, status: 'loading', isRefreshing: false };
}

export function useQuery<T>(key: string, fetcher: () => Promise<T>, options: { enabled?: boolean } = {}): QueryResult<T> {
  const enabled = options.enabled ?? true;
  const [state, setState] = useState<QState<T>>(() => fromCache<T>(key));
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const runId = useRef(0);

  // Reset synchronously when the key changes (e.g. a filter), so stale data never shows under new filters.
  let current = state;
  if (state.key !== key) {
    current = fromCache<T>(key);
    setState(current);
  }

  const run = useCallback(
    async (silent: boolean) => {
      const id = ++runId.current;
      setState((s) => (s.key !== key ? s : silent && s.data !== undefined ? { ...s, isRefreshing: true } : { ...s, status: s.data === undefined ? 'loading' : s.status, error: undefined, isRefreshing: s.data !== undefined }));
      try {
        const data = await fetcherRef.current();
        cache.set(key, { data, updatedAt: Date.now() });
        if (id === runId.current) setState({ key, data, error: undefined, status: 'success', isRefreshing: false });
      } catch (e) {
        const err = e instanceof ApiError ? e : apiError('server');
        if (id === runId.current)
          setState((s) => (s.data !== undefined ? { ...s, error: err, isRefreshing: false } : { key, data: undefined, error: err, status: 'error', isRefreshing: false }));
      }
    },
    [key],
  );

  useEffect(() => {
    if (!enabled) return;
    const hit = cache.get(key);
    if (!hit) run(false);
    else if (Date.now() - hit.updatedAt > STALE_MS) run(true);
  }, [key, enabled, run]);

  useEffect(() => {
    let set = subscribers.get(key);
    if (!set) subscribers.set(key, (set = new Set()));
    const fn = () => run(true);
    set.add(fn);
    return () => {
      set!.delete(fn);
    };
  }, [key, run]);

  const refetch = useCallback(() => run(false), [run]);
  return { data: current.data, error: current.error, status: current.status, isRefreshing: current.isRefreshing, refetch };
}

/** For writes: tracks pending/error and returns the result. */
export function useMutation<A extends unknown[], R>(fn: (...args: A) => Promise<R>) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ApiError | undefined>();
  const mutate = useCallback(
    async (...args: A): Promise<R | undefined> => {
      setPending(true);
      setError(undefined);
      try {
        return await fn(...args);
      } catch (e) {
        setError(e instanceof ApiError ? e : apiError('server'));
        return undefined;
      } finally {
        setPending(false);
      }
    },
    [fn],
  );
  return { mutate, pending, error, reset: () => setError(undefined) };
}
