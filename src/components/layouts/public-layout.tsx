import type React from 'react';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:flex w-1/2 bg-brand-secondary justify-center items-center text-white">
        [Image Here]
      </div>
      <div className="w-full flex flex-col items-center justify-center min-h-screen p-8 md:w-1/2">
        {children}
      </div>
    </div>
  );
}
