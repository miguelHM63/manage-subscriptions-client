import type { Rule } from 'antd/es/form';
import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js/min';

/** País que se asume cuando un número no trae su código (+51…). */
export const DEFAULT_PHONE_COUNTRY: CountryCode = 'PE';

/**
 * Número en formato internacional E.164 (`+51987654321`), el que usa WhatsApp.
 * Acepta también números antiguos guardados como texto libre (`987 654 321`),
 * suponiendo el país por defecto. `undefined` si está vacío o no se entiende.
 */
export function normalizePhone(raw?: string | null): string | undefined {
  if (!raw?.trim()) return undefined;
  return parsePhoneNumberFromString(raw, DEFAULT_PHONE_COUNTRY)?.number;
}

/** Número legible para mostrar (`+51 987 654 321`); si no se entiende, tal cual. */
export function formatPhone(phone?: string | null): string {
  if (!phone) return '';
  return parsePhoneNumberFromString(phone, DEFAULT_PHONE_COUNTRY)?.formatInternational() ?? phone;
}

/** País del número (`PE`), según su código internacional; `undefined` si no se sabe. */
export function phoneCountry(phone?: string | null): CountryCode | undefined {
  if (!phone?.trim()) return undefined;
  return parsePhoneNumberFromString(phone, DEFAULT_PHONE_COUNTRY)?.country;
}

/** `true` si está vacío o es un número válido para su país. */
export const isPhoneOk = (phone?: string) => !phone || isValidPhoneNumber(phone);

/** Regla de formulario: vacío o un número válido para su país. */
export const PHONE_RULES: Rule[] = [
  {
    validator: (_, value?: string) =>
      isPhoneOk(value)
        ? Promise.resolve()
        : Promise.reject(new Error('Número no válido para ese país')),
  },
];
