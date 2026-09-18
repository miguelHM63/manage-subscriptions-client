import cn from '@/helpers/cn';

// Hasta este tamaño se dibuja un segmento por cupo; más, una barra proporcional.
const MAX_SEGMENTS = 12;

interface SlotBarProps {
  capacity: number;
  used: number;
  className?: string;
}

/**
 * Cupos como inventario: ocupados en color de marca, libres punteados en verde.
 * Deja ver de un vistazo cuántos quedan por vender.
 */
export function SlotBar({ capacity, used, className }: SlotBarProps) {
  const free = Math.max(0, capacity - used);
  const usedCls = 'h-2 rounded-[3px] bg-brand-500 dark:bg-brand-400';
  const freeCls =
    'h-2 rounded-[3px] border border-dashed border-success bg-green-100 dark:bg-green-500/15';

  if (capacity > MAX_SEGMENTS) {
    return (
      <div className={cn('flex gap-1', className)} aria-label={`${used} de ${capacity} cupos usados`}>
        {used > 0 && <div className={usedCls} style={{ flexGrow: used }} />}
        {free > 0 && <div className={freeCls} style={{ flexGrow: free }} />}
      </div>
    );
  }

  return (
    <div className={cn('flex gap-1', className)} aria-label={`${used} de ${capacity} cupos usados`}>
      {Array.from({ length: capacity }, (_, i) => (
        <div key={i} className={cn('flex-1', i < used ? usedCls : freeCls)} />
      ))}
    </div>
  );
}
