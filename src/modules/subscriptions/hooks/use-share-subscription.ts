import { App } from 'antd';
import dayjs from 'dayjs';

import { apiAxiosInstance } from '@/api/config';
import { whatsappUrl } from '@/helpers/whatsapp';
import type { ISubscription } from './use-subscriptions';
import { useLookups } from './use-lookups';

/**
 * Comparte por WhatsApp los datos de acceso de una suscripción. Obtiene las
 * credenciales (desencriptadas) bajo demanda y abre WhatsApp con el mensaje.
 */
export const useShareSubscription = () => {
  const { message } = App.useApp();
  const { customer, service } = useLookups();

  return async (sub: ISubscription) => {
    const client = customer(sub.customerId);
    const svc = service(sub.serviceId);
    // Abrimos la ventana dentro del gesto del click para evitar bloqueo de popups.
    const win = window.open('', '_blank');
    try {
      const { data: cred } = await apiAxiosInstance.get<{
        username?: string;
        password?: string;
        notes?: string;
      }>(`/provider-accounts/${sub.providerAccountId}/credentials`);

      // Emojis vía escapes Unicode para evitar problemas de codificación del archivo.
      const wave = '\u{1F44B}';
      const userIcon = '\u{1F464}';
      const keyIcon = '\u{1F511}';
      const calendarIcon = '\u{1F4C5}';
      const noteIcon = '\u{1F4DD}';

      const lines = [
        `Hola${client?.name ? ` ${client.name}` : ''} ${wave}`,
        '',
        `Estos son los datos de tu suscripción a *${svc?.name ?? 'la plataforma'}*:`,
        `${userIcon} Usuario: ${cred.username ?? '-'}`,
        `${keyIcon} Contraseña: ${cred.password ?? '-'}`,
        `${calendarIcon} Vigencia hasta: ${dayjs(sub.endDate).format('DD/MM/YYYY')}`,
        ...(cred.notes ? ['', `${noteIcon} ${cred.notes}`] : []),
      ];
      const url = whatsappUrl(client?.phone, lines.join('\n'));

      if (win) win.location.href = url;
      else window.location.href = url;
    } catch {
      win?.close();
      message.error('No se pudieron obtener las credenciales');
    }
  };
};
