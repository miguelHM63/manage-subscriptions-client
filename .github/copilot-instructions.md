# Copilot Instructions

## Project Purpose

This is a **base/starter project** (boilerplate) maintained by Miguelhm. It provides the foundational architecture, patterns, and configurations used to bootstrap new client-side projects for personal use. Any changes made here should be generic and reusable — avoid adding business logic specific to a single product. New features, patterns, or conventions added to this base will be inherited by all future projects derived from it.

## Quick Context

Vite 7 + React 19 + TypeScript client application.
Stack: Ant Design 6, Tailwind CSS v4, React Router v7, React Query v5, i18next, CASL, Axios, Vitest.

## Project Structure

- Entry: `src/main.tsx` → `src/app.tsx`
- Routes: `src/routes/app-routes.tsx`
- Providers: `src/providers/app-providers.tsx`
- Feature modules: `src/modules/<feature>/` with `components/`, `hooks/`, `pages/`, `index.ts`
- Global hooks: `src/hooks/` (useAuth, useAbility, useStorage, useLanguage, etc.)
- API layer: `src/api/config.ts` (Axios instance with interceptors)
- Environment: `src/config.ts` (API_URL, IS_PROD, IS_DEV)

## Contribution Rules

- Use path aliases: `@/*` → `src/*`, `@test/*` → `test/*`
- Use `import type` for type-only imports (verbatimModuleSyntax enabled)
- File naming: **kebab-case** (`user-list.tsx`, `use-get-user-list.ts`)
- AntD theme/locale stays in `src/providers/antd-provider.tsx`
- Use `useTranslation()` for all user-facing text; errors use namespace `error-codes`
- Remote data: React Query with stable query keys + `invalidateQueries`
- Permissions: `useAbility()` hook (CASL); route guards use `CanRoute`
- Styling: Tailwind v4 + `cn()` helper (clsx + tailwind-merge)
- Routing: `createBrowserRouter` in `src/routes`
- Error handling: wrap pages with `withErrorBoundary` HOC; type API errors as `HttpError`
- Mutations: use `MutationCallback<T>` pattern for onSuccess/onError
- Context pattern: context file + provider + interfaces + hook with validation
- Form validation: use `REQUIRED`/`REQUIRED_TEXT` from constants; `useFormErrorHandler` for error handling

## Testing

- Vitest + @testing-library/react
- Use `@test/test-wrapper` for component tests (provides QueryClient + BrowserRouter)
- i18n mock returns keys — assert against i18n keys, not translated text
- Test setup: `test.setup.ts`

## Scripts

`yarn dev` | `yarn build` | `yarn lint` | `yarn test` | `yarn preview`
