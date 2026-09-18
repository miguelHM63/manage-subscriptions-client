import {
  ArrowRightOutlined,
  BarChartOutlined,
  CalendarOutlined,
  CheckOutlined,
  CloudServerOutlined,
  CreditCardOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Button, Segmented } from 'antd';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { BrandLogo } from '@/components/brand-logo';
import { ThemeToggle } from '@/components/panel/theme-toggle';
import { APP_NAME } from '@/config';
import cn from '@/helpers/cn';
import { PLAN_LABEL } from '@/modules/organization/hooks/use-my-organization';
import { PLAN_OFFERS } from '@/modules/organization/plans';
import { LOGIN_ROUTE, SIGNUP_ROUTE } from '@/routes/routes';

const STEPS = [
  {
    icon: <CloudServerOutlined />,
    title: 'Registra tus cuentas',
    text: 'Anota cada cuenta que compras y cuántos cupos tiene.',
  },
  {
    icon: <CreditCardOutlined />,
    title: 'Vende un cupo',
    text: `Asigna el cupo a tu cliente y ${APP_NAME} calcula cuándo vence.`,
  },
  {
    icon: <ReloadOutlined />,
    title: 'Renueva a tiempo',
    text: 'Cada día ves quién vence y le escribes por WhatsApp en un toque.',
  },
];

const BENEFITS = [
  {
    icon: <CalendarOutlined />,
    title: 'Vencimientos bajo control',
    text: 'Vencidas, las que vencen hoy y las de esta semana, en una sola lista.',
  },
  {
    icon: <CloudServerOutlined />,
    title: 'Cupos como inventario',
    text: 'Sabes cuántos cupos te quedan por vender y tu costo por cupo.',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Credenciales cifradas',
    text: 'Usuarios y contraseñas de tus cuentas guardados de forma segura.',
  },
  {
    icon: <BarChartOutlined />,
    title: 'Tus números del mes',
    text: 'Ingreso mensual estimado y cuánto tienes por cobrar.',
  },
];

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-bold tracking-widest text-brand-ink uppercase">{children}</span>
  );
}

function IconTile({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xl text-brand-ink dark:bg-brand-400/15">
      {children}
    </span>
  );
}

