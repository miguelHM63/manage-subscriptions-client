import dayjs, { type Dayjs } from 'dayjs';

import { centsToSoles, solesToCents } from '@/helpers/money';
import type { IProviderAccount } from '@/modules/provider-accounts/hooks/use-provider-accounts';
import type { IService } from '@/modules/services/hooks/use-services';
import type {
  IPromotion,
  PromotionBody,
  PromotionDesign,
  PromotionItemKind,
} from './hooks/use-promotions';
import { availabilityFor, freeSlots } from './promotion-meta';
import type { PublicPromotion } from './public/public-promotion.types';

/** Ítem tal como se edita (precios en soles). */
export interface DraftItem {
  key: string;
  id?: string;
  /** Código del ítem ya guardado (`NAVIDAD-1`). */
  code?: string;
  sold?: number;
  kind: PromotionItemKind;
  title?: string;
  serviceIds: string[];
  fullAccount: boolean;
  durationMonths: number;
  price?: number;
  regularPrice?: number;
  stockLimit?: number;
}

export interface PromotionDraft {
  title: string;
  description: string;
  /** Vacío: se genera del título al guardar. */
  code: string;
  design: PromotionDesign;
  startsAt: Dayjs;
  endsAt: Dayjs;
  items: DraftItem[];
}

let keySeed = 0;
const newKey = () => `item-${Date.now()}-${keySeed++}`;

export const emptyItem = (serviceId?: string): DraftItem => ({
  key: newKey(),
  kind: 'single',
  serviceIds: serviceId ? [serviceId] : [],
  fullAccount: false,
  durationMonths: 1,
});

export const emptyDraft = (): PromotionDraft => ({
  title: '',
  description: '',
  code: '',
  design: 'showcase',
  startsAt: dayjs().startOf('day'),
  endsAt: dayjs().add(14, 'day').endOf('day'),
  items: [emptyItem()],
});

export const draftFromPromotion = (promotion: IPromotion): PromotionDraft => ({
  title: promotion.title,
  description: promotion.description ?? '',
  code: promotion.code ?? '',
  design: promotion.design,
  startsAt: dayjs(promotion.startsAt),
  endsAt: dayjs(promotion.endsAt),
  items: promotion.items.map(item => ({
    key: item.id ?? newKey(),
    id: item.id,
    code: item.code,
    sold: item.sold,
    kind: item.kind,
    title: item.title,
    serviceIds: item.serviceIds,
    fullAccount: item.fullAccount,
    durationMonths: item.durationMonths,
    price: centsToSoles(item.price),
    regularPrice: item.regularPrice ? centsToSoles(item.regularPrice) : undefined,
    stockLimit: item.stockLimit,
  })),
});

export const draftToBody = (draft: PromotionDraft): PromotionBody => ({
  title: draft.title.trim(),
  description: draft.description.trim() || undefined,
  code: draft.code.trim() || undefined,
  design: draft.design,
  startsAt: draft.startsAt.toISOString(),
  endsAt: draft.endsAt.toISOString(),
  items: draft.items.map(item => ({
    id: item.id,
    kind: item.kind,
    title: item.title?.trim() || undefined,
    serviceIds: item.serviceIds,
    fullAccount: item.fullAccount,
    durationMonths: item.durationMonths,
    price: solesToCents(item.price),
    regularPrice: item.regularPrice ? solesToCents(item.regularPrice) : undefined,
    stockLimit: item.stockLimit || undefined,
  })),
});

/** Ítem nuevo o con servicios, tipo o límite distintos a los guardados. */
const itemChanged = (item: DraftItem, original?: IPromotion) => {
  const saved = item.id ? original?.items.find(i => i.id === item.id) : undefined;
  if (!saved) return true;
  return (
    saved.serviceIds.length !== item.serviceIds.length ||
    saved.serviceIds.some(id => !item.serviceIds.includes(id)) ||
    saved.fullAccount !== item.fullAccount ||
    (saved.stockLimit ?? undefined) !== (item.stockLimit || undefined)
  );
};

