import { ADMIN_ONLY_TEST_ROUTE, DASHBOARD_ROUTE, HOME_ROUTE, USERS_ROUTE } from '@/routes/routes';
import { FireFilled, HomeFilled, IdcardFilled } from '@ant-design/icons';
import { NavigationLink } from './navigation-link';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const navigationLinkClasses =
  'flex items-center px-5 py-0.5 rounded hover:bg-gray-700 transition-colors duration-200 gap-6';

export function NavigationBar() {
  const { pathname } = useLocation();
  const { t } = useTranslation('navigation');
  return (
    <nav className="bg-gray-800 text-white font-semibold p-4 w-56">
      <div className="flex flex-col space-y-2">
        <NavigationLink
          className={navigationLinkClasses}
          to={DASHBOARD_ROUTE}
          isActive={pathname === HOME_ROUTE || pathname === DASHBOARD_ROUTE}
        >
          <HomeFilled />
          <span>{t('home')}</span>
        </NavigationLink>
        <NavigationLink
          className={navigationLinkClasses}
          to={USERS_ROUTE}
          isActive={pathname === USERS_ROUTE}
        >
          <IdcardFilled />
          <span>{t('users')}</span>
        </NavigationLink>
        <NavigationLink
          className={navigationLinkClasses}
          to={ADMIN_ONLY_TEST_ROUTE}
          isActive={pathname === ADMIN_ONLY_TEST_ROUTE}
        >
          <FireFilled />
          <span>{t('admin_only_test')}</span>
        </NavigationLink>
      </div>
    </nav>
  );
}
