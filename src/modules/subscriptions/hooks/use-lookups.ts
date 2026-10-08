import { useMemo } from 'react';

import { useCustomers, type ICustomer } from '@/modules/customers/hooks/use-customers';
import {
  useProviderAccounts,
  type IProviderAccount,
} from '@/modules/provider-accounts/hooks/use-provider-accounts';
import { useServices, type IService } from '@/modules/services/hooks/use-services';
import { formatPhone } from '@/helpers/phone';

/** Búsqueda por id de clientes, servicios y cuentas (para pintar suscripciones). */
export const useLookups = () => {
  const { data: customers } = useCustomers();
  const { data: services } = useServices();
  const { data: accounts } = useProviderAccounts();

  return useMemo(() => {
    const customerMap = new Map<string, ICustomer>(customers?.map(c => [c.id, c]));
    const serviceMap = new Map<string, IService>(services?.map(s => [s.id, s]));
    const accountMap = new Map<string, IProviderAccount>(accounts?.map(a => [a.id, a]));
    return {
      customer: (id: string) => customerMap.get(id),
      service: (id: string) => serviceMap.get(id),
      customerName: (id: string) => customerMap.get(id)?.name ?? 'Cliente',
      serviceName: (id: string) => serviceMap.get(id)?.name ?? 'Servicio',
      /** Teléfono y correo del cliente ("" si no tiene ninguno). */
      customerContact: (id: string) => {
        const c = customerMap.get(id);
        return [formatPhone(c?.phone), c?.email].filter(Boolean).join(' · ');
      },
      /** Correo/usuario de acceso de la cuenta de proveedor (o su etiqueta). */
      accountLogin: (id: string) => {
        const a = accountMap.get(id);
        return a?.username || a?.label || '';
      },
    };
  }, [customers, services, accounts]);
};
