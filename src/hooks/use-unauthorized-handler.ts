import eventBus, { EventBusTypes } from '@/event-bus';
import { useEffect } from 'react';

export function useUnauthorizedHandler(logout: () => void) {
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    eventBus.on(EventBusTypes.UNAUTHORIZED, handleUnauthorized);
    return () => {
      eventBus.off(EventBusTypes.UNAUTHORIZED, handleUnauthorized);
    };
  }, [logout]);
}
