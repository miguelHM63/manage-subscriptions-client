import { CheckCircleFilled } from '@ant-design/icons';
import type React from 'react';

import { BrandMark } from '@/components/brand-logo';
import { ThemeToggle } from '@/components/panel/theme-toggle';

const HIGHLIGHTS = [
  'Clientes y suscripciones en un solo lugar',
  'Sabes cada día qué vence y qué cobrar',
  'Comparte accesos por WhatsApp en un toque',
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      {/* Panel de marca (solo escritorio) */}
      <div className="hidden w-1/2 flex-col justify-center gap-6 bg-brand-700 p-12 text-white md:flex">
        <span className="flex items-center gap-3">
          <BrandMark size={44} className="!bg-white/15" />
          <span className="text-3xl font-black tracking-tight">Plancito</span>
        </span>
        <p className="max-w-sm text-lg text-white/90">
          Gestiona tus clientes, cuentas y vencimientos sin que se te pase nada.
        </p>
        <ul className="space-y-2">
          {HIGHLIGHTS.map(item => (
            <li key={item} className="flex items-center gap-2 text-sm text-white/90">
              <CheckCircleFilled />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Contenido (login / registro) — respeta el tema claro/oscuro */}
      <div className="relative flex min-h-dvh w-full flex-col items-center justify-center bg-surface px-6 py-10 text-content md:w-1/2">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        {children}
      </div>
    </div>
  );
}
