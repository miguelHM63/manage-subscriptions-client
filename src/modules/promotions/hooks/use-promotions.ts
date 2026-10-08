import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiAxiosInstance, type HttpError } from '@/api/config';

export type PromotionDesign = 'showcase' | 'coupon' | 'stories';
export type PromotionItemKind = 'single' | 'bundle';
export type PromotionState = 'draft' | 'scheduled' | 'active' | 'ended' | 'archived';

/** Ventas posibles de un ítem (solo en el listado). */
export interface IItemStock {
  freeSlots: number;
  remainingByLimit: number | null;
  available: number;
  availability: 'available' | 'few' | 'soldout';
}

export interface IPromotionItem {
  id?: string;
  /** Número fijo del ítem; su código es `<código>-<número>`. */
  number?: number;
  /** Código para registrar la venta: `NAVIDAD-1`. */
  code?: string;
  /** Ventas registradas con el código. */
  sold?: number;
  stock?: IItemStock;
  kind: PromotionItemKind;
  title?: string;
  serviceIds: string[];
  fullAccount: boolean;
  durationMonths: number;
  /** Céntimos. */
  price: number;
  regularPrice?: number;
  /** Límite de ventas del ítem en la promo. */
  stockLimit?: number;
}

export interface IPromotion {
  id: string;
  title: string;
  description?: string;
  /** Código corto de la promo (`NAVIDAD`). */
  code: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  state: PromotionState;
  design: PromotionDesign;
  startsAt: string;
  endsAt: string;
  items: IPromotionItem[];
  publishedAt?: string;
  createdAt?: string;
  /** Solo en el listado. */
  stats?: { visitors: number; contacts: number; sales: number; revenue: number };
}

export interface PromotionBody {
  title: string;
  description?: string;
  code?: string;
  design: PromotionDesign;
  startsAt: string;
  endsAt: string;
  items: IPromotionItem[];
}

export interface PriceHint {
  recommended: number | null;
  minimum: number | null;
}

const KEY = ['promotions'];

export const usePromotions = () =>
  useQuery<IPromotion[], HttpError>({
    queryKey: KEY,
    queryFn: () => apiAxiosInstance.get<IPromotion[]>('/promotions').then(({ data }) => data),
  });

export const usePromotion = (id?: string) =>
  useQuery<IPromotion, HttpError>({
    queryKey: [...KEY, id],
    enabled: Boolean(id),
    queryFn: () => apiAxiosInstance.get<IPromotion>(`/promotions/${id}`).then(({ data }) => data),
  });

const useInvalidate = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: KEY });
};

/** Crea (sin id) o reemplaza (con id) una promoción. */
export const useSavePromotion = () => {
  const invalidate = useInvalidate();
  return useMutation<IPromotion, HttpError, { id?: string; body: PromotionBody }>({
    mutationFn: ({ id, body }) =>
      (id
        ? apiAxiosInstance.put<IPromotion>(`/promotions/${id}`, body)
        : apiAxiosInstance.post<IPromotion>('/promotions', body)
      ).then(({ data }) => data),
    onSuccess: () => invalidate(),
  });
};

export const usePromotionAction = () => {
  const invalidate = useInvalidate();
  return useMutation<IPromotion, HttpError, { id: string; action: 'publish' | 'archive' }>({
    mutationFn: ({ id, action }) =>
      apiAxiosInstance.post<IPromotion>(`/promotions/${id}/${action}`).then(({ data }) => data),
    onSuccess: () => invalidate(),
  });
};

export const useDeletePromotion = () => {
  const invalidate = useInvalidate();
  return useMutation<unknown, HttpError, string>({
    mutationFn: id => apiAxiosInstance.delete(`/promotions/${id}`),
    onSuccess: () => invalidate(),
  });
};

/** Precio recomendado y mínimo para un ítem (servicios + duración). */
export const usePriceHint = (serviceIds: string[], months: number, fullAccount: boolean) =>
  useQuery<PriceHint, HttpError>({
    queryKey: [...KEY, 'price-hint', serviceIds, months, fullAccount],
    enabled: serviceIds.length > 0 && months > 0,
    staleTime: 60_000,
    queryFn: () =>
      apiAxiosInstance
        .get<PriceHint>('/promotions/price-hint', {
          params: { serviceIds: serviceIds.join(','), months, fullAccount },
        })
        .then(({ data }) => data),
  });

/** Lo que carga "Nueva venta" con un código de promo. */
export interface IPromotionSale {
  promotion: { id: string; title: string; code: string; state: PromotionState; endsAt: string };
  item: {
    id: string;
    code: string;
    kind: PromotionItemKind;
    title?: string;
    fullAccount: boolean;
    durationMonths: number;
    price: number;
    regularPrice?: number;
    stockLimit?: number;
    sold: number;
  };
  stock: IItemStock;
  services: {
    serviceId: string;
    name: string;
    iconUrl?: string;
    /** Parte del precio de la promo que le toca a este servicio (céntimos). */
    price: number;
    suggestedAccountId?: string;
  }[];
}

export interface SellPromotionBody {
  code: string;
  customerId: string;
  accounts: { serviceId: string; providerAccountId: string }[];
  startDate?: string;
}

/** Busca un código de promo (`NAVIDAD-1`); sin código no consulta. */
export const usePromotionSale = (code: string) =>
  useQuery<IPromotionSale, HttpError>({
    queryKey: [...KEY, 'sale', code],
    enabled: Boolean(code),
    retry: false,
    queryFn: () =>
      apiAxiosInstance
        .get<IPromotionSale>('/promotions/sale', { params: { code } })
        .then(({ data }) => data),
  });

export const useSellPromotion = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation<unknown, HttpError, SellPromotionBody>({
    mutationFn: body => apiAxiosInstance.post('/promotions/sales', body).then(({ data }) => data),
    onSuccess: () => {
      for (const key of [KEY, ['subscriptions'], ['provider-accounts']]) {
        queryClient.invalidateQueries({ queryKey: key });
      }
      onSuccess?.();
    },
  });
};
