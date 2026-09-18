import {
  CheckOutlined,
  CopyOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Button, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';

import { ResponsiveModal } from '@/components/panel/responsive-modal';
import { useProviderCredentials } from '../hooks/use-provider-accounts';

interface Props {
  accountId: string | null;
  open: boolean;
  onClose: () => void;
}

// Fila de credencial con copiar (y mostrar/ocultar si es secreta).
function CredentialRow({ label, value, secret }: { label: string; value?: string; secret?: boolean }) {
  const [visible, setVisible] = useState(!secret);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
  };

  return (
    <div className="flex items-center gap-2 border-b border-border px-3.5 py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-content-subtle">{label}</p>
        <p className="mt-0.5 truncate font-mono text-[15px] text-content">
          {value ? (visible ? value : '•'.repeat(Math.min(value.length, 12))) : '—'}
        </p>
      </div>
      {secret && value && (
        <Button
          aria-label={visible ? 'Ocultar' : 'Mostrar'}
          icon={visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          className="!h-10 !w-10"
          onClick={() => setVisible(v => !v)}
        />
      )}
      {value && (
        <Button
          aria-label={`Copiar ${label.toLowerCase()}`}
          icon={copied ? <CheckOutlined className="text-success" /> : <CopyOutlined />}
          className="!h-10 !w-10"
          onClick={copy}
        />
      )}
    </div>
  );
}

export function CredentialsModal({ accountId, open, onClose }: Props) {
  const { data, isLoading, isError } = useProviderCredentials(accountId, open);

  return (
    <ResponsiveModal title="Credenciales de la cuenta" open={open} onCancel={onClose} footer={null}>
      {isLoading && (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      )}
      {isError && (
        <Typography.Text type="danger">No se pudieron obtener las credenciales.</Typography.Text>
      )}
      {data && (
        <div className="flex flex-col gap-3 pb-2">
          <div className="overflow-hidden rounded-xl border border-border">
            <CredentialRow label="Usuario" value={data.username} />
            <CredentialRow label="Contraseña" value={data.password} secret />
            {data.notes && (
              <div className="px-3.5 py-3">
                <p className="text-xs text-content-subtle">Notas</p>
                <p className="mt-0.5 text-sm whitespace-pre-line text-content-muted">{data.notes}</p>
              </div>
            )}
          </div>
          <p className="flex items-center gap-2 text-xs text-content-subtle">
            <SafetyCertificateOutlined />
            Guardadas cifradas. Solo tú puedes verlas.
          </p>
        </div>
      )}
    </ResponsiveModal>
  );
}
