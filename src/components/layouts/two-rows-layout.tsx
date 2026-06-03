import type React from 'react';

interface ITwoRowsLayout {
  children: React.ReactNode;
  header: React.ReactNode;
}

export function TwoRowsLayout({ children, header }: ITwoRowsLayout) {
  return (
    <div className="w-full min-h-screen flex flex-col">
      {header}
      {children}
    </div>
  );
}
