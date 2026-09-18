import { CloudServerOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import { EmptyState } from './empty-state';

interface LoadErrorProps {
  what: string;
  onRetry: () => void;
  retrying?: boolean;
}

/** Error al cargar una lista: explica y ofrece reintentar (refetch). */
export function LoadError({ what, onRetry, retrying }: LoadErrorProps) {
  return (
    <EmptyState
      tone="danger"
      icon={<CloudServerOutlined />}
      title={`No pudimos cargar ${what}`}
      description="Revisa tu conexión. Tus datos están a salvo."
      actions={
        <Button size="large" icon={<ReloadOutlined />} loading={retrying} onClick={onRetry}>
          Reintentar
        </Button>
      }
    />
  );
}
