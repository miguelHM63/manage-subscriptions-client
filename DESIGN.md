---
name: Plancito
description: Panel móvil para revendedores de cuentas y planes; indigo sereno sobre papel claro.
colors:
  indigo-plancito: '#6366F1'
  indigo-plancito-deep: '#4F46E5'
  indigo-plancito-press: '#4338CA'
  indigo-plancito-wash: '#EEF2FF'
  indigo-plancito-ink-dark: '#A5B4FC'
  papel: '#F8FAFC'
  papel-blanco: '#FFFFFF'
  papel-hover: '#F1F5F9'
  papel-borde: '#E2E8F0'
  carbon: '#0F172A'
  carbon-muted: '#475569'
  carbon-subtle: '#64748B'
  carbon-superficie: '#1E293B'
  carbon-borde: '#334155'
  success: '#22C55E'
  warning: '#F59E0B'
  danger: '#EF4444'
  info: '#3B82F6'
  success-ink: '#15803D'
  warning-ink: '#B45309'
  danger-ink: '#DC2626'
  info-ink: '#1D4ED8'
typography:
  display:
    fontFamily: 'Inter, sans-serif'
    fontSize: 'clamp(34px, 6vw, 56px)'
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: '-0.025em'
  headline:
    fontFamily: 'Inter, sans-serif'
    fontSize: 'clamp(26px, 4vw, 38px)'
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: '-0.025em'
  title:
    fontFamily: 'Inter, sans-serif'
    fontSize: '22px'
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: '-0.025em'
  figure:
    fontFamily: 'Inter, sans-serif'
    fontSize: '30px'
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: '-0.025em'
  section:
    fontFamily: 'Inter, sans-serif'
    fontSize: '16px'
    fontWeight: 700
    lineHeight: 1.5
  body:
    fontFamily: 'Inter, sans-serif'
    fontSize: '14px'
    fontWeight: 400
    lineHeight: 1.43
  row-title:
    fontFamily: 'Inter, sans-serif'
    fontSize: '15px'
    fontWeight: 600
    lineHeight: 1.43
  caption:
    fontFamily: 'Inter, sans-serif'
    fontSize: '12px'
    fontWeight: 400
    lineHeight: 1.33
  label:
    fontFamily: 'Inter, sans-serif'
    fontSize: '11px'
    fontWeight: 600
    lineHeight: 1
    letterSpacing: '0.05em'
rounded:
  sm: '8px'
  md: '12px'
  lg: '16px'
  sheet: '20px'
  full: '9999px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '12px'
  lg: '16px'
  xl: '24px'
  gutter: '16px'
components:
  button-primary:
    backgroundColor: '{colors.indigo-plancito-deep}'
    textColor: '{colors.papel-blanco}'
    rounded: '{rounded.sm}'
    height: '40px'
    padding: '0 16px'
  button-primary-hover:
    backgroundColor: '{colors.indigo-plancito}'
  button-primary-active:
    backgroundColor: '{colors.indigo-plancito-press}'
  card:
    backgroundColor: '{colors.papel-blanco}'
    rounded: '{rounded.md}'
    padding: '14px'
  list-row:
    backgroundColor: '{colors.papel-blanco}'
    textColor: '{colors.carbon}'
    typography: '{typography.row-title}'
    padding: '12px'
  chip-filter:
    backgroundColor: '{colors.papel-blanco}'
    textColor: '{colors.carbon-muted}'
    rounded: '{rounded.full}'
    height: '36px'
    padding: '0 14px'
  chip-filter-selected:
    backgroundColor: '{colors.indigo-plancito-deep}'
    textColor: '{colors.papel-blanco}'
    rounded: '{rounded.full}'
    height: '36px'
    padding: '0 14px'
  hero-card:
    backgroundColor: '{colors.indigo-plancito-deep}'
    textColor: '{colors.papel-blanco}'
    rounded: '{rounded.lg}'
    padding: '16px'
  fab:
    backgroundColor: '{colors.indigo-plancito-deep}'
    textColor: '{colors.papel-blanco}'
    rounded: '{rounded.lg}'
    size: '56px'
  nav-item-active:
    backgroundColor: '{colors.indigo-plancito-wash}'
    textColor: '{colors.indigo-plancito-deep}'
    rounded: '{rounded.full}'
