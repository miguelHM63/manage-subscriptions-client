import {
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  MoreOutlined,
  NotificationOutlined,
  PlusOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { App, Button, Dropdown, Skeleton, type MenuProps } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { EmptyState } from '@/components/panel/empty-state';
import { Fab } from '@/components/panel/fab';
import { LoadError } from '@/components/panel/load-error';
import { PageHeader } from '@/components/panel/page-header';
import { ServiceAvatar } from '@/components/panel/service-avatar';
import { APP_NAME } from '@/config';
import cn from '@/helpers/cn';
import { formatDate } from '@/helpers/dates';
import { formatMoney } from '@/helpers/money';
import { withErrorBoundary } from '@/hoc/with-error-boundary';
import { useServices } from '@/modules/services/hooks/use-services';
import { NEW_PROMOTION_ROUTE, promotionRoute } from '@/routes/routes';
import { SharePromotionModal } from '../components/share-promotion-modal';
import { StatePill } from '../components/state-pill';
import {
  useDeletePromotion,
  usePromotionAction,
  usePromotions,
  type IPromotion,
} from '../hooks/use-promotions';
import { DESIGN_OPTIONS } from '../promotion-meta';

const designLabel = (design: IPromotion['design']) =>
  DESIGN_OPTIONS.find(o => o.value === design)?.label;

function PromotionsPageComponent() {
  const navigate = useNavigate();
  const { modal } = App.useApp();
  const { data: promotions, isLoading, isError, refetch, isRefetching } = usePromotions();
  const { data: services } = useServices();
  const { mutate: runAction } = usePromotionAction();
  const { mutate: remove } = useDeletePromotion();
  const [sharing, setSharing] = useState<IPromotion | null>(null);

  const list = promotions ?? [];
  const live = list.filter(p => p.state === 'active' || p.state === 'scheduled').length;
  const openNew = () => navigate(NEW_PROMOTION_ROUTE);

  const confirmDelete = (promotion: IPromotion) =>
    modal.confirm({
      title: 'Eliminar promoción',
      content: 'El link dejará de funcionar y se pierden sus métricas.',
      okText: 'Eliminar',
      okButtonProps: { danger: true },
      cancelText: 'Cancelar',
      onOk: () => remove(promotion.id),
    });

  const menuFor = (promotion: IPromotion): MenuProps => ({
    items: [
      { key: 'edit', label: 'Editar', icon: <EditOutlined /> },
      ...(promotion.status === 'published'
        ? [{ key: 'archive', label: 'Retirar del link', icon: <InboxOutlined /> }]
        : []),
      { key: 'delete', label: 'Eliminar', icon: <DeleteOutlined />, danger: true },
    ],
    onClick: ({ key }) => {
      if (key === 'edit') navigate(promotionRoute(promotion.id));
      if (key === 'archive') runAction({ id: promotion.id, action: 'archive' });
      if (key === 'delete') confirmDelete(promotion);
    },
  });

  const card = (promotion: IPromotion) => {
    const shareable = promotion.status === 'published';
    return (
      <article
        key={promotion.id}
        className="flex min-w-0 flex-col gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate(promotionRoute(promotion.id))}
            className="min-w-0 flex-1 text-left"
          >
            <span className="flex items-center gap-2">
              <span className="truncate text-[15px] font-semibold text-content">
                {promotion.title}
              </span>
              <StatePill state={promotion.state} />
            </span>
            <span className="mt-0.5 block text-[12.5px] text-content-muted">
              <span className="font-mono font-bold text-brand-ink">{promotion.code}</span> ·{' '}
              {formatDate(promotion.startsAt, 'D MMM')} – {formatDate(promotion.endsAt, 'D MMM')} ·{' '}
              {designLabel(promotion.design)}
            </span>
          </button>
          <Dropdown trigger={['click']} menu={menuFor(promotion)}>
            <Button
              aria-label="Más acciones"
              icon={<MoreOutlined />}
              className="!h-9 !w-9 shrink-0"
            />
          </Dropdown>
        </div>

        <ul className="flex flex-col gap-1.5">
          {promotion.items.map(item => {
            const itemServices = item.serviceIds.map(sid => services?.find(s => s.id === sid));
            const stock = item.stock;
            return (
              <li key={item.id} className="flex items-center gap-2 text-[12.5px]">
                <span className="flex shrink-0 -space-x-1.5">
                  {itemServices.map((svc, i) => (
                    <ServiceAvatar
                      key={i}
                      name={svc?.name ?? ''}
                      iconUrl={svc?.iconUrl}
                      size={20}
                    />
                  ))}
                </span>
                <span className="min-w-0 flex-1 truncate text-content">
                  {item.title || itemServices.map(s => s?.name).join(' + ')}
                </span>
                <span className="shrink-0 font-mono text-[11px] font-bold text-brand-ink">
                  {item.code}
                </span>
                {stock && (
                  <span
                    className={cn(
                      'w-24 shrink-0 text-right text-xs',
                      stock.available ? 'text-content-muted' : 'font-semibold text-danger',
                    )}
                  >
                    {stock.available
                      ? item.stockLimit
                        ? `quedan ${stock.available} de ${item.stockLimit}`
                        : `quedan ${stock.available}`
                      : 'agotado'}
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        {promotion.status !== 'draft' && (
          <div className="grid grid-cols-3 divide-x divide-border rounded-lg bg-surface-muted py-2 text-center">
            <div>
              <p className="text-base font-bold text-content">{promotion.stats?.visitors ?? 0}</p>
              <p className="text-[11px] text-content-muted">visitantes</p>
            </div>
            <div>
              <p className="text-base font-bold text-content">{promotion.stats?.contacts ?? 0}</p>
              <p className="text-[11px] text-content-muted">consultas</p>
            </div>
            <div>
              <p className="text-base font-bold text-content">{promotion.stats?.sales ?? 0}</p>
              <p className="text-[11px] text-content-muted">
                {promotion.stats?.revenue
                  ? `ventas · ${formatMoney(promotion.stats.revenue)}`
                  : 'ventas'}
              </p>
            </div>
          </div>
        )}

        {shareable ? (
          <Button
            icon={<ShareAltOutlined />}
            className="!h-10"
            onClick={() => setSharing(promotion)}
          >
            Compartir link
          </Button>
        ) : (
          promotion.status === 'draft' && (
            <Button
              type="primary"
              ghost
              className="!h-10"
              onClick={() => navigate(promotionRoute(promotion.id))}
            >
              Terminar y publicar
            </Button>
          )
        )}
      </article>
    );
  };

  const renderContent = () => {
    if (isError)
      return <LoadError what="tus promociones" onRetry={() => refetch()} retrying={isRefetching} />;
    if (isLoading) {
      return (
        <div className="rounded-xl border border-border bg-surface p-3">
          <Skeleton active paragraph={{ rows: 3 }} />
        </div>
      );
    }
    if (!list.length) {
      return (
        <EmptyState
          icon={<NotificationOutlined />}
          title="Arma tu primera promoción"
          description={`Elige qué ofrecer, ponle precio y vigencia, y ${APP_NAME} te da un link para compartir por WhatsApp. Te escriben directo a ti.`}
          actions={
            <Button type="primary" size="large" block icon={<PlusOutlined />} onClick={openNew}>
              Nueva promoción
            </Button>
          }
        />
      );
    }
    return <div className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-[repeat(2,minmax(0,1fr))]">{list.map(card)}</div>;
  };

  return (
    <>
      <PageHeader
        title="Promociones"
        subtitle={
          list.length
            ? `${live} ${live === 1 ? 'activa' : 'activas'} · ${list.length} en total`
            : 'Ofertas con un link para compartir'
        }
        action={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openNew}
            className="!hidden md:!inline-flex"
          >
            Nueva promoción
          </Button>
        }
      />
      {renderContent()}
      {list.length > 0 && <Fab label="Nueva promoción" onClick={openNew} />}
      <SharePromotionModal
        promotion={sharing}
        open={Boolean(sharing)}
        onClose={() => setSharing(null)}
      />
    </>
  );
}

export const PromotionsPage = withErrorBoundary(PromotionsPageComponent);
