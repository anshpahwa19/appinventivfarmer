import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useTransform } from 'framer-motion';
import { ArrowUpRight, Bell, BellRing, CalendarCheck, ChevronRight, ClipboardList, Lock, MessageCircle, Mic, Package, Phone, Search, ShieldAlert } from 'lucide-react';
import { useStore } from '@/services/store';
import { eventStatus } from '@/data/events';
import { KISANI_DIDI } from '@/data/people';
import type { HomeAlert } from '@/lib/alerts';
import { dayPart, useHomeT, type QuickKey, type VoiceIntent } from '@/i18n/home';
import { LanguageButton, LanguagePicker } from '@/components/home/LanguageSwitch';
import { VoicePanel } from '@/components/home/VoicePanel';
import { AlertsSection } from '@/components/home/Alerts';
import { useHomeData } from '@/components/home/useHomeData';
import markUrl from '@/assets/brand/kisani-urjaa-mark.webp';
import { Screen, useScreenScroll } from '../../layout/Screen';
import { Photo } from '../../photo/Photo';
import { RevealText, InView } from '../../motion/Reveal';
import { Button, IconButton } from '../../ui/Button';
import { Segments, SectionHead, Skel } from '../../ui/Blocks';
import { Sheet } from '../../ui/Sheet';
import { CoverStory, EventPoster, FieldTile, StoryRow } from '../../content/Cards';
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

function Hero({ slot, greeting, unread, verified, name, village, t, onLang }: { slot: string; greeting: string; unread: number; verified: boolean; name: string; village: string; t: ReturnType<typeof useHomeT>; onLang: () => void }) {
  const scrollY = useScreenScroll();
  const y = useTransform(scrollY, [0, 420], [0, 140]);
  const textY = useTransform(scrollY, [0, 260], [0, -40]);
  const fade = useTransform(scrollY, [0, 220], [1, 0]);
  const date = useMemo(() => new Intl.DateTimeFormat(t.locale, { weekday: 'long', numberingSystem: 'latn' } as Intl.DateTimeFormatOptions).format(new Date()), [t.locale]);
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
          <IconButton label={t.search} variant="glass" to="/search">
            <Search />
          </IconButton>
          <IconButton label={t.notifications} variant="glass" to="/notifications" badge={unread}>
            <Bell />
          </IconButton>
          <Link to={to('/account')} className={s.me} aria-label={`${t.account}: ${name}${verified ? ' ✓' : ''}`}>
            {name
              .split(' ')
              .slice(0, 2)
              .map((p) => p[0])
              .join('')}
          </Link>
        </div>
      </div>
      <motion.div className={s.heroText} style={{ y: textY, opacity: fade }}>
        <LanguageButton t={t} tone="glass" onOpen={onLang} className={s.heroLang} />
        <p className={s.dateline}>
          <span>{t.today}</span> {date} · {village}
        </p>
        <RevealText key={greeting} text={greeting} className={s.hello} delay={0.25} />
      </motion.div>
    </header>
  );
}