---

# Design System: Plancito

## Overview

**Creative North Star: "Indigo sereno"**

Plancito is calm in a business that is not. A reseller opens it between WhatsApp chats with three renewals due and a customer asking for a password; the interface answers with order: soft paper backgrounds, one confident indigo, and only the urgent things in color. It is a modern, professional SaaS whose restraint balances the friendly diminutive of the name. Warmth comes from Spanish copy, rounded touch targets and generous spacing, not from decoration.

The system splits its temperament by surface. The **panel** (dashboard, customers, subscriptions, mother accounts, profile) is operational and sober: dense enough to scan, flat, with indigo reserved for action, selection and the one hero figure. **Public and customer-facing surfaces** (landing, customer portal, public promotions) may be more expressive: larger display type, entrance motion, richer brand washes. Both speak the same tokens.

It must not look like a generic Ant Design admin (grey tables, dark sidebar, default chrome without character) or like a cold fintech dashboard (corporate distance, chart walls). Plancito is close to the person using it.

**Key Characteristics:**

- Mobile-first: bottom navigation, FAB, bottom sheets, safe-area aware; the sidebar appears from `md` up.
- One brand hue (indigo) on Papel/Carbón slate neutrals; semantic colors only for state.
- Flat by default: borders and tonal layers, no shadows except on things that float.
- Inter everywhere; heavy weights (700–800) and tight tracking for figures and titles.
- Full light/dark parity via surface/content tokens that flip on `.dark`.

## Colors

One indigo voice over cool slate paper, with traffic-light semantics reserved for subscription and payment state.

### Primary

- **Indigo Plancito Profundo** (`indigo-plancito-deep`): the action color. AntD `colorPrimary` and `colorLink`, primary buttons, the active sidebar item, selected filter chips, the FAB, the income hero card, brand ink for links and active labels in light mode. White on it is 6.3:1.
- **Indigo Plancito** (`indigo-plancito`): the lighter brand tone. Primary hover (AntD-derived), used slots in the slot bar, indigo washes at low opacity. Never a fill under white text: white on it is 4.47:1, under AA.
- **Indigo Plancito Presionado** (`indigo-plancito-press`): pressed state; text on white buttons placed inside indigo cards.
- **Lavado Indigo** (`indigo-plancito-wash`): soft brand backgrounds — empty-state halos, icon tiles, landing illustration panels. In dark mode use indigo-400 at 10–20% opacity instead.
- **Tinta Indigo Nocturna** (`indigo-plancito-ink-dark`): brand ink (links, active nav labels) on dark surfaces, where the deep indigo fails contrast.

### Neutral

- **Papel** (`papel`): page background in light mode.
- **Papel Blanco** (`papel-blanco`): cards, rows, bars, sheets — anything that sits on the page.
- **Papel Hover** (`papel-hover`): hover rows, progress tracks, quiet fills.
- **Borde de Papel** (`papel-borde`): every divider and card outline in light mode.
- **Carbón** (`carbon`): primary text in light mode; page background in dark mode.
- **Carbón Medio** (`carbon-muted`): secondary text, inactive nav, descriptions (7.2:1 on Papel). Dark mode: `#AAB5C5`.
- **Carbón Tenue** (`carbon-subtle`): tertiary text, dates, chevrons, group labels; the lightest text allowed (≥4.5:1 on Papel). Dark mode: `#8593A8`.
- **Carbón Superficie** (`carbon-superficie`): cards, containers, modals in dark mode.
- **Borde de Carbón** (`carbon-borde`): borders and hover fill in dark mode.

### Semantic

