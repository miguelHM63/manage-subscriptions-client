import { useAbility } from '@/hooks/use-ability';
import { ErrorAction } from '@/components/error-action';
import { ActionsEnum } from '@/types/actions.enum';
import { Button } from 'antd';
import { SubjectsEnum } from '@/types/subjects.enum';
import { Link } from 'react-router-dom';
import { ADMIN_ONLY_TEST_ROUTE } from '@/routes/routes';
import { useGetUserList } from '../hooks/use-get-user-list';
import { useTranslation } from 'react-i18next';

export function UserList() {
  const { data: userList, isLoading, error, refetch } = useGetUserList();
  const { t } = useTranslation('dashboard');

  const ability = useAbility();
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <ErrorAction error={error} onRetry={refetch} />;
  }

  if (!userList) {
    return <div>No data available</div>;
  }

  return (
    <>
      <h3 className="mt-6 font-semibold">{t('userList')}</h3>
      {ability.can(ActionsEnum.manage, SubjectsEnum.Dashboard) && (
        <Link to={ADMIN_ONLY_TEST_ROUTE}>
          <Button type="primary" className="mb-4">
            {t('goToAdminOnlyTestArea')}
          </Button>
        </Link>
      )}
      <ul className="mt-6">
        {userList.map(user => (
          <li key={user._id} className="border border-dashed border-slate-300 p-4 mb-2">
            {user._id} - {user.email}
          </li>
        ))}
      </ul>
    </>
  );
}
