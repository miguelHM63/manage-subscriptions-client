import { WhatsAppOutlined } from '@ant-design/icons';
import type { CSSProperties } from 'react';

import cn from '@/helpers/cn';
import { APP_NAME } from '@/config';
import { ServiceStack } from './service-stack';
import { useCountdown } from './use-countdown';
import {
  bestDiscount,
  businessInitials,
  itemDetail,
  itemTitle,
  monthlyPrice,
  savings,
  shortPrice,
} from './promo-format';
import type { PromotionDesignProps, PublicPromotionItem } from './public-promotion.types';

function Countdown({ endsAt }: { endsAt: string }) {
  const { days, hours, minutes, seconds } = useCountdown(endsAt);
  const box = 'rounded-xl border border-white/15 bg-white/10 py-2.5 text-center';
  return (
    <div>
      <p className="mb-2 text-xs font-semibold tracking-wider uppercase opacity-70">Termina en</p>
      <div className="grid grid-cols-4 gap-2">
        {[
          [days, 'días'],
          [hours, 'horas'],
          [minutes, 'min'],
        ].map(([value, label]) => (
          <div key={label} className={box}>
            <div className="promo-display text-[26px] font-extrabold">{value}</div>
            <div className="text-[11px] opacity-70">{label}</div>
          </div>
        ))}
        <div className="overflow-hidden rounded-xl border border-yellow-300/45 bg-yellow-300/15 py-2.5 text-center">
          <div className="promo-display promo-tick text-[26px] font-extrabold text-yellow-300">
            {seconds}
          </div>
          <div className="text-[11px] opacity-70">seg</div>
        </div>
      </div>
    </div>
  );
}

