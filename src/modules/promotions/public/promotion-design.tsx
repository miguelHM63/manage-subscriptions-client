import { ClockCircleOutlined, WhatsAppOutlined } from '@ant-design/icons';

import { APP_NAME } from '@/config';
import { formatDate } from '@/helpers/dates';
import { CouponDesign } from './coupon-design';
import { ShowcaseDesign } from './showcase-design';
import { StoriesDesign } from './stories-design';
import { businessInitials } from './promo-format';
import { useDisplayFont } from './use-display-font';
import type { PromotionDesignProps } from './public-promotion.types';
import './promo-designs.css';

/** Promo vencida o archivada: el link no se rompe y deja escribir igual. */
function EndedView({ promo, onContact }: PromotionDesignProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 text-slate-900">
      <header className="bg-indigo-600 px-5 pt-7 pb-14 text-white">
        <div className="mx-auto flex max-w-md flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-[13px] font-bold">
              {businessInitials(promo.business.name)}
            </span>
            <span className="text-[15px] font-semibold">{promo.business.name}</span>
          </div>
          <h1 className="promo-display text-[32px] leading-tight font-extrabold">{promo.title}</h1>
        </div>
      </header>
      <main className="mx-auto -mt-8 w-full max-w-md px-4">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-7 text-center shadow-sm">
          <span className="flex h-13 w-13 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-500">
            <ClockCircleOutlined />
          </span>
          <h2 className="text-[19px] font-bold">Esta promoción terminó</h2>
          <p className="text-[14.5px] leading-relaxed text-slate-500">
            Estuvo vigente hasta el {formatDate(promo.endsAt, 'D [de] MMMM')}. Escríbenos y te
            contamos qué tenemos disponible hoy.
          </p>
          <button
            type="button"
            onClick={() => onContact()}
            className="mt-1.5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-700 font-semibold text-white"
          >
            <WhatsAppOutlined className="text-lg" />
            Escribir por WhatsApp
          </button>
        </div>
      </main>
      <footer className="mt-auto py-7 text-center text-xs text-slate-400">
        Hecho con <b className="text-slate-500">{APP_NAME}</b>
      </footer>
    </div>
  );
}

/** El link público con el diseño que eligió el vendedor. */
export function PromotionDesign(props: PromotionDesignProps) {
  useDisplayFont();
  if (props.promo.state === 'ended') return <EndedView {...props} />;
  switch (props.promo.design) {
    case 'coupon':
      return <CouponDesign {...props} />;
    case 'stories':
      return <StoriesDesign {...props} />;
    default:
      return <ShowcaseDesign {...props} />;
  }
}
