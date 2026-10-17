import { CameraOutlined, DeleteOutlined } from '@ant-design/icons';
import { App, Button, Popconfirm, Upload } from 'antd';
import { isAxiosError } from 'axios';
import { useState } from 'react';

import { BusinessLogo } from '@/components/business-logo';
import { cropImage } from '../crop-image';
import { LOGO_ACCEPT, logoFileError, useOrganizationLogo } from '../hooks/use-organization-logo';
import { LogoCropModal } from './logo-crop-modal';

interface Props {
  name: string;
  logoUrl?: string;
}

/**
 * Foto o logo del negocio: se ve en el link de accesos de los clientes y en
 * las promos. Se ajusta y se guarda al momento, aparte del botón "Guardar cambios".
 */
export function BusinessLogoField({ name, logoUrl }: Props) {
  const { message } = App.useApp();
  const { upload, remove } = useOrganizationLogo();
  const busy = upload.isPending || remove.isPending;
  // Imagen elegida (object URL), pendiente de ajustar en el recortador.
  const [picked, setPicked] = useState<string>();
  const [cropping, setCropping] = useState(false);

  // Upload solo elige el archivo: se ajusta en el modal y la mutación lo sube.
  const onPick = (file: File) => {
    const error = logoFileError(file);
    if (error) message.error(error);
    else setPicked(URL.createObjectURL(file));
    return Upload.LIST_IGNORE;
  };

  const closeCrop = () => {
    if (picked) URL.revokeObjectURL(picked);
    setPicked(undefined);
  };

  const onConfirm = async ({ src, area, rotation }: Parameters<typeof cropImage>[0]) => {
    setCropping(true);
    try {
      const image = await cropImage({ src, area, rotation });
      await upload.mutateAsync(image);
      closeCrop();
      message.success('Foto actualizada');
    } catch (error) {
      // Los errores de la API ya los muestra el interceptor global.
      if (!isAxiosError(error)) {
        message.error('No se pudo procesar la imagen. Prueba con otra.');
      }
    } finally {
      setCropping(false);
    }
  };

  return (
    <div className="mb-5 flex items-center gap-4">
      {picked && (
        <LogoCropModal src={picked} saving={cropping} onCancel={closeCrop} onConfirm={onConfirm} />
      )}
      <BusinessLogo
        name={name}
        logoUrl={logoUrl}
        className="h-16 w-16 bg-brand-50 text-xl text-brand-ink dark:bg-brand-400/15"
      />
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Upload accept={LOGO_ACCEPT} showUploadList={false} beforeUpload={onPick} disabled={busy}>
            <Button icon={<CameraOutlined />} loading={upload.isPending} disabled={busy}>
              {logoUrl ? 'Cambiar foto' : 'Subir foto'}
            </Button>
          </Upload>
          {logoUrl && (
            <Popconfirm
              title="¿Quitar la foto del negocio?"
              okText="Quitar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
              onConfirm={() => remove.mutateAsync().then(() => message.success('Foto quitada'))}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                loading={remove.isPending}
                disabled={busy}
                aria-label="Quitar foto"
              />
            </Popconfirm>
          )}
        </div>
        <p className="text-xs text-content-muted">
          Tus clientes la ven en su link de accesos y en tus promos.
        </p>
      </div>
    </div>
  );
}
