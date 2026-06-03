import cn from '@/helpers/cn';
import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface INavigationLink {
  to: string;
  children: ReactNode;
  isActive?: boolean;
  className?: string;
}

export function NavigationLink({ to, children, className }: INavigationLink) {
  const { pathname } = useLocation();
  const mainRoute = pathname.split('/')[1];
  const plainTo = to.replace('/', '');
  const isActive = plainTo === mainRoute;
  return (
    <NavLink
      to={to}
      className={cn(
        'flex items-center px-5 py-0.5 rounded-lg hover:bg-gray-700 transition-colors duration-200 gap-6 h-10',
        {
          'bg-brand-primary text-white hover:filter hover:bg-brand-primary! hover:brightness-125!':
            isActive,
        },
        className,
      )}
    >
      {children}
    </NavLink>
  );
}
