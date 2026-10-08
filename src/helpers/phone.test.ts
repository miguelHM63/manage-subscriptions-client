import { describe, expect, it } from 'vitest';

import { formatPhone, isPhoneOk, normalizePhone } from './phone';
import { whatsappUrl } from './whatsapp';

describe('phone', () => {
  it('normaliza a E.164, suponiendo Perú si no trae código', () => {
    expect(normalizePhone('987 654 321')).toBe('+51987654321');
    expect(normalizePhone('+52 55 1234 5678')).toBe('+525512345678');
    expect(normalizePhone('  ')).toBeUndefined();
    expect(normalizePhone(undefined)).toBeUndefined();
  });

  it('formatea para mostrar y deja tal cual lo que no entiende', () => {
    expect(formatPhone('+51987654321')).toBe('+51 987 654 321');
    expect(formatPhone('abc')).toBe('abc');
    expect(formatPhone(undefined)).toBe('');
  });

  it('valida por país (vacío también vale)', () => {
    expect(isPhoneOk('+51987654321')).toBe(true);
    expect(isPhoneOk(undefined)).toBe(true);
    expect(isPhoneOk('+51123')).toBe(false);
  });

  it('whatsappUrl usa el número internacional, también con números antiguos', () => {
    expect(whatsappUrl('+51987654321')).toContain('phone=51987654321');
    expect(whatsappUrl('987654321')).toContain('phone=51987654321');
  });
});
