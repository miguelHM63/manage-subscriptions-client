import { DashboardLayout } from '../components/dashboard.layout';
import { withErrorBoundary } from '@/hoc/with-error-boundary';
import { UserList } from '../components/user-list';

function DashboardPageComponent() {
  return (
    <DashboardLayout>
      <UserList />
    </DashboardLayout>
  );
}

export const DashboardPage = withErrorBoundary(DashboardPageComponent);
