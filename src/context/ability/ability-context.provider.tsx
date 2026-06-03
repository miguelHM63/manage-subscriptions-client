import React, { useMemo } from 'react';
import { AbilityContext } from './ability-context';
import { defineAbilityFor } from './ability';
import { useAuth } from '@/hooks/use-auth';

export function AbilityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const ability = useMemo(() => defineAbilityFor(user), [user]);

  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>;
}
