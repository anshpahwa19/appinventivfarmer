import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { LanguagePicker } from '@/components/home/LanguageSwitch';
import { actions } from '@/services/store';
import { useHomeT } from '@/i18n/home';
import homeS from '@/features/home/Home.module.css';

/** Onboarding step after the intro screens: pick the app language, then sign in. */
export default function ChooseLanguage() {
  const navigate = useNavigate();
  const t = useHomeT();
  const done = () => {
    actions.completeOnboarding();
    navigate('/auth', { replace: true });
  };
  return (
    <Screen
      title={t.languagePicker.title}
      subtitle={t.languagePicker.hint}
      largeTitle
      back
      backTo="/welcome"
      footer={
        <Button size="lg" block iconRight={<ArrowRight aria-hidden />} onClick={done}>
          {t.languagePicker.continue}
        </Button>
      }
    >
      <div className={`${homeS.tokens} ${homeS.home}`} lang={t.contentLang} style={{ padding: '4px var(--gutter) 24px' }}>
        <LanguagePicker t={t} variant="cards" onDone={() => undefined} />
      </div>
    </Screen>
  );
}
