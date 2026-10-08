import { Input } from 'antd';
import { lazy, Suspense, type KeyboardEventHandler } from 'react';

const PhoneInputField = lazy(() => import('./phone-input-field'));

export interface PhoneInputProps {
  // Inyectados por AntD Form.Item:
  id?: string;
  value?: string;
  /** Número en E.164 (`+51987654321`) o `undefined` si se vacía. */
  onChange?: (value?: string) => void;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
  placeholder?: string;
  autoFocus?: boolean;
  status?: 'error' | 'warning';
  onPressEnter?: KeyboardEventHandler<HTMLInputElement>;
}

/**
 * Teléfono con selector de país y bandera, en formato listo para WhatsApp.
 * Mientras carga (las banderas van en un chunk aparte) muestra un input normal.
 */
export function PhoneInput(props: PhoneInputProps) {
  return (
    <Suspense
      fallback={<Input size={props.size} placeholder={props.placeholder} value={props.value} disabled />}
    >
      <PhoneInputField {...props} />
    </Suspense>
  );
}
