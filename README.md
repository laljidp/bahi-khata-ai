# Bahi Khata — Credit Ledger (Next.js)

A mobile-friendly web app for small shopkeepers to manage customers, track items given on credit, and clear dues when customers pay in cash.

## Features
- **Dashboard** — outstanding credit, customer count, customers with dues, settled count, recent activity
- **Customers** — search, add, edit, delete
- **Customer ledger** — add/edit/delete credit entries, record cash payments, running balance
- Responsive: bottom tab bar on mobile, sidebar on desktop
- Data is saved in the browser via `localStorage` (per device, no backend needed)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build for production

```bash
npm run build
npm run start
```

## Tech stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- No external backend — all data lives in `localStorage` under the key `bahikhata_data_v1`

## Project structure
```
app/
  layout.tsx          root layout, fonts
  page.tsx             main app: view/state orchestration
  globals.css
  lib/
    types.ts           Customer/Entry types + helpers
    useDB.ts            localStorage-backed state hook
  components/
    Nav.tsx             sidebar, mobile header, bottom nav, FAB
    Dashboard.tsx
    CustomersList.tsx
    CustomerDetail.tsx
    CustomerSheet.tsx    add/edit customer modal
    EntrySheet.tsx       add/edit credit/payment modal
    Sheet.tsx            generic modal wrapper
    Toast.tsx
```

## Notes / next steps
Since data is stored per-browser, switching devices won't carry data over. To make this multi-device (e.g. shopkeeper uses phone and desktop), swap `useDB` for calls to a real backend/database — the rest of the app already works off plain `Customer[]` data, so the UI components won't need to change.
