import { useCallback, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IUser } from '../../types/user.interfaces';
import { AuthContext } from './auth-context';
import { DASHBOARD_ROUTE, LOGIN_ROUTE } from '../../routes/routes';
import { apiAxiosInstance } from '../../api/config';
import type { ILoginForm } from '../../modules/auth/login/login.interfaces';
import type { IAuthResponse } from './auth-context.interfaces';
import {
  LOCAL_STORAGE_TOKEN,
  LOCAL_STORAGE_USER,
  REDIRECT_TO_LOCAL_STORAGE_KEY,
} from '@/constants';
import { useStorage } from '@/hooks/use-storage';
import { useVerifyToken } from '@/hooks/use-verify-token';
import { useUnauthorizedHandler } from '@/hooks/use-unauthorized-handler';
import { usePendingRedirect } from '@/hooks/use-pending-redirect';
import { LoadingScreen } from '@/components/loading-screen';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  const { getItem, setItem, removeItem } = useStorage();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [user, setUser] = useState<IUser | null>(null);
  const { pendingRedirect, setPendingRedirect } = usePendingRedirect();
  const updateLoggedUser = useCallback(
    (user: IUser | null) => {
      setUser(user);
      if (user) {
        setItem(LOCAL_STORAGE_USER, JSON.stringify(user));
      } else {
        removeItem(LOCAL_STORAGE_USER);
      }
    },
    [setItem, removeItem],
  );

  const setSession = useCallback(
    (token: string, loggedUser: IUser) => {
      setUser(loggedUser);
      setItem(LOCAL_STORAGE_USER, JSON.stringify(loggedUser));
      setItem(LOCAL_STORAGE_TOKEN, token);
      navigate(DASHBOARD_ROUTE, { replace: true });
    },
    [navigate, setItem],
  );

  const { isVerifyingToken } = useVerifyToken(updateLoggedUser);

  const logout = useCallback(() => {
    setUser(null);
    removeItem(LOCAL_STORAGE_USER);
    removeItem(LOCAL_STORAGE_TOKEN);
    navigate(LOGIN_ROUTE, { replace: true });
  }, [navigate, removeItem, setUser]);

  useUnauthorizedHandler(logout);

  const login = async ({ email, password }: ILoginForm) => {
    try {
      setIsLoggingIn(true);
      const { data } = await apiAxiosInstance.post<IAuthResponse>('/users/sign-in', {
        email,
        password,
      });
      const { token, user } = data;
      setUser(user);
      setItem(LOCAL_STORAGE_USER, JSON.stringify(user));
      setItem(LOCAL_STORAGE_TOKEN, token);
      const redirectTo = getItem(REDIRECT_TO_LOCAL_STORAGE_KEY);
      if (redirectTo) {
        setPendingRedirect(redirectTo);
      } else {
        navigate(DASHBOARD_ROUTE, { replace: true });
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isVerifyingToken) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateLoggedUser,
        setSession,
        isLoggingIn,
        pendingRedirect,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
