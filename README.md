# Bahi Khata — Credit Ledger (Next.js)

A mobile-friendly web app for small shopkeepers to manage customers, track items given on credit, and clear dues when customers pay in cash.

## Features
- **Multi-Tenant Shopkeeper Accounts** — Sign up & log in with Mobile Number and PIN/Password. Each shopkeeper's customer ledger is strictly isolated.
- **Dashboard** — outstanding credit, customer count, customers with dues, settled count, recent activity
- **Customers** — search, add, edit, delete
- **Customer ledger** — add/edit/delete credit entries, record cash payments, running balance
- **Cloud Database** — backed by Supabase PostgreSQL via Prisma ORM
- **Responsive** — bottom tab bar on mobile, sidebar on desktop

## Tech Stack
- **Framework**: Next.js 16 (App Router + Turbopack) & React 19
- **Database & ORM**: PostgreSQL (Supabase) + Prisma ORM 7
- **Authentication**: Phone Number + PIN/Password, Bcrypt password hashing, and JWT session cookies (`jose`)
- **Styling**: Tailwind CSS with custom Indian ledger color theme
- **Package Manager**: pnpm

## Getting Started

Use Node.js 20.19+, 22.12+, or 24+. Install dependencies with `pnpm install`.
Prisma Client is generated during installation and before development and production builds.

### 1. Configure Environment Variables
Copy `.env.example` to `.env` and provide your Supabase PostgreSQL connection string and a secret key:

```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
JWT_SECRET="your_secure_random_string_32_characters_minimum"
```

> **Tip for Supabase with Next.js**: You can use either the direct connection (`port 5432`) or the Transaction Pooler connection string (`port 6543` with `?pgbouncer=true`).

### 2. Push Database Schema
Push the Prisma schema to your Supabase PostgreSQL instance:

```bash
pnpm prisma db push
pnpm prisma generate
```

The Prisma CLI loads `.env` through `prisma.config.ts`. Prisma 7 does not
automatically regenerate the client after schema pushes; run `pnpm prisma generate`
after schema changes.

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build for Production

```bash
pnpm build
pnpm start
```

## Project Structure
```
app/
  layout.tsx                     root layout, fonts
  page.tsx                       main app: view/state orchestration & auth gating
  globals.css
  lib/
    types.ts                     Customer, Entry, and AuthUser types + helpers
    prisma.ts                    Prisma client singleton
    auth.ts                      Password hashing, JWT signing, session verification
    useDB.ts                     Client-side state hook synced with backend API
  api/
    auth/
      signup/route.ts            Shopkeeper registration
      login/route.ts             Shopkeeper login
      logout/route.ts            Shopkeeper session clearance
      me/route.ts                Current authenticated shopkeeper profile
    customers/
      route.ts                   List and create customers for shopkeeper
      [id]/route.ts              Update and delete customer
      [id]/entries/route.ts      Add credit / payment entry
      [id]/entries/[entryId]/route.ts Update and delete entry
  components/
    AuthModal.tsx                Login & Signup modal for shopkeepers
    Nav.tsx                      Sidebar, mobile header, topbar (with shop info & logout)
    Dashboard.tsx
    CustomersList.tsx
    CustomerDetail.tsx
    CustomerSheet.tsx            Add/edit customer modal
    EntrySheet.tsx               Add/edit credit/payment modal
    Sheet.tsx                    Generic modal wrapper
    Toast.tsx
prisma/
  schema.prisma                  Prisma schema (User, Customer, Entry)
```
