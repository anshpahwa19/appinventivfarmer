import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useTransform } from 'framer-motion';
import { Bell, BellRing, CalendarCheck, ChevronRight, ClipboardList, Lock, Mic, Package, Phone, ShieldAlert } from 'lucide-react';
import type { SceneSpec, SceneTime } from '@/types';
import { Scene } from '@/components/media/Scene';
import { IconButton } from '@/components/ui/IconButton';
import { Avatar, SectionHeader } from '@/components/ui/Misc';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { AddLandCard, EventCard, FeatureCard, LandCard, MediaRow } from '@/components/content/Cards';
import { Screen, useScreenScroll } from '@/components/layout/Screen';
import { LanguageButton, LanguagePicker } from '@/components/home/LanguageSwitch';
import { VoicePanel } from '@/components/home/VoicePanel';
import { WhatsAppIcon, didiWhatsAppUrl } from '@/components/home/WhatsApp';
import { useHomeData } from '@/components/home/useHomeData';
import { useUI, KD_CONTACT } from '@/app/providers';
import { useStore } from '@/services/store';
import { eventStatus } from '@/data/events';
import { KISANI_DIDI } from '@/data/people';
import { PROFILE_PHOTO } from '@/data/profilePhoto';
import { formatDate } from '@/lib/format';
import { dayPart, useHomeT, type HomeT, type QuickKey, type VoiceIntent } from '@/i18n/home';
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
    <motion.div variants={rise} className={s.section} role={label ? 'region' : undefined} aria-label={label}>
      {children}
    </motion.div>
  );
}

