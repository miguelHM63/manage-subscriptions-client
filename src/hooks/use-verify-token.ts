import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useStorage } from './use-storage';
import { apiAxiosInstance } from '@/api/config';
import type { IUser } from '@/types/user.interfaces';
import { REDIRECT_TO_LOCAL_STORAGE_KEY } from '@/constants';

const LOCAL_STORAGE_TOKEN = 'token';
const LOCAL_STORAGE_USER = 'user';

export function useVerifyToken(updateLoggedUser: (user: IUser | null) => void) {
  const [isVerifyingToken, setIsVerifyingToken] = useState(true);
  const { getItem, setItem, removeItem } = useStorage();
  const location = useLocation();

  useEffect(() => {
    const token = getItem(LOCAL_STORAGE_TOKEN);
    if (!token) {
      setIsVerifyingToken(false);
      return;
    }
    apiAxiosInstance
      .get<IUser>('/users/me')
      .then(({ data: userResponse }) => {
        updateLoggedUser(userResponse);
      })
      .catch(() => {
        updateLoggedUser(null);
        removeItem(LOCAL_STORAGE_TOKEN);
        removeItem(LOCAL_STORAGE_USER);
        setItem(REDIRECT_TO_LOCAL_STORAGE_KEY, location.pathname);
      })
      .finally(() => {
        setIsVerifyingToken(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isVerifyingToken };
}
