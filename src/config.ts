export const IS_PROD = import.meta.env.PROD;
export const API_URL: string =
  (import.meta.env.VITE_PUBLIC_API as string | undefined) || 'http://localhost:4000';
export const IS_DEV = import.meta.env.DEV;
