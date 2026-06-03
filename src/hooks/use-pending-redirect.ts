import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStorage } from './use-storage';
import { REDIRECT_TO_LOCAL_STORAGE_KEY } from '@/constants';

export function usePendingRedirect() {
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { removeItem } = useStorage();
  useEffect(() => {
    if (pendingRedirect) {
      navigate(pendingRedirect, { replace: true });
    }
  }, [pendingRedirect, navigate]);

  useEffect(() => {
    if (pendingRedirect && location.pathname === pendingRedirect) {
      removeItem(REDIRECT_TO_LOCAL_STORAGE_KEY);
      setPendingRedirect(null);
    }
  }, [location.pathname, pendingRedirect, removeItem]);

  return {
    pendingRedirect,
    setPendingRedirect,
  };
}
