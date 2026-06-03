import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LOGIN_ROUTE, SIGNUP_ROUTE } from '@/routes/routes';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 md:px-10">
        <span className="text-xl font-black text-brand-primary">Plancito</span>
        <Button type="text" onClick={() => navigate(LOGIN_ROUTE)}>
          Iniciar sesión
        </Button>
      </header>

      {/* Hero — mobile-first */}
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-12 text-center md:px-10">
        <h1 className="max-w-2xl text-3xl font-black leading-tight text-neutral-900 md:text-5xl">
          Gestiona tus clientes y suscripciones sin que se te venza nada
        </h1>
        <p className="mt-4 max-w-xl text-base text-neutral-500 md:text-lg">
          Controla tus cuentas, vencimientos y renovaciones en un solo lugar. Recibe alertas antes
          de que tus clientes caduquen.
        </p>
        <div className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:max-w-md sm:flex-row sm:justify-center">
          <Button
            type="primary"
            size="large"
            className="w-full sm:w-auto"
            onClick={() => navigate(SIGNUP_ROUTE)}
          >
            Empezar gratis
          </Button>
          <Button size="large" className="w-full sm:w-auto" onClick={() => navigate(LOGIN_ROUTE)}>
            Ya tengo cuenta
          </Button>
        </div>
        <p className="mt-4 text-xs text-neutral-400">Plan gratis · sin tarjeta · hasta 20 clientes</p>
      </main>

      <footer className="px-5 py-6 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} Plancito
      </footer>
    </div>
  );
}
