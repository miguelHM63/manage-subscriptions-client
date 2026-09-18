import { useMemo } from 'react';

import { useCustomers, type ICustomer } from '@/modules/customers/hooks/use-customers';
import { useServices, type IService } from '@/modules/services/hooks/use-services';

/** Búsqueda por id de clientes y servicios (para pintar suscripciones). */
export const useLookups = () => {
  const { data: customers } = useCustomers();
  const { data: services } = useServices();

  return useMemo(() => {
    const customerMap = new Map<string, ICustomer>(customers?.map(c => [c.id, c]));
    const serviceMap = new Map<string, IService>(services?.map(s => [s.id, s]));
    return {
      customer: (id: string) => customerMap.get(id),
      service: (id: string) => serviceMap.get(id),
      customerName: (id: string) => customerMap.get(id)?.name ?? 'Cliente',
      serviceName: (id: string) => serviceMap.get(id)?.name ?? 'Servicio',
    };
  }, [customers, services]);
};
