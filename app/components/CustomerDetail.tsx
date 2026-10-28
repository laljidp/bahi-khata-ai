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
    (a, b) => +new Date(b.date) - +new Date(a.date),
  );

  return (
    <div>
      <button
        className="mb-3.5 flex items-center gap-1.5 text-sm font-semibold text-ink-muted"
        onClick={onBack}
      >
        ← All customers
      </button>

      <div className="app-card mb-4 p-4.5 p-[18px]">
        <div className="font-slab text-xl font-bold">{customer.name}</div>
        <div className="mt-0.5 text-sm text-ink-muted">
          {customer.phone || "No phone number"}
        </div>
        <div className="mt-3.5 flex items-end justify-between">
          <div>
            <div className="text-[0.72rem] font-semibold uppercase text-ink-muted">
              {bal > 0 ? "Amount due" : bal < 0 ? "Advance paid" : "Settled"}
            </div>
            <div
              className={`font-slab text-3xl font-bold ${bal > 0 ? "text-ledger-due" : bal < 0 ? "text-ledger-paid" : "text-ink"}`}
            >
              {fmt(Math.abs(bal))}
            </div>
          </div>
          <button
            className="button-secondary px-3.5 py-2 text-xs"
            onClick={onEditCustomer}
          >
            Edit
          </button>
        </div>
      </div>

      <div className="mb-4.5 mb-[18px] flex gap-2.5">
        <button
          className="flex-1 rounded-md bg-ledger-due py-3 text-sm font-semibold text-white"
          onClick={onAddCredit}
        >
          + Add credit
        </button>
        <button
          className={`flex-1 rounded-md py-3 text-sm font-semibold text-white ${
            bal <= 0 ? "cursor-not-allowed bg-ledger-paid/45" : "bg-ledger-paid"
          }`}
          disabled={bal <= 0}
          onClick={onAddPayment}
        >
          Record payment
        </button>
      </div>

      <div className="mb-2.5 text-sm font-semibold text-ink-muted">
        Ledger history
      </div>
      <div className="app-card overflow-hidden">
        {entries.length ? (
          entries.map((e) => (
            <div
              key={e.id}
              className="ledger-row items-start gap-2.5 hover:bg-transparent"
            >
              <div>
                <div className="text-sm font-semibold">
                  {e.type === "credit"
                    ? e.item || "Item on credit"
                    : "Cash payment"}
                </div>
                <div className="mt-0.5 text-xs text-ink-muted">
                  {fmtDate(e.date)}
                </div>
                {e.notes && (
                  <div className="mt-0.5 text-xs italic text-ink-muted">
                    {e.notes}
                  </div>
                )}
                <div className="mt-1.5 flex gap-2.5">
                  <button
                    className="text-xs font-semibold text-ink-muted underline"
                    onClick={() => onEditEntry(e)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-xs font-semibold text-ledger-due underline"
                    onClick={() => onDeleteEntry(e.id as string)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div
                className={`whitespace-nowrap font-slab font-bold ${
                  e.type === "credit" ? "text-ledger-due" : "text-ledger-paid"
                }`}
              >
                {e.type === "credit" ? "+" : "−"}
                {fmt(e.amount)}
              </div>
            </div>
          ))
        ) : (
          <div className="px-5 py-9 text-center text-sm text-ink-muted">
            No entries yet.
          </div>
        )}
      </div>
    </div>
  );
}
