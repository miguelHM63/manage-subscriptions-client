import { App, Button, Modal, Segmented } from 'antd';

import type { PromotionDesign } from '../hooks/use-promotions';
import { DESIGN_OPTIONS } from '../promotion-meta';
import { PromotionDesign as PromotionDesignView } from '../public/promotion-design';
import type { PublicPromotion } from '../public/public-promotion.types';

interface Props {
  open: boolean;
  promo: PublicPromotion;
  onClose: () => void;
  onDesignChange: (design: PromotionDesign) => void;
  onPublish: () => void;
  publishLabel?: string;
  publishing?: boolean;
}

/**
 * Vista previa del link antes de publicar: el diseño real, con sus
 * animaciones, en un marco de celular. Los botones no envían mensajes.
 */
export function PromotionPreviewModal({
  open,
  promo,
  onClose,
  onDesignChange,
  onPublish,
  publishLabel = 'Publicar',
  publishing,
}: Props) {
  const { message } = App.useApp();

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Vista previa"
      centered
      width={420}
      destroyOnHidden
      footer={
        <div className="grid grid-cols-2 gap-2.5">
          <Button size="large" onClick={onClose}>
            Seguir editando
          </Button>
          <Button size="large" type="primary" loading={publishing} onClick={onPublish}>
            {publishLabel}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <Segmented
          block
          value={promo.design}
          onChange={value => onDesignChange(value)}
          options={DESIGN_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
        />
        <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-[26px] border-[6px] border-slate-800 bg-black shadow-xl">
          <div className="flex h-6 items-center justify-center bg-slate-800 text-[10.5px] font-semibold text-slate-400">
            {window.location.host}/p/…
          </div>
          {/* `transform` hace que lo fijo (sticky/absolute) quede dentro del marco. */}
          <div className="h-[min(560px,60vh)] [transform:translateZ(0)] overflow-x-hidden overflow-y-auto">
            <div className={promo.design === 'stories' ? 'h-full' : undefined}>
              <PromotionDesignView
                promo={promo}
                onContact={() => message.info('En la vista previa los botones no envían mensajes.')}
              />
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-content-muted">
          Así la verán tus clientes. Estas visitas no cuentan en tus métricas.
        </p>
      </div>
    </Modal>
  );
}
