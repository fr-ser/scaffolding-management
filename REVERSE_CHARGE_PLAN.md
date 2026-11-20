# Milestone Plan: Reverse-Charge & Client Country Support

## Agent Handoff & Continuity Instructions

This document is the single source of truth for the implementation of the Reverse-Charge feature.
It is organized into sequential milestones with granular checklists so that an agent can work on it, update progress, and cleanly hand it off to the next agent if token or budget limits are reached.

### How to Pick Up This Task (For Incoming Agents)

1. Read this entire document first to understand the context and design rules.
2. Check the **Milestone Progress Overview** table below to see which milestones are marked as `[Completed]` and which one is `[In Progress]`.
3. Read the git status and run the verification step of the last completed milestone to confirm the state of the workspace.
4. Continue with the first unchecked item (`- [ ]`) in the current or next milestone.

### How to Pause / Hand Off (For Outgoing Agents)

1. Check off all tasks (`- [x]`) that you have completed and verified.
2. Update the **Status** column in the **Milestone Progress Overview** table.
3. If stopping mid-milestone, leave a short note in the **Current Work Log / Handoff Notes** section at the bottom explaining the exact next file or step to execute.
4. Ensure files are saved and cleanly formatted.

---

## Milestone Progress Overview

| Milestone | Title                                         | Status      | Primary Focus Areas                                                 |
| :-------- | :-------------------------------------------- | :---------- | :------------------------------------------------------------------ |
| **M1**    | Database Schema, Entities & Migration         | Not Started | TypeORM entities, shared interfaces, migration script               |
| **M2**    | Backend Snapshotting & API Routes             | Not Started | Document creation endpoints in `routes/orders/`                     |
| **M3**    | Backend PDF Generation & PDF Snapshot Tests   | Not Started | `renderPDF.ts`, `invoice.ts`, `reverse_charge_invoice_snapshot.pdf` |
| **M4**    | Frontend Client Management                    | Not Started | `ClientView.vue`, validation composables, country & VAT ID inputs   |
| **M5**    | Frontend Order, Invoice & Document Views      | Not Started | Order badge, `SubOrderPositions`, `DocumentArticleTable`            |
| **M6**    | Playwright E2E Tests, Regression & Onboarding | Not Started | `tests/e2e/reverse_charge.spec.ts`, full test suite, Montron setup  |

---

## Milestone 1: Database Schema, Entities & Migration

**Objective:** Extend the data model with `country`, `reverse_vat`, and `vat_id` on clients, and add the corresponding snapshot fields to documents.

- [ ] **1.1 Update Client Entity**
  - File: `backend/src/db/entities/client.ts`
  - Add `@Column({ type: "text", default: "DE" }) declare country: string;`
  - Add `@Column({ type: "boolean", default: false }) declare reverse_vat: boolean;`
  - Add `@Column({ type: "text", nullable: true }) vat_id?: string;`
- [ ] **1.2 Update BaseDocument Entity**
  - File: `backend/src/db/entities/documents.ts`
  - Add `@Column({ type: "text", default: "DE" }) declare client_country: string;`
  - Add `@Column({ type: "boolean", default: false }) declare reverse_vat: boolean;`
  - Add `@Column({ type: "text", nullable: true }) client_vat_id?: string;`
- [ ] **1.3 Synchronize Global TypeScript Interfaces**
  - Files: `backend/src/global/types/entities.ts` and `frontend/src/global/types/entities.ts`
  - Add `country: string;`, `reverse_vat: boolean;`, and `vat_id?: string;` to `interface Client`.
  - Add `client_country: string;`, `reverse_vat: boolean;`, and `client_vat_id?: string;` to `interface BaseDocument`.
  - Confirm `diff -r backend/src/global frontend/src/global` shows no unintentional differences.
