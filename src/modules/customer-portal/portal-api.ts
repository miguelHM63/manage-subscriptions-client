import { API_URL } from '@/config';

export interface PortalItem {
  id: string;
  /** `access`: vigente, con credenciales; `expired`: venció hace pocos días. */
  kind: 'access' | 'expired';
  status: 'active' | 'expiring_soon' | 'expired';
  service: { name: string; iconUrl?: string };
  endDate: string;
  daysLeft: number;
  fullAccount: boolean;
  credentials?: { username?: string; password?: string };
}

export interface PortalView {
  business: { name: string; whatsapp?: string; logoUrl?: string };
  customer: { name: string };
  items: PortalItem[];
}

/** Error del portal con el código de la API (PORTAL_WRONG_PIN, …). */
export class PortalError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

// Sin apiAxiosInstance: página pública, sin la sesión ni los avisos del panel.
async function request<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, cache: 'no-store' });
  } catch {
    throw new PortalError('NETWORK');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new PortalError(
      typeof data?.code === 'string'
        ? data.code
        : response.status === 429
          ? 'RATE_LIMITED'
          : 'UNKNOWN',
    );
  }
  return data as T;
}

export const unlockPortal = (token: string, pin: string, remember: boolean) =>
  request<{ session: string }>(`/public/portal/${encodeURIComponent(token)}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin, remember }),
  });

export const fetchPortal = (session: string) =>
  request<PortalView>('/public/portal/me', { headers: { 'X-Portal-Session': session } });

/** Mensaje para el cliente final según el código de error. */
export const portalErrorMessage = (code: string) =>
  ({
    PORTAL_WRONG_PIN: 'PIN incorrecto. Revisa el mensaje de tu vendedor.',
    PORTAL_LOCKED: 'Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.',
    PORTAL_BLOCKED: 'Este link se bloqueó por seguridad. Pide uno nuevo a tu vendedor.',
    PORTAL_NOT_FOUND: 'Este link no es válido o fue reemplazado. Pide uno nuevo a tu vendedor.',
    RATE_LIMITED: 'Demasiados intentos seguidos. Espera un momento.',
    NETWORK: 'No hay conexión. Revisa tu internet e inténtalo de nuevo.',
  })[code] ?? 'No pudimos abrir tus accesos. Inténtalo de nuevo.';
