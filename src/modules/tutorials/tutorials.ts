import type { ComponentType } from 'react';

import { navLabel } from '@/components/panel/panel-nav-items';
import { PROVIDER_ACCOUNTS_ROUTE, SERVICES_ROUTE } from '@/routes/routes';
import { ADD_SERVICE_DURATION } from './compositions/add-service-script';
import { AddServiceTutorial } from './compositions/add-service-tutorial';
import { PROVIDER_ACCOUNT_DURATION } from './compositions/provider-account-script';
import { ProviderAccountTutorial } from './compositions/provider-account-tutorial';

export type TutorialVariant = 'desktop' | 'mobile';

export interface TutorialProps {
  /** Versión de la UI que se muestra; sigue al dispositivo de quien lo ve. */
  variant: TutorialVariant;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  durationInFrames: number;
  component: ComponentType<TutorialProps>;
  /** Acción real para hacerlo después de verlo. */
  cta: { label: string; to: string };
}

export const TUTORIAL_FPS = 30;

/** Tamaño de la composición: la de móvil es vertical, como la pantalla del teléfono. */
export const STAGE_SIZE: Record<TutorialVariant, { width: number; height: number }> = {
  desktop: { width: 1024, height: 640 },
  mobile: { width: 390, height: 760 },
};

// En el orden del primer uso (ver SetupChecklist): servicio → cuenta → cliente → venta.
export const TUTORIALS: Tutorial[] = [
  {
    id: 'agregar-servicio',
    title: 'Agregar un servicio',
    description:
      'Los servicios son las plataformas que vendes (Netflix, Spotify…). Es el primer paso: tus cuentas y ventas se organizan por servicio.',
    durationInFrames: ADD_SERVICE_DURATION,
    component: AddServiceTutorial,
    cta: { label: `Ir a ${navLabel(SERVICES_ROUTE)}`, to: SERVICES_ROUTE },
  },
  {
    id: 'registrar-cuenta',
    title: 'Registrar una cuenta',
    description:
      'La cuenta que compras (por ejemplo, un Netflix de 5 perfiles) se divide en cupos: uno por cliente. Indica cuántos tiene y cuánto te cuesta, y sabrás cuántos te quedan por vender.',
    durationInFrames: PROVIDER_ACCOUNT_DURATION,
    component: ProviderAccountTutorial,
    cta: { label: `Ir a ${navLabel(PROVIDER_ACCOUNTS_ROUTE)}`, to: PROVIDER_ACCOUNTS_ROUTE },
  },
];
