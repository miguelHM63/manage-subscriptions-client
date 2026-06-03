import { Header } from '@/components/header';
import { LanguageSwitcher } from '@/components/language-switcher';
import { DashboardFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export function DashboardHeader() {
  const { t } = useTranslation('dashboard');
  return (
    <Header>
      <div className="flex justify-between pr-6">
        <div className="flex items-center gap-3">
          <DashboardFilled />
          <span className="text-2xl font-bold">{t('title')}</span>
        </div>
        <LanguageSwitcher />
      </div>
    </Header>
  );
}
