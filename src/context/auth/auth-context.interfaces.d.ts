import type { ILoginForm } from '../../modules/auth/login/login.interfaces';
import type { IUser } from '../../types/user.interfaces';

export interface IAuthContext {
  user?: IUser | null;
  login?: (userData: ILoginForm) => void;
  logout?: () => void;
  updateLoggedUser?: (user: IUser | null) => void;
  setSession?: (token: string, user: IUser) => void;
  isLoggingIn?: boolean;
  pendingRedirect?: string | null;
}

export interface IAuthResponse {
  token: string;
  user: IUser;
}
