import { CheckOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

import cn from '@/helpers/cn';
import { NEW_PARAM } from '@/hooks/use-open-from-query';
import {
  CUSTOMERS_ROUTE,
  PROVIDER_ACCOUNTS_ROUTE,
  SERVICES_ROUTE,
  SUBSCRIPTIONS_ROUTE,
} from '@/routes/routes';

interface SetupChecklistProps {
  hasServices: boolean;
  hasAccounts: boolean;
  hasCustomers: boolean;
}

interface Step {
  title: string;
  description: string;
  cta: string;
  route: string;
  done: boolean;
}

/**
 * Primer uso: los 4 pasos en el orden que exige el dominio (servicio → cuenta →
 * cliente → venta). Todo se deriva de los datos; no guarda estado propio.
 * Se muestra mientras no haya ventas.
 */
export function SetupChecklist({ hasServices, hasAccounts, hasCustomers }: SetupChecklistProps) {
  const navigate = useNavigate();

  const steps: Step[] = [
    {
      title: 'Agrega los servicios que vendes',
      description: 'Netflix, Spotify, Disney+… lo que ofrezcas.',
      cta: 'Agregar servicio',
      route: SERVICES_ROUTE,
      done: hasServices,
    },
    {
      title: 'Registra una cuenta de proveedor',
      description: 'La cuenta que compras y cuántos cupos tiene.',
      cta: 'Agregar cuenta',
      route: PROVIDER_ACCOUNTS_ROUTE,
      done: hasAccounts,
    },
    {
      title: 'Agrega tu primer cliente',
      description: 'Nombre y WhatsApp, para avisarle antes de que venza.',
      cta: 'Agregar cliente',
      route: CUSTOMERS_ROUTE,
      done: hasCustomers,
    },
    {
      title: 'Registra tu primera venta',
      description: 'Asigna un cupo al cliente y define cuándo vence.',
      cta: 'Registrar venta',
      route: SUBSCRIPTIONS_ROUTE,
      done: false,
    },
  ];

  const doneCount = steps.filter(s => s.done).length;
  const nextIndex = steps.findIndex(s => !s.done);

  return (
    <section className="flex flex-col gap-3.5 md:max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-hover">
          <div
            className="h-full bg-success transition-[width]"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-content-muted">
          {doneCount} de {steps.length}
        </span>
      </div>

      <ol className="flex flex-col gap-2.5">
        {steps.map((step, i) => {
          const isNext = i === nextIndex;
          return (
            <li
              key={step.title}
              className={cn(
                'flex gap-3 rounded-xl bg-surface p-3.5',
                isNext
                  ? 'border-[1.5px] border-brand-500 shadow-[0_0_0_4px] shadow-brand-500/10'
                  : 'border border-border',
              )}
            >
              <span
                className={cn(
                  'flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                  step.done && 'bg-success text-white',
                  isNext && 'bg-brand-600 text-white',
                  !step.done && !isNext && 'border-[1.5px] border-border text-content-subtle',
                )}
              >
                {step.done ? <CheckOutlined /> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'font-semibold',
                    step.done ? 'text-content-muted line-through' : isNext ? 'text-content' : 'text-content-muted',
                  )}
                >
                  {step.title}
                </p>
                <p className="mt-0.5 text-[13px] text-content-muted">{step.description}</p>
                {isNext && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className="!mt-3 !h-10"
                    onClick={() => navigate(`${step.route}?${NEW_PARAM}=1`)}
                  >
                    {step.cta}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