export default function Home() {
  const nav = useNav();
  const t = useHomeT();
  const { openContact, requireVerified } = useUI();
  const profile = useStore((st) => st.profile);
  const d = useHomeData();
  const { verified, unread, weather, lands, content } = d;
  const [wxOpen, setWxOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const firstName = profile.name.split(' ')[0];
  const rainy = !!weather.data && weather.data.current.code >= 51;
  const slot = useMemo(() => heroSlot(rainy), [rainy]);
  const next = d.nextEvent;
  const live = !!next && eventStatus(next) === 'live';
  const news = (content.data ?? []).filter((c) => c.kind === 'news');
  const lead = news.find((n) => n.featured) ?? news[0];
  const restNews = news.filter((n) => n.id !== lead?.id);

  const go = (path: string, needsVerified = false, reason = t.verifyReasonOrder) => {
    if (needsVerified && !verified) requireVerified(reason, () => nav(path));
    else nav(path);
  };
  const recordsTo = d.activeCycle ? `/forms/${d.activeCycle.id}` : '/forms';

  const quick: { key: QuickKey; icon: ReactNode; stat: string; onTap: () => void; locked?: boolean; photo: string; extra?: ReactNode; badge?: number }[] = [
    {
      key: 'records',
      icon: <ClipboardList aria-hidden />,
      stat: d.cycle && d.activeCycle ? `${t.crop(d.activeCycle.crop.name)} · ${t.quickHint.records(d.cycle.done, d.cycle.total)}` : d.forms.status === 'loading' ? '…' : d.forms.status === 'error' ? t.quickHint.unknown : t.quickHint.noRecords,
      onTap: () => nav(recordsTo),
      photo: 'cotton-drip',
      extra: d.cycle && <Segments done={d.cycle.done} total={d.cycle.total} label={t.quickHint.records(d.cycle.done, d.cycle.total)} />,
    },
    {
      key: 'order',
      icon: verified ? <Package aria-hidden /> : <Lock aria-hidden />,
      stat: !verified ? t.quickHint.verify : d.orders.status === 'loading' ? '…' : d.orders.status === 'error' ? t.quickHint.unknown : d.pendingOrders ? t.quickHint.pending(d.pendingOrders) : t.quickHint.upToDate,
      onTap: () => go('/orders/fom/new', true, t.verifyReasonOrder),
      locked: !verified,
      photo: 'fom-product',
    },
    {
      key: 'bookings',
      icon: verified ? <CalendarCheck aria-hidden /> : <Lock aria-hidden />,
      stat: !verified ? t.quickHint.verify : d.bookings.status === 'loading' ? '…' : d.bookings.status === 'error' ? t.quickHint.unknown : d.pendingBookings ? t.quickHint.pending(d.pendingBookings) : t.quickHint.upToDate,
      onTap: () => go('/orders?tab=bookings', true, t.verifyReasonBooking),
      locked: !verified,
      photo: 'harvest-baler',
    },
    {
      key: 'updates',
      icon: <BellRing aria-hidden />,
      stat: unread ? t.quickHint.unread(unread) : t.quickHint.noUpdates,
      onTap: () => nav('/notifications'),
      badge: unread,
      photo: 'village-meeting',
    },
  ];

  const onAlert = (a: HomeAlert) => {
    if (a.action.kind === 'forecast') return setWxOpen(true);
    go(a.action.to, a.action.verified, t.verifyReasonBooking);
  };

  const afterVoice = (fn: () => void) => {
    setVoiceOpen(false);
    setTimeout(fn, 300);
  };
  const onIntent = (intent: VoiceIntent) =>
    afterVoice(() => {
      if (intent === 'weather') setWxOpen(true);
      else if (intent === 'records') nav(recordsTo);
      else if (intent === 'order') go('/orders/fom/new', true, t.verifyReasonOrder);
      else if (intent === 'bookings') go('/orders?tab=bookings', true, t.verifyReasonBooking);
      else if (intent === 'fields') nav('/lands');
      else nav('/notifications');
    });

  return (
    <Screen title="Today" variant="bare" tabRoot lightTop heroHeight={520}>
      <div className={`${s.tokens} ${s.home}`} lang={t.lang}>
        <Hero slot={slot} greeting={t.greeting(dayPart(), firstName)} unread={unread} verified={verified} name={profile.name} village={profile.village} t={t} onLang={() => setLangOpen(true)} />

        <div className={s.instrument}>
          <WeatherPanel weather={weather.data} loading={weather.status === 'loading'} onOpen={() => setWxOpen(true)} t={t} />
        </div>

        {!verified && (
          <InView className={s.verify}>
            <ShieldAlert aria-hidden className={s.verifyIcon} />
            <div className={s.verifyText}>
              <strong>{t.verifyTitle}</strong>
              <span>{t.verifyBody}</span>
              <div className={s.verifyActions}>
                <Button size="sm" onClick={() => nav('/account/verify')}>
                  {t.verifyNow}
                </Button>
                <Button size="sm" variant="ghost" icon={<Phone aria-hidden />} onClick={() => openContact(KD_CONTACT)}>
                  {t.askDidi}
                </Button>
              </div>
            </div>
          </InView>
        )}

        <div className={s.section}>
          <AlertsSection
            t={t}
            alerts={d.alerts}
            loading={d.alertsLoading}
            failed={d.recordsFailed}
            offline={d.offline}
            onRetry={d.retryRecords}
            onAction={onAlert}
            s={s}
            skeleton={[0, 1].map((i) => <Skel key={i} h={120} r="var(--r-lg)" />)}
            heading={
              <div>
                <p className={s.sectionKicker}>
                  <span>01</span> {t.alertsKicker}
                </p>
                <h2 id="alerts-h" className={s.glanceTitle}>
                  {t.alertsTitle}
                </h2>
              </div>
            }
          />
        </div>

        <section className={s.section} aria-labelledby="quick-h">
          <div className={s.glanceHead}>
            <p className={s.sectionKicker}>
              <span>02</span> {t.quickTitle}
            </p>
            <h2 id="quick-h" className="sr-only">
              {t.quickTitle}
            </h2>
          </div>
          <ol className={s.glance}>
            {quick.map((q, i) => (
              <li key={q.key}>
                <motion.button type="button" whileTap={{ scale: 0.985 }} className={s.glanceRow} onClick={q.onTap}>
                  <span className={s.glanceNum} aria-hidden>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={s.glanceBody}>
                    <span className={s.glanceTitleRow}>
                      <span className={s.glanceIcon}>{q.icon}</span>
                      {t.quick[q.key]}
                      {!!q.badge && <span className={s.glanceBadge}>{q.badge > 9 ? '9+' : q.badge}</span>}
                    </span>
                    <span className={`${s.glanceStat} ${q.locked ? s.glanceLocked : ''}`}>{q.stat}</span>
                    {q.extra}
                  </span>
                  <Photo id={q.photo} ratio="1/1" className={s.glanceThumb} decorative />
                  <ChevronRight aria-hidden className={s.glanceArrow} />
                </motion.button>
              </li>
            ))}
          </ol>
        </section>

        <InView className={s.didi}>
          <Photo id="village-meeting" ratio="3/4" className={s.didiPhoto} alt={`${KISANI_DIDI.name}, ${t.didiRole}`} />
          <div className={s.didiPanel}>
            <p className={s.didiKicker}>{t.didiRole}</p>
            <p className={s.didiName}>{KISANI_DIDI.name}</p>
            <p className={s.didiArea}>
              {KISANI_DIDI.area}
              <br />
              {t.didiSpeaks(t.didiLangs(KISANI_DIDI.languages))}
            </p>
          </div>
          <div className={s.didiFoot}>
            <motion.button type="button" whileTap={{ scale: 0.97 }} className={s.askDidi} onClick={() => setVoiceOpen(true)} aria-haspopup="dialog">
              <span className={s.askMic} aria-hidden>
                <Mic />
              </span>
              <span className={s.askText}>
                <strong>{t.askDidi}</strong>
                <span>{t.askDidiHint}</span>
              </span>
            </motion.button>
            <div className={s.didiActions}>
              <Button size="sm" variant="secondary" icon={<Phone aria-hidden />} onClick={() => openContact(KD_CONTACT)}>
                {t.call}
              </Button>
              <Button size="sm" variant="secondary" icon={<MessageCircle aria-hidden />} onClick={() => openContact(KD_CONTACT)}>
                {t.message}
              </Button>
            </div>
          </div>
        </InView>

        {(d.events.status === 'loading' || next) && (
          <section className={s.section}>
            <SectionHead index="03" kicker={live ? t.happeningNow : t.nextEvent} title={live ? t.happeningNow : t.nextEvent} to="/events" action={t.allEvents} />
            <div className={s.gutter} style={{ marginTop: 16 }} lang="en">
              {next ? <EventPoster event={next} ratio="4/5" /> : <Skel h={420} r="var(--r-xl)" />}
            </div>
          </section>
        )}

        <section className={s.section} aria-label={t.myFields}>
          <SectionHead index="04" kicker={lands.data ? t.fieldsSummary(lands.data.length, lands.data.reduce((a, l) => a + l.areaAcres, 0)) : t.myFields} title={t.myFields} to="/lands" action={t.seeAll} />
          <div className="fj-rail" style={{ marginTop: 16 }}>
            {lands.status === 'loading' && [0, 1].map((i) => <Skel key={i} w={240} h={300} r="var(--r-xl)" />)}
            {lands.data?.map((l) => <FieldTile key={l.id} land={l} />)}
            <Link to={to('/lands/new')} className={s.addField}>
              <span className={s.addPlus}>+</span>
              {t.addField}
            </Link>
          </div>
        </section>

        {(content.status === 'loading' || lead) && (
          <section className={s.section} aria-label={t.latestNews}>
            <SectionHead index="05" kicker={t.topStory} title={t.latestNews} to="/learn?tab=news" action={t.seeAll} />
            {content.status === 'loading' ? (
              <div className={s.gutter}>
                <Skel h={460} r="var(--r-xl)" />
              </div>
            ) : (
              <div lang="en">
                {lead && (
                  <div className={s.coverWrap}>
                    <CoverStory item={lead} />
                  </div>
                )}
                <div className={`${s.gutter} ${s.magazine}`}>
                  {restNews.slice(0, 2).map((n, i) => (
                    <StoryRow key={n.id} item={n} flip={i % 2 === 1} />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <div className={s.gutter}>
          <Link to={to('/learn')} className={s.endLink}>
            <span>{t.browseLearn}</span>
            <ArrowUpRight aria-hidden />
          </Link>
          {t.reviewNote && <p className={s.reviewNote}>{t.reviewNote}</p>}
        </div>
      </div>

      <WeatherSheet open={wxOpen} onClose={() => setWxOpen(false)} weather={weather.data} onRetry={weather.refetch} t={t} tokens={s.tokens} />

      <Sheet open={langOpen} onClose={() => setLangOpen(false)} kicker={t.lang === 'en' ? t.language : `${t.language} · Language`} title={t.languagePicker.title}>
        <div className={`${s.tokens} ${s.home}`} lang={t.lang}>
          <LanguagePicker t={t} onDone={() => setLangOpen(false)} />
        </div>
      </Sheet>

      <Sheet open={voiceOpen} onClose={() => setVoiceOpen(false)} kicker={t.didiRole} title={t.voice.title}>
        <div className={s.tokens} lang={t.lang}>
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
