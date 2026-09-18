import cn from '@/helpers/cn';

export const MIN_PASSWORD_LENGTH = 8;

/** Barra de progreso hacia el mínimo de caracteres, visible mientras se escribe. */
export function PasswordHint({ value = '' }: { value?: string }) {
  const missing = Math.max(0, MIN_PASSWORD_LENGTH - value.length);
  const segments = 4;
  const filled = Math.round((Math.min(value.length, MIN_PASSWORD_LENGTH) / MIN_PASSWORD_LENGTH) * segments);

  return (
    <div className="mt-1.5 flex flex-col gap-1.5">
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: segments }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-1 rounded-full',
              i < filled ? (missing ? 'bg-warning' : 'bg-success') : 'bg-surface-hover',
            )}
          />
        ))}
      </div>
      <span className={cn('text-xs', missing ? 'text-content-muted' : 'text-success')}>
        {!value.length
          ? `Mínimo ${MIN_PASSWORD_LENGTH} caracteres`
          : missing
            ? `Faltan ${missing} caracter${missing === 1 ? '' : 'es'}`
            : 'Largo suficiente'}
      </span>
    </div>
  );
}
