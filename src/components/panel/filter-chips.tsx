import cn from '@/helpers/cn';

export type ChipTone = 'neutral' | 'warning' | 'danger' | 'info' | 'success';

export interface FilterChip<T extends string> {
  value: T;
  label: string;
  count?: number;
  tone?: ChipTone;
}

// Chip no seleccionado: tono suave. Seleccionado: marca sólida.
const TONES: Record<ChipTone, string> = {
  neutral: 'border border-border bg-surface text-content-muted',
  success: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
};

interface FilterChipsProps<T extends string> {
  chips: FilterChip<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** Filtros rápidos en fila con scroll horizontal (móvil) y conteo por opción. */
export function FilterChips<T extends string>({
  chips,
  value,
  onChange,
  className,
}: FilterChipsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn('-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0', className)}
    >
      {chips.map(chip => {
        const selected = chip.value === value;
        return (
          <button
            key={chip.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(chip.value)}
            className={cn(
              'flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold whitespace-nowrap transition-colors',
              selected ? 'bg-brand-600 text-white' : TONES[chip.tone ?? 'neutral'],
            )}
          >
            {chip.label}
            {chip.count !== undefined && <span className="opacity-80">· {chip.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
