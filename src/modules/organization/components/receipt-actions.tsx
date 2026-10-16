import { EyeOutlined, PaperClipOutlined } from '@ant-design/icons';
import { App, Button, Upload } from 'antd';

import type { IPlanPayment } from '../hooks/use-my-organization';
import {
  RECEIPT_ACCEPT,
  receiptFileError,
  type usePlanPaymentReceipt,
} from '../hooks/use-plan-payment-receipt';

interface Props {
  payment: IPlanPayment;
  receipt: ReturnType<typeof usePlanPaymentReceipt>;
  /** El equipo siempre puede (reemplaza); el dueño solo si aún no hay. */
  canUpload: boolean;
}

/** Ver / subir / reemplazar el comprobante de un pago. */
export function ReceiptActions({ payment, receipt, canUpload }: Props) {
  const { message } = App.useApp();
  const { upload, open } = receipt;
  const uploading = upload.isPending && upload.variables?.paymentId === payment.id;

  // Upload solo elige el archivo: la subida la hace la mutación (sin la
  // petición automática de AntD).
  const onPick = (file: File) => {
    const error = receiptFileError(file);
    if (error) {
      message.error(error);
    } else {
      upload.mutate(
        { paymentId: payment.id, file },
        { onSuccess: () => message.success('Comprobante subido') },
      );
    }
    return Upload.LIST_IGNORE;
  };

  return (
    <span className="mt-1 flex flex-wrap items-center gap-x-3">
      {payment.hasReceipt && (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => open(payment.id)}
          className="!h-auto !px-0 !text-xs !font-semibold"
        >
          Ver comprobante
        </Button>
      )}
      {canUpload && (
        <Upload
          accept={RECEIPT_ACCEPT}
          showUploadList={false}
          beforeUpload={onPick}
          disabled={uploading}
        >
          <Button
            type="link"
            size="small"
            icon={<PaperClipOutlined />}
            loading={uploading}
            className="!h-auto !px-0 !text-xs !font-semibold"
          >
            {payment.hasReceipt ? 'Reemplazar' : 'Subir comprobante'}
          </Button>
        </Upload>
      )}
    </span>
  );
}