- [ ] **1.4 Create Database Migration**
  - Create file: `backend/src/migrations/1785000000000-add-client-country-and-reverse-vat.ts`
  - In `up()`:
    - Add `country` (`TEXT NOT NULL DEFAULT 'DE'`), `reverse_vat` (`INTEGER NOT NULL DEFAULT 0`), and `vat_id` (`TEXT NULL`) to table `client`.
    - Add `client_country` (`TEXT NOT NULL DEFAULT 'DE'`), `reverse_vat` (`INTEGER NOT NULL DEFAULT 0`), and `client_vat_id` (`TEXT NULL`) to tables:
      - `invoice_document`
      - `offer_document`
      - `credit_note_document`
      - `overdue_notice_document`
  - In `down()`:
    - Drop the added columns from the respective tables.
- [ ] **1.5 Milestone 1 Verification**
  - Verify migration file compiles and can run against a temporary SQLite instance.
  - Verify entity definitions match database schema.

---

## Milestone 2: Backend Snapshotting & API Routes

**Objective:** Ensure all document creation routes snapshot client country, VAT ID, and reverse-VAT settings to maintain historical accuracy.

- [ ] **2.1 Update Invoice Document Route**
  - File: `backend/src/routes/orders/invoices.ts`
  - Locate `POST /api/orders/invoices/:id/create-document`.
  - Ensure the client relation is fetched (`relations: { order: { client: true }, items: true }`).
  - Pass the snapshot fields when instantiating `InvoiceDocument`:
    - `client_country: invoice.order.client.country || "DE"`
    - `client_vat_id: invoice.order.client.vat_id`
    - `reverse_vat: invoice.order.client.reverse_vat ?? false`
- [ ] **2.2 Update Offer Document Route**
  - File: `backend/src/routes/orders/offers.ts`
  - Pass `client_country`, `client_vat_id`, and `reverse_vat` when creating `OfferDocument`.
- [ ] **2.3 Update Credit Note Document Route**
  - File: `backend/src/routes/orders/credit_notes.ts`
  - Pass `client_country`, `client_vat_id`, and `reverse_vat` when creating `CreditNoteDocument`.
- [ ] **2.4 Update Test Factories & Mock Data**
  - File: `backend/src/tests/factories.ts`
  - Provide default values for `country: "DE"`, `reverse_vat: false`, and `vat_id: undefined` across client and document factories.
- [ ] **2.5 Milestone 2 Verification**
  - Run backend unit tests (`npx vitest run backend/src/tests/routes/invoice_documents.test.ts`).
  - Verify document creation properly persists the new snapshot columns.

---

## Milestone 3: Backend PDF Generation & EPC-QR Code

**Objective:** Format PDF documents for reverse-charge recipients according to legal requirements and customer specifications.

- [ ] **3.1 Recipient Address Header**
  - File: `backend/src/pdf/renderPDF.ts` in function `createSubHeader()`
  - Include country line if `documentData.document.client_country && documentData.document.client_country !== "DE"`.
  - Include client tax identification if present: `USt-IdNr.: ${documentData.document.client_vat_id}`.
- [ ] **3.2 Item Table Formatting**
  - File: `backend/src/pdf/renderPDF.ts` in function `createOfferOrInvoiceTable()`
  - Check `documentData.document.reverse_vat`.
  - If `reverse_vat === true`:
    - Display `"-"` in the `USt. %` column (instead of `19%` or `0%`).
    - Display `"-"` in the `Ust.` column (instead of calculating VAT).
    - Display `"-"` in the `Gesamt` column (gross amount placeholder).
- [ ] **3.3 Summary Table Formatting**
  - File: `backend/src/pdf/renderPDF.ts` in function `createTableBottomText()`
  - If `reverse_vat === true`:
    - **Netto**: `formatNumber(netSum, { currency: true })` (the actual payable amount)
    - **Umsatzsteuer**: `"-"` (explicit placeholder, never `0,00 €`)
    - **Brutto**: `"-"` (explicit placeholder, no gross amount under reverse charge)
