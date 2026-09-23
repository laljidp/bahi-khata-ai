"use client";

import { Customer, Entry, balanceOf, fmt, fmtDate } from "../lib/types";

export default function CustomerDetail({
  customer,
  onBack,
  onEditCustomer,
  onAddCredit,
  onAddPayment,
  onEditEntry,
  onDeleteEntry,
}: {
  customer: Customer;
  onBack: () => void;
  onEditCustomer: () => void;
  onAddCredit: () => void;
  onAddPayment: () => void;
  onEditEntry: (e: Entry) => void;
  onDeleteEntry: (id: string) => void;
}) {
  const bal = balanceOf(customer);
  const entries = [...customer.entries].sort(
    (a, b) => +new Date(b.date) - +new Date(a.date)
  );

  return (
    <div>
      <button
        className="mb-3.5 flex items-center gap-1.5 text-sm font-semibold text-inkSoft"
        onClick={onBack}
      >
        ← All customers
      </button>

      <div className="mb-4 rounded-lg border border-paperLine bg-card p-4.5 p-[18px]">
        <div className="font-slab text-xl font-bold">{customer.name}</div>
        <div className="mt-0.5 text-sm text-inkSoft">
          {customer.phone || "No phone number"}
        </div>
        <div className="mt-3.5 flex items-end justify-between">
          <div>
            <div className="text-[0.72rem] font-semibold uppercase text-inkSoft">
              {bal > 0 ? "Amount due" : bal < 0 ? "Advance paid" : "Settled"}
            </div>
            <div
              className="font-slab text-3xl font-bold"
              style={{
                color: bal > 0 ? "#8B2E2E" : bal < 0 ? "#3F6B4F" : "#2B2318",
              }}
            >
              {fmt(Math.abs(bal))}
            </div>
          </div>
          <button
            className="rounded-md border border-paperLine px-3.5 py-2 text-xs font-semibold hover:bg-[#F1EADA]"
            onClick={onEditCustomer}
          >
            Edit
          </button>
        </div>
      </div>

      <div className="mb-4.5 mb-[18px] flex gap-2.5">
        <button
          className="flex-1 rounded-md bg-due py-3 text-sm font-semibold text-white"
          onClick={onAddCredit}
        >
          + Add credit
        </button>
        <button
          className={`flex-1 rounded-md py-3 text-sm font-semibold text-white ${
            bal <= 0 ? "cursor-not-allowed bg-paid/45" : "bg-paid"
          }`}
          disabled={bal <= 0}
          onClick={onAddPayment}
        >
          Record payment
        </button>
      </div>

      <div className="mb-2.5 text-sm font-semibold text-inkSoft">
        Ledger history
      </div>
      <div className="overflow-hidden rounded-lg border border-paperLine bg-card">
        {entries.length ? (
          entries.map((e) => (
            <div
              key={e.id}
              className="flex justify-between gap-2.5 border-b border-paperLine px-4 py-3.5 last:border-b-0"
            >
              <div>
                <div className="text-sm font-semibold">
                  {e.type === "credit" ? e.item || "Item on credit" : "Cash payment"}
                </div>
                <div className="mt-0.5 text-xs text-inkSoft">{fmtDate(e.date)}</div>
                {e.note && (
                  <div className="mt-0.5 text-xs italic text-inkSoft">{e.note}</div>
                )}
                <div className="mt-1.5 flex gap-2.5">
                  <button
                    className="text-xs font-semibold text-inkSoft underline"
                    onClick={() => onEditEntry(e)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-xs font-semibold text-due underline"
                    onClick={() => onDeleteEntry(e.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div
                className={`whitespace-nowrap font-slab font-bold ${
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
            No entries yet.
          </div>
        )}
      </div>
    </div>
  );
}
