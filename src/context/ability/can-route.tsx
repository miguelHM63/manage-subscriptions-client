import React from 'react';
import { Can } from './can';
import type { ActionsEnum } from '@/types/actions.enum';
import type { SubjectsEnum } from '@/types/subjects.enum';
import NotAllowed from '@/routes/components/not-allowed';

interface CanRouteProps {
  I: ActionsEnum;
  a: SubjectsEnum;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function CanRoute({ I, a, children, fallback }: CanRouteProps) {
  return (
    <Can I={I} a={a} passThrough>
      {(allowed: boolean) => (allowed ? children : (fallback ?? <NotAllowed />))}
    </Can>
  );
}