/** Opción A · Vitrina animada: clara, con hero en movimiento y cuenta regresiva. */
export function ShowcaseDesign({ promo, onContact }: PromotionDesignProps) {
  const discount = bestDiscount(promo);
  const available = promo.items.filter(item => item.availability !== 'soldout');
  const soldOut = promo.items.filter(item => item.availability === 'soldout');
  // Se destaca el ítem disponible con más ahorro.
  const featured = [...available].sort((a, b) => savings(b) - savings(a))[0];
  const rest = available.filter(item => item !== featured);
  const logos = [
    ...new Map(promo.items.flatMap(i => i.services).map(s => [s.name, s])).values(),
  ].slice(0, 3);

  const contactButton = (item: PublicPromotionItem, label: string, compact = false) => (
    <button
      type="button"
      onClick={() => onContact(item)}
      className={cn(
        'relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-green-700 font-bold text-white transition-transform active:scale-[0.97]',
        compact
          ? 'h-12 px-4 text-[14.5px]'
          : 'h-[52px] w-full text-[15.5px] shadow-lg shadow-green-700/25',
      )}
    >
      {!compact && (
        <span className="promo-shine absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-white/0 via-white/45 to-white/0" />
      )}
      <WhatsAppOutlined className="text-lg" />
      {label}
    </button>
  );

  return (
    <div className="min-h-dvh bg-violet-50 text-slate-900">
      <header className="relative overflow-hidden bg-indigo-950 px-5 pt-7 pb-[72px] text-white">
        <div className="promo-drift-a absolute -top-20 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.9),rgba(124,58,237,0)_70%)]" />
        <div className="promo-drift-b absolute top-16 -right-28 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.75),rgba(236,72,153,0)_70%)]" />
        <div className="promo-drift-a absolute -bottom-40 left-32 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.55),rgba(56,189,248,0)_70%)]" />

        <div className="relative mx-auto max-w-md">
          {logos.map((logo, index) => (
            <span
              key={logo.name}
              className="promo-bob absolute"
              style={
                {
                  right: [6, 66, 0][index],
                  top: [56, 112, 140][index],
                  animationDelay: `${-1.2 * index}s`,
                  '--promo-tilt': `${[-12, 10, 8][index]}deg`,
                } as CSSProperties
              }
            >
              <ServiceStack
                item={{ ...promo.items[0], services: [logo] }}
                size={[46, 38, 34][index]}
                className="block rounded-xl shadow-xl"
              />
            </span>
          ))}

          <div className="relative flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/15 text-[13px] font-bold">
                {businessInitials(promo.business.name)}
              </span>
              <span className="text-[15px] font-semibold">{promo.business.name}</span>
            </div>
            <div className="max-w-[250px]">
              {discount > 0 && (
                <span className="promo-wobble mb-2.5 inline-flex h-7 items-center rounded-full bg-yellow-300 px-3 text-[13px] font-extrabold text-indigo-950">
                  Hasta {discount} % menos
                </span>
              )}
              <h1 className="promo-display text-[44px] leading-[0.98] font-extrabold tracking-tight">
                {promo.title}
              </h1>
              {promo.description && (
                <p className="mt-2.5 text-[15px] leading-relaxed opacity-85">{promo.description}</p>
              )}
            </div>
            {promo.state === 'active' && <Countdown endsAt={promo.endsAt} />}
          </div>
        </div>
      </header>

      <main className="relative mx-auto -mt-10 flex max-w-md flex-col gap-4 px-4 pb-6">
        {featured && (
          <div
            className="promo-rise relative overflow-hidden rounded-[20px] p-[2px] shadow-xl shadow-violet-900/20"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="promo-spin absolute -top-1/2 -left-1/2 h-[200%] w-[200%] bg-[conic-gradient(from_0deg,#7c3aed,#ec4899,#facc15,#38bdf8,#7c3aed)]" />
            <article className="relative flex flex-col gap-3.5 rounded-[18px] bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-6 items-center rounded-full bg-indigo-950 px-2.5 text-[11.5px] font-bold tracking-wide text-white">
                  DESTACADO
                </span>
                {featured.availability === 'few' && (
                  <span className="inline-flex items-center gap-2 text-[12.5px] font-bold text-amber-700">
                    <span className="relative h-2 w-2">
                      <span className="promo-ping absolute inset-0 rounded-full bg-amber-500" />
                      <span className="absolute inset-0 rounded-full bg-amber-500" />
                    </span>
                    Últimos cupos
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <ServiceStack item={featured} size={54} />
                <div className="min-w-0">
                  <h2 className="promo-display text-[22px] font-extrabold tracking-tight">
                    {itemTitle(featured)}
                  </h2>
                  <p className="mt-0.5 text-[13.5px] text-slate-500">{itemDetail(featured)}</p>
                </div>
              </div>
              <div className="flex items-end gap-2.5">
                <span className="promo-display text-[38px] leading-none font-extrabold tracking-tight">
                  {shortPrice(featured.price)}
                </span>
                {savings(featured) > 0 && (
                  <span className="pb-0.5">
                    <span className="block text-sm text-slate-400 line-through">
                      {shortPrice(featured.regularPrice!)}
                    </span>
                    <span className="block text-[12.5px] font-bold text-green-700">
                      Ahorras {shortPrice(savings(featured))}
                    </span>
                  </span>
                )}
              </div>
              {contactButton(featured, 'Lo quiero')}
            </article>
          </div>
        )}

        {rest.map((item, index) => (
          <article
            key={item.id}
            className="promo-rise flex flex-col gap-3.5 rounded-[20px] bg-white p-4 shadow-lg shadow-violet-900/10"
            style={{ animationDelay: `${0.25 + index * 0.15}s` }}
          >
            <div className="flex items-center gap-3">
              <ServiceStack item={item} size={50} />
              <div className="min-w-0">
                <h2 className="promo-display flex items-center gap-2 text-xl font-extrabold tracking-tight">
                  {itemTitle(item)}
                  {item.availability === 'few' && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 font-sans text-[11px] font-bold tracking-normal text-amber-700">
                      Últimos cupos
                    </span>
                  )}
                </h2>
                <p className="mt-0.5 text-[13.5px] text-slate-500">
                  {[itemDetail(item), monthlyPrice(item) && `${monthlyPrice(item)} al mes`]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-baseline gap-2">
                <span className="promo-display text-3xl font-extrabold tracking-tight">
                  {shortPrice(item.price)}
                </span>
                {savings(item) > 0 && (
                  <span className="text-sm text-slate-400 line-through">
                    {shortPrice(item.regularPrice!)}
                  </span>
                )}
              </span>
              {contactButton(item, 'Consultar', true)}
            </div>
          </article>
        ))}

        {soldOut.map(item => (
          <article
            key={item.id}
            className="promo-rise flex items-center gap-3 rounded-[20px] bg-white p-4 opacity-55"
            style={{ animationDelay: '0.5s' }}
          >
            <ServiceStack item={item} size={50} className="grayscale-[0.6]" />
            <div className="min-w-0 flex-1">
              <h2 className="promo-display text-xl font-extrabold">{itemTitle(item)}</h2>
              <p className="text-[13.5px] text-slate-500">
                {itemDetail(item)} · {shortPrice(item.price)}
              </p>
            </div>
            <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600">
              Agotado
            </span>
          </article>
        ))}

        <div className="flex flex-col items-center gap-2.5 pt-2.5 text-center">
          <span className="text-sm text-slate-500">¿Buscas otro servicio o duración?</span>
          <button
            type="button"
            onClick={() => onContact()}
            className="flex h-12 items-center gap-2 rounded-2xl border border-violet-200 bg-white px-5 text-[14.5px] font-bold text-indigo-950"
          >
            <WhatsAppOutlined className="text-lg text-green-700" />
            Escríbenos por WhatsApp
          </button>
        </div>
      </main>

      <footer className="pt-2 pb-7 text-center text-xs text-slate-400">
        Hecho con <b className="text-slate-500">{APP_NAME}</b>
      </footer>
    </div>
  );
}
