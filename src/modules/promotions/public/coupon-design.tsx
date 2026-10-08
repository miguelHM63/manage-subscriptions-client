import { WhatsAppOutlined } from '@ant-design/icons';

import { ServiceAvatar } from '@/components/panel/service-avatar';
import { APP_NAME } from '@/config';
import cn from '@/helpers/cn';
import { formatDate } from '@/helpers/dates';
import {
  businessInitials,
  discountPercent,
  itemDetail,
  itemTitle,
  shortPrice,
} from './promo-format';
import type { PromotionDesignProps } from './public-promotion.types';

// Color del talón del cupón, rotando entre ítems.
const STUB_COLORS = ['#facc15', '#ef4444', '#38bdf8', '#a78bfa'];
const PAGE_BG = '#0c0a14';

function Notch({ side }: { side: 'top' | 'bottom' }) {
  return (
    <span
      className="absolute -left-2.5 h-[18px] w-[18px] rounded-full"
      style={{ background: PAGE_BG, [side]: -10 }}
    />
  );
}

/** Opción B · Cupón: oscura y de alto contraste, cada ítem como un cupón. */
export function CouponDesign({ promo, onContact }: PromotionDesignProps) {
  const until = `HASTA EL ${formatDate(promo.endsAt, 'D MMM').toUpperCase()}`;
  const marquee = [promo.title.toUpperCase(), until, 'CUPOS LIMITADOS'];

  return (
    <div
      className="relative flex min-h-dvh flex-col text-stone-100"
      style={{ background: PAGE_BG }}
    >
      <div className="flex h-[38px] items-center overflow-hidden bg-yellow-400 text-[#1a1400]">
        <div className="promo-marquee flex text-[13px] font-extrabold tracking-[0.08em] whitespace-nowrap">
          {[0, 1].map(copy => (
            <span key={copy} className="flex" aria-hidden={copy === 1}>
              {marquee.map(text => (
                <span key={text} className="flex">
                  <span className="pr-7">{text}</span>
                  <span className="pr-7 opacity-50">/</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <header className="relative mx-auto w-full max-w-md overflow-hidden px-5 pt-7 pb-6">
        <div className="promo-glow absolute -top-16 -right-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(250,204,21,0.35),rgba(250,204,21,0)_70%)]" />
        <div className="relative mb-6 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#34304a] bg-[#1f1b2e] text-xs font-bold">
            {businessInitials(promo.business.name)}
          </span>
          <span className="text-sm font-semibold">{promo.business.name}</span>
        </div>
        <p className="relative text-[13px] font-bold tracking-[0.1em] text-yellow-400">
          SOLO {until}
        </p>
        <h1 className="promo-display relative mt-1.5 text-[54px] leading-[0.92] font-extrabold tracking-tight">
          {promo.title}
        </h1>
        {promo.description && (
          <p className="relative mt-3.5 max-w-[300px] text-[15px] leading-relaxed text-stone-300">
            {promo.description}
          </p>
        )}
      </header>

      <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-32">
        {promo.items.map((item, index) => {
          const soldOut = item.availability === 'soldout';
          const percent = discountPercent(item);
          const stub = STUB_COLORS[index % STUB_COLORS.length];
          return (
            <article
              key={item.id}
              className="promo-deal relative flex overflow-hidden rounded-[18px]"
              style={{
                animationDelay: `${0.15 + index * 0.15}s`,
                background: soldOut ? '#1f1b2e' : '#fff',
                color: soldOut ? '#a8a29e' : PAGE_BG,
                border: soldOut ? '1px solid #34304a' : undefined,
              }}
            >
              <div
                className="flex w-24 shrink-0 flex-col items-center justify-center px-1.5 py-3.5"
                style={{
                  background: soldOut ? '#2a2540' : stub,
                  color: soldOut ? '#a8a29e' : stub === '#facc15' ? '#1a1400' : '#fff',
                }}
              >
                {percent > 0 && !soldOut ? (
                  <>
                    <span className="text-[11px] font-extrabold tracking-[0.08em]">AHORRA</span>
                    <span className="promo-display text-4xl leading-none font-extrabold tracking-tighter">
                      {percent}%
                    </span>
                  </>
                ) : (
                  <span className="promo-display text-[26px] font-extrabold">
                    {item.durationMonths}
                    <span className="block text-center text-[11px] font-sans font-extrabold tracking-[0.08em]">
                      {item.durationMonths === 1 ? 'MES' : 'MESES'}
                    </span>
                  </span>
                )}
              </div>
              <div
                className="relative w-0 border-l-2 border-dashed"
                style={{ borderColor: soldOut ? '#34304a' : '#d6d3d1' }}
              >
                <Notch side="top" />
                <Notch side="bottom" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2.5 py-4 pr-4 pl-[18px]">
                <div>
                  {/* Logos de lo que se ofrece (en un paquete, todos). */}
                  <span className={cn('mb-2 flex -space-x-1.5', soldOut && 'opacity-60 grayscale')}>
                    {item.services.map(service => (
                      <span
                        key={service.name}
                        className="rounded-[7px]"
                        style={{ boxShadow: `0 0 0 2px ${soldOut ? '#1f1b2e' : '#fff'}` }}
                      >
                        <ServiceAvatar name={service.name} iconUrl={service.iconUrl} size={28} />
                      </span>
                    ))}
                  </span>
                  <h2 className="promo-display text-[21px] font-extrabold tracking-tight">
                    {itemTitle(item)}
                  </h2>
                  <p
                    className={soldOut ? 'mt-0.5 text-[13px]' : 'mt-0.5 text-[13px] text-stone-600'}
                  >
                    {itemDetail(item)}
                  </p>
                </div>
                {!soldOut && (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="promo-display text-[30px] font-extrabold tracking-tight">
                        {shortPrice(item.price)}
                      </span>
                      {percent > 0 && (
                        <span className="text-sm text-stone-400 line-through">
                          {shortPrice(item.regularPrice!)}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onContact(item)}
                      className="inline-flex h-11 items-center gap-1.5 self-start rounded-xl bg-yellow-400 px-4 text-sm font-extrabold text-[#1a1400]"
                    >
                      <WhatsAppOutlined />
                      Lo quiero
                    </button>
                  </>
                )}
              </div>
              {item.availability === 'few' && (
                <span
                  className="promo-stamp absolute right-2.5 bottom-4 rounded-md border-2 border-red-600 px-1.5 py-0.5 text-[10px] font-black tracking-[0.06em] text-red-600"
                  style={{ animationDelay: `${0.8 + index * 0.15}s` }}
                >
                  ÚLTIMOS CUPOS
                </span>
              )}
              {soldOut && (
                <span
                  className="promo-stamp absolute right-3 bottom-3 rounded-md border-2 border-stone-400 px-2 py-0.5 text-xs font-black tracking-[0.12em] text-stone-400"
                  style={{ animationDelay: `${0.9 + index * 0.15}s` }}
                >
                  AGOTADO
                </span>
              )}
            </article>
          );
        })}

        <p className="pt-1.5 text-center text-[13.5px] text-stone-400">
          ¿Otro servicio o duración?{' '}
          <button type="button" onClick={() => onContact()} className="font-bold text-yellow-400">
            Pregúntanos
          </button>
        </p>
        <p className="text-center text-xs text-stone-600">
          Hecho con <b className="text-stone-400">{APP_NAME}</b>
        </p>
      </main>

      <div
        className="sticky bottom-0 mt-auto px-4 pt-3.5 pb-5"
        style={{ background: `linear-gradient(180deg, rgba(12,10,20,0), ${PAGE_BG} 35%)` }}
      >
        <button
          type="button"
          onClick={() => onContact()}
          className="promo-nudge mx-auto flex h-[54px] w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-green-500 text-base font-extrabold text-green-950"
        >
          <WhatsAppOutlined className="text-lg" />
          Escríbenos por WhatsApp
        </button>
      </div>
    </div>
  );
}
