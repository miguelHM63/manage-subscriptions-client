import type React from 'react';
import { StorageContext } from './storage-context';

export const StorageProvider = ({ children }: { children: React.ReactNode }) => {
  const setItem = (key: string, value: string) => localStorage.setItem(key, value);
  const getItem = (key: string) => localStorage.getItem(key);
  const removeItem = (key: string) => localStorage.removeItem(key);
  const clear = () => localStorage.clear();

  return (
    <StorageContext.Provider value={{ setItem, getItem, removeItem, clear }}>
      {children}
    </StorageContext.Provider>
  );
};