- **Success** (`success`): active subscriptions, free slots (dashed green), progress fills.
- **Warning** (`warning`): expiring soon.
- **Danger** (`danger`): expired, attention badges, destructive actions.
- **Info** (`info`): paused.
  The 500 tones are for fills, bars and borders only. Text and icons use the ink pair, exposed as `text-success-ink` / `text-warning-ink` / `text-danger-ink` / `text-info-ink`: green-700, amber-700, red-600, blue-700 in light mode (`success-ink` … `info-ink` above), and green-400, amber-400, red-400, blue-300 in dark mode.
  Status pills and tone chips use the Tailwind 100/700 tint pair in light mode and the 500-at-15% / 300 pair in dark mode (e.g. `bg-red-100 text-red-700` → `bg-red-500/15 text-red-300`). Cancelled is neutral slate; migrated uses violet.

### Named Rules

**The Tokens-Only Rule.** Components use the surface/content tokens (`bg-surface`, `bg-surface-muted`, `border-border`, `text-content`, `text-content-muted`, `text-content-subtle`, `text-brand-ink`), never raw slate hex, so dark mode and rebranding stay a token edit in `src/index.css` mirrored in `antd-provider.tsx`.

**The One Voice Rule.** Indigo is the only brand hue in the panel. Violet (`#8B5CF6`) exists as an accent token but stays out of panel chrome; it lives in promotion templates and the `migrated` status only.

**The Color Means State Rule.** Red, amber, green and blue appear only when they say something about a subscription, slot, payment or error. Never as decoration.

**The Ink Rule.** Colored text and icons always use an `-ink` token or `text-brand-ink`, never a 500 tone: `text-success` on white is 2.3:1. Every text pair passes AA (4.5:1) in both themes.

## Typography

**Display Font:** Inter (variable, optical size 14–32, roman 400–900 only, loaded from Google Fonts via `<link>` with preconnect in `index.html`), fallback sans-serif
**Body Font:** Inter
**Label Font:** Inter

**Character:** One family doing all the work. Hierarchy comes from weight and tracking: extrabold, tight-tracked numbers and titles against plain 14px body, so a balance or a count reads before the words around it.

### Hierarchy

- **Display** (800, 34px → 56px at `md`, 1.05): landing hero headline only. `text-balance`.
- **Headline** (800, 26px → 38px, 1.25): landing and public section titles.
- **Title** (700, 22px → 24px at `md`): page titles in the panel (`PageHeader`, dashboard greeting).
- **Figure** (800, 30px): hero money figures (estimated monthly income). Stat tiles use 20–24px bold.
- **Section** (700, 16px): section headings inside panel pages ("Requiere atención").
- **Body** (400, 14px): default panel text; 15px for landing paragraphs and longer descriptions.
- **Row title** (600, 15px): the title of a card or list row (service, account, promotion, customer). Customer names render uppercase; a customer shown as the second line inside a card drops to 14px.
- **Caption** (400, 12px): secondary row lines, metadata, helper text.
- **Label** (600, 11px, 0.05em, uppercase): eyebrows and card labels ("INGRESO MENSUAL"); also bottom-nav labels at 500 weight, not uppercase.

### Named Rules

**The Weight-Not-Size Rule.** Prefer stepping weight (400 → 600 → 700 → 800) over adding new font sizes. The panel ladder is 11 (label, pill), 12 (caption), 14 (body, form labels), 15 (row title), 16 (section), 22→24 (page title), 30 (figure). No 10, 13 or half-pixel sizes.

**The Tight Numbers Rule.** Money, counts and titles at 20px and above use `tracking-tight`; body text never does. Numerals are tabular everywhere (`font-variant-numeric: tabular-nums` on `body`) so amounts, days and slot counts align and do not jump when they update.

**The One Title Rule.** Every panel page title is the same role: 22px bold tight, 24px from `md` (`PageHeader`, dashboard greeting).

## Layout

