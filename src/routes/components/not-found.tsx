export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <svg
            className="w-20 h-20 text-cyan-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 64 64"
          >
            <circle cx="32" cy="32" r="30" stroke="#06b6d4" strokeWidth="4" fill="#e0f2fe" />
            <text x="32" y="44" textAnchor="middle" fontSize="32" fill="#06b6d4" fontWeight="bold">
              404
            </text>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-cyan-600 mb-2">Página no encontrada</h1>
        <p className="text-gray-600 mb-6">
          La página que buscas no existe o fue movida.
          <br />
          Verifica la URL o vuelve al inicio.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition"
        >
          Ir al inicio
        </a>
      </div>
    </div>
  );
}
