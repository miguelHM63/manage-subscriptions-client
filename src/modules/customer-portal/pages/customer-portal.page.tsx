import {
  CopyOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  LoadingOutlined,
  LockOutlined,
  LogoutOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { App, Button, Checkbox, Input, type GetRef } from 'antd';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';

import { BusinessLogo } from '@/components/business-logo';
import { ServiceAvatar } from '@/components/panel/service-avatar';
import { APP_NAME } from '@/config';
import cn from '@/helpers/cn';
import { dueLabel, formatDate } from '@/helpers/dates';
import { whatsappUrl } from '@/helpers/whatsapp';
import {
  fetchPortal,
  PortalError,
  portalErrorMessage,
  unlockPortal,
  type PortalItem,
  type PortalView,
} from '../portal-api';
import { clearSession, readSession, saveSession } from '../portal-session';

import './customer-portal.css';

/**
 * Evita filtrar el link (que lleva el token) a otros sitios por el Referer
 * —p. ej. al cargar logos externos— y que los buscadores indexen la página.
 */
function usePrivatePage() {
  useEffect(() => {
    const metas = [
      ['referrer', 'no-referrer'],
      ['robots', 'noindex, nofollow'],
    ].map(([name, content]) => {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
      return meta;
    });
    return () => metas.forEach(meta => meta.remove());
  }, []);
}

/** Orden de entrada (`.portal-enter`) del contenido en la página. */
const enterOrder = (i: number) => ({ '--i': i }) as CSSProperties;

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface-muted px-4 py-8">
      <div className="mx-auto flex max-w-md flex-col gap-5">{children}</div>
      <p className="mt-10 text-center text-xs text-content-subtle">{APP_NAME}</p>
    </div>
  );
}

function PinForm({
  token,
  initialError,
  onUnlocked,
}: {
  token: string;
  initialError?: string;
  onUnlocked: (session: string) => void;
}) {
  const [pin, setPin] = useState('');
  const [remember, setRemember] = useState(false);
  const otpRef = useRef<GetRef<typeof Input.OTP>>(null);
  const shakeRef = useRef<HTMLDivElement>(null);
  const unlock = useMutation<{ session: string }, PortalError, string>({
    mutationFn: value => unlockPortal(token, value, remember),
    onSuccess: ({ session }) => {
      saveSession(token, session, remember);
      onUnlocked(session);
    },
    onError: () => setPin(''),
  });
  // Tras un error (ya con las casillas habilitadas) sacude las casillas y
  // vuelve el foco para reintentar sin tener que tocarlas.
  useEffect(() => {
    if (!unlock.isError) return;
    otpRef.current?.focus();
    // Quitar y volver a poner la clase (con un reflow entre medio) reinicia la
    // animación sin remontar el OTP, que perdería el foco.
    const el = shakeRef.current;
    if (!el) return;
    el.classList.remove('portal-shake');
    void el.offsetWidth;
    el.classList.add('portal-shake');
  }, [unlock.isError, unlock.submittedAt]);

  const error = unlock.error ? portalErrorMessage(unlock.error.code) : initialError;
  const finalError = Boolean(
    unlock.error && ['PORTAL_BLOCKED', 'PORTAL_NOT_FOUND'].includes(unlock.error.code),
  );

  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-surface px-5 py-8 text-center shadow-sm">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-2xl text-brand-ink dark:bg-brand-400/15">
        <LockOutlined />
      </span>
      <div>
        <h1 className="text-xl font-bold tracking-tight text-content">Tus accesos</h1>
        <p className="mt-1 text-sm text-content-muted">
          Ingresa el PIN de 6 dígitos que te envió tu vendedor.
        </p>
      </div>
      <div className="flex w-full flex-col items-center gap-2">
        <div ref={shakeRef}>
          <Input.OTP
            ref={otpRef}
            length={6}
            size="large"
            value={pin}
            disabled={unlock.isPending || finalError}
            formatter={value => value.replace(/\D/g, '')}
            onChange={value => {
              setPin(value);
              if (value.length === 6) unlock.mutate(value);
            }}
            inputMode="numeric"
            autoFocus
          />
        </div>
        {/* Espacio reservado (2 líneas, lo más largo en móvil) para que el error
            no empuje el checkbox ni el botón al aparecer. */}
        <div aria-live="polite" className="min-h-10">
          {error && (
            <p
              key={unlock.submittedAt}
              className="portal-fade text-sm font-medium text-balance text-danger"
            >
              {error}
            </p>
          )}
        </div>
      </div>
      <Checkbox checked={remember} onChange={e => setRemember(e.target.checked)}>
        Recordar en este dispositivo (30 días)
      </Checkbox>
      <Button
        type="primary"
        size="large"
        block
        loading={unlock.isPending}
        disabled={pin.length !== 6 || finalError}
        onClick={() => unlock.mutate(pin)}
      >
        Ver mis accesos
      </Button>
    </div>
  );
}