- **Mobile-first shell.** Below `md` (768px): fixed top bar, content, fixed bottom navigation (min 56px tall, safe-area padded) and a FAB at bottom-right above it. Content keeps 160px of bottom padding so the last card's actions clear the FAB. From `md`: a left sidebar replaces both; the FAB disappears and its action moves to the page header.
- **Gutter.** 16px side padding on mobile (chip rows bleed to the edge with `-mx-4 px-4`); 20–32px on landing.
- **Rhythm.** 4px base. Gaps of 8, 10, 12px inside components; 24px between page sections. Card padding 12–16px.
- **Panel grids.** Every grid declares `grid-cols-1` (`minmax(0,1fr)`) on mobile so long names truncate instead of widening the page.
- **Dashboard.** Today first: the "Requiere atención" list leads (first on mobile, the `2fr` column from `md`); income, free slots and accounts to renew follow in the `1fr` column. No row of summary counters: counts appear as the list's subtitle ("2 vencidas · 2 por vencer").
- **Landing.** `max-w-6xl` container, `1.15fr / 1fr` hero split at `md`, sections 64px → 96px vertical padding.
- **Overlays.** On mobile, modals are bottom sheets (`ResponsiveModal` / `.panel-sheet`): content height up to 92dvh, internal scroll, footer padded for the home indicator. On desktop, centered AntD modals.

## Elevation & Depth

Plancito is **flat**. Depth comes from tonal layering — white (Papel Blanco) cards on Papel page in light mode, Carbón Superficie on Carbón in dark mode — plus a 1px border. Shadows are reserved for elements that actually float above the page.

### Shadow Vocabulary

- **Floating action** (`box-shadow: 0 10px 15px -3px rgb(79 70 229 / 0.35)`): the FAB only.
- **Overlay**: AntD default elevation for drawers, bottom sheets, modals, dropdowns, popovers and toasts.
- **Device mock** (`shadow-2xl` tinted indigo-900/25): the landing phone illustration (public surface only).

### Named Rules

**The Flat-By-Default Rule.** Cards, rows, stat tiles and the income hero card have no shadow; a border (or, for the hero card, its solid indigo fill) separates them. If it does not float, it does not cast a shadow.

## Shapes

Gently rounded, thumb-friendly forms. Radius grows with the size of the element.

- **8px** (`rounded-lg`, AntD `borderRadius`): buttons, inputs, sidebar items, small icon tiles.
- **12px** (`rounded-xl`): cards, list containers, row groups, landing feature rows — the most common container radius.
- **16px** (`rounded-2xl`): hero card, FAB, empty-state icon tile, landing feature cards.
- **20px**: top corners of bottom sheets; promotion template cards.
- **Pill** (`rounded-full`): filter chips, status pills, count badges, avatars, the active bottom-nav indicator.
- **Slot segments**: 3px radius, 8px tall — the one deliberately small radius.

Borders are 1px solid (`border-border`). Dashed borders mean "empty / available": free slots and empty-list placeholders.

## Components

### Buttons

- **Character:** AntD buttons themed by tokens; firm and simple.
- **Primary:** Indigo Plancito Profundo fill, white text, 8px radius. Hover lightens toward Indigo Plancito, press deepens (AntD-derived). Landing CTAs grow to 52px height with 28px horizontal padding and 16px semibold text.
- **Default / ghost:** AntD defaults on surface tokens.
- **Dark secondary** (`.btn-brand-secondary`): slate-800 fill, white text, brightness 1.4 on hover.

### Chips

- **Filter chips:** 36px pill row, 14px semibold, horizontally scrollable on mobile, with optional `· count`. Unselected chips carry a tone (neutral outlined, or the semantic 100/700 tint); selected is solid Indigo Profundo with white text. Exposed as `role="tablist"`.
- **Status pills:** small pill (10–11px bold) using the semantic tint pairs.
- **Count badges:** min 20px wide pill, 11px bold, red tint; white-on-25% inside the active sidebar item.

### Cards / Containers

- **Corner Style:** 12px.
- **Background:** `bg-surface` on `bg-surface-muted`.
- **Shadow Strategy:** none (see Flat-By-Default).
- **Border:** 1px `border-border`.
- **Internal Padding:** 12–16px. Grouped rows use `divide-y divide-border` inside one container rather than separate cards.

### Hero Card (signature)

The dashboard's estimated monthly income: solid Indigo Profundo, 16px radius, 16px padding, white text. An uppercase 11px label at 80% opacity, the figure at 30px extrabold, a white/20 divider, then "Por cobrar" (amount · customers) when something is owed. Information only, no button: the actions live in the attention list. One per screen.

