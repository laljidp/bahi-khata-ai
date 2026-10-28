"use client";

import { DashboardData, fmt, fmtDate } from "../lib/types";

export default function Dashboard({
  dashboard,
  onOpenCustomer,
}: {
  dashboard: DashboardData | null;
  onOpenCustomer: (id: string) => void;
}) {
  if (!dashboard) return null;
  const stats = [
    { label: "Outstanding", value: fmt(dashboard.outstanding), tone: "due" },
    { label: "Customers", value: String(dashboard.customerCount), tone: "" },
    { label: "With dues", value: String(dashboard.customersWithDues), tone: "due" },
    { label: "Settled up", value: String(dashboard.customerCount - dashboard.customersWithDues), tone: "ok" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {stats.map((s) => <div key={s.label} className="app-card p-4">
          <div className="text-[0.72rem] font-semibold uppercase tracking-wide text-ink-muted">{s.label}</div>
          <div className={`mt-1.5 font-slab text-2xl font-bold ${s.tone === "due" ? "text-ledger-due" : s.tone === "ok" ? "text-ledger-paid" : "text-ink"}`}>{s.value}</div>
        </div>)}
      </div>
      <div className="mb-2.5 mt-7 text-sm font-semibold text-ink-muted">Recent activity</div>
      <div className="app-card overflow-hidden">
        {dashboard.recent.length ? dashboard.recent.map((entry) => <button key={entry.id} type="button" onClick={() => onOpenCustomer(entry.customerId)} className="ledger-row w-full text-left">
          <div className="min-w-0"><div className="text-sm font-semibold">{entry.customerName}</div><div className="mt-0.5 text-xs text-ink-muted">{entry.type === "credit" ? entry.notes || "Credit given" : "Payment received"} · {fmtDate(entry.date)}</div></div>
          <div className={`whitespace-nowrap pl-3 font-slab font-bold ${entry.type === "credit" ? "text-ledger-due" : "text-ledger-paid"}`}>{entry.type === "credit" ? "+" : "−"}{fmt(entry.amount)}</div>
        </button>) : <div className="px-5 py-9 text-center text-sm text-ink-muted">No activity yet. Add your first customer to get started.</div>}
      </div>
    </div>
  );
}