- [ ] **3.4 Invoice Legal Notice & EPC-QR Code**
  - File: `backend/src/pdf/invoice.ts` in function `setInvoiceSubSumTableText()`
  - When `document.reverse_vat === true`:
    - Print statutory note: _"Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge)"_.
    - Print explanatory text: _"Die Rechnung enthält keine Umsatzsteuer, da die Steuerschuldnerschaft auf den Leistungsempfänger übergeht."_.
    - In EPC-QR Code generation: set `grossSum = document.reverse_vat ? netSum : netSum * (1 + vatRate)` so the encoded payment transfer amount is purely the net sum.
- [ ] **3.5 PDF Snapshot Test & Snapshot Generator**
  - Files:
    - `backend/src/tests/pdf/generate-snapshot-pdfs.ts`
    - `backend/src/tests/pdf/pdf.test.ts`
  - In `generate-snapshot-pdfs.ts`:
    - Add generation of `reverse_charge_invoice_snapshot.pdf` using a test invoice document factory configured with:
      - `reverse_vat: true`
      - `client_country: "AT"`
      - `client_vat_id: "ATU53502008"`
  - In `pdf.test.ts`:
    - Add test case: `test("reverse-charge invoice PDF generation", async () => { ... })` comparing rendered output against `reverse_charge_invoice_snapshot.pdf`.
  - Run `make generate-pdf-snapshots` (or `npm run generate-pdf-snapshots` in `backend/`) to generate the baseline snapshot file `backend/src/tests/pdf/reverse_charge_invoice_snapshot.pdf`.
- [ ] **3.6 Milestone 3 Verification**
  - Run PDF tests (`npx vitest run backend/src/tests/pdf/pdf.test.ts`).
  - Verify all PDF snapshot tests pass, including the new reverse-charge snapshot and existing snapshots.

---

## Milestone 4: Frontend Client Management

**Objective:** Allow operators to set client country, reverse-VAT status, and VAT ID in the client view.

- [ ] **4.1 Client View UI Form**
  - File: `frontend/src/views/ClientView.vue`
  - In the **Adresse** card:
    - Add `FloatLabel` with input or select for `country` (Label: `"Land"`).
    - Default value: `"DE"`.
  - In the **Sonstiges** card (or dedicated tax section):
    - Add checkbox or toggle switch for `reverse_vat` with label `"Reverse Charge (Steuerschuldnerschaft des Leistungsempfängers)"`.
    - Add `InputText` for `vat_id` with label `"USt-IdNr. / Steuer-Nr."` and placeholder `"z. B. ATU53502008"`.
- [ ] **4.2 Client Validation Composable**
  - File: `frontend/src/composables/useClientLogic.ts`
  - In `validateAndCleanPayload`:
    - Sanitize `country` (fallback to `"DE"` if empty).
    - Sanitize `reverse_vat` (boolean cast).
    - Trim `vat_id` (store as `null` or `undefined` if empty string).
- [ ] **4.3 Milestone 4 Verification**
  - Run frontend client tests (`npx vitest run frontend/src/__tests__/views/ClientView.spec.ts`).
  - Confirm form fields bind and update client payload correctly.

---

## Milestone 5: Frontend Order, Invoice & Document Views

**Objective:** Display the Reverse-Charge warning badge on orders and update invoice and document tables to show `-` for VAT.

- [ ] **5.1 Order View Visual Badge**
  - File: `frontend/src/views/OrderView.vue`
  - Check whether `selectedClient?.reverse_vat` or `(orderInfo as Order).client?.reverse_vat` is true.
  - When true, display a PrimeVue `Tag` in the order header:
    - `<Tag severity="warn" icon="pi pi-exclamation-triangle" value="Reverse Charge (ohne MwSt.)" />`
  - Pass `isReverseVat: boolean` down to sub-order editors (`InvoiceEdit`, `OfferEdit`, `CreditNoteEdit`).
