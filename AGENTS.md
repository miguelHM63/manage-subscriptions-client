# Codex Agent Context

## Project Purpose

This is a **base/starter project** (boilerplate) maintained by Miguelhm. It provides the foundational architecture, patterns, and configurations used to bootstrap new client-side projects for personal use. Any changes made here should be generic and reusable — avoid adding business logic specific to a single product. New features, patterns, or conventions added to this base will be inherited by all future projects derived from it.

## Stack

- **Build:** Vite 7, TypeScript ~5.9 (moduleResolution: bundler)
- **UI:** React 19, Ant Design 6 + @ant-design/icons, Tailwind CSS v4
- **Routing:** React Router v7 (`createBrowserRouter` / data router)
- **Data fetching:** TanStack React Query v5 + Axios
- **i18n:** i18next + i18next-http-backend
- **Permissions:** CASL (@casl/ability, @casl/react)
- **Testing:** Vitest + @testing-library/react

## Scripts

- `yarn dev` — start Vite dev server on `http://localhost:3000`
- `yarn build` — type-check (tsc) + production build (vite)
- `yarn lint` — ESLint with autofix
- `yarn test` — Vitest
- `yarn preview` — preview production build

## Key Entry Points

- Entry: `src/main.tsx` → `src/app.tsx`
- Routes: `src/routes/app-routes.tsx` and `src/routes/app-routes/*`
- Global providers: `src/providers/app-providers.tsx`
- AntD theme & locale: `src/providers/antd-provider.tsx`
- i18n config: `src/i18n.ts` (loads from `/locales/{{lng}}/{{ns}}.json`)
- Environment config: `src/config.ts` (exports `API_URL`, `IS_PROD`, `IS_DEV`)
- CSS theme: `src/index.css` (Tailwind v4 `@theme` + brand variables)

## Project Structure

```
src/
├── api/          # Axios instance, interceptors, error utilities
├── components/   # Shared components (ErrorAction, ErrorBoundaryMessage)
├── config.ts     # Environment variables (import.meta.env)
├── constants.ts  # Form rules, storage keys, date formats
├── context/      # React contexts (auth, storage, language, ability)
├── helpers/      # Utilities (cn.ts for classnames)
├── hoc/          # HOCs (withErrorBoundary)
├── hooks/        # Global custom hooks (useAuth, useAbility, etc.)
├── modules/      # Feature modules (auth, dashboard, users)
├── providers/    # Provider components
├── routes/       # Route definitions and guards
└── types/        # Shared TypeScript types
```

## Conventions

### File Naming & Imports

- Use **kebab-case** for all files: `user-list.tsx`, `use-get-user-list.ts`
- Path aliases: `@/*` → `src/*`, `@test/*` → `test/*`
- Use `import type` for type-only imports (verbatimModuleSyntax enabled)
- React 19 with automatic JSX runtime — no `import React` needed

### Module Structure

Each feature module follows this pattern:

```
modules/<feature>/
├── components/    # Feature-specific components
├── hooks/         # Feature-specific hooks (API calls)
├── pages/         # Page components (wrapped with withErrorBoundary)
└── index.ts       # Re-exports main page component
```

### Context Pattern

Contexts follow a 4-part structure:

1. `*-context.ts` — `createContext` with initial state
2. `*-context.provider.tsx` — Provider with logic
3. `*-context.interfaces.d.ts` — TypeScript interfaces
4. `src/hooks/use-*.ts` — Hook with context validation

### API & Data Fetching

- Axios instance in `src/api/config.ts` (auto-attaches Bearer token, handles 401)
- Use `useQuery` for reads, `useMutation` with `MutationCallback<T>` for writes
- Keep query keys stable; use `invalidateQueries` after mutations
- Type errors as `HttpError` (from `src/api/error-validation.ts`)

### UI & Styling

- Tailwind v4 + `clsx()` + `tailwind-merge` via `cn()` helper (`src/helpers/cn.ts`)
- AntD theme kept in `ConfigProvider` — don't hardcode colors in components
- Use `@layer antd` in CSS to avoid specificity conflicts
- TypeScript `strict` with `noUncheckedSideEffectImports` — import CSS explicitly

### i18n

- Always use `useTranslation()` for user-facing text
- Error messages use namespace `error-codes`
- Locales live in `public/locales/{lng}/{ns}.json`

### Permissions

- Use `useAbility()` hook (CASL) to check permissions
- Route-level guards use `CanRoute` component

### Error Handling

- Wrap pages with `withErrorBoundary` HOC
- Event bus (`src/event-bus.ts`) dispatches UNAUTHORIZED, SHOW_ERROR, LOGOUT events
- Form validation errors (422) are formatted for AntD forms via `useInvalidateForm`

### Form Validation

- Use constants from `src/constants.ts` (`REQUIRED`, `REQUIRED_TEXT`)
- Use `useFormErrorHandler` to combine form instance with error handling

### Routing

- Add routes in `src/routes/app-routes/*` and export them in `src/routes/app-routes.tsx`
- Use `PrivateRoute` for authenticated routes, `CanRoute` for permission-based routes

## Testing

- Vitest + @testing-library/react
- Use `@test/test-wrapper` for component tests (provides QueryClient + BrowserRouter)
- i18n mock returns keys, not translated text — assert against i18n keys
- `app.test.tsx` uses `@testing-library/react` directly (avoids router nesting)
- Tests in `*.test.tsx` / `*.test.ts`, co-located with source or in `test/`
- Test setup: `test.setup.ts`

## Formatting

- Prettier: `printWidth: 100`, `singleQuote: true`, `trailingComma: all`
- ESLint flat config in `eslint.config.js`
