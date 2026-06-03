import type React from 'react';
import { TwoRowsLayout } from '@/components/layouts/two-rows-layout';
import { DashboardHeader } from './dashboard-header';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TwoRowsLayout header={<DashboardHeader />}>
      <div className="p-4">{children}</div>
    </TwoRowsLayout>
  );
}
