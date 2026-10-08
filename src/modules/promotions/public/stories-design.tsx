import { RightOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

import cn from '@/helpers/cn';
import { ServiceStack } from './service-stack';
import {
  businessInitials,
  endDateLabel,
  itemDetail,
  itemTitle,
  monthlyPrice,
  savings,
  shortPrice,
} from './promo-format';
import type { PromotionDesignProps, PublicPromotionItem } from './public-promotion.types';

const SLIDE_MS = 5000;
const GRADIENTS = [
  'linear-gradient(165deg, #450a0a, #b91c1c 40%, #6d28d9 85%)',
  'linear-gradient(165deg, #1c0505, #dc2626 55%, #f97316)',
  'linear-gradient(165deg, #052e16, #15803d 50%, #0ea5e9)',
  'linear-gradient(165deg, #1e1b4b, #7c3aed 50%, #ec4899)',
];

type Slide = { kind: 'intro' } | { kind: 'item'; item: PublicPromotionItem } | { kind: 'outro' };

const ctaClass =
  'promo-up relative z-10 flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-white text-base font-extrabold text-green-700 shadow-xl';

/** Opción C · Historias: pantalla completa, una oferta por historia, como los Estados. */
export function StoriesDesign({ promo, onContact }: PromotionDesignProps) {
  const items = promo.items.filter(item => item.availability !== 'soldout');
  const slides: Slide[] = [
    { kind: 'intro' },
    ...items.map(item => ({ kind: 'item' as const, item })),
    { kind: 'outro' },
  ];
  // Un logo por servicio (sin repetir) para la portada.
  const logos = [...new Map(items.flatMap(i => i.services).map(s => [s.name, s])).values()].slice(
    0,
    4,
  );
  const [index, setIndex] = useState(0);
  const last = slides.length - 1;

  // Avanza sola; cada cambio de historia (también al tocar) reinicia la cuenta.
  useEffect(() => {
    if (index >= last) return;
    const timer = setTimeout(() => setIndex(index + 1), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [index, last]);

  const go = (step: number) => setIndex(current => Math.min(last, Math.max(0, current + step)));

  const slide = slides[index];
  const itemNumber = slide.kind === 'item' ? items.indexOf(slide.item) : 0;
  const background =
    slide.kind === 'intro'
      ? 'linear-gradient(160deg, #312e81, #7c3aed 45%, #db2777 80%, #f59e0b)'
      : slide.kind === 'outro'
        ? 'linear-gradient(165deg, #0f172a, #312e81 60%, #4f46e5)'
        : GRADIENTS[itemNumber % GRADIENTS.length];

  return (
    <div className="relative h-full min-h-[560px] overflow-hidden bg-[#0c0a14] text-white">
      {/* `key` remonta la historia: así sus animaciones de entrada se repiten. */}
      <div
        key={index}
        className="promo-pan absolute inset-0 mx-auto flex max-w-md flex-col"
        style={{ backgroundImage: background }}
      >
        {slide.kind === 'intro' && (
          <div className="flex flex-1 flex-col justify-center gap-4 px-7">
            <p
              className="promo-up text-sm font-semibold opacity-85"
              style={{ animationDelay: '0.1s' }}
            >
              {promo.business.name} presenta
            </p>
            <h1
              className="promo-display promo-up text-[64px] leading-[0.9] font-extrabold tracking-tight"
              style={{ animationDelay: '0.2s' }}
            >
              {promo.title}
            </h1>
            <p
              className="promo-up text-[17px] font-semibold opacity-90"
              style={{ animationDelay: '0.35s' }}
            >
              {items.length} {items.length === 1 ? 'oferta' : 'ofertas'} · solo hasta el{' '}
              {endDateLabel(promo)}
            </p>
            <div className="mt-2 flex gap-2.5">
              {logos.map((logo, i) => (
                <span
                  key={logo.name}
                  className="promo-zoom"
                  style={{ animationDelay: `${0.5 + i * 0.12}s` }}
                >
                  <ServiceStack item={{ ...items[0], services: [logo] }} size={58} />
                </span>
              ))}
            </div>
            <p
              className="promo-up absolute inset-x-0 bottom-14 flex justify-center text-sm font-semibold"
              style={{ animationDelay: '0.9s' }}
            >
              <span className="promo-hint flex items-center gap-1.5">
                Toca para ver las ofertas <RightOutlined />
              </span>
            </p>
          </div>
        )}

        {slide.kind === 'item' && (
          <div className="flex flex-1 flex-col px-7 pt-[120px] pb-10">
            <span className="promo-zoom self-start" style={{ animationDelay: '0.05s' }}>
              <ServiceStack item={slide.item} size={96} ring="rgba(255,255,255,0.9)" />
            </span>
            {slide.item.availability === 'few' && (
              <span className="promo-wobble mt-5 inline-flex h-[30px] items-center self-start rounded-full bg-yellow-400 px-3 text-[13px] font-extrabold text-[#1a1400]">
                Últimos cupos
              </span>
            )}
            <h2
              className="promo-display promo-up mt-4 text-[44px] leading-none font-extrabold tracking-tight"
              style={{ animationDelay: '0.25s' }}
            >
              {itemTitle(slide.item)}
            </h2>
            <p className="promo-up mt-2 text-base opacity-90" style={{ animationDelay: '0.35s' }}>
              {itemDetail(slide.item)}
            </p>
            <p
              className="promo-up mt-6 flex items-baseline gap-3"
              style={{ animationDelay: '0.5s' }}
            >
              <span className="promo-display text-[72px] leading-[0.9] font-extrabold tracking-tighter">
                {shortPrice(slide.item.price)}
              </span>
              {savings(slide.item) > 0 && (
                <span className="text-xl line-through opacity-60">
                  {shortPrice(slide.item.regularPrice!)}
                </span>
              )}
            </p>
            <p
              className="promo-up mt-2 text-[15px] font-bold text-yellow-300"
              style={{ animationDelay: '0.6s' }}
            >
              {savings(slide.item) > 0
                ? `Ahorras ${shortPrice(savings(slide.item))}`
                : monthlyPrice(slide.item) && `Solo ${monthlyPrice(slide.item)} al mes`}
            </p>
            <button
              type="button"
              onClick={() => onContact(slide.item)}
              className={cn(ctaClass, 'mt-auto')}
              style={{ animationDelay: '0.75s' }}
            >
              <WhatsAppOutlined className="text-lg" />
              Lo quiero
            </button>
          </div>
        )}

        {slide.kind === 'outro' && (
          <div className="flex flex-1 flex-col justify-center gap-3.5 px-7 pb-10">
            <h2
              className="promo-display promo-up text-[46px] leading-none font-extrabold tracking-tight"
              style={{ animationDelay: '0.1s' }}
            >
              ¿Buscas otro servicio?
            </h2>
            <p
              className="promo-up text-[17px] leading-relaxed opacity-85"
              style={{ animationDelay: '0.25s' }}
            >
              Escríbenos y te armamos lo que necesitas.
            </p>
            <div className="absolute inset-x-7 bottom-10 z-10 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => onContact()}
                className={ctaClass}
                style={{ animationDelay: '0.4s' }}
              >
                <WhatsAppOutlined className="text-lg" />
                Escribir por WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setIndex(0)}
                className="promo-up h-11 text-[14.5px] font-semibold opacity-85"
                style={{ animationDelay: '0.5s' }}
              >
                Ver las ofertas otra vez
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-md flex-col gap-3 bg-gradient-to-b from-black/35 to-transparent px-3 pt-3 pb-4">
        <div className="flex gap-1">
          {slides.map((_, i) => (
            <span key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
              <span
                // La barra activa se remonta en cada cambio para reiniciar su animación.
                key={i === index ? `on-${index}` : 'off'}
                className={cn(
                  'block h-full bg-white',
                  i < index ? 'w-full' : i === index ? 'promo-fill w-0' : 'w-0',
                )}
              />
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-[1.5px] border-white/60 bg-white/20 text-xs font-bold">
            {businessInitials(promo.business.name)}
          </span>
          <span className="flex-1">
            <span className="block text-sm font-bold">{promo.business.name}</span>
            <span className="block text-xs opacity-80">Hasta el {endDateLabel(promo)}</span>
          </span>
        </div>
      </div>

      <button
        type="button"
        aria-label="Anterior"
        onClick={() => go(-1)}
        className="absolute top-20 bottom-48 left-0 z-[5] w-[30%]"
      />
      <button
        type="button"
        aria-label="Siguiente"
        onClick={() => go(1)}
        className="absolute top-20 right-0 bottom-48 z-[5] w-[70%]"
      />
    </div>
  );
}
