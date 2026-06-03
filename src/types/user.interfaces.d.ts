import type { Language } from './language.enum';
import type { RolesEnum } from './roles.enum';

export interface IUser {
  _id: string;
  email: string;
  phone: string;
  profile: {
    firstName: string;
    lastName: string;
    address: object;
    avatarUrl: string;
  };
  language: Language;
  role: RolesEnum;
}
