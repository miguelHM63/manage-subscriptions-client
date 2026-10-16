import { SALES_WHATSAPP } from '@/config';
import { whatsappUrl } from '@/helpers/whatsapp';
import { useAuth } from '@/hooks/use-auth';
import { PLAN_LABEL, useMyOrganization, type Plan } from './use-my-organization';

export type SalesTopic = 'upgrade' | 'activate' | 'renew' | 'payments';

/**
 * Enlace de WhatsApp a ventas con el mensaje ya escrito. Incluye el negocio y
 * el correo de la cuenta para ubicarla al activar el plan a mano. Devuelve
 * `undefined` si no hay número de ventas configurado.
 */
export function useSalesWhatsapp() {
  const { user } = useAuth();
  const { data: org } = useMyOrganization();

  return (topic: SalesTopic, plan?: Plan): string | undefined => {
    if (!SALES_WHATSAPP) return undefined;
    const business = `${org?.name ?? 'mi negocio'}${user?.email ? ` (${user.email})` : ''}`;
    const planName = PLAN_LABEL[plan ?? org?.plan ?? 'free'];
    const text = {
      upgrade: `Hola, quiero mejorar el plan de ${business}.`,
      activate: `Hola, quiero activar el plan ${planName} para ${business}.`,
      renew: `Hola, quiero renovar el plan ${planName} de ${business}.`,
      payments: `Hola, tengo una consulta sobre mis pagos de ${business}.`,
    }[topic];
    return whatsappUrl(SALES_WHATSAPP, text);
  };
}
