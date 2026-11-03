import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useTransform } from 'framer-motion';
import { Bell, BookOpen, CalendarDays, ClipboardList, Lock, MessageCircle, Package, Phone, ShieldAlert, ChevronRight } from 'lucide-react';
import type { SceneSpec, SceneTime } from '@/types';
import { Scene } from '@/components/media/Scene';
import { IconButton } from '@/components/ui/IconButton';
import { Avatar, SectionHeader } from '@/components/ui/Misc';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { AddLandCard, CompactCard, EventCard, FeatureCard, LandCard, MediaRow, OrderCard } from '@/components/content/Cards';
import { Screen, useScreenScroll } from '@/components/layout/Screen';
import { useUI, KD_CONTACT } from '@/app/providers';
import { api } from '@/services/api';
import { usePrime, useQuery } from '@/services/query';
import { useStore } from '@/services/store';
import { eventStatus } from '@/data/events';
import { cycleProgress } from '@/data/forms';
import { KISANI_DIDI } from '@/data/people';
import { formatDate, formatDayDistance, greeting } from '@/lib/format';
import { WeatherCard, WeatherSheet } from './Weather';
import s from './Home.module.css';

function heroScene(rainy: boolean, now = new Date()): SceneSpec {
  if (rainy) return { kind: 'monsoon', seed: 4, time: 'overcast' };
  const h = now.getHours() + now.getMinutes() / 60;
  const time: SceneTime = h < 7 ? 'dawn' : h < 11 ? 'morning' : h < 16 ? 'day' : h < 18.5 ? 'golden' : 'dusk';
  return { kind: 'paddy', seed: 31, time };
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};
const rise = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
};

function Section({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <motion.section variants={rise} className={s.section} aria-label={label}>
      {children}
    </motion.section>
  );
}

