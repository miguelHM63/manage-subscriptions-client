import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';

import { apiAxiosInstance, type HttpError } from '@/api/config';

/** Igual que la API: imágenes o PDF de hasta 2 MB. */
export const RECEIPT_ACCEPT = '.jpg,.jpeg,.png,.webp,.pdf';
export const RECEIPT_MAX_BYTES = 2 * 1024 * 1024;
const RECEIPT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

/** Validación previa en el navegador (la definitiva la hace la API por contenido). */
export function receiptFileError(file: File): string | undefined {
  if (!RECEIPT_TYPES.includes(file.type)) return 'Sube una imagen (JPG, PNG o WebP) o un PDF.';
  if (file.size > RECEIPT_MAX_BYTES) return 'El archivo pesa más de 2 MB.';
  return undefined;
}

/**
 * Subir y ver el comprobante de un pago. `paymentsPath` es la ruta de la
 * colección de pagos: los del plan (del negocio o del platform-admin) o los
 * cobros de una suscripción. `invalidateKeys`: qué refrescar tras subir.
 */
export function usePlanPaymentReceipt(paymentsPath: string, invalidateKeys: QueryKey[]) {
  const queryClient = useQueryClient();

  const upload = useMutation<unknown, HttpError, { paymentId: string; file: File }>({
    mutationFn: ({ paymentId, file }) => {
      const body = new FormData();
      body.append('file', file);
      // Sin esto axios convertiría el FormData a JSON (la instancia usa JSON
      // por defecto); el navegador completa el boundary.
      return apiAxiosInstance.post(`${paymentsPath}/${paymentId}/receipt`, body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () =>
      invalidateKeys.forEach(queryKey => queryClient.invalidateQueries({ queryKey })),
  });

  /**
   * Abre el comprobante en otra pestaña con un enlace firmado de corta vida.
   * La pestaña se abre antes de pedir el enlace para que el navegador no la
   * bloquee como ventana emergente.
   */
  const open = async (paymentId: string) => {
    const tab = window.open('', '_blank');
    try {
      const { data } = await apiAxiosInstance.get<{ url: string }>(
        `${paymentsPath}/${paymentId}/receipt`,
      );
      if (tab) {
        tab.opener = null;
        tab.location.href = data.url;
      } else {
        window.location.href = data.url;
      }
    } catch {
      tab?.close();
    }
  };

  return { upload, open };
}
