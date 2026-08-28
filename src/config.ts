export const IS_PROD = import.meta.env.PROD;
export const API_URL: string =
  (import.meta.env.VITE_PUBLIC_API as string | undefined) || 'http://localhost:4000';
export const IS_DEV = import.meta.env.DEV;

// Brandfetch Brand Search API (clientId público, seguro en el frontend).
// Crea uno gratis en https://developers.brandfetch.com
export const BRANDFETCH_CLIENT_ID: string =
  (import.meta.env.VITE_BRANDFETCH_CLIENT_ID as string | undefined) || '';
