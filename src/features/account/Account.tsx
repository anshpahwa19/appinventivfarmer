import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Bookmark, ClipboardList, FlaskConical, HelpCircle, Info, KeyRound, Languages, LogOut, MessageCircle, Palette, Pencil, ScrollText, Shield, ShieldCheck, Sprout, Tractor, LayoutTemplate } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { Avatar, StatusBadge } from '@/components/ui/Misc';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { ListGroup, ListRow } from '@/components/ui/Blocks';
import { Sheet } from '@/components/ui/Sheet';
import { actions, useStore } from '@/services/store';
import { formatPhone, monthYear } from '@/lib/format';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import s from './Account.module.css';

export default function Account() {
  const navigate = useNavigate();
  const profile = useStore((st) => st.profile);
  const session = useStore((st) => st.session);
  const prefs = useStore((st) => st.prefs);
  const bookmarks = useStore((st) => st.bookmarks.length);
  const unread = useStore((st) => st.unreadNotifications.length);
  const lands = useStore((st) => st.lands.length);
  const [logout, setLogout] = useState(false);

  return (
    <Screen title="Account" largeTitle band tabRoot>
      <Stagger className={s.page}>
        <StaggerItem>
        <section className={s.profile} aria-label="Profile">
          <div className={s.profileTop}>
            <Avatar name={profile.name} size={64} verified={session.verified} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 className={s.name}>{profile.name}</h2>
              <p className={s.phone}>{formatPhone(session.phone || profile.phone)}</p>
              <p className={s.since}>
                @{profile.username} · member since {monthYear(profile.memberSince)}
              </p>
            </div>
            <IconButton label="Edit profile" variant="surface" to="/account/profile">
              <Pencil />
            </IconButton>
          </div>
          <div className={s.verifyRow}>
            {session.verified ? (
              <StatusBadge tone="success" icon={<ShieldCheck aria-hidden />}>
                Verified number
              </StatusBadge>
            ) : (
              <>
                <StatusBadge tone="warning" icon={<Shield aria-hidden />}>
                  Verification pending
                </StatusBadge>
                <Button size="sm" onClick={() => navigate('/account/verify')}>
                  Verify now
                </Button>
              </>
            )}
          </div>
        </section>
        </StaggerItem>

        <StaggerItem>
        <ListGroup title="My farm">
          <ListRow icon={<Sprout />} title="My fields" value={String(lands)} to="/lands" />
          <ListRow icon={<ClipboardList />} title="My forms" subtitle="Season records" to="/forms" />
          <ListRow icon={<Tractor />} title="Farm machinery" subtitle="Machines you own" to="/account/machinery" />
        </ListGroup>
        </StaggerItem>

        <StaggerItem>
        <ListGroup title="Activity">
          <ListRow icon={<Bookmark />} title="My bookmarks" value={bookmarks ? String(bookmarks) : undefined} to="/bookmarks" />
          <ListRow icon={<Bell />} title="Notifications" value={unread ? `${unread} new` : undefined} to="/notifications" />
        </ListGroup>
        </StaggerItem>

        <StaggerItem>
        <ListGroup title="Preferences">
          <ListRow icon={<Languages />} title="Language" value="English" to="/account/language" />
          <ListRow icon={<Palette />} title="Display" value={prefs.text === 'large' ? 'Large text' : prefs.theme === 'dark' ? 'Dark' : undefined} subtitle="Text size, theme, animations" to="/account/display" />
          {session.verified && <ListRow icon={<KeyRound />} title="Change password" to="/account/password" />}
        </ListGroup>
        </StaggerItem>

        <StaggerItem>
        <ListGroup title="Help">
          <ListRow icon={<HelpCircle />} title="Help & FAQs" to="/account/help" />
          <ListRow icon={<MessageCircle />} title="Contact us" to="/account/contact" />
          <ListRow icon={<Info />} title="About Kisani Urjaa" to="/account/about" />
          <ListRow icon={<ScrollText />} title="Privacy policy" to="/account/legal/privacy" />
          <ListRow icon={<ScrollText />} title="Terms & conditions" to="/account/legal/terms" />
        </ListGroup>
        </StaggerItem>

        <StaggerItem>
        <ListGroup title="Prototype">
          <ListRow icon={<FlaskConical />} title="Prototype controls" subtitle="Verification, offline, slow network, empty states" to="/account/prototype" />
          <ListRow icon={<LayoutTemplate />} title="Design system" subtitle="Colours, type, components, animations" to="/design-system" />
        </ListGroup>
        </StaggerItem>

        <StaggerItem>
        <ListGroup>
          <ListRow icon={<LogOut />} title="Log out" danger onClick={() => setLogout(true)} chevron={false} />
        </ListGroup>
        </StaggerItem>

        <p className={s.version}>Kisani Urjaa 2.0 · prototype build</p>
      </Stagger>

      <Sheet
        open={logout}
        onClose={() => setLogout(false)}
        variant="dialog"
        icon={<LogOut />}
        iconTone={{ bg: 'var(--danger-bg)', fg: 'var(--danger-fg)' }}
        title="Log out?"
        description="You’ll need your mobile number to log in again. Saved bookmarks stay on this phone."
        footer={
          <div className="stack" style={{ ['--gap' as string]: '8px', width: '100%' }}>
            <Button
              variant="danger"
              block
              onClick={() => {
                setLogout(false);
                actions.signOut();
                navigate('/auth', { replace: true });
              }}
            >
              Log out
            </Button>
            <Button variant="secondary" block onClick={() => setLogout(false)} data-autofocus>
              Stay logged in
            </Button>
          </div>
        }
      />
    </Screen>
  );
}
