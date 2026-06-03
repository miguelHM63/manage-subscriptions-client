import { createContext } from 'react';
import type { IStorageContext } from './storage-context.interfaces';

export const initialState: IStorageContext = {
  setItem: () => {},
  getItem: () => null,
  removeItem: () => {},
  clear: () => {},
};

export const StorageContext = createContext<IStorageContext>(initialState);
