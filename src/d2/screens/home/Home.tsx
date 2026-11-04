import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useTransform } from 'framer-motion';
import { ArrowUpRight, Bell, MessageCircle, Phone, Search, ShieldAlert } from 'lucide-react';
import { useStore } from '@/services/store';
import { api } from '@/services/api';
import { usePrime, useQuery } from '@/services/query';
import { eventStatus } from '@/data/events';
import { cycleProgress } from '@/data/forms';
import { KISANI_DIDI } from '@/data/people';
import { formatDate, formatDayDistance, greeting } from '@/lib/format';
import markUrl from '@/assets/brand/kisani-urjaa-mark.webp';
import { Screen, useScreenScroll } from '../../layout/Screen';
import { Photo } from '../../photo/Photo';
import { RevealText, InView } from '../../motion/Reveal';
import { Button, IconButton } from '../../ui/Button';
import { Segments, SectionHead, Skel } from '../../ui/Blocks';
import { CoverStory, EventPoster, FieldTile, GuideCard, IndexStory, OrderTicket, StoryRow, VideoTile } from '../../content/Cards';
import { KD_CONTACT, useUI } from '../../providers';
import { useNav } from '../../nav';
import { to } from '../../paths';
import { WeatherPanel, WeatherSheet } from './Weather';
import s from './Home.module.css';

/** Hero photograph follows the time of day (and the rain). */
function heroSlot(rainy: boolean, now = new Date()) {
  if (rainy) return 'monsoon-sky';
  const h = now.getHours();
  if (h < 8) return 'dawn-field';
  if (h < 15) return 'paddy-field';
  return 'wheat-field';
}

function Hero({ slot, firstName, unread, verified, name }: { slot: string; firstName: string; unread: number; verified: boolean; name: string }) {
  const scrollY = useScreenScroll();
  const y = useTransform(scrollY, [0, 420], [0, 140]);
  const textY = useTransform(scrollY, [0, 260], [0, -40]);
  const fade = useTransform(scrollY, [0, 220], [1, 0]);
  const profile = useStore((st) => st.profile);
  return (
    <header className={s.hero}>
      <motion.div className={s.heroMedia} style={{ y }}>
        <Photo id={slot} ratio="fill" shade="full" drift priority label="hero" />
      </motion.div>
      <div className={s.heroTop}>
        <Link to={to('/account/about')} className={s.brand} aria-label="About Kisani Urjaa">
          <img src={markUrl} alt="" />
        </Link>
        <div className={s.heroActions}>
          <IconButton label="Search" variant="glass" to="/search">
            <Search />
          </IconButton>
          <IconButton label="Notifications" variant="glass" to="/notifications" badge={unread}>
            <Bell />
          </IconButton>
          <Link to={to('/account')} className={s.me} aria-label={`Me: ${name}${verified ? ', verified' : ''}`}>
            {name
              .split(' ')
              .slice(0, 2)
              .map((p) => p[0])
              .join('')}
          </Link>
        </div>
      </div>
      <motion.div className={s.heroText} style={{ y: textY, opacity: fade }}>
        <p className={s.dateline}>
          <span>Today</span> {formatDate(new Date(), 'weekday')} · {profile.village}
        </p>
        <RevealText text={`${greeting()}, ${firstName}`} className={s.hello} delay={0.25} />
      </motion.div>
    </header>
  );
}