### Attention Row (dashboard)

One urgent sale in a single divided list: service avatar (40px), customer name (row title, uppercase), then a meta line led by the colored due label ("Venció hace 5 días" in danger ink, "Vence mañana" in warning ink) followed by service and price. Actions are Renovar (primary, 36px) and WhatsApp (outlined, 44px wide), under the text on mobile and inline at the right from `md`. No status pill, progress bar or overflow menu: the full card lives in Suscripciones.

### List Rows

Avatar (customer avatar with country flag, or service avatar) + two lines (14px semibold name, 12px subtle meta) + status pill or chevron. 10–12px padding, full-row link. Long names truncate.

### Slot Bar (signature)

Mother-account capacity as inventory: one 8px segment per slot up to 12 (proportional bar beyond), used slots solid indigo, free slots dashed green on green tint. Labeled for screen readers ("3 de 5 cupos usados").

### Inputs / Fields

- **Style:** AntD inputs on tokens: 8px radius, `colorBgContainer` surface, slate border.
- **Focus:** AntD indigo focus outline.
- **Error:** 422 validation errors mapped onto AntD form fields (`useInvalidateForm`); error text in danger.
- Phone fields include country flag and WhatsApp-ready formatting.

### Navigation

- **Bottom nav (mobile):** surface bar with top border, items stacked icon (24px) over 11px label. Active item gets a 56×28px pill behind the icon (indigo at 15%, 20% in dark) and brand-ink label; inactive items are Carbón Medio.
- **Sidebar (`md`+):** 14px medium items, 8px radius, 10px vertical padding. Active is solid Indigo Plancito Profundo with white text; hover is `bg-surface-hover`. Attention badges sit at the end of the row.
- **Top bar:** sticky surface bar with border; on landing it is translucent (`bg-surface/90` + backdrop blur).

### Empty State

Centered, max 384px wide: 96px wash-colored circle holding a 56px surface tile with the icon, 18px bold title, 14px muted description, then actions. Explains what the section is for and what to do next. A danger tone exists for load errors.

### FAB

56px, 16px radius, Indigo Profundo, white plus icon, the floating-action shadow, `active:scale-95`. Mobile only, placed above the bottom nav and safe area.

### Motion

One shared curve, `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`. Durations: 150–200ms for feedback and swaps, 300ms for list entrances (staggered 50–60ms per item, capped), 500ms for a one-time hero entrance. Every animation has a `prefers-reduced-motion` fallback that keeps only opacity. Spinners wait 300ms before appearing. Entrance motion belongs to public surfaces; the panel animates state (color, width, scale on press) rather than arrival.

## Do's and Don'ts

### Do:

- **Do** use the surface/content tokens and `text-brand-ink` for every color in panel components, so light and dark both work.
- **Do** keep panel containers flat: 12px radius, 1px `border-border`, no shadow.
- **Do** reserve solid indigo for the primary action, the current selection and one hero figure per screen.
- **Do** design the phone layout first: bottom nav, FAB, bottom sheets, 16px gutter, touch targets of at least 36px (56px for nav items).
- **Do** put state colors only on state: semantic 100/700 tints in light mode, 500/15 + 300 in dark.
- **Do** use `--ease-out` and provide a reduced-motion fallback for any animation.
- **Do** let public surfaces (landing, portal, promotions) be more expressive in type scale, washes and entrance motion, using the same tokens.

### Don't:

- **Don't** make it look like a generic Ant Design admin: no dark sidebar, no grey data tables as the main view, no default AntD chrome left unthemed.
- **Don't** drift into a cold fintech look: no chart walls, no corporate distance; show what needs action today before totals.
- **Don't** add shadows to cards, rows or tiles; only floating elements (FAB, overlays) cast them.
- **Don't** hardcode slate hex values or add a second brand hue to panel chrome.
- **Don't** use red, amber, green or blue decoratively.
- **Don't** introduce new font families or off-scale font sizes in the panel.
