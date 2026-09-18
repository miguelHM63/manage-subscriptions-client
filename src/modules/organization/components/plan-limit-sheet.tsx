import { CheckOutlined, TeamOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useEffect, useState } from 'react';

import { ResponsiveModal } from '@/components/panel/responsive-modal';
import { SALES_WHATSAPP } from '@/config';
import eventBus, { EventBusTypes } from '@/event-bus';
import cn from '@/helpers/cn';
import { whatsappUrl } from '@/helpers/whatsapp';
import { PLAN_LABEL, useMyOrganization } from '../hooks/use-my-organization';
import { PLAN_OFFERS } from '../plans';

/**
 * Se abre cuando la API responde PLAN_LIMIT_REACHED (en cualquier alta de
 * cliente) y compara el plan actual con el siguiente. Los planes de pago se
 * activan a mano, así que la acción es escribir a ventas.
 */
export function PlanLimitSheet() {
  const [open, setOpen] = useState(false);
  const { data: org, refetch } = useMyOrganization();

  useEffect(() => {
    const onLimit = () => {
      refetch();
      setOpen(true);
    };
    eventBus.on(EventBusTypes.PLAN_LIMIT_REACHED, onLimit);
    return () => eventBus.off(EventBusTypes.PLAN_LIMIT_REACHED, onLimit);
  }, [refetch]);

  const currentIndex = Math.max(0, PLAN_OFFERS.findIndex(o => o.plan === (org?.plan ?? 'free')));
  const current = PLAN_OFFERS[currentIndex];
  const next = PLAN_OFFERS[currentIndex + 1];
  const max = org?.limits.maxCustomers ?? 20;

  const contactUrl = next
    ? whatsappUrl(
        SALES_WHATSAPP,
        `Hola, quiero activar el plan ${PLAN_LABEL[next.plan]} para ${org?.name ?? 'mi negocio'}.`,
      )
    : undefined;

  const offer = (o: (typeof PLAN_OFFERS)[number], highlight: boolean) => (
    <div
      className={cn(
        'flex flex-col gap-2.5 rounded-xl p-3.5',
        highlight ? 'border-[1.5px] border-brand-500 bg-brand-50 dark:bg-brand-400/10' : 'border border-border',
      )}
    >
      <div>
        <p className={cn('text-sm font-semibold', highlight ? 'text-brand-ink' : 'text-content-muted')}>
          {PLAN_LABEL[o.plan]}
        </p>
        <p className="text-2xl font-extrabold tracking-tight text-content">
          {o.price}
          {o.plan !== 'free' && <span className="text-sm font-semibold text-content-muted"> /mes</span>}
        </p>
      </div>
      <ul className="flex flex-col gap-1.5">
        {o.features.map(f => (
          <li key={f.label} className="flex gap-2 text-[13px] text-content">
            <CheckOutlined className={cn('mt-1', highlight ? 'text-success' : 'text-content-subtle')} />
            <span className={f.soon ? 'text-content-muted' : undefined}>
              {f.label}
              {f.soon && (
                <span className="ml-1.5 inline-block rounded bg-surface-hover px-1.5 text-[10px] font-bold text-content-muted">
                  Pronto
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <ResponsiveModal
      title={null}
      open={open}
      onCancel={() => setOpen(false)}
      footer={
        <div className="flex flex-col gap-1.5">
          {next && SALES_WHATSAPP ? (
            <Button type="primary" size="large" block icon={<WhatsAppOutlined />} href={contactUrl} target="_blank">
              Quiero {PLAN_LABEL[next.plan]}
            </Button>
          ) : null}
          <Button type="text" block onClick={() => setOpen(false)}>
            Ahora no
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-2xl text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
            <TeamOutlined />
          </span>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-content">Llegaste a {max} clientes</h2>
          <p className="text-sm text-content-muted">
            Es el límite del plan {PLAN_LABEL[current.plan]}. Tus datos siguen intactos
            {next ? `; para agregar más clientes, pásate a ${PLAN_LABEL[next.plan]}.` : '.'}
            {next && !SALES_WHATSAPP && ' Escríbenos para activarlo.'}
          </p>
        </div>
        {next && (
          <div className="grid grid-cols-2 gap-2.5">
            {offer(current, false)}
            {offer(next, true)}
          </div>
        )}
      </div>
    </ResponsiveModal>
  );
}
