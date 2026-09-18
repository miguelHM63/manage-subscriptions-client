import dayjs from 'dayjs';
import 'dayjs/locale/es';

/** Días de calendario desde hoy hasta `date` (negativo si ya pasó). */
export const daysUntil = (date: string | Date): number =>
  dayjs(date).startOf('day').diff(dayjs().startOf('day'), 'day');

const plural = (n: number) => `${n} ${n === 1 ? 'día' : 'días'}`;

/** "Venció hace 3 días" · "Vence hoy" · "Vence mañana" · "Vence en 4 días". */
export const dueLabel = (days: number): string => {
  if (days < 0) return `Venció hace ${plural(Math.abs(days))}`;
  if (days === 0) return 'Vence hoy';
  if (days === 1) return 'Vence mañana';
  return `Vence en ${plural(days)}`;
};

/** Versión corta para etiquetas: "-3 días" · "Hoy" · "Mañana" · "4 días". */
export const dueShort = (days: number): string => {
  if (days < 0) return `-${plural(Math.abs(days))}`;
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Mañana';
  return plural(days);
};

/**
 * Formatea en español sin depender del locale global (que sigue al idioma del
 * navegador). Los textos del panel están en español.
 */
export const formatDate = (date: string | Date, format: string): string =>
  dayjs(date).locale('es').format(format).replace('.', '');

/** Fecha corta: "10 sep". */
export const shortDate = (date: string | Date): string => formatDate(date, 'D MMM');
