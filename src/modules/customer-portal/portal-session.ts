// Sesión del portal en este navegador. "Recordar" la guarda en localStorage
// (30 días); si no, en sessionStorage (se borra al cerrar la pestaña). Todo
// en try/catch: el almacenamiento puede no estar disponible.
const keyFor = (token: string) => `plancito-portal:${token.slice(0, 16)}`;

export function readSession(token: string): string | null {
  for (const storage of [sessionStorage, localStorage]) {
    try {
      const value = storage.getItem(keyFor(token));
      if (value) return value;
    } catch {
      // sin almacenamiento
    }
  }
  return null;
}

export function saveSession(token: string, session: string, remember: boolean) {
  try {
    (remember ? localStorage : sessionStorage).setItem(keyFor(token), session);
  } catch {
    // sin almacenamiento: la sesión dura lo que la página abierta
  }
}

export function clearSession(token: string) {
  for (const storage of [sessionStorage, localStorage]) {
    try {
      storage.removeItem(keyFor(token));
    } catch {
      // nada que borrar
    }
  }
}
