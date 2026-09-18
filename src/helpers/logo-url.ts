import { BRANDFETCH_CLIENT_ID } from '@/config';

const BRANDFETCH_CDN_HOST = 'cdn.brandfetch.io';

/**
 * Devuelve una URL de logo que no caduca.
 *
 * La búsqueda de Brandfetch entrega los logos con un token temporal en `?c=`
 * (`c=1ax<timestamp>…`) que a los días responde 410. El CDN también acepta el
 * clientId público en ese parámetro, y así la URL es estable. Se aplica al
 * guardar y al mostrar, lo que además recupera los logos ya guardados.
 */
export function resolveLogoUrl(url?: string): string | undefined {
  if (!url || !BRANDFETCH_CLIENT_ID) return url;

  try {
    const parsed = new URL(url);
    if (parsed.hostname !== BRANDFETCH_CDN_HOST) return url;
    parsed.searchParams.set('c', BRANDFETCH_CLIENT_ID);
    return parsed.toString();
  } catch {
    return url;
  }
}
