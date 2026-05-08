# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack business management application for a specific scaffolding rental company.
Backend: Node.js/Express/TypeORM/SQLite.
Frontend: Vue 3/TypeScript/Vite/PrimeVue/TailwindCSS.

## Common Commands

```bash
make build             # Build both frontend and backend for production
make test-all          # Run all tests (lint, unit, e2e)
```

**Backend (in `backend/`):**

```bash
npm run build          # Compile TypeScript (tsc + tsc-alias)
npm run test           # Lint + unit tests
```

**Frontend (in `frontend/`):**

```bash
npm run build          # Production build
npm run test           # Lint + type check + unit tests
npm run format         # Auto-fix ESLint + Prettier
```

**Tests (from root):**

```bash
npm run test:unit      # Vitest unit tests (excludes e2e, excludes sub-packages)
npm run test:lint      # ESLint across entire project
npm run test:e2e       # Playwright E2E tests (requires running backend on :3001)
# Run single test file:
npx vitest run backend/tests/someFile.test.ts
# E2E with UI:
PLAYWRIGHT_BACKEND_PORT=5173 npm run test:e2e -- --ui
```

## Architecture

### Request Flow

Frontend (Vue SPA on :5173) → Vite proxy `/api` → Backend (Express on :3001) → SQLite via TypeORM

In production, the backend serves the built frontend as static files from `backend/dist/static/`.

### Backend Structure (`backend/src/`)

- `index.ts` — HTTP/HTTPS server setup
- `main.ts` — Express app, middleware wiring, route mounting
- `config.ts` — All config loaded from `.env` file (see `CONFIG_PATH` env var)
- `authorization.ts` — Basic Auth middleware + 4-role permission system (Admin, Partner, Invoicing, Employee)
- `db/dataSource.ts` — TypeORM SQLite datasource; entities in `db/entities/`
- `routes/` — Express routers per domain: `clients.ts`, `articles.ts`, `users.ts`, `orders/`, `documents/`
- `pdf/` — PDFKit-based PDF generation (invoice, offer, reminder)
- `services/` — `email.ts` (Nodemailer), `dropbox.ts` (cloud backup)
- `tasks/` — Standalone cron job scripts: `backup/`, `overdue_email/`, `prepared_orders_mail/`
- `migrations/` — TypeORM migration files

Path alias: `@/*` → `src/*` (both frontend and backend).

### Frontend Structure (`frontend/src/`)

- `main.ts` — App entry, PrimeVue + Pinia setup
- `router.ts` — Vue Router; all routes require auth
- `store.ts` — Pinia stores
- `backendClient.ts` — Axios instance with Basic Auth headers
- `views/` — 8 page components (ClientList, Client, OrderList, Order, DocumentList, Document, Article, Reporting)
- `components/` — UI components organized by domain (documents/, orders/, articles/, NavigationBar)
- `composables/` — Reusable Vue composables
- `helpers/` — Utility functions

### Database Entities

SQLite via TypeORM.
The core business flow is: Client → Order → Offer / Invoice / OverdueNotice.
Each of those can produce a corresponding Document (the PDF-ready snapshot).

#### `Client`

A customer of the scaffolding company with standard contact and address data.
Has many Orders.

#### `Order`

The central work unit representing a scaffolding job for a client.
Has a title, description, and status lifecycle: `Angebot` → `Vorbereitung` → `Fertig` → `Abgebaut` (optionally `Gesperrt`).
Carries optional Skonto (early-payment discount) settings that are inherited by Invoices.

An Order has at most one Offer, and can have multiple Invoices and OverdueNotices.

#### `Article`

A reusable price-list entry (product/service template) used as the source when building line items on Offers and Invoices.
Has a `kind`: `Artikel` (billable line item) or `Hinweis` (text-only heading/note).
Item data is **copied** into the Offer/Invoice at the time of selection — not linked.

#### `Offer`

A price quote attached to an Order (one-to-one).
Tracks status (`-` / `Ausgestellt` / `Bestätigt` / `Abgelehnt`), validity dates, and a list of line items (**OfferItems**).

#### `Invoice`

A billing record on an Order.
One Order can have multiple partial invoices.
Tracks payment status (`-` / `Ausstehend` / `Bezahlt` / `Gemahnt`), a payment target date, and `service_dates` (the rental period being billed).
Contains a list of line items (**InvoiceItems**).

#### `OverdueNotice`

A payment reminder on an Order that references one or more issued InvoiceDocuments.
Has a `notice_level` (`1. Mahnung` / `Letzte Mahnung`), its own payment status, a flat `notice_costs` fee, and an optional `default_interest` percentage.

#### Documents (`OfferDocument`, `InvoiceDocument`, `OverdueNoticeDocument`)

Immutable PDF snapshots created when a document is issued.
Client and order data is **duplicated** into the document at creation time so it remains historically accurate even if the source records are later edited.
Each document type mirrors the data of its source entity (Offer / Invoice / OverdueNotice) and contains a snapshot of its line items.

### Authorization

4 roles:

- **Admin** and **Partner** have full access
- **Invoicing** can manage documents and update orders but not edit clients/articles
- **Employee** is read-only.
Users/passwords configured via environment variables.

## Environment Configuration

Config loaded from `.env` (or path specified by `CONFIG_PATH`).
Key variables:

- `HTTP_PORT` (default 3001), `USE_HTTPS`, HTTPS cert paths
- `DB_PATH` — SQLite file path
- `USER_*_NAME` / `USER_*_PASSWORD` — credentials for 4 roles
- `DROPBOX_*` — Dropbox backup credentials
- `APP_MAIL_*` — SMTP email config
- `VITE_COMPANY_*` — Company branding used in PDFs and frontend

Development env file: `.env.development`

## Style

### Language

The app UI is in German — all user-facing strings (labels, button text, toast messages, error messages, placeholder text) are and must remain German.
All code must be in English: variable names, function names, comments, type names, test data values, and any other non-user-facing identifiers.
In tests, UI selector strings (e.g. `getByRole("button", { name: "Speichern" })`) must match the German app text and are the only acceptable exception.

### Error Handling

- Keep try-catch blocks as small as possible — only the operations that can actually throw should be inside.
This makes error attribution clear and avoids the anti-pattern of thoughtless global try-catch sections with generic handling.

### Markdown / Documentation

- Use one sentence per line in prose paragraphs (applies to CLAUDE.md and any other markdown docs in this repo).

## Deployment

- Target: Remote, manually managed VPC via SSH.
- Process managed by PM2 (`deployment/pm2.config.js`).
- Build locally with `make build`, deploy with Makefile targets in `deployment/`.
- Frontend build is copied into `backend/dist/static/` and served as static files.

**IMPORTANT: Never run deployment commands.**
Do not execute `make deploy`, `make sync-db`, any `scp` transfers, or any SSH commands targeting the production server.
Deployment must always be done manually by the user.
