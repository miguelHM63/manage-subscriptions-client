import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiAxiosInstance, type HttpError } from '@/api/config';
import { MY_ORGANIZATION_KEY, type IMyOrganization } from './use-my-organization';

export const LOGO_ACCEPT = '.jpg,.jpeg,.png,.webp';
const LOGO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
/** Antes de reducirla: una foto de celular puede pesar varios MB. */
const LOGO_SOURCE_MAX_BYTES = 15 * 1024 * 1024;

export function logoFileError(file: File): string | undefined {
  if (!LOGO_TYPES.includes(file.type)) return 'Sube una imagen JPG, PNG o WebP.';
  if (file.size > LOGO_SOURCE_MAX_BYTES) return 'La imagen pesa más de 15 MB.';
  return undefined;
}

/** Subir o quitar la foto del negocio; actualiza `organizations/me` al terminar. */
export function useOrganizationLogo() {
  const queryClient = useQueryClient();
  const setLogo = ({ logoUrl }: { logoUrl: string | null }) =>
    queryClient.setQueryData<IMyOrganization>(MY_ORGANIZATION_KEY, current =>
      current ? { ...current, logoUrl: logoUrl ?? undefined } : current,
    );

  /** Recibe la foto ya recortada y reducida (`cropImage`). */
  const upload = useMutation<{ logoUrl: string | null }, HttpError, Blob>({
    mutationFn: image => {
      const body = new FormData();
      body.append('file', image, `logo.${image.type === 'image/webp' ? 'webp' : 'png'}`);
      return apiAxiosInstance
        .post<{ logoUrl: string | null }>('/organizations/me/logo', body, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then(({ data }) => data);
    },
    onSuccess: setLogo,
  });

  const remove = useMutation<{ logoUrl: string | null }, HttpError, void>({
    mutationFn: () =>
      apiAxiosInstance
        .delete<{ logoUrl: string | null }>('/organizations/me/logo')
        .then(({ data }) => data),
    onSuccess: setLogo,
  });

  return { upload, remove };
}
