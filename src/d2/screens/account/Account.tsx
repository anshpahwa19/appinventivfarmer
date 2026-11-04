import { useState } from 'react';
import { Bell, Bookmark, ClipboardList, FlaskConical, HelpCircle, Info, KeyRound, Languages, LayoutTemplate, LogOut, MessageCircle, Palette, Pencil, Repeat, ScrollText, ShieldCheck, Sprout, Tractor } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { actions, useStore } from '@/services/store';
import { formatPhone, monthYear } from '@/lib/format';
import { counterpartPath } from '@/app/DirectionSwitcher';
import { Screen } from '../../layout/Screen';
import { Avatar, Row, RowGroup, StatusTag } from '../../ui/Blocks';
import { Button } from '../../ui/Button';
import { Sheet } from '../../ui/Sheet';
import { Cascade, Rise } from '../../motion/Reveal';
import { useNav } from '../../nav';
import { Photo } from '../../photo/Photo';
import s from './Account.module.css';

export default function Account() {
  const nav = useNav();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const profile = useStore((st) => st.profile);
  const session = useStore((st) => st.session);
  const prefs = useStore((st) => st.prefs);
  const bookmarks = useStore((st) => st.bookmarks.length);
  const unread = useStore((st) => st.unreadNotifications.length);
  const lands = useStore((st) => st.lands);
  const [logout, setLogout] = useState(false);
  const acres = lands.reduce((a, l) => a + l.areaAcres, 0);

  return (
    <Screen title="Me" variant="masthead" kicker="Your account" tabRoot>
      <Cascade className={s.page}>
        <Rise>
          <div className={s.cover}>
            <Photo id="farmer-portrait" ratio="16/9" shade="bottom" />
          </div>
          <section className={`${s.profile} ${s.profileOnCover}`} aria-label="Profile">
            <div className={s.profileTop}>
              <Avatar name={profile.name} size={76} verified={session.verified} night />
              <Button size="sm" variant="secondary" icon={<Pencil aria-hidden />} to="/account/profile">
                Edit
              </Button>
            </div>
            <h2 className={s.name}>{profile.name}</h2>
            <p className={s.phone}>{formatPhone(session.phone || profile.phone)}</p>
            <p className={s.since}>
              @{profile.username} · {profile.village}, {profile.district} · since {monthYear(profile.memberSince)}
            </p>
            <div className={s.verifyRow}>
              {session.verified ? (
                <StatusTag tone="success" icon={<ShieldCheck aria-hidden />}>
                  Verified number
                </StatusTag>
              ) : (
                <>
                  <StatusTag tone="warning">
                    Verification pending
                  </StatusTag>
                  <Button size="sm" variant="accent" onClick={() => nav('/account/verify')}>
                    Verify now
                  </Button>
                </>
              )}
            </div>
            <dl className={s.stats}>
              <div>
                <dt>Fields</dt>
                <dd>{lands.length}</dd>
              </div>
              <div>
                <dt>Acres</dt>
                <dd>{acres}</dd>
              </div>
              <div>
                <dt>Saved</dt>
                <dd>{bookmarks}</dd>
              </div>
            </dl>
          </section>
        </Rise>

        <Rise>
          <RowGroup title="My farm">
            <Row icon={<Sprout />} title="My fields" value={String(lands.length)} to="/lands" />
            <Row icon={<ClipboardList />} title="My forms" subtitle="Season records" to="/forms" />
            <Row icon={<Tractor />} title="Farm machinery" subtitle="Machines you own" to="/account/machinery" />
          </RowGroup>
        </Rise>
        <Rise>
          <RowGroup title="Activity">
            <Row icon={<Bookmark />} title="My bookmarks" value={bookmarks ? String(bookmarks) : undefined} to="/bookmarks" />
            <Row icon={<Bell />} title="Notifications" value={unread ? `${unread} new` : undefined} to="/notifications" />
          </RowGroup>
        </Rise>
        <Rise>
          <RowGroup title="Preferences">
            <Row icon={<Languages />} title="Language" value="English" to="/account/language" />
            <Row icon={<Palette />} title="Display" subtitle="Text size, theme, animations" value={prefs.text === 'large' ? 'Large text' : prefs.theme === 'dark' ? 'Dark' : undefined} to="/account/display" />
            {session.verified && <Row icon={<KeyRound />} title="Change password" to="/account/password" />}
          </RowGroup>
        </Rise>
        <Rise>
          <RowGroup title="Help">
            <Row icon={<HelpCircle />} title="Help & FAQs" to="/account/help" />
            <Row icon={<MessageCircle />} title="Contact us" to="/account/contact" />
            <Row icon={<Info />} title="About Kisani Urjaa" subtitle="Credits and photo slots" to="/account/about" />
            <Row icon={<ScrollText />} title="Privacy policy" to="/account/legal/privacy" />
            <Row icon={<ScrollText />} title="Terms & conditions" to="/account/legal/terms" />
          </RowGroup>
        </Rise>
        <Rise>
          <RowGroup title="Design review">
            <Row icon={<Repeat />} title="Switch to Direction 01" subtitle="Same screen in the illustrated design" onClick={() => navigate(counterpartPath(pathname))} />
            <Row icon={<FlaskConical />} title="Prototype controls" subtitle="Verification, offline, slow network, empty states" to="/account/prototype" />
            <Row icon={<LayoutTemplate />} title="Design system" subtitle="Field Journal colours, type, components, motion" to="/design-system" />
          </RowGroup>
        </Rise>
        <Rise>
          <RowGroup>
            <Row icon={<LogOut />} title="Log out" danger onClick={() => setLogout(true)} chevron={false} />
          </RowGroup>
        </Rise>
        <p className={s.version}>Kisani Urjaa 2.0 · Direction 02 “Field Journal” · prototype</p>
      </Cascade>

      <Sheet
        open={logout}
        onClose={() => setLogout(false)}
        variant="dialog"
        icon={<LogOut />}
        tone="danger"
        title="Log out?"
        description="You’ll need your mobile number to log in again. Bookmarks stay on this phone."
        footer={
          <>
            <Button
              variant="danger"
              block
              onClick={() => {
                setLogout(false);
                actions.signOut();
                nav('/auth', { replace: true });
              }}
            >
              Log out
            </Button>
            <Button variant="secondary" block onClick={() => setLogout(false)} data-autofocus>
              Stay logged in
            </Button>
          </>
        }
      />
    </Screen>
  );
}
