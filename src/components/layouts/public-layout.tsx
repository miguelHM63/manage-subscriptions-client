import { CheckCircleFilled } from '@ant-design/icons';
import type React from 'react';

const HIGHLIGHTS = [
  'Clientes y suscripciones en un solo lugar',
  'Alertas antes de que algo se venza',
  'Comparte accesos por WhatsApp en un clic',
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Panel de marca (solo escritorio) */}
      <div className="hidden w-1/2 flex-col justify-center gap-6 bg-gradient-to-br from-brand-600 to-accent-600 p-12 text-white md:flex">
        <span className="text-3xl font-black">Plancito</span>
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
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-surface p-8 text-content md:w-1/2">
        {children}
      </div>
    </div>
  );
}
