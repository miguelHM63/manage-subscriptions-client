import { normalizePhone } from './phone';

/**
 * Enlace para abrir un chat de WhatsApp (opcionalmente con mensaje).
 *
 * - Número: E.164 (`+51987654321`); los antiguos sin código se interpretan
 *   con el país por defecto (Perú).
 * - En el teléfono abre la app. En escritorio fuerza WhatsApp Web: la app de
 *   escritorio corrompe los emojis de los enlaces wa.me en Windows.
 */
export function whatsappUrl(phone?: string, text?: string): string {
  const intl = (normalizePhone(phone) ?? phone ?? '').replace(/\D/g, '');
  const host = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    ? 'https://api.whatsapp.com'
    : 'https://web.whatsapp.com';
  // encodeURIComponent (no URLSearchParams) para que los espacios vayan como
  // %20 y no como "+".
  const query = [intl && `phone=${intl}`, text && `text=${encodeURIComponent(text)}`].filter(
    Boolean,
  );
  return `${host}/send?${query.join('&')}`;
}
