import {
  AppstoreOutlined,
  CloudServerOutlined,
  CreditCardOutlined,
  HomeOutlined,
  NotificationOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';

import {
  CUSTOMERS_ROUTE,
  DASHBOARD_ROUTE,
  PROMOTIONS_ROUTE,
  PROVIDER_ACCOUNTS_ROUTE,
  SERVICES_ROUTE,
  SUBSCRIPTIONS_ROUTE,
} from '@/routes/routes';

export interface PanelNavItem {
  to: string;
  label: string;
  icon: ReactNode;
  /** `false`: solo en la barra lateral (la barra inferior móvil ya va llena). */
  mobile?: boolean;
}

export const PANEL_NAV_ITEMS: PanelNavItem[] = [
  { to: DASHBOARD_ROUTE, label: 'Inicio', icon: <HomeOutlined /> },
  { to: CUSTOMERS_ROUTE, label: 'Clientes', icon: <TeamOutlined /> },
  {
    to: SUBSCRIPTIONS_ROUTE,
    label: 'Suscripciones',
    icon: <CreditCardOutlined />,
  },
  {
    to: PROVIDER_ACCOUNTS_ROUTE,
    label: 'Cuentas',
    icon: <CloudServerOutlined />,
  },
  { to: SERVICES_ROUTE, label: 'Servicios', icon: <AppstoreOutlined /> },
  { to: PROMOTIONS_ROUTE, label: 'Promociones', icon: <NotificationOutlined />, mobile: false },
];
