import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { DASHBOARD_ROUTE } from '../routes';

export const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { user, pendingRedirect } = useAuth();
  if (user && !pendingRedirect) {
    return <Navigate to={DASHBOARD_ROUTE} replace />;
  }
  return <>{children}</>;
};
