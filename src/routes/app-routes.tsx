import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { AppProviders } from '@/providers/app-providers';
import { AppPublicRoutes } from './app-routes/app-public-routes';
import { AppPrivateRoutes } from './app-routes/app-private-routes';
import { AppCommonRoutes } from './app-routes/app-common-routes';

const router = createBrowserRouter([
  {
    element: (
      <AppProviders>
        <Outlet />
      </AppProviders>
    ),
    children: [...AppPublicRoutes, ...AppPrivateRoutes, ...AppCommonRoutes],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
