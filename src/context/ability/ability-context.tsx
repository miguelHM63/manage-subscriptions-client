import { createContext } from 'react';
import { defineAbilityFor, type AppAbility } from './ability';

export const AbilityContext = createContext<AppAbility>(defineAbilityFor());
