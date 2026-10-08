import {
  CheckCircleFilled,
  CopyOutlined,
  ExportOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import { App, Button, Input } from 'antd';
import { useState } from 'react';

import { ResponsiveModal } from '@/components/panel/responsive-modal';
import cn from '@/helpers/cn';
import { formatDate } from '@/helpers/dates';
import { whatsappUrl } from '@/helpers/whatsapp';
import type { IPromotion } from '../hooks/use-promotions';
import { SHARE_SOURCES, publicPromotionUrl } from '../promotion-meta';

interface Props {
  promotion: IPromotion | null;
  open: boolean;
  onClose: () => void;
  /** Recién publicada: muestra el mensaje de éxito. */
  justPublished?: boolean;
}

/** Link de la promo listo para copiar o compartir, con el origen para las métricas. */
export function SharePromotionModal({ promotion, open, onClose, justPublished }: Props) {
  const { message } = App.useApp();
  const [source, setSource] = useState<string | undefined>(SHARE_SOURCES[0].value);
  if (!promotion) return null;

  const url = publicPromotionUrl(promotion, source);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      message.success('Link copiado');
    } catch {
      message.error('No se pudo copiar; selecciónalo y cópialo a mano.');
    }
  };

  return (
    <ResponsiveModal
      title={promotion.title}
      open={open}
      onCancel={onClose}
      footer={
        <Button
          type="primary"
          size="large"
          block
          icon={<WhatsAppOutlined />}
          href={whatsappUrl(undefined, `${promotion.title}: ${url}`)}
          target="_blank"
          className="!bg-green-700 hover:!bg-green-600"
        >
          Compartir por WhatsApp
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        {justPublished && (
          <div className="flex items-center gap-3">
            <CheckCircleFilled className="text-3xl text-success" />
            <div>
              <p className="text-base font-bold text-content">Tu promo está publicada</p>
              <p className="text-sm text-content-muted">
                Visible del {formatDate(promotion.startsAt, 'D MMM')} al{' '}
                {formatDate(promotion.endsAt, 'D MMM')}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-content">¿Dónde la vas a compartir?</span>
          <div role="radiogroup" className="flex flex-wrap gap-2">
            {SHARE_SOURCES.map(option => {
              const selected = option.value === source;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setSource(selected ? undefined : option.value)}
                  className={cn(
                    'h-9 rounded-full border px-3.5 text-[13px] font-semibold transition-colors',
                    selected
                      ? 'border-brand-500 bg-brand-50 text-brand-ink dark:bg-brand-400/15'
                      : 'border-border bg-surface text-content',
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <span className="text-xs text-content-subtle">
            Así sabrás de dónde llegan tus visitas.
          </span>
        </div>

        <div className="flex gap-2">
          <Input readOnly value={url} size="large" onFocus={e => e.target.select()} />
          <Button size="large" icon={<CopyOutlined />} onClick={copy}>
            Copiar
          </Button>
        </div>

        <Button
          type="link"
          icon={<ExportOutlined />}
          href={url}
          target="_blank"
          className="!self-center"
        >
          Ver cómo la ven tus clientes
        </Button>
      </div>
    </ResponsiveModal>
  );
}
