import type React from 'react';
import { NavigationBar } from '../navigation-bar';
import { Outlet } from 'react-router-dom';

interface IPrivateLayout {
  children?: React.ReactNode;
}

export function PrivateLayout({ children }: IPrivateLayout) {
  return (
    <div className="flex h-screen">
      <NavigationBar />
      <div className="flex-1">{children ?? <Outlet />}</div>
    </div>
  );
}