function HomeHero({ scene, name, firstName, verified, unread, t, locale, offline, onLang }: { scene: SceneSpec; name: string; firstName: string; verified: boolean; unread: number; t: HomeT; locale: string; offline: boolean; onLang: () => void }) {
  const scrollY = useScreenScroll();
  const y = useTransform(scrollY, [0, 300], [0, 120]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.12]);
  const textY = useTransform(scrollY, [0, 160], [0, -24]);
  const textOpacity = useTransform(scrollY, [0, 140], [1, 0]);
  const date = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', numberingSystem: 'latn' } as Intl.DateTimeFormatOptions).format(new Date());
    } catch {
      return formatDate(new Date(), 'long').replace(/ \d{4}$/, '');
    }
  }, [locale]);
  return (
    <div className={s.hero}>
      <motion.div className={s.heroScene} style={{ y, scale }}>
        <Scene scene={scene} aspect="wide" detail="high" drift style={{ position: 'absolute', inset: 0 }} />
      </motion.div>
      <div className={s.heroScrim} aria-hidden />
      <motion.div className={`${s.heroTop} ${offline ? s.heroTopOffline : ''}`} style={{ y: textY, opacity: textOpacity }}>
        <Link to="/account" className={s.me} aria-label={t.account}>
          <Avatar name={name} size={44} verified={verified} src={PROFILE_PHOTO} />
        </Link>
        <span className={s.heroSpacer} />
        <LanguageButton t={t} variant="pill" onOpen={onLang} />
        <IconButton label={t.notifications} variant="onImage" badge={unread} to="/notifications">
          <Bell />
        </IconButton>
      </motion.div>
      <motion.div className={s.hello} style={{ y: textY, opacity: textOpacity }}>
        <span className={s.helloDate}>{date}</span>
        <h1 className={s.helloName}>{t.greeting(dayPart(), firstName)}</h1>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const t = useHomeT();
  const { openContact, requireVerified } = useUI();
  const profile = useStore((st) => st.profile);
  const d = useHomeData();
  const { verified, unread, weather, lands, content } = d;
  const [weatherOpen, setWeatherOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const firstName = profile.name.split(' ')[0];
  const rainy = !!weather.data && weather.data.current.code >= 51;
  const scene = useMemo(() => heroScene(rainy), [rainy]);
  const live = !!d.nextEvent && eventStatus(d.nextEvent) === 'live';

  const news = (content.data ?? []).filter((c) => c.kind === 'news');
  const lead = news.find((n) => n.featured) ?? news[0];

  const go = (to: string, needsVerified = false, reason = t.verifyReasonOrder) => {
    if (needsVerified && !verified) requireVerified(reason, () => navigate(to));
    else navigate(to);
  };

  const recordsTo = d.activeCycle ? `/forms/${d.activeCycle.id}` : '/forms';
  const quick: { key: QuickKey; icon: ReactNode; hint: string; onTap: () => void; locked?: boolean; badge?: number; tone: string }[] = [
    {
      key: 'records',
      icon: <ClipboardList />,
      hint: d.cycle ? t.quickHint.records(d.cycle.done, d.cycle.total) : d.forms.status === 'loading' ? '…' : d.forms.status === 'error' ? t.quickHint.unknown : t.quickHint.noRecords,
      onTap: () => navigate(recordsTo),
      tone: s.qLeaf,
    },
    {
      key: 'order',
      icon: verified ? <Package /> : <Lock />,
      hint: !verified ? t.quickHint.verify : d.orders.status === 'loading' ? '…' : d.orders.status === 'error' ? t.quickHint.unknown : d.pendingOrders ? t.quickHint.pending(d.pendingOrders) : t.quickHint.upToDate,
      onTap: () => go('/orders/fom/new', true, t.verifyReasonOrder),
      locked: !verified,
      tone: s.qSoil,
    },
    {
      key: 'bookings',
      icon: verified ? <CalendarCheck /> : <Lock />,
      hint: !verified ? t.quickHint.verify : d.bookings.status === 'loading' ? '…' : d.bookings.status === 'error' ? t.quickHint.unknown : d.pendingBookings ? t.quickHint.pending(d.pendingBookings) : t.quickHint.upToDate,
      onTap: () => go('/orders?tab=bookings', true, t.verifyReasonBooking),
      locked: !verified,
      tone: s.qSky,
    },
    {
      key: 'updates',
      icon: <BellRing />,
      hint: unread ? t.quickHint.unread(unread) : t.quickHint.noUpdates,
      onTap: () => navigate('/notifications'),
      badge: unread,
      tone: s.qSun,
    },
  ];

  /** Close the voice sheet first, then open the next layer once it has animated away. */
  const afterVoice = (fn: () => void) => {
    setVoiceOpen(false);
    setTimeout(fn, 280);
  };
  const onIntent = (intent: VoiceIntent) =>
    afterVoice(() => {
      if (intent === 'weather') setWeatherOpen(true);
      else if (intent === 'records') navigate(recordsTo);
      else if (intent === 'order') go('/orders/fom/new', true, t.verifyReasonOrder);
      else if (intent === 'bookings') go('/orders?tab=bookings', true, t.verifyReasonBooking);
      else if (intent === 'fields') navigate('/lands');
      else navigate('/notifications');
    });

  const acres = (lands.data ?? []).reduce((a, l) => a + l.areaAcres, 0);

  return (
    <Screen noHeader tabRoot heroTone="light" heroHeight={250}>
      <div className={`${s.tokens} ${s.home}`} lang={t.contentLang}>
        <HomeHero scene={scene} name={profile.name} firstName={firstName} verified={verified} unread={unread} t={t} locale={t.locale} offline={d.offline} onLang={() => setLangOpen(true)} />

        <motion.div className={s.body} variants={stagger} initial="hidden" animate="show">
          <motion.div variants={rise} className={s.weatherWrap}>
            <WeatherCard weather={weather.data} loading={weather.status === 'loading'} onOpen={() => setWeatherOpen(true)} t={t} />
          </motion.div>

          {!verified && (
            <Section label={t.verifyTitle}>
              <div className={s.verify}>
                <ShieldAlert aria-hidden className={s.verifyIcon} />
                <div className={s.verifyText}>
                  <strong>{t.verifyTitle}</strong>
                  <span>{t.verifyBody}</span>
                  <div className={s.verifyActions}>
                    <Button size="sm" onClick={() => navigate('/account/verify')}>
                      {t.verifyNow}
                    </Button>
                    <Button size="sm" variant="ghost" icon={<Phone aria-hidden />} onClick={() => openContact(KD_CONTACT)}>
                      {t.askDidi}
                    </Button>
                  </div>
                </div>
              </div>
            </Section>
          )}

          <Section>
            <h2 className={`${s.secTitle} ${s.secPad}`} id="quick-h">
              {t.quickTitle}
            </h2>
            <nav className={s.quick} aria-labelledby="quick-h">
              {quick.map((q) => (
                <motion.button key={q.key} type="button" whileTap={{ scale: 0.95 }} className={`${s.qTile} ${q.tone}`} onClick={q.onTap} aria-label={`${t.quick[q.key]}, ${q.hint}`}>
                  <span className={s.qIcon} aria-hidden>
                    {q.icon}
                    {!!q.badge && <span className={s.qBadge}>{q.badge > 9 ? '9+' : q.badge}</span>}
                  </span>
                  <span className={s.qLabel} aria-hidden>
                    {t.quick[q.key]}
                  </span>
                  <span className={`${s.qStat} ${q.locked ? s.qLocked : ''}`} aria-hidden>
                    {q.hint}
                  </span>
                </motion.button>
              ))}
            </nav>
          </Section>

          <Section label={t.didiRole}>
            <div className={s.kd}>
              <div className={s.kdHead}>
                <Avatar name={KISANI_DIDI.name} size={52} />
                <div className={s.kdText}>
                  <span className={s.kdRole}>{t.didiRole}</span>
                  <strong className={s.kdName}>{KISANI_DIDI.name}</strong>
                  <span className={s.kdArea}>
                    {KISANI_DIDI.area} · {t.didiSpeaks(t.didiLangs(KISANI_DIDI.languages))}
                  </span>
                </div>
              </div>
              <motion.button type="button" whileTap={{ scale: 0.97 }} className={s.askDidi} onClick={() => setVoiceOpen(true)} aria-haspopup="dialog">
                <span className={s.askMic} aria-hidden>
                  <Mic />
                </span>
                <span className={s.askText}>
                  <strong>{t.askDidi}</strong>
                  <span>{t.askDidiHint}</span>
                </span>
                <ChevronRight aria-hidden className={s.askChevron} />
              </motion.button>
              <div className={s.kdActions}>
                <Button variant="tonal" icon={<Phone aria-hidden />} onClick={() => openContact(KD_CONTACT)}>
                  {t.call}
                </Button>
                <Button variant="tonal" icon={<WhatsAppIcon />} href={didiWhatsAppUrl(t.voice.messagePrefix.trim())}>
                  WhatsApp
                </Button>
              </div>
            </div>
          </Section>

          {(d.events.status === 'loading' || d.nextEvent) && (
            <Section label={live ? t.happeningNow : t.nextEvent}>
              <SectionHeader title={live ? t.happeningNow : t.nextEvent} to="/events" action={t.allEvents} />
              <div className="gutter" style={{ marginTop: 12 }}>
                {d.nextEvent ? <EventCard event={d.nextEvent} featured /> : <Skeleton h={300} r={28} />}
              </div>
            </Section>
          )}

          <Section label={t.myFields}>
            <SectionHeader title={t.myFields} subtitle={lands.data ? t.fieldsSummary(lands.data.length, acres) : undefined} to="/lands" action={t.seeAll} />
            <div className="hscroll" style={{ marginTop: 12 }}>
              {lands.status === 'loading' && [0, 1].map((i) => <Skeleton key={i} w={236} h={250} r={28} />)}
              {lands.data?.map((l) => <LandCard key={l.id} land={l} />)}
              {lands.status !== 'loading' && <AddLandCard />}
            </div>
          </Section>

          {(content.status === 'loading' || lead) && (
            <Section label={t.latestNews}>
              <SectionHeader title={t.latestNews} to="/learn?tab=news" action={t.seeAll} />
              <div className="gutter stack" style={{ marginTop: 12, ['--gap' as string]: '16px' }} lang="en">
                {content.status === 'loading' ? (
                  <Skeleton h={380} r={28} />
                ) : (
                  <>
                    {lead && <FeatureCard item={lead} eyebrow={t.topStory} />}
                    {news
                      .filter((n) => n.id !== lead?.id)
                      .slice(0, 1)
                      .map((n) => (
                        <MediaRow key={n.id} item={n} />
                      ))}
                  </>
                )}
              </div>
            </Section>
          )}

          <div className="gutter">
            <Button variant="secondary" block iconRight={<ChevronRight aria-hidden />} to="/learn">
              {t.browseLearn}
            </Button>
            {t.reviewNote && <p className={s.reviewNote}>{t.reviewNote}</p>}
          </div>
        </motion.div>
      </div>

      <WeatherSheet open={weatherOpen} onClose={() => setWeatherOpen(false)} weather={weather.data} onRetry={weather.refetch} t={t} tokens={s.tokens} />

      <Sheet open={langOpen} onClose={() => setLangOpen(false)} title={t.languagePicker.title} description={t.contentLang === 'en' ? undefined : 'Choose your language'}>
        <div className={`${s.tokens} ${s.home}`} lang={t.contentLang}>
          <LanguagePicker t={t} variant="cards" onDone={() => setLangOpen(false)} />
        </div>
      </Sheet>

      <Sheet open={voiceOpen} onClose={() => setVoiceOpen(false)} title={t.voice.title}>
        <div className={s.tokens} lang={t.contentLang}>
          <VoicePanel
            t={t}
            open={voiceOpen}
            onSend={(text) => afterVoice(() => openContact({ ...KD_CONTACT, message: t.voice.messagePrefix + text }))}
            onCall={() => afterVoice(() => openContact(KD_CONTACT))}
            onMessage={() => afterVoice(() => openContact(KD_CONTACT))}
            onIntent={onIntent}
          />
        </div>
      </Sheet>
    </Screen>
  );
}
