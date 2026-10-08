import { LoadingOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { API_URL, APP_NAME } from '@/config';
import { whatsappUrl } from '@/helpers/whatsapp';
import { contactMessage } from './promo-format';
import { PromotionDesign } from './promotion-design';
import type { PublicPromotion, PublicPromotionItem } from './public-promotion.types';

// Sin apiAxiosInstance: esta página es pública (sin token) y un 404 no debe
// mostrar el aviso de error del panel.
async function fetchPromotion(slug: string): Promise<PublicPromotion | null> {
  const response = await fetch(`${API_URL}/public/promotions/${encodeURIComponent(slug)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function recordEvent(
  slug: string,
  body: { type: 'view' | 'contact_click'; itemId?: string; source?: string },
) {
  // Las visitas del propio vendedor (con sesión en este navegador) no cuentan.
  if (localStorage.getItem('token')) return;
  fetch(`${API_URL}/public/promotions/${encodeURIComponent(slug)}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => undefined);
}

/** Link público de una promoción (`/p/:slug`), sin sesión. */
export function PublicPromotionPage() {
  const { slug = '' } = useParams();
  const [params] = useSearchParams();
  const source = params.get('src') ?? undefined;
  const {
    data: promo,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['public-promotion', slug],
    queryFn: () => fetchPromotion(slug),
    retry: 1,
  });

  const viewed = useRef(false);
  useEffect(() => {
    if (!promo || viewed.current) return;
    viewed.current = true;
    recordEvent(slug, { type: 'view', source });
  }, [promo, slug, source]);

  useEffect(() => {
    if (promo) document.title = `${promo.title} · ${promo.business.name}`;
  }, [promo]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 text-3xl text-indigo-600">
        <LoadingOutlined />
      </div>
    );
  }

  if (!promo || isError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-slate-50 px-6 text-center text-slate-900">
        <h1 className="text-xl font-bold">
          {isError ? 'No pudimos cargar la promoción' : 'Esta promoción no existe'}
        </h1>
        <p className="text-sm text-slate-500">
          {isError
            ? 'Revisa tu conexión e inténtalo de nuevo.'
            : 'Revisa que el link esté completo.'}
        </p>
        <p className="mt-6 text-xs text-slate-400">{APP_NAME}</p>
      </div>
    );
  }

  const onContact = (item?: PublicPromotionItem) => {
    recordEvent(slug, { type: 'contact_click', itemId: item?.id, source });
    window.open(
      whatsappUrl(promo.business.whatsapp ?? '', contactMessage(promo, item)),
      '_blank',
      'noopener',
    );
  };

  return (
    <div className={promo.design === 'stories' && promo.state !== 'ended' ? 'h-dvh' : undefined}>
      <PromotionDesign promo={promo} onContact={onContact} />
    </div>
  );
}
