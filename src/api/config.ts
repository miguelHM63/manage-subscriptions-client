import { API_URL } from '@/config';
import axios, { AxiosError } from 'axios';
import { ErrorMessages } from './error-validation';
import eventBus, { EventBusTypes } from '@/event-bus';

export const SESSION_TOKEN_EXPIRED = 'SESSION_TOKEN_EXPIRED';
export const ERR_CONNECTION_REFUSED = 'ERR_CONNECTION_REFUSED';

export const apiAxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export interface InputError {
  name: string;
  errors: string[];
}

export type HttpError = AxiosError<{
  message: string | InputError[];
  code: string | number;
  error?: string;
}>;

apiAxiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

apiAxiosInstance.interceptors.response.use(
  response => response,
  (error: AxiosError<HttpError>) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (!error.response) {
      eventBus.emit(EventBusTypes.SHOW_ERROR, {
        type: 'error',
        text: ErrorMessages.api(ERR_CONNECTION_REFUSED),
      });
      return Promise.reject(error);
    }

    if (!status) return Promise.reject(error);

    if (typeof data?.code === 'string') {
      eventBus.emit(EventBusTypes.SHOW_ERROR, {
        type: 'error',
        text: ErrorMessages.api(data.code),
      });
    } else if (status >= 400) {
      if (status === 401) {
        eventBus.emit(EventBusTypes.UNAUTHORIZED);
      }
      eventBus.emit(EventBusTypes.SHOW_ERROR, {
        type: 'error',
        text: ErrorMessages.http(status.toString()),
      });
    }

    if (status === 422) {
      error.code = data?.code;
      error.message = data?.message || 'The request was not processed due to validation errors';
    }
    return Promise.reject(error);
  },
);

export interface MutationCallback<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: HttpError) => void;
}
