import type { PromotionDesign, PromotionItemKind } from '../hooks/use-promotions';

export type ItemAvailability = 'available' | 'few' | 'soldout';

export interface PublicPromotionItem {
  id: string;
  /** Va en el mensaje de WhatsApp para registrar la venta (`NAVIDAD-1`). */
  code: string;
  kind: PromotionItemKind;
  title?: string;
  services: { name: string; iconUrl?: string }[];
  fullAccount: boolean;
  durationMonths: number;
  /** Céntimos. */
  price: number;
  regularPrice?: number;
  availability: ItemAvailability;
}

/** Lo que devuelve `GET /public/promotions/:slug` (y lo que arma la vista previa). */
export interface PublicPromotion {
  slug: string;
  title: string;
  description?: string;
  design: PromotionDesign;
  state: 'scheduled' | 'active' | 'ended';
  startsAt: string;
  endsAt: string;
  business: { name: string; whatsapp: string | null };
  items: PublicPromotionItem[];
}

/** Props comunes de los tres diseños del link. */
export interface PromotionDesignProps {
  promo: PublicPromotion;
  /** Abre el chat por un ítem (o general, sin ítem). */
  onContact: (item?: PublicPromotionItem) => void;
}
