"use client";

import { AuthUser } from "../lib/types";

export type View = "dashboard" | "customers" | "activity" | "detail";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[21px] w-[21px]">
      <path d="M3 12l9-9 9 9M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[21px] w-[21px]">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 19c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" />
      <path d="M16 8.5a3 3 0 1 1 3 3" />
      <path d="M15.5 13c2.8.4 5 2.6 5 6" />
    </svg>
  );
}

export function Sidebar({
  view,
  setView,
  onAddCustomer,
  user,
  onLogout,
}: {
  view: View;
  setView: (v: View) => void;
  onAddCustomer: () => void;
  user?: AuthUser | null;
  onLogout?: () => void;
}) {
  const items: { key: View; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "customers", label: "Customers" },
    { key: "activity", label: "Recent activity" },
  ];
  return (
    <aside className="hidden w-[230px] flex-shrink-0 flex-col justify-between border-r border-paper-line bg-paper-card px-4 py-7 sm:flex">
      <div>
        <div className="ml-1.5 font-slab text-xl font-bold text-ink">
          Bahi Khata
          <small className="mt-0.5 block font-sans text-xs font-normal text-ink-muted">
            credit ledger
          </small>
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          {items.map((it) => (
            <div
              key={it.key}
              onClick={() => setView(it.key)}
              className={`cursor-pointer rounded-md border-l-[3px] px-3 py-2.5 text-sm font-medium transition-colors ${
                view === it.key || (view === "detail" && it.key === "customers")
                  ? "border-ledger-due bg-ledger-due-soft text-ink"
                  : "border-transparent text-ink-muted hover:bg-paper-hover"
              }`}
            >
              {it.label}
            </div>
          ))}
        </nav>

        <button
          className="button-primary mt-6 w-full shadow-xs"
          onClick={onAddCustomer}
        >
          + New customer
        </button>
      </div>

      {user && (
        <div className="rounded-xl border border-paper-line/70 bg-paper/60 p-3">
          <div className="truncate font-semibold text-xs text-ink">
            {user.shopName}
          </div>
          <div className="mt-0.5 text-[0.72rem] text-ink-muted">
            +91 {user.phone}
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-paper-line bg-paper-card py-1.5 text-xs font-medium text-ledger-due transition hover:bg-ledger-due-soft/50"
            >
              Log out
            </button>
          )}
        </div>
      )}
    </aside>
  );
}

export function MobileHeader({
  user,
  onLogout,
}: {
  user?: AuthUser | null;
  onLogout?: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-paper-line px-[18px] py-3.5 sm:hidden">
      <div>
        <div className="font-slab text-lg font-bold text-ink leading-tight">
          Bahi Khata
        </div>
        {user && (
          <div className="text-[0.7rem] font-medium text-ink-muted truncate max-w-[200px]">
            {user.shopName}
          </div>
        )}
      </div>
      {user && onLogout && (
        <button
          onClick={onLogout}
          className="rounded-md border border-paper-line bg-paper-card px-2.5 py-1 text-xs font-semibold text-ledger-due transition hover:bg-ledger-due-soft/50"
        >
          Logout
        </button>
      )}
    </div>
  );
}

export function Topbar({
  view,
  user,
  onLogout,
}: {
  view: View;
  user?: AuthUser | null;
  onLogout?: () => void;
}) {
  const title = view === "dashboard" ? "Dashboard" : view === "customers" ? "Customers" : view === "activity" ? "Recent activity" : "Customer";
  return (
    <div className="hidden items-center justify-between border-b border-paper-line px-8 py-4 sm:flex">
      <h2 className="m-0 text-lg font-semibold text-ink">{title}</h2>
      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="block text-xs font-semibold text-ink">
              {user.shopName}
            </span>
            <span className="block text-[0.7rem] text-ink-muted">
              +91 {user.phone}
            </span>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="rounded-md border border-paper-line bg-paper-card px-3 py-1.5 text-xs font-semibold text-ledger-due transition hover:bg-ledger-due-soft/50"
            >
              Log out
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function BottomNav({ view, setView }: { view: View; setView: (v: View) => void }) {
  const items: { key: View; label: string; icon: React.ReactNode }[] = [
    { key: "dashboard", label: "Dashboard", icon: <HomeIcon /> },
    { key: "customers", label: "Customers", icon: <UsersIcon /> },
    { key: "activity", label: "Activity", icon: <ActivityIcon /> },
  ];
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex border-t border-paper-line bg-paper-card pb-[env(safe-area-inset-bottom)] sm:hidden">
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => setView(it.key)}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 pb-2 text-[0.68rem] font-semibold transition-colors ${
            view === it.key || (view === "detail" && it.key === "customers")
              ? "text-ledger-due"
              : "text-ink-muted"
          }`}
        >
          {it.icon}
          {it.label}
        </button>
      ))}
    </div>
  );
}

function ActivityIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[21px] w-[21px]"><path d="M3 12h4l3-8 4 16 3-8h4" /></svg>;
}

export function Fab({ show, onClick }: { show: boolean; onClick: () => void }) {
  if (!show) return null;
  return (
    <button
      onClick={onClick}
      className="fixed bottom-[calc(78px+env(safe-area-inset-bottom))] right-[18px] z-40 flex h-[54px] w-[54px] items-center justify-center rounded-full bg-brand text-2xl text-white shadow-[0_4px_14px_rgba(199,125,38,0.4)] transition hover:bg-brand-dark sm:hidden"
    >
      +
    </button>
  );
}
