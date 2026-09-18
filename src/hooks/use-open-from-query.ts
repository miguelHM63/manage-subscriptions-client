import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/** Parámetro que pide abrir el formulario de alta al entrar (`?nuevo=1`). */
export const NEW_PARAM = 'nuevo';

/**
 * Abre el formulario de alta si la URL trae `?nuevo=1` (p. ej. desde el
 * checklist de primer uso) y limpia el parámetro para no reabrirlo.
 */
export const useOpenFromQuery = (open: () => void) => {
  const [params, setParams] = useSearchParams();
  const requested = params.has(NEW_PARAM);

  useEffect(() => {
    if (!requested) return;
    open();
    setParams(
      prev => {
        prev.delete(NEW_PARAM);
        return prev;
      },
      { replace: true },
    );
  }, [requested, open, setParams]);
};
