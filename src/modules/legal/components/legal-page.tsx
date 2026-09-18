import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { BrandLogo } from '@/components/brand-logo';
import { APP_NAME, SUPPORT_EMAIL } from '@/config';
import { HOME_ROUTE, PRIVACY_ROUTE, TERMS_ROUTE } from '@/routes/routes';

/** Fecha de la última revisión de los textos legales. */
export const LEGAL_UPDATED_AT = '18 de septiembre de 2026';

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-bold tracking-tight text-content">{title}</h2>
      {children}
    </section>
  );
}

export function ContactLine() {
  return SUPPORT_EMAIL ? (
    <p>
      Escríbenos a{' '}
      <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold">
        {SUPPORT_EMAIL}
      </a>
      .
    </p>
  ) : (
    <p>Puedes contactarnos por el correo de soporte de {APP_NAME}.</p>
  );
}

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface-muted text-content">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-5">
          <Link to={HOME_ROUTE} aria-label={`Ir al inicio de ${APP_NAME}`}>
            <BrandLogo size={30} />
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-7 px-5 py-10 text-[15px] leading-relaxed text-content-muted [&_a]:!text-brand-ink [&_li]:mt-1 [&_ul]:list-disc [&_ul]:pl-5">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-content">{title}</h1>
          <p className="mt-1 text-sm text-content-subtle">Última actualización: {LEGAL_UPDATED_AT}</p>
        </div>
        {children}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-5 py-6 text-sm text-content-subtle sm:flex-row sm:justify-between">
          <span>
            © {new Date().getFullYear()} {APP_NAME}
          </span>
          <nav className="flex gap-5 font-semibold">
            <Link to={PRIVACY_ROUTE} className="!text-content-muted">
              Privacidad
            </Link>
            <Link to={TERMS_ROUTE} className="!text-content-muted">
              Términos
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
