import { CanRoute } from '@/context/ability/can-route';
import { UsersListPage } from '@/modules/users/users-list/pages/users-list.page';
import { USERS_ROUTE } from '@/routes/routes';
import { ActionsEnum } from '@/types/actions.enum';
import { SubjectsEnum } from '@/types/subjects.enum';

export const UserRoutes = [
  {
    path: USERS_ROUTE,
    element: (
      <CanRoute I={ActionsEnum.read} a={SubjectsEnum.User}>
        <UsersListPage />
      </CanRoute>
    ),
  },
];
