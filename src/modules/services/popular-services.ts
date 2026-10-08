import { BRANDFETCH_CLIENT_ID } from '@/config';

export interface PopularService {
  name: string;
  domain: string;
}

// Atajos del estado vacío: los servicios más vendidos, con su dominio para el logo.
export const POPULAR_SERVICES: PopularService[] = [
  { name: 'Netflix', domain: 'netflix.com' },
  { name: 'Spotify', domain: 'spotify.com' },
  { name: 'Disney+', domain: 'disneyplus.com' },
  { name: 'Max', domain: 'max.com' },
  { name: 'Prime Video', domain: 'primevideo.com' },
  { name: 'YouTube Premium', domain: 'youtube.com' },
];

/** Logo por dominio desde el CDN de Brandfetch (solo si hay clientId). */
export const logoForDomain = (domain: string) =>
  BRANDFETCH_CLIENT_ID
    ? `https://cdn.brandfetch.io/${domain}/w/128/h/128?c=${BRANDFETCH_CLIENT_ID}`
    : undefined;
