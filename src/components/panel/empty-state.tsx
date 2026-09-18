import type { ReactNode } from 'react';

import cn from '@/helpers/cn';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  /** Acción principal (y opcionalmente secundaria) debajo del texto. */
  actions?: ReactNode;
  /** Contenido extra entre el texto y las acciones (atajos, requisitos…). */
  children?: ReactNode;
  tone?: 'brand' | 'danger';
  className?: string;
}

/** Estado vacío/error: explica para qué sirve la sección y qué hacer ahora. */
export function EmptyState({
  icon,
  title,
  description,
  actions,
  children,
  tone = 'brand',
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'mx-auto flex max-w-sm flex-col items-center gap-5 px-4 py-12 text-center',
        className,
      )}
    >
      <div
        className={cn(
          'flex h-24 w-24 items-center justify-center rounded-full',
          tone === 'danger' ? 'bg-red-100 dark:bg-red-500/15' : 'bg-brand-50 dark:bg-brand-400/15',
        )}
      >
        <div
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-3xl shadow-sm',
            tone === 'danger' ? 'text-danger' : 'text-brand-ink',
          )}
        >
          {icon}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-bold text-balance text-content">{title}</h2>
        {description && (
          <p className="mt-1.5 text-sm text-pretty text-content-muted">{description}</p>
        )}
      </div>
      {children}
      {actions && <div className="flex w-full flex-col items-center gap-1">{actions}</div>}
    </div>
  );
}
