import { CloseOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useState } from 'react';

import cn from '@/helpers/cn';
import { dueLabel, formatDate } from '@/helpers/dates';
import { PLAN_LABEL, useMyOrganization } from '../hooks/use-my-organization';
import { useSalesWhatsapp } from '../hooks/use-sales-whatsapp';
import { planHealth } from '../plan-status';

const DISMISS_KEY = 'plan-expiry-banner-dismissed';

const readDismissed = () => {
  try {
    return sessionStorage.getItem(DISMISS_KEY);
  } catch {
    return null;
  }
};

/**
 * Aviso en el panel cuando el plan de pago está por vencer o ya venció, con
 * acceso directo a WhatsApp para renovar (el cobro es manual). Cerrarlo vale
 * para la sesión y solo para ese estado: si pasa de "por vencer" a "vencido"
 * (o cambia la fecha), vuelve a aparecer.
 */
export function PlanExpiryBanner() {
  const { data: org } = useMyOrganization();
  const salesWhatsapp = useSalesWhatsapp();
  const [dismissed, setDismissed] = useState(readDismissed);

  if (!org) return null;
  const { health, days } = planHealth(org);
  if (health !== 'expiring' && health !== 'grace' && health !== 'expired') return null;
  const state = `${health}:${org.planValidUntil ?? ''}`;
  if (dismissed === state) return null;
  const renewUrl = salesWhatsapp('renew');

  const plan = PLAN_LABEL[org.plan];
  const date = org.planValidUntil ? formatDate(org.planValidUntil, 'D MMM') : '';
  const text =
    health === 'expiring'
      ? `Tu plan ${plan} ${dueLabel(days ?? 0).toLowerCase()} (${date}).`
      : health === 'grace'
        ? `Tu plan ${plan} venció el ${date}. Renuévalo en estos días para no volver a los límites de Free.`
        : `Tu plan ${plan} venció el ${date}. Ahora tienes los límites de Free; tus datos siguen intactos.`;

  const dismiss = () => {
    setDismissed(state);
    try {
      sessionStorage.setItem(DISMISS_KEY, state);
    } catch {
      // Sin storage: solo se oculta hasta recargar.
    }
  };

  return (
    <div
      role="status"
      className={cn(
        'mb-4 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm',
        health === 'expiring'
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200'
          : 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-200',
      )}
    >
      <p className="min-w-0 flex-1 font-medium">{text}</p>
      {renewUrl && (
        <Button
          size="small"
          icon={<WhatsAppOutlined />}
          href={renewUrl}
          target="_blank"
          className="!font-semibold"
        >
          Renovar
        </Button>
      )}
      <button
        type="button"
        aria-label="Ocultar aviso"
        onClick={dismiss}
        className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full opacity-70 hover:opacity-100"
      >
        <CloseOutlined />
      </button>
    </div>
  );
}
