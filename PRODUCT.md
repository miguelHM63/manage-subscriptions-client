# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Vendedor (primary).** A small reseller in Peru who buys "cuentas madre" (multi-profile accounts) and resells profiles/plans to their own customers. Runs the whole business from a phone, between other tasks, and talks to customers over WhatsApp. Their job: know who is due today, collect, renew, and keep track of slots, credentials and money without a spreadsheet. Self-registers; becomes `owner` of their own organization.
- **Cliente final.** The reseller's customer. Opens a private link + PIN (customer portal) to see their accesses and credentials, days remaining, and to ask for renewal over WhatsApp. Also lands on a reseller's public promotion link. Sees the reseller's business (name, logo), not Plancito, as the face of the relationship.
- **Sub-vendedor (next).** Resellers working under an owner (`owner → reseller → sub-reseller`). Roles are prepared but not built; future work must leave room for them (seats, permissions via CASL).
- **Platform admin (internal).** Activates paid plans and sets their validity manually; reviews payment receipts. Not a design audience for marketing.

## Product Purpose

Plancito is a multi-tenant SaaS for managing the resale of subscriptions: services, mother accounts with slot control, customers, subscriptions, renewals with payment history, and expirations. It exists to replace notebooks, spreadsheets and memory with one place that says who expires, who owes, and how many slots are left. Success for a reseller: never miss a renewal, collect on time, and spend seconds, not minutes, per customer.

## Positioning

Public copy speaks to people who sell "cuentas y planes", **without naming streaming platforms**. Streaming is the real first vertical, but naming Netflix/Spotify/etc. is avoided because account resale often breaches those platforms' terms and because the model must grow to any recurring sale (gyms, memberships, software). Plancito sells the management tool, never the accounts.

What a neighboring product cannot truthfully copy (confirmed differentiators):

1. **Simple and mobile-first.** Built to be used in seconds from a phone: see who is due and message them on WhatsApp in one tap.
2. **Promotions and customer portal.** Promotions with a public link and sale by code (no competitor offers this), plus a customer portal behind link + PIN, safer than most competitors' portals.
3. **Low price.** Pro at S/10/month, half of the most direct competitor (StreamGestor, ~S/20); acquisition by volume.

Expiry alerts and WhatsApp reminders are table stakes in this category, not differentiators.

## Operating Context

- Market: Peru first, currency PEN (S/), locale es-PE, default timezone America/Lima. Spanish is the primary UI language; English locales exist.
- Communication with customers happens in WhatsApp (phone numbers stored with country, WhatsApp-ready format). Payments from customers arrive by Yape/Plin/transfer and are recorded manually; receipts can be uploaded.
- Core loop: register a mother account with capacity → sell a subscription (occupies a slot) → track its end date → renew (creates a Payment, extends the end date) → follow up when due.
- Plancito's own billing is manual and prepaid (monthly / semiannual / annual); a platform admin activates plans.
- In-app "Cómo usarlo" section with animated (Remotion) tutorials.

## Capabilities and Constraints

**Built:** self-service signup (email or Google) creating an organization on Free; services catalog; mother accounts with slots, cost and encrypted credentials; customers with country/phone and generated avatars; subscriptions with selectable or custom duration, status and service change; renewals with payment history and receipts; "vencimientos" views (expired, due today, this week); estimated monthly income and receivables; promotions with public link and code-based sales; customer portal (link + PIN); business profile with cropped logo/photo; plan gating (blocks creating beyond the plan limit, never deletes); platform-admin panel for plans and payments; light/dark/system theme; legal pages (privacy, terms).

**Plans:** Free S/0 (20 customers, manual reminders, 5 receipts/month) · Pro S/10/month or S/100/year (200 customers, 300 receipts) · Business S/20/month or S/200/year (unlimited customers, 1000 receipts). Source of truth: `src/modules/organization/plans.ts`. Features not yet built are marked `soon` and must never be sold as available.

**Not built yet (do not present as available):** automatic reminders and Telegram/in-app notifications (cron), WhatsApp automation, sub-resellers, payment gateway (Culqi/Izipay/MercadoPago, phase 2).

**Terminology:** cuenta madre (mother account), cupos (slots), vencimiento, renovar, cliente, venta, promoción, comprobante. User-facing section names: "Mis Cuentas", "Cómo usarlo".

**Technical:** this client is derived from a generic base starter (React 19, Vite, Ant Design 6, Tailwind v4, i18next, CASL); keep base-level changes reusable. Customer names display in uppercase.

## Brand Commitments

- Name: **Plancito** ("plan" = plans/subscriptions, category-agnostic; "-cito" = close, friendly Peruvian/LATAM tone). Domain `plancito.pe`; never `.com` (taken by an unrelated app). Name is centralized as `APP_NAME` in `src/config.ts`.
- Tone: warm and close to small resellers, balanced by a clean, professional product so the diminutive does not read as unserious.
- Logo: current Plancito logo and icons in `public/` (`plancito-icon.svg`, `favicon.svg`, app icons); previous versions kept as `*.old.*` backups only.
- On customer-facing surfaces (portal, promotions), the reseller's business identity leads.
- Trademark registration at INDECOPI is pending.

## Evidence on Hand

- Product docs: `../docs/discovery.md`, `../docs/mvp-plan.md`, `../docs/competencia.md` (competitor research, 2026-10-16), `../docs/branding.md`.
- Tutorial videos/assets: `public/tutorials/`, `src/modules/tutorials/`.
- **None yet:** testimonials, customer counts, case studies, press, usage metrics. Do not fabricate them.

## Product Principles

1. **Seconds, on a phone.** Every frequent task must be doable one-handed in a few taps; the reseller is never at a desk.
2. **Today first.** Lead with what needs action now (expired, due today, owed) before totals and history.
3. **WhatsApp is the channel.** Hand off to WhatsApp instead of rebuilding messaging.
4. **Honest about the plan.** Never sell what is `soon`; gate by blocking new creation, never by losing data.
5. **The reseller's brand faces their customer.** Customer-facing pages serve the reseller's business, with Plancito in the background.