/**
 * Qué falta para guardar (o publicar); `null` si está completo. Misma regla
 * de stock que la api: un ítem nuevo o cambiado no puede ofrecer más de lo
 * que hay en cupos libres.
 */
export const draftProblem = (
  draft: PromotionDraft,
  forPublish: boolean,
  context: { accounts: IProviderAccount[]; services: IService[]; original?: IPromotion },
): string | null => {
  if (!draft.title.trim()) return 'Ponle un título a la promoción.';
  if (!draft.endsAt.isAfter(draft.startsAt))
    return 'La promoción debe terminar después de empezar.';
  if (forPublish && !draft.items.length) return 'Agrega al menos un ítem.';
  if (forPublish && !draft.endsAt.isAfter(dayjs())) return 'La fecha de fin ya pasó.';
  for (const [index, item] of draft.items.entries()) {
    const n = index + 1;
    if (item.kind === 'bundle' ? item.serviceIds.length < 2 : item.serviceIds.length !== 1) {
      return item.kind === 'bundle'
        ? `El paquete ${n} necesita al menos dos servicios.`
        : `Elige el servicio del ítem ${n}.`;
    }
    if (!item.price || item.price <= 0) return `Ponle precio al ítem ${n}.`;
    if (!itemChanged(item, context.original)) continue;
    const free = item.serviceIds.map(id => ({
      id,
      free: freeSlots(context.accounts, id, item.fullAccount),
    }));
    const empty = free.filter(f => f.free <= 0);
    if (empty.length) {
      const names = empty.map(
        f => context.services.find(s => s.id === f.id)?.name ?? 'un servicio',
      );
      return `El ítem ${n} no tiene cupos libres de ${names.join(' ni de ')}. Agrega una cuenta con cupo o quita el servicio.`;
    }
    const maxNow = Math.min(...free.map(f => f.free));
    if (item.stockLimit && item.stockLimit - (item.sold ?? 0) > maxNow) {
      return `El ítem ${n} ofrece ${item.stockLimit - (item.sold ?? 0)} ventas, pero solo hay cupos para ${maxNow}.`;
    }
  }
  return null;
};

/** Arma lo que verá el visitante, para la vista previa (antes de guardar). */
export const draftToPublic = (
  draft: PromotionDraft,
  context: {
    businessName: string;
    whatsapp?: string;
    services: IService[];
    accounts: IProviderAccount[];
  },
): PublicPromotion => {
  const serviceById = new Map(context.services.map(s => [s.id, s]));
  const body = draftToBody(draft);
  return {
    slug: 'vista-previa',
    title: body.title || 'Tu promoción',
    description: body.description,
    design: draft.design,
    state: dayjs().isBefore(draft.startsAt) ? 'scheduled' : 'active',
    startsAt: body.startsAt,
    endsAt: body.endsAt,
    business: { name: context.businessName, whatsapp: context.whatsapp ?? null },
    items: body.items
      .filter(item => item.serviceIds.length)
      .map((item, index) => {
        let free = Math.min(
          ...item.serviceIds.map(id => freeSlots(context.accounts, id, item.fullAccount)),
        );
        if (item.stockLimit)
          free = Math.min(free, item.stockLimit - (draft.items[index]?.sold ?? 0));
        return {
          id: draft.items[index]?.key ?? String(index),
          code: draft.items[index]?.code ?? `${draft.code || 'CODIGO'}-${index + 1}`,
          kind: item.kind,
          title: item.title,
          services: item.serviceIds.map(id => ({
            name: serviceById.get(id)?.name ?? '',
            iconUrl: serviceById.get(id)?.iconUrl,
          })),
          fullAccount: item.fullAccount,
          durationMonths: item.durationMonths,
          price: item.price,
          regularPrice: item.regularPrice,
          availability: availabilityFor(free),
        };
      }),
  };
};
