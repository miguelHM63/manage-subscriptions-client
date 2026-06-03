import { createContext } from 'react';
import type { IAuthContext } from './auth-context.interfaces';

export const initialState: IAuthContext = {
  user: undefined,
  login: () => {},
  logout: () => {},
  updateLoggedUser: () => {},
  isLoggingIn: false,
  pendingRedirect: null,
};

export const AuthContext = createContext(initialState);
