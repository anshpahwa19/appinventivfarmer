import { ArrowRight } from 'lucide-react';
import { actions } from '@/services/store';
import { useHomeT } from '@/i18n/home';
import { LanguagePicker } from '@/components/home/LanguageSwitch';
import { Screen, PageTitle } from '../../layout/Screen';
import { Button } from '../../ui/Button';
import { useNav } from '../../nav';
import homeS from '../home/Home.module.css';

/** Onboarding step after the intro screens: pick the app language, then sign in. */
export default function ChooseLanguage() {
  const nav = useNav();
  const t = useHomeT();
  const done = () => {
    actions.completeOnboarding();
    nav('/auth', { replace: true });
  };
  return (
    <Screen
      title={t.languagePicker.title}
      backTo="/welcome"
      footer={
        <Button size="lg" block iconRight={<ArrowRight aria-hidden />} onClick={done}>
          {t.languagePicker.continue}
        </Button>
      }
    >
      <PageTitle title={t.languagePicker.title} deck={t.languagePicker.hint} />
      <div className={`${homeS.tokens} ${homeS.home}`} lang={t.contentLang} style={{ padding: '4px var(--fj-gutter) 24px' }}>
        <LanguagePicker t={t} variant="index" onDone={() => undefined} />
      </div>
    </Screen>
  );
}
