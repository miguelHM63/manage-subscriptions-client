import { Header } from '@/components/header';
import { UserSwitchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/language-switcher';

export function UsersHeader() {
  const { t } = useTranslation('users');
  return (
    <Header>
      <div className="flex justify-between pr-6">
        <div className="flex items-center gap-3">
          <UserSwitchOutlined />
          <span className="text-2xl font-bold">{t('title')}</span>
        </div>
        <LanguageSwitcher />
      </div>
    </Header>
  );
}
