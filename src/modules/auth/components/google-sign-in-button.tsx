import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { message } from 'antd';
import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { GOOGLE_CLIENT_ID } from '@/config';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';

// Google solo admite anchos de botón entre 200 y 400 px.
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

/**
 * Botón "Continuar con Google". Sirve para iniciar sesión y para registrarse:
 * la API crea la cuenta si el correo aún no existe. Si no hay
 * `VITE_GOOGLE_CLIENT_ID`, no se muestra.
 */
export function GoogleSignInButton() {
  const { t, i18n } = useTranslation('auth');
  const { loginWithGoogle, isLoggingIn } = useAuth();
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(MAX_WIDTH);

  // El botón se dibuja con un ancho fijo en px: se ajusta al del contenedor.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.floor(el.clientWidth))));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID} locale={i18n.language}>
      <div
        ref={containerRef}
        // El iframe de Google es claro: con `color-scheme: light` en el contenedor su
        // fondo es transparente también en tema oscuro (si no, se ve un recuadro blanco).
        style={{ colorScheme: 'light' }}
        className={`mb-3 flex w-full justify-center ${isLoggingIn ? 'pointer-events-none opacity-60' : ''}`}
      >
        <GoogleLogin
          key={`${width}-${isDark}`}
          onSuccess={({ credential }) => {
            if (credential) loginWithGoogle?.(credential);
          }}
          onError={() => message.error(t('google.error'))}
          text="continue_with"
          shape="rectangular"
          size="large"
          width={width}
          theme={isDark ? 'filled_black' : 'outline'}
        />
      </div>
    </GoogleOAuthProvider>
  );
}
