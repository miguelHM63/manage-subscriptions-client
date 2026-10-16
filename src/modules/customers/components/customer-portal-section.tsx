import { KeyOutlined, LinkOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { App, Button, Skeleton, Typography } from 'antd';

import { formatDate } from '@/helpers/dates';
import { whatsappUrl } from '@/helpers/whatsapp';
import { useMyOrganization } from '@/modules/organization/hooks/use-my-organization';
import {
  portalUrl,
  useCustomerPortal,
  useDisableCustomerPortal,
  useRegenerateCustomerPortal,
  useRegenerateCustomerPortalPin,
} from '../hooks/use-customer-portal';
import type { ICustomer } from '../hooks/use-customers';

/**
 * Link de accesos del cliente: un link personal + PIN de 6 dígitos donde ve
 * solo sus plataformas vigentes. El PIN se manda en un mensaje aparte.
 */
export function CustomerPortalSection({ customer }: { customer: ICustomer }) {
  const { modal } = App.useApp();
  const { data: portal, isLoading } = useCustomerPortal(customer.id);
  const { data: org } = useMyOrganization();
  const regenerate = useRegenerateCustomerPortal(customer.id);
  const regeneratePin = useRegenerateCustomerPortalPin(customer.id);
  const disable = useDisableCustomerPortal(customer.id);
  const busy = regenerate.isPending || regeneratePin.isPending || disable.isPending;

  const title = (
    <h3 className="mb-2 text-[11px] font-semibold tracking-wider text-content-subtle uppercase">
      Link de accesos
    </h3>
  );

  if (isLoading) {
    return (
      <section>
        {title}
        <Skeleton active paragraph={{ rows: 2 }} />
      </section>
    );
  }

  if (!portal?.enabled || !portal.token || !portal.pin) {
    return (
      <section>
        {title}
        <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border px-4 py-4">
          <p className="text-sm text-content-muted">
            Un link personal donde {customer.name} ve sus plataformas vigentes (usuario, contraseña
            y vencimiento), protegido con un PIN. Si cambias una contraseña, el link muestra la
            nueva.
          </p>
          <Button icon={<LinkOutlined />} loading={busy} onClick={() => regenerate.mutate()}>
            Crear link de accesos
          </Button>
        </div>
      </section>
    );
  }

  const url = portalUrl(portal.token);
  const business = org?.name ?? 'tu proveedor';
  const linkMessage = `Hola ${customer.name}, aquí puedes ver tus accesos de ${business}: ${url}\nTe envío el PIN en un mensaje aparte.`;
  const pinMessage = `Tu PIN para ver tus accesos: ${portal.pin}`;

  const confirmRegenerate = () =>
    modal.confirm({
      title: 'Regenerar link de accesos',
      content: 'El link y el PIN actuales dejarán de funcionar. Tendrás que enviarle los nuevos.',
      okText: 'Regenerar',
      cancelText: 'Cancelar',
      onOk: () => regenerate.mutateAsync(),
    });

  const confirmRegeneratePin = () =>
    modal.confirm({
      title: 'Cambiar PIN',
      content:
        'El link sigue siendo el mismo, pero el PIN actual dejará de funcionar y se cerrarán las sesiones abiertas. Tendrás que enviarle el PIN nuevo.',
      okText: 'Cambiar PIN',
      cancelText: 'Cancelar',
      onOk: () => regeneratePin.mutateAsync(),
    });

  const confirmDisable = () =>
    modal.confirm({
      title: 'Desactivar link de accesos',
      content: `${customer.name} ya no podrá ver sus accesos con el link.`,
      okText: 'Desactivar',
      okButtonProps: { danger: true },
      cancelText: 'Cancelar',
      onOk: () => disable.mutateAsync(),
    });

  return (
    <section>
      {title}
      <div className="flex flex-col gap-3 rounded-xl border border-border px-3.5 py-3">
        {portal.blocked ? (
          <p className="rounded-lg bg-red-100 px-3 py-2 text-xs font-medium text-red-700 dark:bg-red-500/15 dark:text-red-300">
            Bloqueado por demasiados PIN incorrectos. Cambia el PIN o regenera el link para
            reactivarlo.
          </p>
        ) : portal.lockedUntil ? (
          <p className="rounded-lg bg-amber-100 px-3 py-2 text-xs font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-200">
            Pausado hasta las {formatDate(portal.lockedUntil, 'HH:mm')} por PIN incorrectos.
          </p>
        ) : null}

        <div className="flex items-center gap-2 text-sm">
          <LinkOutlined className="text-content-subtle" />
          <Typography.Text
            className="min-w-0 flex-1 !text-content-muted"
            ellipsis
            copyable={{ text: url, tooltips: ['Copiar link', 'Link copiado'] }}
          >
            {url.replace(/^https?:\/\//, '')}
          </Typography.Text>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <KeyOutlined className="text-content-subtle" />
          <span className="text-content-muted">PIN</span>
          <Typography.Text
            className="font-mono !text-base font-semibold tracking-[0.25em] !text-content"
            copyable={{ text: portal.pin, tooltips: ['Copiar PIN', 'PIN copiado'] }}
          >
            {portal.pin}
          </Typography.Text>
        </div>
        <p className="text-xs text-content-subtle">
          {portal.lastAccessAt
            ? `Último acceso: ${formatDate(portal.lastAccessAt, 'D MMM, HH:mm')}`
            : 'Aún no lo abre'}
        </p>

        {customer.phone && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              href={whatsappUrl(customer.phone, linkMessage)}
              target="_blank"
              icon={<WhatsAppOutlined />}
            >
              Enviar link
            </Button>
            <Button
              href={whatsappUrl(customer.phone, pinMessage)}
              target="_blank"
              icon={<WhatsAppOutlined />}
            >
              Enviar PIN
            </Button>
          </div>
        )}
        <div className="flex gap-4">
          <Button
            type="link"
            size="small"
            className="!px-0"
            disabled={busy}
            onClick={confirmRegeneratePin}
          >
            Cambiar PIN
          </Button>
          <Button
            type="link"
            size="small"
            className="!px-0"
            disabled={busy}
            onClick={confirmRegenerate}
          >
            Regenerar link
          </Button>
          <Button
            type="link"
            size="small"
            danger
            className="!px-0"
            disabled={busy}
            onClick={confirmDisable}
          >
            Desactivar
          </Button>
        </div>
      </div>
    </section>
  );
}