function CredentialRow({
  label,
  value,
  secret,
}: {
  label: string;
  value?: string;
  secret?: boolean;
}) {
  const { message } = App.useApp();
  const [shown, setShown] = useState(!secret);
  if (!value) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      message.success(`${label} copiado`);
    } catch {
      message.error('No se pudo copiar');
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-content-subtle">{label}</p>
        <p className="truncate font-mono text-sm text-content">{shown ? value : '••••••••••'}</p>
      </div>
      {secret && (
        <Button
          type="text"
          aria-label={shown ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          icon={shown ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          onClick={() => setShown(s => !s)}
        />
      )}
      <Button
        type="text"
        aria-label={`Copiar ${label.toLowerCase()}`}
        icon={<CopyOutlined />}
        onClick={copy}
      />
    </div>
  );
}

function ItemCard({
  item,
  renewUrl,
  className,
  style,
}: {
  item: PortalItem;
  renewUrl?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const expired = item.kind === 'expired';
  const soon = item.status === 'expiring_soon';
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm',
        expired && 'opacity-90',
        className,
      )}
      style={style}
    >
      <div className="flex items-center gap-3">
        <ServiceAvatar name={item.service.name} iconUrl={item.service.iconUrl} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-content">{item.service.name}</p>
          <p
            className={cn(
              'text-xs font-medium',
              expired ? 'text-danger' : soon ? 'text-warning' : 'text-content-muted',
            )}
          >
            {expired
              ? `Venció el ${formatDate(item.endDate, 'D MMM')}`
              : soon
                ? `${dueLabel(item.daysLeft)} (${formatDate(item.endDate, 'D MMM')})`
                : `Vigente hasta el ${formatDate(item.endDate, 'D MMM YYYY')}`}
          </p>
        </div>
      </div>

      {expired ? (
        <p className="text-sm text-content-muted">Renueva para volver a ver tus accesos.</p>
      ) : (
        <div className="flex flex-col gap-2">
          <CredentialRow label="Usuario" value={item.credentials?.username} />
          <CredentialRow label="Contraseña" value={item.credentials?.password} secret />
        </div>
      )}

      {(expired || soon) && renewUrl && (
        <Button href={renewUrl} target="_blank" icon={<WhatsAppOutlined />}>
          Renovar
        </Button>
      )}
    </div>
  );
}

function PortalContent({ view, onExit }: { view: PortalView; onExit: () => void }) {
  const renewUrl = (service?: string) =>
    view.business.whatsapp
      ? whatsappUrl(
          view.business.whatsapp,
          service
            ? `Hola, soy ${view.customer.name}. Quiero renovar ${service}.`
            : `Hola, soy ${view.customer.name}. Tengo una consulta sobre mis accesos.`,
        )
      : undefined;

  // Saludo, tarjetas (o vacío), aviso y botones entran en ese orden.
  const after = Math.max(view.items.length, 1) + 1;

  return (
    <>
      <div className="portal-enter flex items-center gap-3" style={enterOrder(0)}>
        {view.business.logoUrl && (
          <BusinessLogo
            name={view.business.name}
            logoUrl={view.business.logoUrl}
            className="h-12 w-12 bg-surface-hover text-base text-content-muted"
          />
        )}
        <div className="min-w-0">
          <p className="truncate text-sm text-content-muted">{view.business.name}</p>
          <h1 className="text-2xl font-bold tracking-tight text-content">
            Hola, {view.customer.name}
          </h1>
        </div>
      </div>

      {view.items.length ? (
        view.items.map((item, i) => (
          <ItemCard
            key={item.id}
            item={item}
            renewUrl={renewUrl(item.service.name)}
            className="portal-enter"
            style={enterOrder(i + 1)}
          />
        ))
      ) : (
        <p
          className="portal-enter rounded-2xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-content-muted"
          style={enterOrder(1)}
        >
          No tienes accesos vigentes por ahora.
        </p>
      )}

      <p className="portal-enter text-center text-xs text-content-subtle" style={enterOrder(after)}>
        No compartas este link ni tu PIN: son solo para ti.
      </p>
      <div className="portal-enter flex flex-col gap-2" style={enterOrder(after + 1)}>
        {renewUrl() && (
          <Button size="large" icon={<WhatsAppOutlined />} href={renewUrl()} target="_blank">
            Escribir a {view.business.name}
          </Button>
        )}
        <Button type="text" icon={<LogoutOutlined />} onClick={onExit}>
          Salir
        </Button>
      </div>
    </>
  );
}

/** Portal del cliente final (`/c/:token`): link personal + PIN, sin cuenta. */
export function CustomerPortalPage() {
  usePrivatePage();
  const { token = '' } = useParams();
  const [session, setSession] = useState<string | null>(() => readSession(token));

  const { data: view, error } = useQuery<PortalView, PortalError>({
    queryKey: ['customer-portal', token, session],
    enabled: Boolean(session),
    queryFn: async () => {
      try {
        return await fetchPortal(session ?? '');
      } catch (error) {
        // Sesión vencida o link reemplazado: se descarta y se pide el PIN.
        clearSession(token);
        throw error;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const askPin = !session || Boolean(error);
  const notice = error
    ? error.code === 'PORTAL_SESSION_EXPIRED'
      ? 'Por seguridad, vuelve a ingresar tu PIN.'
      : portalErrorMessage(error.code)
    : undefined;

  useEffect(() => {
    document.title = view ? `Tus accesos · ${view.business.name}` : 'Tus accesos';
  }, [view]);

  const exit = () => {
    clearSession(token);
    setSession(null);
  };

  return (
    <Shell>
      {askPin ? (
        <PinForm token={token} initialError={notice} onUnlocked={setSession} />
      ) : view ? (
        <PortalContent view={view} onExit={exit} />
      ) : (
        <div className="portal-spinner flex justify-center py-20 text-3xl text-brand-ink">
          <LoadingOutlined />
        </div>
      )}
    </Shell>
  );
}
