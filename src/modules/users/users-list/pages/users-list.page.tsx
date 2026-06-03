import { withErrorBoundary } from '@/hoc/with-error-boundary';
import { UsersLayout } from '../../components/users.layout';
import { UsersList } from '../components/users-list';

function UsersListPageComponent() {
  return (
    <UsersLayout>
      <UsersList />
    </UsersLayout>
  );
}

export const UsersListPage = withErrorBoundary(UsersListPageComponent);
