"use client";

import { useState } from "react";
import { Customer, balanceOf, fmt } from "../lib/types";

export default function CustomersList({
  customers,
  onOpen,
}: {
  customers: Customer[];
  onOpen: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.toLowerCase();
  const list = customers
    .filter(
      (c) =>
        c.name.toLowerCase().includes(q) || (c.phone || "").includes(q)
    )
    .sort((a, b) => balanceOf(b) - balanceOf(a));

  return (
    <div>
      <div className="mb-3.5">
        <input
          className="app-input bg-paper-card"
          placeholder="Search by name or phone"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="app-card overflow-hidden">
        {list.length ? (
          list.map((c) => {
            const bal = balanceOf(c);
            return (
              <div
                key={c.id}
                className="ledger-row w-full cursor-pointer text-left"
                onClick={() => onOpen(c.id)}
              >
                <div>
                  <div className="text-sm font-semibold">{c.name}</div>
                  <div className="mt-0.5 text-xs text-ink-muted">
                    {c.phone || "No phone"}
                  </div>
                </div>
                <div
                  className={`text-right font-slab text-sm font-bold ${bal > 0 ? "text-ledger-due" : "text-ledger-paid"}`}
                >
                  {fmt(Math.abs(bal))}
                  <span className="block font-sans text-[0.68rem] font-medium text-ink-muted">
                    {bal > 0 ? "due" : bal < 0 ? "advance" : "settled"}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-5 py-9 text-center text-sm text-ink-muted">
            {customers.length
              ? "No customers match your search."
              : "No customers yet. Tap + to add one."}
          </div>
        )}
      </div>
    </div>
  );
}
