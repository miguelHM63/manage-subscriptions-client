import { CanRoute } from '@/context/ability/can-route';
import { PrivateLayout } from '@/components/layouts/private-layout';
import { PrivateRoute } from '@/routes/components/private-route';
import { ADMIN_ONLY_TEST_ROUTE, DASHBOARD_ROUTE } from '@/routes/routes';
import { ActionsEnum } from '@/types/actions.enum';
import { DashboardPage } from '@/modules/dashboard';
import { SubjectsEnum } from '@/types/subjects.enum';
import { UserRoutes } from './user-routes';

export const AppPrivateRoutes = [
  {
    element: (
      <PrivateRoute>
        <PrivateLayout />
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
