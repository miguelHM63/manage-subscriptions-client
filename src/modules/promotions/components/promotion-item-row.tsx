import { DeleteOutlined, EditOutlined, WarningFilled } from '@ant-design/icons';
import { Button } from 'antd';

import { ServiceAvatar } from '@/components/panel/service-avatar';
import cn from '@/helpers/cn';
import { formatMoney } from '@/helpers/money';
import type { IProviderAccount } from '@/modules/provider-accounts/hooks/use-provider-accounts';
import type { IService } from '@/modules/services/hooks/use-services';
import type { DraftItem } from '../promotion-draft';
import { freeSlots } from '../promotion-meta';

interface Props {
  item: DraftItem;
  services: IService[];
  accounts: IProviderAccount[];
  onEdit: () => void;
  onRemove: () => void;
}

const months = (n: number) => `${n} ${n === 1 ? 'mes' : 'meses'}`;

/** Ítem plegado: una fila con lo esencial; al tocarla se edita en el formulario. */
export function PromotionItemRow({ item, services, accounts, onEdit, onRemove }: Props) {
  const itemServices = item.serviceIds.map(id => services.find(s => s.id === id));
  const name =
    item.title ||
    itemServices
      .map(s => s?.name)
      .filter(Boolean)
      .join(' + ') ||
    'Sin servicio';
  const free = item.serviceIds.map(id => ({ id, free: freeSlots(accounts, id, item.fullAccount) }));
  const empty = free.filter(f => f.free <= 0).map(f => services.find(s => s.id === f.id)?.name);
  const maxNow = free.length ? Math.min(...free.map(f => f.free)) : 0;

  // Lo que falta para poder guardar, visible sin abrir el ítem.
  const problem = !item.serviceIds.length
    ? 'Elige el servicio'
    : item.kind === 'bundle' && item.serviceIds.length < 2
      ? 'Un paquete necesita dos servicios'
      : empty.length && !item.id
        ? `Sin cupos de ${empty.join(' ni de ')}`
        : !item.price
          ? 'Falta el precio'
          : item.stockLimit && item.stockLimit - (item.sold ?? 0) > maxNow
            ? `Solo hay cupos para ${maxNow}`
            : null;

  const detail = [
    item.kind === 'bundle' && 'Paquete',
    item.fullAccount ? 'Cuenta completa' : 'Por perfil',
    months(item.durationMonths),
    item.stockLimit ? `límite ${item.stockLimit}` : null,
    item.sold ? `vendidas ${item.sold}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  // Ya guardado y sin cupos ahora: no bloquea, en el link se ve "Agotado".
  const soldOut = !problem && empty.length > 0;

  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <button
        type="button"
        onClick={onEdit}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span className="flex shrink-0 -space-x-2">
          {itemServices.length ? (
            itemServices.map((svc, i) => (
              <span key={i} className="rounded-[7px] ring-2 ring-surface">
                <ServiceAvatar name={svc?.name ?? ''} iconUrl={svc?.iconUrl} size={30} />
              </span>
            ))
          ) : (
            <span className="h-[30px] w-[30px] rounded-[7px] border border-dashed border-border" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-content">{name}</span>
            {item.code && (
              <span className="shrink-0 font-mono text-[11px] font-bold text-brand-ink">
                {item.code}
              </span>
            )}
          </span>
          <span
            className={cn(
              'flex items-center gap-1.5 truncate text-xs',
              problem
                ? 'font-semibold text-danger'
                : soldOut
                  ? 'font-semibold text-amber-700 dark:text-amber-300'
                  : 'text-content-muted',
            )}
          >
            {(problem || soldOut) && <WarningFilled />}
            {problem ?? (soldOut ? `Agotado: sin cupos de ${empty.join(' ni de ')}` : detail)}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block text-sm font-bold text-content">
            {item.price ? formatMoney(Math.round(item.price * 100)) : '—'}
          </span>
          {item.regularPrice && item.price && item.regularPrice > item.price ? (
            <span className="block text-[11px] text-content-subtle line-through">
              {formatMoney(Math.round(item.regularPrice * 100))}
            </span>
          ) : null}
        </span>
      </button>
      <Button
        type="text"
        size="small"
        aria-label="Editar ítem"
        icon={<EditOutlined />}
        onClick={onEdit}
      />
      <Button
        type="text"
        size="small"
        aria-label="Quitar ítem"
        icon={<DeleteOutlined />}
        className="!text-content-subtle"
        onClick={onRemove}
      />
    </div>
  );
}
