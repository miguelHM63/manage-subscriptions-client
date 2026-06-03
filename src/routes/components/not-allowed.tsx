import { Link } from 'react-router-dom';
import { DASHBOARD_ROUTE } from '../routes';

export default function NotAllowed() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <svg
            className="w-16 h-16 text-red-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#fee2e2" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5"
              stroke="#ef4444"
              strokeWidth="2"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-red-600 mb-2">Acceso denegado</h1>
        <p className="text-gray-600 mb-6">
          No tienes permiso para acceder a esta página.
          <br />
          Si crees que esto es un error, contacta al administrador.
        </p>
        <Link
          to={DASHBOARD_ROUTE}
          className="inline-block px-6 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
