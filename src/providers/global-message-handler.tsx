import { useEffect } from 'react';
import { message } from 'antd';
import { EventBusTypes } from '@/event-bus';

export function GlobalMessageHandler() {
  useEffect(() => {
    const onError = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: 'error'; text: string }>;
      message[customEvent.detail.type](customEvent.detail.text);
    };

    document.addEventListener(EventBusTypes.SHOW_ERROR, onError as EventListener);
    return () => document.removeEventListener(EventBusTypes.SHOW_ERROR, onError as EventListener);
  }, []);

  return null;
}
