import { Descriptions, Modal, Spin, Typography } from 'antd';

import { useProviderCredentials } from '../hooks/use-provider-accounts';

interface Props {
  accountId: string | null;
  open: boolean;
  onClose: () => void;
}

export function CredentialsModal({ accountId, open, onClose }: Props) {
  const { data, isLoading, isError } = useProviderCredentials(accountId, open);

  return (
    <Modal
      title="Credenciales de la cuenta"
      open={open}
      onCancel={onClose}
      footer={null}
    >
      {isLoading && (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      )}
      {isError && (
        <Typography.Text type="danger">
          No se pudieron obtener las credenciales.
        </Typography.Text>
      )}
      {data && (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Usuario">
            <Typography.Text copyable>{data.username || '—'}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Contraseña">
            <Typography.Text copyable>{data.password || '—'}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Notas">{data.notes || '—'}</Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
}
