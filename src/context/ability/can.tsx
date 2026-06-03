import { createContextualCan } from '@casl/react';
import { AbilityContext } from './ability-context';

export const Can = createContextualCan(AbilityContext.Consumer);
