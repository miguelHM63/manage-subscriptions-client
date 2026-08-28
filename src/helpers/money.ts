// El backend maneja todos los montos en céntimos (enteros). En la UI trabajamos
// en soles. Estas utilidades convierten entre ambos y formatean para mostrar.

export const centsToSoles = (cents?: number): number => (cents ?? 0) / 100;

export const solesToCents = (soles?: number): number =>
  Math.round((soles ?? 0) * 100);

const formatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
});

export const formatMoney = (cents?: number): string =>
  formatter.format(centsToSoles(cents));
