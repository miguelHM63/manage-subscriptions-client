import { useQuery } from '@tanstack/react-query';

import { BRANDFETCH_CLIENT_ID } from '@/config';

export interface BrandResult {
  brandId: string;
  name: string;
  domain: string;
  icon?: string;
  claimed?: boolean;
}

/** La búsqueda solo está disponible si hay un clientId de Brandfetch configurado. */
export const isBrandSearchEnabled = Boolean(BRANDFETCH_CLIENT_ID);

/** Logo a usar para una marca (su icon, o el CDN de Brandfetch por dominio). */
export const brandLogoUrl = (brand: BrandResult): string =>
  brand.icon ||
  `https://cdn.brandfetch.io/${brand.domain}/w/128/h/128?c=${BRANDFETCH_CLIENT_ID}`;

export const useBrandSearch = (query: string) =>
  useQuery<BrandResult[]>({
    queryKey: ['brand-search', query],
    enabled: isBrandSearchEnabled && query.trim().length >= 2,
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const res = await fetch(
        `https://api.brandfetch.io/v2/search/${encodeURIComponent(
          query.trim(),
        )}?c=${BRANDFETCH_CLIENT_ID}`,
      );
      if (!res.ok) throw new Error('Brand search failed');
      return (await res.json()) as BrandResult[];
    },
  });
