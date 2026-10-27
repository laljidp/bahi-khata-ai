# Bahi Khata — Credit Ledger (Next.js)

A mobile-friendly web app for small shopkeepers to manage customers, track items given on credit, and clear dues when customers pay in cash.

## Features
- **Multi-Tenant Shopkeeper Accounts** — Sign up with email, mobile number, and PIN/Password; log in with email and PIN/Password. Each shopkeeper's customer ledger is strictly isolated.
- **Password Recovery** — Reset a password using a time-limited OTP sent to the registered email address.
- **Dashboard** — outstanding credit, customer count, customers with dues, settled count, recent activity
- **Customers** — search, add, edit, delete
- **Customer ledger** — add/edit/delete credit entries, record cash payments, running balance
- **Cloud Database** — backed by Supabase PostgreSQL via Prisma ORM
- **Responsive** — bottom tab bar on mobile, sidebar on desktop

## Tech Stack
- **Framework**: Next.js 16 (App Router + Turbopack) & React 19
- **Database & ORM**: PostgreSQL (Supabase) + Prisma ORM 7
- **Authentication**: Email login, phone number at signup, Bcrypt password hashing, and JWT session cookies (`jose`)
- **Email**: Resend API for password reset OTP delivery
- **Styling**: Tailwind CSS with custom Indian ledger color theme
- **Package Manager**: pnpm

## Getting Started

Use Node.js 20.19+, 22.12+, or 24+. Install dependencies with `pnpm install`.
Prisma Client is generated during installation and before development and production builds.

### 1. Configure Environment Variables
Copy `.env.example` to `.env` and provide your Supabase PostgreSQL connection string and a secret key:

```bash
DATABASE_URL="postgresql://bahi_app:[ROLE-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require"
JWT_SECRET="your_secure_random_string_32_characters_minimum"
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="Bahi Khata <accounts@your-verified-domain.com>"
```

`DATABASE_URL` is the application's restricted runtime connection. Do not use
the Supabase `postgres` or `service_role` credentials for app traffic;
administrative roles bypass RLS. `DIRECT_URL` is only for Prisma CLI schema
operations and must remain server-side.

> **Tip for Supabase with Next.js**: The runtime connection can use the Session
> Pooler or Transaction Pooler. For the Transaction Pooler, use its connection
> string with `?pgbouncer=true`; keep `DIRECT_URL` as a direct/admin connection.
> Verify your sending domain in Resend and configure `RESEND_FROM_EMAIL` with an address on that domain. Password reset codes expire after 10 minutes and can be entered up to five times.

### 2. Push Database Schema
Push the Prisma schema to your Supabase PostgreSQL instance:

```bash
pnpm prisma db push
pnpm prisma generate
```

The Prisma CLI loads `.env` through `prisma.config.ts`. Prisma 7 does not
automatically regenerate the client after schema pushes; run `pnpm prisma generate`
after schema changes.

When upgrading an existing database, this adds an email field but cannot infer
shopkeepers' email addresses. Backfill each existing account's verified email
address before that account next needs to log in; new signups require email.

### 3. Enable Row-Level Security

The app uses its own JWT sessions, not Supabase Auth, so its policies use
transaction-local `app.user_id` and `app.auth_operation` settings. The server
sets these for every Prisma transaction; they are cleared automatically when
the transaction ends.

First, in the Supabase SQL Editor, create a dedicated runtime role with a unique
strong password (do not reuse your `postgres` password):

```sql
CREATE ROLE bahi_app LOGIN
  PASSWORD 'replace-with-a-long-random-secret'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
GRANT CONNECT ON DATABASE postgres TO bahi_app;
```

Replace the example password before running the SQL. Then run
[`supabase/rls.sql`](./supabase/rls.sql) in the SQL Editor as an administrator.
It enables and forces RLS on users, customers, ledger entries, and password
reset codes, and grants the runtime role only the table operations the app
needs. Set `DATABASE_URL` to the `bahi_app` connection string and keep
`DIRECT_URL` set to the admin connection string. Never expose either URL to the
browser.

The `bahi_app` role must not own these tables and must not have `BYPASSRLS`.
The transaction-local identity is trusted server context; this setup is defense
in depth for requests handled by this app, not a way to let browsers connect
directly to PostgreSQL using the shared app credentials.

### 4. Run Development Server

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
      login/route.ts             Email-based shopkeeper login
      forgot-password/route.ts   Send a password reset OTP by email
      reset-password/route.ts    Verify the OTP and change the password
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