function HomeHero({ scene, name, firstName, verified, unread }: { scene: SceneSpec; name: string; firstName: string; verified: boolean; unread: number }) {
  const scrollY = useScreenScroll();
  const y = useTransform(scrollY, [0, 300], [0, 120]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.12]);
  const textY = useTransform(scrollY, [0, 160], [0, -24]);
  const textOpacity = useTransform(scrollY, [0, 140], [1, 0]);
  return (
    <div className={s.hero}>
      <motion.div className={s.heroScene} style={{ y, scale }}>
        <Scene scene={scene} aspect="wide" detail="high" drift style={{ position: 'absolute', inset: 0 }} />
      </motion.div>
      <div className={s.heroScrim} aria-hidden />
      <motion.div className={s.heroTop} style={{ y: textY, opacity: textOpacity }}>
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}>
          <Link to="/account" className={s.me} aria-label="Account">
            <Avatar name={name} size={44} verified={verified} />
          </Link>
        </motion.div>
        <motion.div className={s.hello} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}>
          <span className={s.helloDate}>{formatDate(new Date(), 'long').replace(/ \d{4}$/, '')}</span>
          <h1 className={s.helloName}>
            {greeting()}, {firstName}
          </h1>
        </motion.div>
        <motion.div initial={{ rotate: -20, opacity: 0 }} animate={{ rotate: [0, -14, 12, -8, 4, 0], opacity: 1 }} transition={{ duration: 1.1, delay: 0.5 }}>
          <IconButton label="Notifications" variant="onImage" badge={unread} to="/notifications">
            <Bell />
          </IconButton>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { openContact, requireVerified } = useUI();
  const profile = useStore((st) => st.profile);
  const verified = useStore((st) => st.session.verified);
  const unread = useStore((st) => st.unreadNotifications.length);
  const [weatherOpen, setWeatherOpen] = useState(false);

  const weather = useQuery('weather', () => api.getWeather());
  const events = useQuery('events', () => api.listEvents());
  const lands = useQuery('lands', () => api.listLands());
  const content = useQuery('content:all', () => api.listContent());
  const orders = useQuery('orders:all', () => api.listOrders(), { enabled: verified });
  const forms = useQuery('forms', () => api.listForms());
  usePrime('content-item:', content.data);
  usePrime('event:', events.data);
  usePrime('order:', orders.data);
  usePrime('form:', forms.data);

  const firstName = profile.name.split(' ')[0];
  const rainy = !!weather.data && weather.data.current.code >= 51;
  const scene = useMemo(() => heroScene(rainy), [rainy]);

  const liveOrNext = useMemo(() => {
    const list = events.data ?? [];
    return list.find((e) => eventStatus(e) === 'live') ?? list.find((e) => eventStatus(e) === 'upcoming');
  }, [events.data]);

  const news = (content.data ?? []).filter((c) => c.kind === 'news');
  const videos = (content.data ?? []).filter((c) => c.kind === 'video');
  const articles = (content.data ?? []).filter((c) => c.kind === 'article');
  const lead = news.find((n) => n.featured) ?? news[0];
  const pendingOrders = (orders.data ?? []).filter((o) => o.status === 'pending').length;
  const activeCycle = (forms.data ?? []).find((f) => !cycleProgress(f).complete) ?? forms.data?.[0];
  const cycle = activeCycle ? cycleProgress(activeCycle) : undefined;

  const quick = [
    {
      to: '/orders',
      icon: verified ? <Package /> : <Lock />,
      label: 'My orders',
      stat: !verified ? 'Verify to order' : orders.status === 'loading' ? '…' : pendingOrders ? `${pendingOrders} awaiting approval` : 'All up to date',
      tone: s.qSage,
    },
    { to: activeCycle ? `/forms/${activeCycle.id}` : '/forms', icon: <ClipboardList />, label: 'My forms', stat: cycle ? `${cycle.done} of ${cycle.total} steps done` : forms.status === 'loading' ? '…' : 'No records yet', tone: s.qSun },
    { to: '/learn', icon: <BookOpen />, label: 'Learn', stat: content.data ? `${news.length} news · ${videos.length} videos` : '…', tone: s.qEarth },
    {
      to: '/events',
      icon: <CalendarDays />,
      label: 'Events',
      stat: liveOrNext ? (eventStatus(liveOrNext) === 'live' ? 'Live now' : `Next: ${formatDayDistance(liveOrNext.start)}`) : events.status === 'loading' ? '…' : 'Nothing planned',
      tone: s.qSky,
      live: liveOrNext && eventStatus(liveOrNext) === 'live',
    },
  ];

  return (
    <Screen noHeader tabRoot heroTone="light" heroHeight={250}>
      <HomeHero scene={scene} name={profile.name} firstName={firstName} verified={verified} unread={unread} />

      <motion.div className={s.body} variants={stagger} initial="hidden" animate="show">
        <motion.div variants={rise} className={s.weatherWrap}>
          <WeatherCard weather={weather.data} loading={weather.status === 'loading'} onOpen={() => setWeatherOpen(true)} />
        </motion.div>

        {!verified && (
          <Section label="Verification">
            <div className={s.verify}>
              <ShieldAlert aria-hidden className={s.verifyIcon} />
              <div className={s.verifyText}>
                <strong>Verification pending</strong>
                <span>Ordering FOM and bookings unlock once your number is verified.</span>
                <div className={s.verifyActions}>
                  <Button size="sm" onClick={() => navigate('/account/verify')}>
                    Verify now
                  </Button>
                  <Button size="sm" variant="ghost" icon={<Phone aria-hidden />} onClick={() => openContact(KD_CONTACT)}>
                    Ask Kisani Didi
                  </Button>
                </div>
              </div>
            </div>
          </Section>
        )}

        <Section label="Quick actions">
          <div className={s.quick}>
            {quick.map((q) => (
              <motion.div key={q.label} whileTap={{ scale: 0.97 }}>
                <Link
                  to={q.to}
                  className={`${s.qTile} ${q.tone}`}
                  onClick={(e) => {
                    if (q.to === '/orders' && !verified) {
                      e.preventDefault();
                      requireVerified('Orders need a verified mobile number', () => navigate('/orders'));
                    }
                  }}
                >
                  <motion.span className={s.qIcon} aria-hidden initial={{ scale: 0.4, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.25 }}>
                    {q.icon}
                  </motion.span>
                  <span className={s.qLabel}>{q.label}</span>
                  <span className={`${s.qStat} ${q.live ? s.qLive : ''}`}>{q.stat}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </Section>

        <Section label="Your Kisani Didi">
          <div className={s.kd}>
            <div className={s.kdHead}>
              <Avatar name={KISANI_DIDI.name} size={52} />
              <div className={s.kdText}>
                <span className={s.kdRole}>Your Kisani Didi</span>
                <strong className={s.kdName}>{KISANI_DIDI.name}</strong>
                <span className={s.kdArea}>
                  {KISANI_DIDI.area} · {KISANI_DIDI.languages.join(', ')}
                </span>
              </div>
            </div>
            <div className={s.kdActions}>
              <Button variant="tonal" icon={<Phone aria-hidden />} onClick={() => openContact(KD_CONTACT)}>
                Call
              </Button>
              <Button variant="tonal" icon={<MessageCircle aria-hidden />} onClick={() => openContact(KD_CONTACT)}>
                WhatsApp
              </Button>
            </div>
          </div>
        </Section>

        {(events.status === 'loading' || liveOrNext) && (
          <Section label="Events">
            <SectionHeader title={liveOrNext && eventStatus(liveOrNext) === 'live' ? 'Happening now' : 'Next event'} to="/events" action="All events" />
            <div className="gutter" style={{ marginTop: 12 }}>
              {liveOrNext ? <EventCard event={liveOrNext} featured /> : <Skeleton h={300} r={28} />}
            </div>
          </Section>
        )}

        <Section label="My fields">
          <SectionHeader title="My fields" subtitle={lands.data ? `${lands.data.length} registered · ${lands.data.reduce((a, l) => a + l.areaAcres, 0)} acres` : undefined} to="/lands" />
          <div className="hscroll" style={{ marginTop: 12 }}>
            {lands.status === 'loading' && [0, 1].map((i) => <Skeleton key={i} w={236} h={250} r={28} />)}
            {lands.data?.map((l) => <LandCard key={l.id} land={l} />)}
            {lands.status !== 'loading' && <AddLandCard />}
          </div>
        </Section>

        {verified && orders.data && orders.data.length > 0 && (
          <Section label="Recent order">
            <SectionHeader title="Latest FOM order" to="/orders" action="All orders" />
            <div className="gutter" style={{ marginTop: 12 }}>
              <OrderCard order={orders.data[0]} />
            </div>
          </Section>
        )}

        <Section label="Latest news">
          <SectionHeader title="Latest news" to="/learn?tab=news" />
          <div className="gutter stack" style={{ marginTop: 12, ['--gap' as string]: '16px' }}>
            {content.status === 'loading' ? (
              <Skeleton h={380} r={28} />
            ) : (
              <>
                {lead && <FeatureCard item={lead} eyebrow="Top story" />}
                {news
                  .filter((n) => n.id !== lead?.id)
                  .slice(0, 2)
                  .map((n) => (
                    <MediaRow key={n.id} item={n} />
                  ))}
              </>
            )}
          </div>
        </Section>

        {videos.length > 0 && (
          <Section label="Videos">
            <SectionHeader title="Watch and learn" to="/learn?tab=videos" />
            <div className="hscroll" style={{ marginTop: 12 }}>
              {videos.slice(0, 5).map((v) => (
                <CompactCard key={v.id} item={v} />
              ))}
            </div>
          </Section>
        )}

        {articles.length > 0 && (
          <Section label="Articles">
            <SectionHeader title="Guides for this season" to="/learn?tab=articles" />
            <div className="hscroll" style={{ marginTop: 12 }}>
              {articles.slice(0, 5).map((a) => (
                <CompactCard key={a.id} item={a} tall />
              ))}
            </div>
          </Section>
        )}

        <div className="gutter">
          <Button variant="secondary" block iconRight={<ChevronRight aria-hidden />} to="/learn">
            Browse everything in Learn
          </Button>
        </div>
      </motion.div>

      <WeatherSheet open={weatherOpen} onClose={() => setWeatherOpen(false)} weather={weather.data} onRetry={weather.refetch} />
    </Screen>
  );
}
