import {
  RotateLeftOutlined,
  RotateRightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { useState, type ReactNode } from 'react';
import Cropper, { type Area } from 'react-easy-crop';

import { ResponsiveModal } from '@/components/panel/responsive-modal';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

interface Props {
  /** URL (object URL) de la imagen elegida; el modal se monta mientras haya una. */
  src: string;
  saving: boolean;
  onCancel: () => void;
  /** Recibe la imagen y el encuadre que eligió la persona. */
  onConfirm: (crop: { src: string; area: Area; rotation: number }) => void;
}

/**
 * Ajusta la foto antes de subirla: recorte cuadrado (se ve en círculo),
 * centrado al abrir, que se mueve arrastrando. La barra gira de a 90° y
 * acerca/aleja, como la vista previa de imágenes de antd.
 */
export function LogoCropModal({ src, saving, onCancel, onConfirm }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [rotation, setRotation] = useState(0);
  const [area, setArea] = useState<Area>();

  const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

  const tool = (label: string, icon: ReactNode, onClick: () => void, disabled = false) => (
    <Tooltip title={label}>
      <Button
        type="text"
        shape="circle"
        size="large"
        aria-label={label}
        icon={icon}
        onClick={onClick}
        disabled={disabled}
      />
    </Tooltip>
  );

  return (
    <ResponsiveModal
      title="Ajusta la foto"
      open
      onCancel={onCancel}
      onOk={() => area && onConfirm({ src, area, rotation })}
      okText="Guardar"
      confirmLoading={saving}
    >
      <div className="flex flex-col gap-3">
        <div className="relative h-[min(60vh,340px)] w-full overflow-hidden rounded-lg bg-neutral-900">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setArea(pixels)}
          />
        </div>
        <div className="mx-auto flex items-center gap-1 rounded-full bg-surface-hover px-2 py-1">
          {tool('Girar a la izquierda', <RotateLeftOutlined />, () => setRotation(r => r - 90))}
          {tool('Girar a la derecha', <RotateRightOutlined />, () => setRotation(r => r + 90))}
          {tool(
            'Alejar',
            <ZoomOutOutlined />,
            () => setZoom(z => clampZoom(z - ZOOM_STEP)),
            zoom <= MIN_ZOOM,
          )}
          {tool(
            'Acercar',
            <ZoomInOutlined />,
            () => setZoom(z => clampZoom(z + ZOOM_STEP)),
            zoom >= MAX_ZOOM,
          )}
        </div>
        <p className="text-center text-xs text-content-muted">
          Arrastra para encuadrar. También puedes acercar con la rueda o con dos dedos.
        </p>
      </div>
    </ResponsiveModal>
  );
}
