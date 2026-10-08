import dayjs from 'dayjs';

import type { IProviderAccount } from '@/modules/provider-accounts/hooks/use-provider-accounts';
import type { IPromotion, PromotionDesign, PromotionState } from './hooks/use-promotions';
import type { ItemAvailability } from './public/public-promotion.types';

export const PROMOTIONS_TONE = {
  neutral: 'bg-surface-hover text-content-muted',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
};

export const STATE_META: Record<
  PromotionState,
  { label: string; tone: keyof typeof PROMOTIONS_TONE }
> = {
  draft: { label: 'Borrador', tone: 'neutral' },
  scheduled: { label: 'Programada', tone: 'info' },
  active: { label: 'Publicada', tone: 'success' },
  ended: { label: 'Terminó', tone: 'danger' },
  archived: { label: 'Archivada', tone: 'neutral' },
};

export const DESIGN_OPTIONS: { value: PromotionDesign; label: string; hint: string }[] = [
  { value: 'showcase', label: 'Vitrina', hint: 'Clara y animada' },
  { value: 'coupon', label: 'Cupón', hint: 'Oscura, de oferta' },
  { value: 'stories', label: 'Historias', hint: 'Como Estados' },
];

/** Dónde se comparte el link: agrega `?src=` para medir de dónde llegan. */
export const SHARE_SOURCES = [
  { value: 'estados', label: 'Estados de WhatsApp' },
  { value: 'grupos', label: 'Grupos' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
];

export const publicPromotionUrl = (promotion: Pick<IPromotion, 'slug'>, source?: string) =>
  `${window.location.origin}/p/${promotion.slug}${source ? `?src=${source}` : ''}`;

/** Cupos libres de un servicio en cuentas vigentes (o cuentas completas libres). */
export const freeSlots = (accounts: IProviderAccount[], serviceId: string, fullAccount: boolean) =>
  accounts
    .filter(a => a.serviceId === serviceId && (!a.expiresAt || dayjs(a.expiresAt).isAfter(dayjs())))
    .reduce((total, a) => total + (fullAccount ? Number(a.usedSlots === 0) : a.availableSlots), 0);

/** Misma regla que el backend (promotion-availability.service). */
export const availabilityFor = (free: number): ItemAvailability =>
  free <= 0 ? 'soldout' : free <= 2 ? 'few' : 'available';

export interface PromoImpact {
  title: string;
  code: string;
  /** Ventas posibles después de esta venta. */
  after: number;
  /** Lo que la promo aún ofrece por su límite (null = sin límite). */
  promised: number | null;
}

/**
 * Promos a las que una venta normal (fuera de la promo) les quita capacidad:
 * los cupos son de todos, así que vender por separado puede dejar a una
 * oferta sin cupo para cumplir lo que ofrece.
 */
export const promoImpacts = (
  promotions: IPromotion[],
  accounts: IProviderAccount[],
  accountId: string,
  fullAccount: boolean,
): PromoImpact[] => {
  const account = accounts.find(a => a.id === accountId);
  if (!account) return [];
  const seats = fullAccount ? account.capacity : 1;
  const after = accounts.map(a =>
    a.id === accountId
      ? {
          ...a,
          usedSlots: a.usedSlots + seats,
          availableSlots: Math.max(a.availableSlots - seats, 0),
        }
      : a,
  );

  return promotions
    .filter(p => p.state === 'active' || p.state === 'scheduled')
    .flatMap(promotion =>
      promotion.items
        .filter(item => item.serviceIds.includes(account.serviceId) && item.stock)
        .map(item => {
          const stock = item.stock!;
          const free = Math.min(
            ...item.serviceIds.map(id => freeSlots(after, id, item.fullAccount)),
          );
          const left = Math.max(Math.min(free, stock.remainingByLimit ?? Infinity), 0);
          return {
            title: promotion.title,
            code: item.code ?? promotion.code,
            before: stock.available,
            after: left,
            promised: stock.remainingByLimit,
          };
        })
        // Avisa solo si la oferta ya no alcanza para lo que promete (o se agota).
        .filter(
          i => i.after < i.before && (i.promised === null ? i.after === 0 : i.after < i.promised),
        )
        .map(i => ({ title: i.title, code: i.code, after: i.after, promised: i.promised })),
    );
};
