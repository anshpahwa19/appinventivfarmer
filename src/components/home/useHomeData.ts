import { useMemo } from 'react';
import { api, isOffline } from '@/services/api';
import { usePrime, useQuery } from '@/services/query';
import { useStore } from '@/services/store';
import { eventStatus } from '@/data/events';
import { cycleProgress } from '@/data/forms';
import { deriveAlerts } from '@/lib/alerts';

/**
 * Data for both Home screens. Same query keys as the rest of the app, so the
 * cache is shared with Orders, Forms, Lands and Events.
 */
export function useHomeData() {
  const verified = useStore((st) => st.session.verified);
  const unread = useStore((st) => st.unreadNotifications.length);
  const network = useStore((st) => st.demo.network);

  const weather = useQuery('weather', () => api.getWeather());
  const events = useQuery('events', () => api.listEvents());
  const lands = useQuery('lands', () => api.listLands());
  const content = useQuery('content:all', () => api.listContent());
  const orders = useQuery('orders:all', () => api.listOrders(), { enabled: verified });
  const bookings = useQuery('bookings:all', () => api.listBookings(), { enabled: verified });
  const forms = useQuery('forms', () => api.listForms());
  usePrime('content-item:', content.data);
  usePrime('event:', events.data);
  usePrime('order:', orders.data);
  usePrime('booking:', bookings.data);
  usePrime('form:', forms.data);

  const alerts = useMemo(
    () => deriveAlerts({ weather: weather.data, lands: lands.data, forms: forms.data, bookings: bookings.data, orders: orders.data, events: events.data }),
    [weather.data, lands.data, forms.data, bookings.data, orders.data, events.data],
  );

  const recordQueries = [lands, forms, events, ...(verified ? [orders, bookings] : [])];
  const alertsLoading = weather.status === 'loading' || recordQueries.some((q) => q.status === 'loading' && !q.data);
  const recordsFailed = recordQueries.some((q) => q.status === 'error');
  const offline = network === 'offline' || isOffline();

  const nextEvent = useMemo(() => {
    const list = events.data ?? [];
    return list.find((e) => eventStatus(e) === 'live') ?? list.find((e) => eventStatus(e) === 'upcoming');
  }, [events.data]);

  const activeCycle = (forms.data ?? []).find((f) => !cycleProgress(f).complete) ?? forms.data?.[0];
  const cycle = activeCycle ? cycleProgress(activeCycle) : undefined;
  const pendingOrders = (orders.data ?? []).filter((o) => o.status === 'pending').length;
  const pendingBookings = (bookings.data ?? []).filter((b) => b.status === 'pending').length;

  const retryRecords = () => recordQueries.forEach((q) => q.status === 'error' && q.refetch());

  return {
    verified,
    unread,
    offline,
    weather,
    events,
    lands,
    content,
    orders,
    bookings,
    forms,
    alerts,
    alertsLoading,
    recordsFailed,
    retryRecords,
    nextEvent,
    activeCycle,
    cycle,
    pendingOrders,
    pendingBookings,
  };
}
