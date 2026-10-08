import { CloseOutlined, TagOutlined } from '@ant-design/icons';
import { Alert, Button } from 'antd';

import { formatMoney } from '@/helpers/money';
import type { IPromotionSale } from '../hooks/use-promotions';

interface Props {
  sale: IPromotionSale;
  onRemove: () => void;
}

const months = (n: number) => `${n} ${n === 1 ? 'mes' : 'meses'}`;

/** Lo que se va a vender con el código: ítem, precio, reparto y lo que queda. */
export function PromoSaleSummary({ sale, onRemove }: Props) {
  const { item, stock, promotion, services } = sale;
  const bundle = services.length > 1;
  const title = item.title || services.map(s => s.name).join(' + ');

  return (
    <div className="mb-4 flex flex-col gap-2.5 rounded-xl border border-brand-300 bg-brand-50/60 p-3 dark:border-brand-400/40 dark:bg-brand-400/10">
      <div className="flex items-start gap-2.5">
        <TagOutlined className="mt-1 text-brand-ink" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-content-muted">
            {promotion.title} ·{' '}
            <span className="font-mono font-bold text-brand-ink">{item.code}</span>
          </p>
          <p className="text-[15px] font-semibold text-content">{title}</p>
          <p className="text-[12.5px] text-content-muted">
            {[
              bundle && 'Paquete',
              item.fullAccount ? 'Cuenta completa' : 'Por perfil',
              months(item.durationMonths),
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-base font-bold text-content">{formatMoney(item.price)}</p>
          {item.regularPrice && item.regularPrice > item.price && (
            <p className="text-xs text-content-subtle line-through">
              {formatMoney(item.regularPrice)}
            </p>
          )}
        </div>
        <Button
          type="text"
          size="small"
          aria-label="Quitar código"
          icon={<CloseOutlined />}
          onClick={onRemove}
        />
      </div>

      {bundle && (
        <p className="text-xs text-content-muted">
          Se registra una venta por servicio:{' '}
          {services.map(s => `${s.name} ${formatMoney(s.price)}`).join(' + ')}
        </p>
      )}

      <p className="text-xs font-semibold text-content-muted">
        {item.stockLimit
          ? `Quedan ${stock.available} de ${item.stockLimit} en esta promo`
          : `Puedes vender ${stock.available} más con tus cupos libres`}
      </p>

      {stock.available <= 0 && (
        <Alert
          type="error"
          showIcon
          title={
            stock.remainingByLimit === 0
              ? 'Esta oferta ya llegó a su límite de ventas.'
              : 'No hay cupos libres para esta oferta.'
          }
        />
      )}
      {promotion.state === 'ended' && (
        <Alert
          type="warning"
          showIcon
          title="La promoción ya terminó; puedes registrar la venta igual."
        />
      )}
    </div>
  );
}
