import dayjs from 'dayjs';

import { formatDate } from '@/helpers/dates';
import { formatMoney } from '@/helpers/money';
import type { PublicPromotion, PublicPromotionItem } from './public-promotion.types';

/** "Netflix + Max" o el título que le puso el vendedor. */
export const itemTitle = (item: PublicPromotionItem) =>
  item.title || item.services.map(s => s.name).join(' + ');

const months = (n: number) => `${n} ${n === 1 ? 'mes' : 'meses'}`;

/** "Paquete · 1 perfil en cada uno · 3 meses". */
export const itemDetail = (item: PublicPromotionItem) => {
  const bundle = item.services.length > 1;
  const what = item.fullAccount
    ? bundle
      ? 'Cuenta completa de cada uno'
      : 'Cuenta completa'
    : bundle
      ? '1 perfil en cada uno'
      : '1 perfil';
  return [bundle && 'Paquete', what, months(item.durationMonths)].filter(Boolean).join(' · ');
};

/** Precio sin decimales si son ceros: "S/ 75" · "S/ 42.50". */
export const shortPrice = (cents: number) => formatMoney(cents).replace(/[.,]00$/, '');

export const savings = (item: PublicPromotionItem) =>
  item.regularPrice && item.regularPrice > item.price ? item.regularPrice - item.price : 0;

export const discountPercent = (item: PublicPromotionItem) =>
  item.regularPrice && item.regularPrice > item.price
    ? Math.round((1 - item.price / item.regularPrice) * 100)
    : 0;

export const monthlyPrice = (item: PublicPromotionItem) =>
  item.durationMonths > 1 ? formatMoney(Math.round(item.price / item.durationMonths)) : null;

/** El mayor descuento de la promo (para la etiqueta "Hasta 12 % menos"). */
export const bestDiscount = (promo: PublicPromotion) =>
  Math.max(0, ...promo.items.map(discountPercent));

export const endDateLabel = (promo: PublicPromotion) => formatDate(promo.endsAt, 'D MMM');

/** "quedan 5 días" · "termina hoy". */
export const timeLeftLabel = (promo: PublicPromotion) => {
  const days = dayjs(promo.endsAt).startOf('day').diff(dayjs().startOf('day'), 'day');
  if (days <= 0) return 'termina hoy';
  return `${days === 1 ? 'queda' : 'quedan'} ${days} ${days === 1 ? 'día' : 'días'}`;
};

/** Mensaje que llega por WhatsApp al tocar "Consultar". */
export const contactMessage = (promo: PublicPromotion, item?: PublicPromotionItem) =>
  item
    ? `Hola, me interesa ${itemTitle(item)} (${months(item.durationMonths)}) de la promo "${promo.title}". Código: ${item.code}`
    : `Hola, vi tu promo "${promo.title}" y quiero hacer una consulta.`;

export const businessInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase() || '?';
