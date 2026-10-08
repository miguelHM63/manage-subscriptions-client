import { useLayoutEffect, useState } from 'react';

import type { Point } from './timeline';

/** Busca un elemento dentro del escenario del tutorial. */
export type TargetFinder = (stage: HTMLElement) => Element | null;

export const bySelector =
  (selector: string): TargetFinder =>
  stage =>
    stage.querySelector(selector);

/** Primer `selector` cuyo texto contiene `text`. */
export const byText =
  (selector: string, text: string): TargetFinder =>
  stage =>
    Array.from(stage.querySelectorAll(selector)).find(el => el.textContent?.includes(text)) ?? null;

/**
 * Centro de cada destino en coordenadas de la composición. El Player escala el
 * escenario con `transform`, así que se deshace esa escala. Se mide tras cada
 * render y se recuerda la última posición conocida (el cursor parte de ahí
 * aunque el elemento ya no exista).
 */
export function useTargetPoints(
  stage: HTMLElement | null,
  targets: Record<string, TargetFinder>,
): ReadonlyMap<string, Point> {
  const [points, setPoints] = useState<ReadonlyMap<string, Point>>(() => new Map());

  // Sin dependencias a propósito: cada frame puede mover los elementos. Solo
  // vuelve a renderizar si alguna posición cambió, así que se estabiliza.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (!stage) return;
    const box = stage.getBoundingClientRect();
    const scale = box.width / stage.offsetWidth || 1;

    setPoints(prev => {
      let next: Map<string, Point> | null = null;
      for (const [key, find] of Object.entries(targets)) {
        const el = find(stage);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const point = {
          x: (r.left + r.width / 2 - box.left) / scale,
          y: (r.top + r.height / 2 - box.top) / scale,
        };
        const old = prev.get(key);
        if (!old || Math.abs(old.x - point.x) > 0.5 || Math.abs(old.y - point.y) > 0.5) {
          next ??= new Map(prev);
          next.set(key, point);
        }
      }
      return next ?? prev;
    });
  });

  return points;
}

const FIELD_BOX = '.ant-input-affix-wrapper, .ant-input-number, .ant-select';

/**
 * Muestra el estilo de foco en un campo sin enfocarlo de verdad (enfocar
 * movería el scroll de la página o abriría el teclado en móvil).
 */
export function useSimulatedFocus(stage: HTMLElement | null, find: TargetFinder | null) {
  useLayoutEffect(() => {
    if (!stage) return;
    stage
      .querySelectorAll('[data-tutorial-focus]')
      .forEach(el => el.removeAttribute('data-tutorial-focus'));
    const input = find?.(stage);
    // El borde lo dibuja el contenedor del campo, no el <input>.
    const field = input?.closest(FIELD_BOX) ?? input;
    field?.setAttribute('data-tutorial-focus', '');
  });
}

/**
 * Desplaza un contenedor con scroll (p. ej. el cuerpo de un modal largo) según
 * `progress` (0 = arriba, 1 = abajo del todo). Úsalo antes de `useTargetPoints`
 * para que el cursor mida las posiciones ya desplazadas.
 */
export function useScrollProgress(stage: HTMLElement | null, find: TargetFinder, progress: number) {
  useLayoutEffect(() => {
    const el = stage && find(stage);
    if (!el) return;
    el.scrollTo({ top: (el.scrollHeight - el.clientHeight) * progress });
  });
}
