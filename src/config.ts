export const IS_PROD = import.meta.env.PROD;
export const API_URL: string =
  (import.meta.env.VITE_PUBLIC_API as string | undefined) || 'http://localhost:4000';
export const IS_DEV = import.meta.env.DEV;

// Brandfetch Brand Search API (clientId público, seguro en el frontend).
// Crea uno gratis en https://developers.brandfetch.com
export const BRANDFETCH_CLIENT_ID: string =
  (import.meta.env.VITE_BRANDFETCH_CLIENT_ID as string | undefined) || '';

// WhatsApp de ventas (solo dígitos, con código de país). Si está, "Quiero Pro"
// abre el chat; los planes de pago se activan a mano.
export const SALES_WHATSAPP: string =
  (import.meta.env.VITE_SALES_WHATSAPP as string | undefined) || '';

// Nombre del producto que se muestra en la interfaz (logo, títulos, textos).
export const APP_NAME: string = (import.meta.env.VITE_APP_NAME as string | undefined) || 'Plancito';
