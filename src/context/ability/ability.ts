import { ActionsEnum } from '@/types/actions.enum';
import { RolesEnum } from '@/types/roles.enum';
import { SubjectsEnum } from '@/types/subjects.enum';
import type { IUser } from '@/types/user.interfaces';
import { AbilityBuilder, createMongoAbility, type MongoAbility } from '@casl/ability';

export type Actions = ActionsEnum;
export type Subjects = SubjectsEnum;

export type AppAbility = MongoAbility<[Actions, Subjects]>;
export type AppAbilityClass = typeof createMongoAbility;

export function defineAbilityFor(user?: IUser | null) {
  const { can, build } = new AbilityBuilder<MongoAbility<[Actions, Subjects]>>(createMongoAbility);
  if (!user) {
    return build();
  }

  if (user.role === RolesEnum.ADMIN) {
    can(ActionsEnum.manage, SubjectsEnum.all);
  } else {
    can(ActionsEnum.read, SubjectsEnum.Dashboard);
    can(ActionsEnum.read, SubjectsEnum.User);
  }

  return build();
}
