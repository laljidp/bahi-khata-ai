"use client";

import { Customer, balanceOf, fmt, fmtDate } from "../lib/types";

export default function Dashboard({ customers }: { customers: Customer[] }) {
  const outstanding = customers.reduce(
    (s, c) => s + Math.max(balanceOf(c), 0),
    0
  );
  const withDues = customers.filter((c) => balanceOf(c) > 0).length;

  const allEntries = customers.flatMap((c) =>
    c.entries.map((e) => ({ ...e, custName: c.name }))
  );
  allEntries.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const recent = allEntries.slice(0, 6);

  const stats = [
    { label: "Outstanding", value: fmt(outstanding), tone: "due" },
    { label: "Customers", value: String(customers.length), tone: "" },
    { label: "With dues", value: String(withDues), tone: "due" },
    { label: "Settled up", value: String(customers.length - withDues), tone: "ok" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-paperLine bg-card p-4"
          >
            <div className="text-[0.72rem] font-semibold uppercase tracking-wide text-inkSoft">
              {s.label}
            </div>
            <div
              className={`mt-1.5 font-slab text-2xl font-bold ${
                s.tone === "due" ? "text-due" : s.tone === "ok" ? "text-paid" : "text-ink"
              }`}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-2.5 mt-7 text-sm font-semibold text-inkSoft">
        Recent activity
      </div>
      <div className="overflow-hidden rounded-lg border border-paperLine bg-card">
        {recent.length ? (
          recent.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between border-b border-paperLine px-4 py-3.5 last:border-b-0"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold">{e.custName}</div>
                <div className="mt-0.5 text-xs text-inkSoft">
                  {e.type === "credit" ? e.item || "Credit given" : "Payment received"} ·{" "}
                  {fmtDate(e.date)}
                </div>
              </div>
              <div
                className={`whitespace-nowrap pl-3 font-slab font-bold ${
                  e.type === "credit" ? "text-due" : "text-paid"
                }`}
              >
                {e.type === "credit" ? "+" : "−"}
                {fmt(e.amount)}
              </div>
            </div>
          ))
        ) : (
          <div className="px-5 py-9 text-center text-sm text-inkSoft">
            No activity yet. Add your first customer to get started.
          </div>
        )}
      </div>
    </div>
  );
}