- [ ] **5.2 Invoice Positions & Sub-Order Editing**
  - Files:
    - `frontend/src/components/orders/InvoiceEdit.vue`
    - `frontend/src/components/orders/SubOrderPositions.vue`
    - `frontend/src/components/orders/SubOrderItem.vue`
  - In `SubOrderPositions.vue`:
    - Accept prop `isReverseVat?: boolean`.
    - When `isReverseVat` is true, render sum bar as:
      - `Netto: {{ formatNumber(itemsNetSum, { currency: true }) }}`
      - `USt: -`
      - `Brutto: -`
  - In `SubOrderItem.vue`:
    - Accept prop `isReverseVat?: boolean`.
    - When `isReverseVat` is true, display position header as:
      - `Netto: {{ formatNumber(itemNet, { currency: true }) }} - Brutto: -`
- [ ] **5.3 Document Preview & Header**
  - File: `frontend/src/components/documents/DocumentTitle.vue`
  - Under the recipient section:
    - Display country if `result.client_country && result.client_country !== "DE"`.
    - Display `USt-IdNr.: {{ result.client_vat_id }}` if `result.client_vat_id` is set.
- [ ] **5.4 Document Article Table**
  - File: `frontend/src/components/documents/DocumentArticleTable.vue`
  - Check `props.document.reverse_vat`.
  - When true:
    - Position rows: render `"-"` for `USt.%`, `"-"` for `USt.`, and `"-"` for `Gesamt`.
    - Summary table: Netto displays net sum, Umsatzsteuer displays `"-"`, Brutto / Rechnungsbetrag displays `"-"`.
- [ ] **5.5 Document Legal Disclaimer**
  - File: `frontend/src/components/documents/DocumentText.vue`
  - When viewing an invoice document with `result.reverse_vat === true`, display:
    `"Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge)"`.
- [ ] **5.6 Milestone 5 Verification**
  - Run frontend test suite (`npx vitest run frontend/src/__tests__/`).
  - Verify document and order view components render expected reverse-charge elements.

---

## Milestone 6: Playwright E2E Tests, Regression & Onboarding

**Objective:** Validate all integration points with a dedicated Playwright E2E test, run full regression checks, and record Montron customer data.

- [ ] **6.1 Playwright End-to-End Test (`tests/e2e/reverse_charge.spec.ts`)**
  - Create file: `tests/e2e/reverse_charge.spec.ts`.
  - Write an automated Playwright test covering the end-to-end customer journey:
    - Navigate to the client list and create a client with:
      - Country: `"AT"`
      - USt-IdNr.: `"ATU53502008"`
      - Reverse Charge checkbox: checked
    - Create a new order for that client.
    - Assert that the `"Reverse Charge (ohne MwSt.)"` badge is visible in the order view.
    - Create an invoice within the order, add line items with amount and price.
    - Assert that the invoice positions sum section displays `"-"` for VAT and `"-"` for Brutto.
    - Issue the invoice document.
    - On the document preview page, assert:
      - Recipient address includes the country `"AT"` (or `"Österreich"`).
      - Recipient details include `USt-IdNr.: ATU53502008`.
      - Line item columns `USt.%`, `USt.`, and `Gesamt` display `"-"`.
      - Summary table displays Netto as net sum, `"-"` for Umsatzsteuer, and `"-"` for Brutto.
      - Statutory notice _"Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge)"_ is visible.
  - Run the test with: `npm run test:e2e` (or `npx playwright test tests/e2e/reverse_charge.spec.ts`).
- [ ] **6.2 Full Test Suite Verification**
  - Run linting: `make lint-all` (or `npm run lint` across packages).
  - Run all unit tests: `npm run test:unit`.
  - Run Playwright E2E suite: `npm run test:e2e`.
  - Confirm TypeScript compilation: `npm run build` in `backend/` and `frontend/`.

---

## Current Work Log / Handoff Notes

> Any agent working on this task should append updates here when concluding their work or hitting context boundaries.

- **Current Status:** Not Started.
- **Next Task:** Start Milestone 1: update `backend/src/db/entities/client.ts` and `backend/src/db/entities/documents.ts`.
- **Blockers / Dependencies:** None.
