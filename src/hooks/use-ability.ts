import { AbilityContext } from '@/context/ability/ability-context';
import { useContext } from 'react';

export function useAbility() {
  return useContext(AbilityContext);
}