// Ilustración del producto (no es una captura): el inicio con lo que requiere atención.
function ProductPreview() {
  const row = (name: string, detail: string, pill: string, tone: string, letter: string, color: string) => (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface p-2.5">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {letter}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold text-content">{name}</span>
        <span className="block truncate text-[11px] text-content-muted">{detail}</span>
      </span>
      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', tone)}>{pill}</span>
    </div>
  );

  return (
    <div
      aria-hidden
      className="w-[280px] rounded-[34px] bg-slate-900 p-2.5 shadow-2xl shadow-brand-900/25 dark:bg-slate-700"
    >
      <div className="overflow-hidden rounded-[26px] bg-surface-muted">
        <div className="border-b border-border bg-surface px-4 pt-5 pb-3 text-[15px] font-black tracking-tight text-brand-ink">
          {APP_NAME}
        </div>
        <div className="flex flex-col gap-2 p-3 pb-10">
          <div className="rounded-xl bg-brand-600 p-3 text-white">
            <p className="text-[9px] font-semibold tracking-wider uppercase opacity-80">Ingreso mensual</p>
            <p className="text-xl font-extrabold tracking-tight">S/ 1,248.00</p>
          </div>
          <p className="mt-1 px-0.5 text-xs font-bold text-content">Requiere atención</p>
          {row('Karla Ríos', 'Netflix · S/ 25.00', 'Venció 3d', 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300', 'N', '#ef4444')}
          {row('Diego Paredes', 'Spotify · S/ 12.00', 'Hoy', 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300', 'S', '#10b981')}
          {row('Ana Quispe', 'Disney+ · S/ 18.00', 'En 4d', 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300', 'D', '#3b82f6')}
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="min-h-dvh bg-surface-muted text-content">
      {/* Cabecera */}
      <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 md:px-8">
          <BrandLogo size={30} />
          <nav className="flex items-center gap-2 md:gap-6">
            <a href="#como-funciona" className="!hidden text-sm font-semibold !text-content-muted md:!inline">
              Cómo funciona
            </a>
            <a href="#precios" className="!hidden text-sm font-semibold !text-content-muted md:!inline">
              Precios
            </a>
            <Link to={LOGIN_ROUTE} className="px-2 text-sm font-semibold !text-content">
              Ingresar
            </Link>
            <Link to={SIGNUP_ROUTE} className="hidden sm:block">
              <Button type="primary" className="!font-semibold">
                Empezar gratis
              </Button>
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-10 pb-4 md:grid-cols-[1.15fr_1fr] md:gap-16 md:px-8 md:pt-20">
        <div className="flex flex-col gap-5">
          <Eyebrow>Para quienes venden cuentas y planes</Eyebrow>
          <h1 className="text-[34px] leading-[1.1] font-extrabold tracking-tight text-balance md:text-[56px] md:leading-[1.05]">
            Gestiona tus clientes y suscripciones sin que se te venza nada
          </h1>
          <p className="max-w-xl text-base text-pretty text-content-muted md:text-lg">
            Tus cuentas, cupos, vencimientos y cobros en un solo lugar. Cada mañana sabes a quién renovar.
          </p>
          <div className="mt-1 flex flex-col gap-2.5 sm:flex-row">
            <Link to={SIGNUP_ROUTE}>
              <Button type="primary" size="large" block className="!h-13 !px-7 !text-base !font-semibold">
                Empezar gratis <ArrowRightOutlined />
              </Button>
            </Link>
            <Link to={LOGIN_ROUTE}>
              <Button size="large" block className="!h-13 !px-7 !text-base !font-semibold">
                Ya tengo cuenta
              </Button>
            </Link>
          </div>
          <p className="text-center text-xs text-content-subtle sm:text-left">
            Plan gratis · Sin tarjeta · Hasta 20 clientes
          </p>
        </div>
        <div className="flex justify-center overflow-hidden rounded-3xl bg-brand-50 pt-8 dark:bg-brand-400/10 md:pt-12">
          <div className="-mb-24 md:-mb-16">
            <ProductPreview />
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="mt-16 scroll-mt-20 bg-surface py-16 md:mt-24 md:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 md:px-8">
          <div className="flex max-w-xl flex-col gap-2">
            <Eyebrow>Cómo funciona</Eyebrow>
            <h2 className="text-[26px] leading-tight font-extrabold tracking-tight md:text-[38px]">
              De la compra a la renovación, en 3 pasos
            </h2>
          </div>
          <ol className="grid gap-8 md:grid-cols-3 md:gap-12">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4 md:flex-col">
                <IconTile>{step.icon}</IconTile>
                <div>
                  <p className="text-xs font-bold text-content-subtle">PASO {i + 1}</p>
                  <h3 className="mt-0.5 text-lg font-bold">{step.title}</h3>
                  <p className="mt-1 text-[15px] text-content-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Beneficios */}
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-16 md:px-8 md:py-24">
        <h2 className="text-[26px] leading-tight font-extrabold tracking-tight md:text-[38px]">
          Lo que resuelve por ti
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(b => (
            <article key={b.title} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <IconTile>{b.icon}</IconTile>
              <h3 className="text-[17px] font-bold">{b.title}</h3>
              <p className="text-[15px] text-content-muted">{b.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Precios */}
      <section id="precios" className="scroll-mt-20 bg-surface py-16 md:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-2">
              <Eyebrow>Precios</Eyebrow>
              <h2 className="text-[26px] leading-tight font-extrabold tracking-tight md:text-[38px]">
                Empieza gratis. Crece cuando lo necesites.
              </h2>
            </div>
            <Segmented
              value={billing}
              onChange={setBilling}
              options={[
                { label: 'Mensual', value: 'monthly' },
                { label: 'Anual · 2 meses gratis', value: 'annual' },
              ]}
            />
          </div>
          <div className="grid items-stretch gap-4 md:grid-cols-3 md:gap-6">
            {PLAN_OFFERS.map(offer => {
              const highlight = offer.plan === 'pro';
              const annual = billing === 'annual' && offer.annual;
              return (
                <article
                  key={offer.plan}
                  className={cn(
                    'flex flex-col gap-5 rounded-2xl bg-surface p-6',
                    highlight
                      ? 'border-2 border-brand-500 shadow-xl shadow-brand-500/15'
                      : 'border border-border',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold">{PLAN_LABEL[offer.plan]}</span>
                    {highlight && (
                      <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
                        Recomendado
                      </span>
                    )}
                  </div>
                  <p className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold tracking-tight">
                      {annual ? offer.annual : offer.price}
                    </span>
                    <span className="text-sm text-content-muted">
                      {offer.plan === 'free' ? 'para siempre' : annual ? 'al año' : 'al mes'}
                    </span>
                  </p>
                  <ul className="flex flex-col gap-2.5">
                    {offer.features.map(f => (
                      <li key={f.label} className="flex gap-2.5 text-[15px]">
                        <CheckOutlined className={cn('mt-1', f.soon ? 'text-content-subtle' : 'text-success')} />
                        <span className={f.soon ? 'text-content-muted' : undefined}>
                          {f.label}
                          {f.soon && (
                            <span className="ml-2 inline-block rounded bg-surface-hover px-1.5 text-[11px] font-bold text-content-muted">
                              Pronto
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link to={SIGNUP_ROUTE} className="mt-auto">
                    <Button
                      type={highlight ? 'primary' : 'default'}
                      size="large"
                      block
                      className="!h-12 !font-semibold"
                    >
                      {offer.plan === 'free' ? 'Empezar gratis' : `Empezar y pasar a ${PLAN_LABEL[offer.plan]}`}
                    </Button>
                  </Link>
                </article>
              );
            })}
          </div>
          <p className="text-sm text-content-muted">
            Todas las cuentas empiezan en el plan Free. Los planes de pago se activan desde tu panel cuando los
            necesites.
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-brand-600 px-6 py-10 text-center text-white md:flex-row md:justify-between md:p-14 md:text-left">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight md:text-[34px]">
              Empieza gratis con tus primeros 20 clientes
            </h2>
            <p className="mt-2 text-white/85">Sin tarjeta. Cambias de plan cuando quieras.</p>
          </div>
          <Link to={SIGNUP_ROUTE}>
            <Button size="large" className="!h-13 !border-white !bg-white !px-7 !text-base !font-bold !text-brand-700">
              Crear mi cuenta <ArrowRightOutlined />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 py-8 text-sm text-content-subtle md:flex-row md:justify-between md:px-8">
          <span>© {new Date().getFullYear()} {APP_NAME}</span>
          <nav className="flex gap-5 font-semibold">
            <a href="#precios" className="!text-content-muted">
              Precios
            </a>
            <Link to={LOGIN_ROUTE} className="!text-content-muted">
              Iniciar sesión
            </Link>
            <Link to={SIGNUP_ROUTE} className="!text-content-muted">
              Crear cuenta
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
