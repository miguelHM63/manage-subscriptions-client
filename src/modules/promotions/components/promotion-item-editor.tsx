import { DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import { Button, Input, InputNumber, Segmented, Select } from 'antd';
import { useState } from 'react';

import { ServiceAvatar } from '@/components/panel/service-avatar';
import cn from '@/helpers/cn';
import { centsToSoles, formatMoney } from '@/helpers/money';
import type { IProviderAccount } from '@/modules/provider-accounts/hooks/use-provider-accounts';
import type { IService } from '@/modules/services/hooks/use-services';
import { DURATION_OPTIONS } from '@/modules/subscriptions/subscription-meta';
import { usePriceHint } from '../hooks/use-promotions';
import { freeSlots } from '../promotion-meta';
import type { DraftItem } from '../promotion-draft';

interface Props {
  item: DraftItem;
  index: number;
  services: IService[];
  accounts: IProviderAccount[];
  onChange: (item: DraftItem) => void;
  onRemove: () => void;
  /** Pliega el ítem (vuelve a la lista). */
  onDone: () => void;
}

const PRESETS = DURATION_OPTIONS.map(o => o.value);

/** Un ítem de la promo: servicio(s), duración, precio y su precio recomendado. */
export function PromotionItemEditor({
  item,
  index,
  services,
  accounts,
  onChange,
  onRemove,
  onDone,
}: Props) {
  const [customDuration, setCustomDuration] = useState(!PRESETS.includes(item.durationMonths));
  const set = (patch: Partial<DraftItem>) => onChange({ ...item, ...patch });
  const isBundle = item.kind === 'bundle';

  const { data: hint } = usePriceHint(item.serviceIds, item.durationMonths, item.fullAccount);
  const minimum = hint?.minimum ?? null;
  const recommended = hint?.recommended ?? null;
  const priceCents = Math.round((item.price ?? 0) * 100);
  const margin = minimum !== null && item.price ? priceCents - minimum : null;

  const serviceName = (id: string) => services.find(s => s.id === id)?.name ?? '';
  const free = item.serviceIds.map(id => ({ id, free: freeSlots(accounts, id, item.fullAccount) }));
  // Lo que se puede vender hoy con los cupos libres (un paquete: el que menos tiene).
  const maxNow = free.length ? Math.min(...free.map(f => f.free)) : 0;
  const sold = item.sold ?? 0;
  const emptyServices = free.filter(f => f.free <= 0).map(f => serviceName(f.id));
  const noStock = emptyServices.length > 0;
  const overStock =
    item.stockLimit !== undefined && item.serviceIds.length > 0 && item.stockLimit - sold > maxNow;
  const serviceOptions = services.map(s => ({
    value: s.id,
    label: (
      <span className="flex items-center gap-2">
        <ServiceAvatar name={s.name} iconUrl={s.iconUrl} size={20} />
        {s.name}
      </span>
    ),
    searchLabel: s.name,
  }));

  return (
    <article className="flex flex-col gap-3.5 rounded-xl border-2 border-brand-500/60 bg-surface p-3.5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold tracking-wider text-content-subtle uppercase">
          Ítem {index + 1}
        </span>
        {item.code && (
          <span className="rounded-md bg-brand-50 px-1.5 py-0.5 font-mono text-[11px] font-bold text-brand-ink dark:bg-brand-400/15">
            {item.code}
          </span>
        )}
        <Segmented
          size="small"
          value={item.kind}
          onChange={kind =>
            set({
              kind: kind as DraftItem['kind'],
              serviceIds: kind === 'single' ? item.serviceIds.slice(0, 1) : item.serviceIds,
            })
          }
          options={[
            { label: 'Individual', value: 'single' },
            { label: 'Paquete', value: 'bundle' },
          ]}
        />
        <Button
          type="text"
          aria-label="Quitar ítem"
          icon={<DeleteOutlined />}
          className="!ml-auto !text-content-subtle"
          onClick={onRemove}
        />
        <Button size="small" type="primary" ghost onClick={onDone}>
          Listo
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-content">
          {isBundle ? 'Servicios del paquete' : 'Servicio'}
        </span>
        <Select
          mode={isBundle ? 'multiple' : undefined}
          maxCount={isBundle ? 5 : undefined}
          placeholder={isBundle ? 'Elige dos o más servicios' : 'Elige un servicio'}
          value={isBundle ? item.serviceIds : item.serviceIds[0]}
          onChange={(value: string | string[]) =>
            set({ serviceIds: Array.isArray(value) ? value : [value] })
          }
          options={serviceOptions}
          optionFilterProp="searchLabel"
          showSearch
          className="w-full"
        />
        {free.length > 0 && (
          <span className="text-xs text-content-muted">
            {free
              .map(
                f =>
                  `${f.free} ${item.fullAccount ? 'cuenta(s) libre(s)' : f.free === 1 ? 'cupo libre' : 'cupos libres'} de ${serviceName(f.id)}`,
              )
              .join(' · ')}
          </span>
        )}
      </div>

      {isBundle && (
        <Input
          placeholder="Nombre del paquete (opcional). Ej.: Combo cine"
          value={item.title}
          maxLength={60}
          onChange={e => set({ title: e.target.value })}
        />
      )}

      <Segmented
        block
        value={item.fullAccount ? 'full' : 'profile'}
        onChange={value => set({ fullAccount: value === 'full' })}
        options={[
          { label: 'Por perfil', value: 'profile' },
          { label: 'Cuenta completa', value: 'full' },
        ]}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-content">Duración (meses)</span>
        <Segmented
          block
          value={customDuration ? 'custom' : item.durationMonths}
          onChange={value => {
            if (value === 'custom') {
              setCustomDuration(true);
              return;
            }
            setCustomDuration(false);
            set({ durationMonths: Number(value) });
          }}
          options={[
            ...PRESETS.map(v => ({ value: v, label: String(v) })),
            { value: 'custom', label: 'Otro' },
          ]}
        />
        {customDuration && (
          <InputNumber
            min={1}
            max={36}
            precision={0}
            value={item.durationMonths}
            onChange={value => set({ durationMonths: value ?? 1 })}
            suffix={item.durationMonths === 1 ? 'mes' : 'meses'}
            className="!w-full"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-content">Precio promo</span>
          <InputNumber
            min={0}
            step={0.5}
            precision={2}
            prefix="S/"
            placeholder="0.00"
            value={item.price}
            onChange={value => set({ price: value ?? undefined })}
            className="!w-full"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-content">
            Precio normal <span className="font-normal text-content-subtle">(opcional)</span>
          </span>
          <InputNumber
            min={0}
            step={0.5}
            precision={2}
            prefix="S/"
            placeholder="Tachado"
            value={item.regularPrice}
            onChange={value => set({ regularPrice: value ?? undefined })}
            className="!w-full"
          />
        </label>
      </div>

      {item.serviceIds.length > 0 && (recommended !== null || minimum !== null) && (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-surface-muted px-3 py-2.5">
          <div className="text-[12.5px] leading-snug text-content-muted">
            {recommended !== null && (
              <>
                Recomendado <b className="text-content">{formatMoney(recommended)}</b>
              </>
            )}
            {minimum !== null && <> · mínimo {formatMoney(minimum)}</>}
            {margin !== null && margin >= 0 && (
              <span className="block font-semibold text-success">
                Ganas {formatMoney(margin)} por venta
              </span>
            )}
          </div>
          {recommended !== null && priceCents !== recommended && (
            <Button size="small" onClick={() => set({ price: centsToSoles(recommended) })}>
              Usar {formatMoney(recommended)}
            </Button>
          )}
        </div>
      )}
      {item.serviceIds.length > 0 && minimum === null && hint && (
        <p className="text-xs text-content-muted">
          Agrega costo y vencimiento a tus cuentas de este servicio para calcular el precio mínimo.
        </p>
      )}
      {margin !== null && margin < 0 && (
        <p className="flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-2 text-[12.5px] font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
          <WarningOutlined />
          Bajo el mínimo ({formatMoney(minimum!)}): pierdes {formatMoney(-margin)} por venta
        </p>
      )}

      <label className="flex items-center justify-between gap-3">
        <span>
          <span className="block text-[13px] font-semibold text-content">Límite de ventas</span>
          <span
            className={cn(
              'block text-xs',
              noStock ? 'font-semibold text-danger' : 'text-content-muted',
            )}
          >
            {item.serviceIds.length
              ? `Hoy puedes ofrecer hasta ${maxNow}${sold ? ` · vendidas ${sold}` : ''}`
              : 'Opcional: cuántas vendes en la promo'}
          </span>
        </span>
        <InputNumber
          min={Math.max(1, sold)}
          precision={0}
          placeholder="Sin límite"
          value={item.stockLimit}
          onChange={value => set({ stockLimit: value ?? undefined })}
          className="!w-32"
        />
      </label>
      {noStock ? (
        <p className="-mt-1.5 text-xs font-semibold text-danger">
          Sin cupos libres de {emptyServices.join(' ni de ')}: agrega una cuenta con cupo o quita el
          servicio para poder guardar.
        </p>
      ) : (
        overStock && (
          <p className="-mt-1.5 text-xs font-semibold text-danger">
            Solo hay cupos para {maxNow} {maxNow === 1 ? 'venta' : 'ventas'}: baja el límite o
            agrega cupos para poder guardar.
          </p>
        )
      )}
    </article>
  );
}
