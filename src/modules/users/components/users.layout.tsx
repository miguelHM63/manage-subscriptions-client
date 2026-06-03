import { TwoRowsLayout } from '@/components/layouts/two-rows-layout';
import { UsersHeader } from './users-header';
import type React from 'react';

export function UsersLayout({ children }: { children: React.ReactNode }) {
  return (
    <TwoRowsLayout header={<UsersHeader />}>
      <div className="p-4">{children}</div>
    </TwoRowsLayout>
  );
}
