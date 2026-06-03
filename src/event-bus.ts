type EventHandler = (data?: unknown) => void;

export enum EventBusTypes {
  UNAUTHORIZED = 'unauthorized',
  LOGOUT = 'logout',
  SHOW_ERROR = 'show_error',
}

interface IEventBus {
  on(event: EventBusTypes, handler: EventHandler): void;
  off(event: EventBusTypes, handler: EventHandler): void;
  emit(event: EventBusTypes, data?: unknown): void;
}

const eventBus: IEventBus = {
  on(event, handler) {
    document.addEventListener(event, handler);
  },
  off(event, handler) {
    document.removeEventListener(event, handler);
  },
  emit(event, data) {
    document.dispatchEvent(new CustomEvent(event, { detail: data }));
  },
};

export default eventBus;
