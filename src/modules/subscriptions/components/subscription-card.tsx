import { MoreOutlined, ReloadOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { Button, Dropdown, type MenuProps } from 'antd';

import { ServiceAvatar } from '@/components/panel/service-avatar';
import cn from '@/helpers/cn';
import { daysUntil, dueShort, shortDate } from '@/helpers/dates';
import { formatMoney } from '@/helpers/money';
import type { IService } from '@/modules/services/hooks/use-services';
import type { ISubscription } from '../hooks/use-subscriptions';
import { DUE_BAR, DUE_TEXT, StatusPill } from './status-pill';

interface SubscriptionCardProps {
  subscription: ISubscription;
  customerName: string;
  service?: IService;
  menu: MenuProps;
  onRenew: () => void;
  onShare: () => void;
}

const URGENT = ['expired', 'expiring_soon'];

/** Porcentaje transcurrido del periodo actual (0–100). */
const elapsed = (start: string, end: string) => {
  const total = new Date(end).getTime() - new Date(start).getTime();
  if (total <= 0) return 100;
  const done = Date.now() - new Date(start).getTime();
  return Math.min(100, Math.max(0, Math.round((done / total) * 100)));
};

/**
 * Suscripción en móvil. Las urgentes (vencidas / por vencer) muestran las
 * acciones a la vista; el resto las tiene en el menú ⋯.
 */
export function SubscriptionCard({
  subscription: sub,
  customerName,
  service,
  menu,
  onRenew,
  onShare,
}: SubscriptionCardProps) {
  const days = daysUntil(sub.endDate);
  const urgent = URGENT.includes(sub.status);
  const inactive = sub.status === 'paused' || sub.status === 'cancelled';
  const detail = [
    service?.name ?? 'Servicio',
    sub.fullAccount ? 'Cuenta completa' : `${sub.seats} ${sub.seats === 1 ? 'cupo' : 'cupos'}`,
    formatMoney(sub.price),
  ].join(' · ');

  return (
    <article
      className={cn(
        'flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-3 shadow-sm',
        inactive && 'opacity-75',
      )}
    >
      <div className="flex items-center gap-2.5">
        <ServiceAvatar name={service?.name ?? ''} iconUrl={service?.iconUrl} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-[15px] font-semibold text-content">{customerName}</span>
            <StatusPill status={sub.status} />
          </div>
          <p className="mt-0.5 truncate text-[12.5px] text-content-muted">{detail}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className={cn('text-[13px] font-bold', DUE_TEXT[sub.status])}>
            {sub.status === 'cancelled' ? '—' : dueShort(days)}
          </p>
          <p className="mt-0.5 text-[11px] text-content-subtle">{shortDate(sub.endDate)}</p>
        </div>
        {!urgent && sub.status !== 'cancelled' && (
          <Dropdown trigger={['click']} menu={menu}>
            <Button type="text" aria-label="Más acciones" icon={<MoreOutlined />} className="!-mr-1 !h-10 !w-10" />
          </Dropdown>
        )}
      </div>

      {!inactive && (
        <div className="h-[3px] overflow-hidden rounded-full bg-surface-hover">
          <div
            className={cn('h-full', DUE_BAR[sub.status])}
            style={{ width: `${elapsed(sub.startDate, sub.endDate)}%` }}
          />
        </div>
      )}

      {urgent && (
        <div className="flex gap-2">
          <Button type="primary" icon={<ReloadOutlined />} className="!h-10 flex-1" onClick={onRenew}>
            Renovar
          </Button>
          <Button
            aria-label="Compartir por WhatsApp"
            icon={<WhatsAppOutlined />}
            className="!h-10 !w-11 !border-[#25D366] !text-[#25D366]"
            onClick={onShare}
          />
          <Dropdown trigger={['click']} menu={menu}>
            <Button aria-label="Más acciones" icon={<MoreOutlined />} className="!h-10 !w-11" />
          </Dropdown>
        </div>
      )}
    </article>
  );
}
