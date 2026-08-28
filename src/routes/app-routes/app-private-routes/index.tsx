import { CanRoute } from '@/context/ability/can-route';
import { PanelLayout } from '@/components/layouts/panel-layout';
import { PrivateRoute } from '@/routes/components/private-route';
import {
  ADMIN_ONLY_TEST_ROUTE,
  CUSTOMERS_ROUTE,
  DASHBOARD_ROUTE,
  PROFILE_ROUTE,
  PROVIDER_ACCOUNTS_ROUTE,
  SERVICES_ROUTE,
  SUBSCRIPTIONS_ROUTE,
} from '@/routes/routes';
import { ActionsEnum } from '@/types/actions.enum';
import { DashboardPage } from '@/modules/dashboard';
import { CustomersPage } from '@/modules/customers';
import { SubscriptionsPage } from '@/modules/subscriptions';
import { ProviderAccountsPage } from '@/modules/provider-accounts';
import { ServicesPage } from '@/modules/services';
import { ProfilePage } from '@/modules/profile';
import { SubjectsEnum } from '@/types/subjects.enum';
import { UserRoutes } from './user-routes';

export const AppPrivateRoutes = [
  {
    element: (
      <PrivateRoute>
        <PanelLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: DASHBOARD_ROUTE,
        element: (
          <CanRoute I={ActionsEnum.read} a={SubjectsEnum.Dashboard}>
            <DashboardPage />
          </CanRoute>
        ),
      },
      { path: CUSTOMERS_ROUTE, element: <CustomersPage /> },
      { path: SUBSCRIPTIONS_ROUTE, element: <SubscriptionsPage /> },
      { path: PROVIDER_ACCOUNTS_ROUTE, element: <ProviderAccountsPage /> },
      { path: SERVICES_ROUTE, element: <ServicesPage /> },
      { path: PROFILE_ROUTE, element: <ProfilePage /> },
      ...UserRoutes,
      {
        path: ADMIN_ONLY_TEST_ROUTE,
        element: (
          <CanRoute I={ActionsEnum.read} a={SubjectsEnum.AdminOnlyTest}>
            <div>Ruta de test solo para admins</div>
          </CanRoute>
        ),
      },
    ],
  },
];
