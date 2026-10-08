import { describe, expect, it } from 'vitest';

import {
  activeAt,
  clickProgress,
  cursorPosition,
  realDuration,
  realFrame,
  sceneFrame,
  typedText,
  typingEnd,
  type CursorMove,
} from './timeline';

describe('typedText', () => {
  it('escribe una letra cada N frames desde el inicio', () => {
    expect(typedText('Netflix', 9, 10)).toBe('');
    expect(typedText('Netflix', 10, 10)).toBe('N');
    expect(typedText('Netflix', 13, 10)).toBe('Ne');
    expect(typedText('Netflix', 100, 10)).toBe('Netflix');
  });

  it('typingEnd coincide con el frame en que se completa el texto', () => {
    const end = typingEnd('Netflix', 10);
    expect(typedText('Netflix', end, 10)).toBe('Netflix');
    expect(typedText('Netflix', end - 1, 10)).toBe('Netfli');
  });
});

describe('cursorPosition', () => {
  const initial = { x: 0, y: 0 };
  const moves: CursorMove[] = [
    { start: 10, end: 20, target: 'a' },
    { start: 30, end: 40, target: 'b' },
  ];
  const points = new Map([
    ['a', { x: 100, y: 0 }],
    ['b', { x: 100, y: 200 }],
  ]);

  it('espera en el origen antes del primer movimiento', () => {
    expect(cursorPosition(5, moves, points, initial)).toEqual(initial);
  });

  it('va de un destino al siguiente', () => {
    expect(cursorPosition(15, moves, points, initial).x).toBeCloseTo(50);
    expect(cursorPosition(25, moves, points, initial)).toEqual({ x: 100, y: 0 });
    expect(cursorPosition(35, moves, points, initial)).toEqual({ x: 100, y: 100 });
    expect(cursorPosition(99, moves, points, initial)).toEqual({ x: 100, y: 200 });
  });

  it('se queda donde está si aún no conoce el destino', () => {
    const partial = new Map([['a', { x: 100, y: 0 }]]);
    expect(cursorPosition(35, moves, partial, initial)).toEqual({ x: 100, y: 0 });
  });
});

describe('clickProgress', () => {
  it('avanza durante el clic y luego se apaga', () => {
    expect(clickProgress(9, [10], 10)).toBeNull();
    expect(clickProgress(10, [10], 10)).toBe(0);
    expect(clickProgress(15, [10], 10)).toBe(0.5);
    expect(clickProgress(20, [10], 10)).toBeNull();
  });

  it('usa el clic más reciente', () => {
    expect(clickProgress(32, [10, 30], 10)).toBeCloseTo(0.2);
  });
});

describe('activeAt', () => {
  it('devuelve el último elemento que ya empezó', () => {
    const items = [
      { from: 0, id: 'a' },
      { from: 10, id: 'b' },
    ];
    expect(activeAt(items, 5)?.id).toBe('a');
    expect(activeAt(items, 10)?.id).toBe('b');
    expect(activeAt([{ from: 3 }], 0)).toBeUndefined();
  });
});

describe('sceneFrame / realFrame', () => {
  const holds = [
    { at: 0, duration: 10 },
    { at: 50, duration: 20 },
  ];

  it('congela la escena durante cada pausa y luego sigue', () => {
    expect(sceneFrame(0, holds)).toBe(0);
    expect(sceneFrame(9, holds)).toBe(0);
    expect(sceneFrame(10, holds)).toBe(0);
    expect(sceneFrame(11, holds)).toBe(1);
    expect(sceneFrame(60, holds)).toBe(50);
    expect(sceneFrame(79, holds)).toBe(50);
    expect(sceneFrame(81, holds)).toBe(51);
  });

  it('realFrame es el inverso fuera de las pausas', () => {
    expect(realFrame(0, holds)).toBe(0);
    expect(realFrame(1, holds)).toBe(11);
    expect(realFrame(50, holds)).toBe(60);
    expect(realFrame(51, holds)).toBe(81);
    for (const scene of [1, 20, 49, 51, 99]) {
      expect(sceneFrame(realFrame(scene, holds), holds)).toBe(scene);
    }
  });

  it('realDuration suma las pausas', () => {
    expect(realDuration(100, holds)).toBe(130);
  });
});
