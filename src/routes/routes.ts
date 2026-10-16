export const HOME_ROUTE = '/';
export const DASHBOARD_ROUTE = '/dashboard';
export const LOGIN_ROUTE = '/login';
export const ADMIN_ONLY_TEST_ROUTE = '/admin-only-test';
export const SIGNUP_ROUTE = '/signup';
export const USERS_ROUTE = '/users';
export const CUSTOMERS_ROUTE = '/customers';
export const SUBSCRIPTIONS_ROUTE = '/subscriptions';
export const PROVIDER_ACCOUNTS_ROUTE = '/provider-accounts';
export const SERVICES_ROUTE = '/services';
export const PROFILE_ROUTE = '/perfil';
export const PLATFORM_ADMIN_ROUTE = '/admin';
export const HOW_TO_ROUTE = '/como-usarlo';
export const PROMOTIONS_ROUTE = '/promociones';
export const NEW_PROMOTION_ROUTE = '/promociones/nueva';
export const promotionRoute = (id: string) => `/promociones/${id}`;
// Link público de una promoción (sin sesión).
export const PUBLIC_PROMOTION_ROUTE = '/p/:slug';
// Link de accesos del cliente final (sin sesión; protegido con PIN).
export const CUSTOMER_PORTAL_ROUTE = '/c/:token';
export const RECOVER_PASSWORD_ROUTE = '/recuperar';
// Ruta fija: la usa el correo de recuperación (api: recover-password.handler).
export const RESET_PASSWORD_ROUTE = '/reset-password';
export const PRIVACY_ROUTE = '/privacidad';
export const TERMS_ROUTE = '/terminos';
