import { Button, Drawer, Modal } from 'antd';
import type { ReactNode } from 'react';

import { useIsMobile } from '@/hooks/use-is-mobile';

interface ResponsiveModalProps {
  title: ReactNode;
  open: boolean;
  onCancel: () => void;
  onOk?: () => void;
  okText?: ReactNode;
  cancelText?: ReactNode;
  confirmLoading?: boolean;
  /** `null` oculta el pie (como en Modal). */
  footer?: ReactNode | null;
  children: ReactNode;
}

/**
 * Modal en escritorio y hoja inferior (bottom sheet) en móvil, con la misma API
 * que usan los formularios del panel. En móvil la acción principal queda fija
 * abajo, al alcance del pulgar.
 */
export function ResponsiveModal({
  title,
  open,
  onCancel,
  onOk,
  okText = 'Aceptar',
  cancelText = 'Cancelar',
  confirmLoading,
  footer,
  children,
}: ResponsiveModalProps) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <Modal
        title={title}
        open={open}
        onCancel={onCancel}
        onOk={onOk}
        okText={okText}
        cancelText={cancelText}
        confirmLoading={confirmLoading}
        footer={footer}
      >
        {children}
      </Modal>
    );
  }

  const sheetFooter =
    footer === null ? null : (
      footer ?? (
        <Button type="primary" size="large" block loading={confirmLoading} onClick={onOk}>
          {okText}
        </Button>
      )
    );

  return (
    <Drawer
      title={title}
      open={open}
      onClose={onCancel}
      placement="bottom"
      size="auto"
      footer={sheetFooter}
      classNames={{ wrapper: 'panel-sheet' }}
    >
      {children}
    </Drawer>
  );
}
