import { Input, Select, Space } from 'antd';
import type { ReactNode } from 'react';
import PhoneNumberInput, { getCountryCallingCode, type Country } from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import es from 'react-phone-number-input/locale/es';

import { DEFAULT_PHONE_COUNTRY, normalizePhone } from '@/helpers/phone';
import type { PhoneInputProps } from './phone-input';

// Primero los países donde más se usa la app; luego el resto, alfabético.
const COUNTRY_ORDER: (Country | '...')[] = ['PE', 'MX', 'CO', 'AR', 'CL', 'EC', 'BO', 'VE', 'US', 'ES', '...'];

function Flag({ country }: { country: Country }) {
  const Svg = flags[country];
  return (
    <span className="inline-flex h-3.5 w-5 shrink-0 overflow-hidden rounded-[3px] shadow-[0_0_0_1px_rgb(0_0_0/0.08)]">
      {Svg && <Svg title={es[country] ?? country} />}
    </span>
  );
}

interface CountrySelectProps {
  value?: Country;
  onChange: (country?: Country) => void;
  options: { value?: Country; label: string; divider?: boolean }[];
  disabled?: boolean;
  readOnly?: boolean;
  size?: 'small' | 'middle' | 'large';
  status?: 'error' | 'warning';
  'aria-label'?: string;
}

/** Selector de país con AntD: bandera + código, con búsqueda por nombre o código. */
function CountrySelect({
  value,
  onChange,
  options,
  disabled,
  readOnly,
  size,
  status,
  ...rest
}: CountrySelectProps) {
  return (
    <Select<Country>
      aria-label={rest['aria-label']}
      value={value}
      onChange={onChange}
      disabled={disabled || readOnly}
      size={size}
      status={status}
      showSearch
      optionFilterProp="search"
      popupMatchSelectWidth={280}
      className="!w-auto shrink-0"
      labelRender={({ value: country }) =>
        country ? (
          <span className="flex items-center gap-1.5">
            <Flag country={country as Country} />
            <span className="tabular-nums">+{getCountryCallingCode(country as Country)}</span>
          </span>
        ) : null
      }
      options={options
        .filter((option): option is { value: Country; label: string } => Boolean(option.value) && !option.divider)
        .map(option => {
          const code = getCountryCallingCode(option.value);
          return {
            value: option.value,
            search: `${option.label} +${code} ${code}`,
            label: (
              <span className="flex items-center gap-2">
                <Flag country={option.value} />
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                <span className="text-content-subtle tabular-nums">+{code}</span>
              </span>
            ),
          };
        })}
    />
  );
}

/** Une selector e input en un solo campo (bordes compartidos de AntD). */
function Container({ children }: { children?: ReactNode }) {
  return <Space.Compact block>{children}</Space.Compact>;
}

/**
 * Campo de teléfono con país (bandera + código). Devuelve el número en E.164
 * (`+51987654321`), listo para WhatsApp. Se carga en diferido desde
 * `PhoneInput` porque las banderas pesan.
 */
export default function PhoneInputField({ value, onChange, size, status, ...inputProps }: PhoneInputProps) {
  return (
    <PhoneNumberInput
      value={normalizePhone(value)}
      onChange={next => onChange?.(next ?? undefined)}
      defaultCountry={DEFAULT_PHONE_COUNTRY}
      labels={es}
      countryOptionsOrder={COUNTRY_ORDER}
      addInternationalOption={false}
      countrySelectComponent={CountrySelect}
      countrySelectProps={{ size, status }}
      containerComponent={Container}
      inputComponent={Input}
      // El caret "inteligente" necesita el <input> nativo; el de AntD envuelve.
      smartCaret={false}
      size={size}
      status={status}
      inputMode="tel"
      {...inputProps}
    />
  );
}