export default function Home() {
  const nav = useNav();
  const { openContact, requireVerified } = useUI();
  const profile = useStore((st) => st.profile);
  const verified = useStore((st) => st.session.verified);
  const unread = useStore((st) => st.unreadNotifications.length);
  const [wxOpen, setWxOpen] = useState(false);

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
  const slot = useMemo(() => heroSlot(rainy), [rainy]);

  const next = useMemo(() => {
    const list = events.data ?? [];
    return list.find((e) => eventStatus(e) === 'live') ?? list.find((e) => eventStatus(e) === 'upcoming');
  }, [events.data]);
  const news = (content.data ?? []).filter((c) => c.kind === 'news');
  const videos = (content.data ?? []).filter((c) => c.kind === 'video');
  const guides = (content.data ?? []).filter((c) => c.kind === 'article');
  const lead = news.find((n) => n.featured) ?? news[0];
  const restNews = news.filter((n) => n.id !== lead?.id);
  const pending = (orders.data ?? []).filter((o) => o.status === 'pending').length;
  const cycle = (forms.data ?? []).find((f) => !cycleProgress(f).complete) ?? forms.data?.[0];
  const progress = cycle ? cycleProgress(cycle) : undefined;
  const acres = (lands.data ?? []).reduce((a, l) => a + l.areaAcres, 0);
  const live = next && eventStatus(next) === 'live';

  const glance = [
    {
      key: 'orders',
      title: 'My orders',
      stat: !verified ? 'Verify your number to order' : orders.status === 'loading' ? '…' : pending ? `${pending} awaiting approval` : 'All up to date',
      to: '/orders',
      locked: !verified,
    },
    {
      key: 'forms',
      title: 'Season records',
      stat: progress ? `${cycle!.crop.name} · ${progress.done} of ${progress.total} steps recorded` : forms.status === 'loading' ? '…' : 'No records yet',
      to: cycle ? `/forms/${cycle.id}` : '/forms',
      extra: progress && <Segments done={progress.done} total={progress.total} label={`${progress.done} of ${progress.total} steps recorded`} />,
    },
    {
      key: 'events',
      title: 'Events',
      stat: next ? (live ? 'Live now · join in' : `Next ${formatDayDistance(next.start).toLowerCase()}`) : events.status === 'loading' ? '…' : 'Nothing planned',
      to: '/events',
      live,
    },
    { key: 'fields', title: 'My fields', stat: lands.data ? `${lands.data.length} fields · ${acres} acres` : '…', to: '/lands' },
  ];

  return (
    <Screen title="Today" variant="bare" tabRoot lightTop heroHeight={520}>
      <Hero slot={slot} firstName={firstName} unread={unread} verified={verified} name={profile.name} />

      <div className={s.instrument}>
        <WeatherPanel weather={weather.data} loading={weather.status === 'loading'} onOpen={() => setWxOpen(true)} />
      </div>

      {!verified && (
        <InView className={s.verify}>
          <ShieldAlert aria-hidden className={s.verifyIcon} />
          <div className={s.verifyText}>
            <strong>Verification pending</strong>
            <span>Ordering FOM and booking services unlock once your number is verified.</span>
            <div className={s.verifyActions}>
              <Button size="sm" onClick={() => nav('/account/verify')}>
                Verify now
              </Button>
              <Button size="sm" variant="ghost" icon={<Phone aria-hidden />} onClick={() => openContact(KD_CONTACT)}>
                Ask Kisani Didi
              </Button>
            </div>
          </div>
        </InView>
      )}

      <section className={s.section} aria-labelledby="glance-h">
        <div className={s.glanceHead}>
          <p className={s.sectionKicker}>
            <span>01</span> Your farm
          </p>
          <h2 id="glance-h" className={s.glanceTitle}>
            At a glance
          </h2>
        </div>
        <ol className={s.glance}>
          {glance.map((g, i) => (
            <InView key={g.key} delay={i * 0.06}>
              <li>
                <Link
                  to={to(g.to)}
                  className={`${s.glanceRow} ${g.live ? s.glanceLive : ''}`}
                  onClick={(e) => {
                    if (g.locked) {
                      e.preventDefault();
                      requireVerified('Orders need a verified mobile number', () => nav('/orders'));
                    }
                  }}
                >
                  <span className={s.glanceNum}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={s.glanceBody}>
                    <span className={s.glanceTitleRow}>{g.title}</span>
                    <span className={s.glanceStat}>
                      {g.live && <span className={s.liveDot} aria-hidden />}
                      {g.stat}
                    </span>
                    {g.extra}
                  </span>
                  <ArrowUpRight className={s.glanceArrow} aria-hidden />
                </Link>
              </li>
            </InView>
          ))}
        </ol>
      </section>

      <InView className={s.didi}>
        <Photo id="village-meeting" ratio="3/4" className={s.didiPhoto} alt={`${KISANI_DIDI.name}, your Kisani Didi`} />
        <div className={s.didiPanel}>
          <p className={s.didiKicker}>Your Kisani Didi</p>
          <p className={s.didiName}>{KISANI_DIDI.name}</p>
          <p className={s.didiArea}>
            {KISANI_DIDI.area}
            <br />
            Speaks {KISANI_DIDI.languages.join(' and ')}
          </p>
          <div className={s.didiActions}>
            <Button size="sm" variant="accent" icon={<Phone aria-hidden />} onClick={() => openContact(KD_CONTACT)}>
              Call
            </Button>
            <Button size="sm" variant="glass" icon={<MessageCircle aria-hidden />} onClick={() => openContact(KD_CONTACT)}>
              Message
            </Button>
          </div>
        </div>
      </InView>

      {(events.status === 'loading' || next) && (
        <section className={s.section}>
          <SectionHead index="02" kicker={live ? 'Happening now' : 'Coming up'} title={live ? 'Join the demonstration' : 'Next event'} to="/events" action="All events" />
          <div className={s.gutter}>{next ? <EventPoster event={next} ratio="4/5" /> : <Skel h={420} r="var(--r-xl)" />}</div>
        </section>
      )}

      <section className={s.section} aria-label="News">
        <SectionHead index="03" kicker="The Journal" title="Latest from the field" to="/learn?tab=news" />
        {content.status === 'loading' ? (
          <div className={s.gutter}>
            <Skel h={460} r="var(--r-xl)" />
          </div>
        ) : (
          <>
            {lead && (
              <div className={s.coverWrap}>
                <CoverStory item={lead} />
              </div>
            )}
            <div className={`${s.gutter} ${s.magazine}`}>
              {restNews.slice(0, 2).map((n, i) => (
                <StoryRow key={n.id} item={n} flip={i % 2 === 1} />
              ))}
              {restNews.slice(2, 4).map((n, i) => (
                <IndexStory key={n.id} item={n} index={i + 1} />
              ))}
            </div>
          </>
        )}
      </section>

      {videos.length > 0 && (
        <section className={s.nightBand} aria-label="Videos">
          <SectionHead index="04" kicker="Watch" title="Learn by seeing" to="/learn?tab=videos" night />
          <div className="fj-rail" style={{ ['--gap' as string]: '14px', marginTop: 18, alignItems: 'flex-start' }}>
            {videos.slice(0, 5).map((v, i) => (i % 3 === 0 ? <VideoTile key={v.id} item={v} ratio="9/16" width={176} night /> : <VideoTile key={v.id} item={v} ratio="16/9" width={286} night />))}
          </div>
        </section>
      )}

      <section className={s.section} aria-label="My fields">
        <SectionHead index="05" kicker="Your land" title="My fields" to="/lands" />
        <div className="fj-rail" style={{ marginTop: 16 }}>
          {lands.status === 'loading' && [0, 1].map((i) => <Skel key={i} w={240} h={300} r="var(--r-xl)" />)}
          {lands.data?.map((l) => <FieldTile key={l.id} land={l} />)}
          <Link to={to('/lands/new')} className={s.addField}>
            <span className={s.addPlus}>+</span>
            Add a field
          </Link>
        </div>
      </section>

      {verified && orders.data && orders.data.length > 0 && (
        <section className={s.section} aria-label="Latest order">
          <SectionHead index="06" kicker="Orders" title="Latest FOM order" to="/orders" action="All orders" />
          <div className={s.gutter} style={{ marginTop: 16 }}>
            <OrderTicket order={orders.data[0]} />
          </div>
        </section>
      )}

      {guides.length > 0 && (
        <section className={s.section} aria-label="Guides">
          <SectionHead index={verified ? '07' : '06'} kicker="Guides" title="For this season" to="/learn?tab=articles" />
          <div className="fj-rail" style={{ marginTop: 16, ['--gap' as string]: '16px' }}>
            {guides.slice(0, 5).map((g) => (
              <GuideCard key={g.id} item={g} />
            ))}
          </div>
        </section>
      )}

      <div className={s.gutter}>
        <Link to={to('/learn')} className={s.endLink}>
          <span>
            <span className={s.endKicker}>Keep reading</span>
            Open the full Journal
          </span>
          <ArrowUpRight aria-hidden />
        </Link>
      </div>

      <WeatherSheet open={wxOpen} onClose={() => setWxOpen(false)} weather={weather.data} onRetry={weather.refetch} />
    </Screen>
  );
}
