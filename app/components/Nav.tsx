"use client";

import { View } from "../page";

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
}: {
  view: View;
  setView: (v: View) => void;
  onAddCustomer: () => void;
}) {
  const items: { key: View; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "customers", label: "Customers" },
  ];
  return (
    <aside className="hidden w-[220px] flex-shrink-0 flex-col border-r border-paperLine bg-card px-4.5 px-[18px] py-7 sm:flex">
      <div className="ml-1.5 font-slab text-xl font-bold">
        Bahi Khata
        <small className="mt-0.5 block font-sans text-xs font-normal text-inkSoft">
          credit ledger
        </small>
      </div>
      <nav className="mt-8 flex flex-col gap-1">
        {items.map((it) => (
          <div
            key={it.key}
            onClick={() => setView(it.key)}
            className={`cursor-pointer rounded-md border-l-[3px] px-3 py-2.5 text-sm font-medium ${
              view === it.key || (view === "detail" && it.key === "customers")
                ? "border-due bg-dueSoft text-ink"
                : "border-transparent text-inkSoft hover:bg-[#F1EADA]"
            }`}
          >
            {it.label}
          </div>
        ))}
      </nav>
      <button
        className="mt-6 w-full rounded-md bg-amber py-3 text-sm font-semibold text-white hover:bg-amberDark"
        onClick={onAddCustomer}
      >
        + New customer
      </button>
    </aside>
  );
}

export function MobileHeader() {
  return (
    <div className="flex items-center justify-between border-b border-paperLine px-4.5 px-[18px] py-4 sm:hidden">
      <div className="font-slab text-lg font-bold">
        Bahi Khata
        <small className="block font-sans text-[0.68rem] font-normal text-inkSoft">
          credit ledger
        </small>
      </div>
    </div>
  );
}

export function Topbar({ view }: { view: View }) {
  const title = view === "dashboard" ? "Dashboard" : view === "customers" ? "Customers" : "Customer";
  return (
    <div className="hidden items-center justify-between border-b border-paperLine px-8 py-5 sm:flex">
      <h2 className="m-0 text-lg font-semibold">{title}</h2>
    </div>
  );
}

export function BottomNav({ view, setView }: { view: View; setView: (v: View) => void }) {
  const items: { key: View; label: string; icon: React.ReactNode }[] = [
    { key: "dashboard", label: "Dashboard", icon: <HomeIcon /> },
    { key: "customers", label: "Customers", icon: <UsersIcon /> },
  ];
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex border-t border-paperLine bg-card pb-[env(safe-area-inset-bottom)] sm:hidden">
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => setView(it.key)}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 pb-2 text-[0.68rem] font-semibold ${
            view === it.key || (view === "detail" && it.key === "customers")
              ? "text-due"
              : "text-inkSoft"
          }`}
        >
          {it.icon}
          {it.label}
        </button>
      ))}
    </div>
  );
}

export function Fab({ show, onClick }: { show: boolean; onClick: () => void }) {
  if (!show) return null;
  return (
    <button
      onClick={onClick}
      className="fixed bottom-[calc(78px+env(safe-area-inset-bottom))] right-[18px] z-40 flex h-[54px] w-[54px] items-center justify-center rounded-full bg-amber text-2xl text-white shadow-[0_4px_14px_rgba(199,125,38,0.4)] sm:hidden"
    >
      +
    </button>
  );
}
