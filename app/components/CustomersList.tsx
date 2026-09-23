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
          className="w-full rounded-md border border-paperLine bg-card px-3.5 py-2.5 text-sm text-ink"
          placeholder="Search by name or phone"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="overflow-hidden rounded-lg border border-paperLine bg-card">
        {list.length ? (
          list.map((c) => {
            const bal = balanceOf(c);
            return (
              <div
                key={c.id}
                className="flex cursor-pointer items-center justify-between border-b border-paperLine px-4 py-3.5 last:border-b-0 hover:bg-[#F4EEDD]"
                onClick={() => onOpen(c.id)}
              >
                <div>
                  <div className="text-sm font-semibold">{c.name}</div>
                  <div className="mt-0.5 text-xs text-inkSoft">
                    {c.phone || "No phone"}
                  </div>
                </div>
                <div
                  className="text-right font-slab text-sm font-bold"
                  style={{ color: bal > 0 ? "#8B2E2E" : "#3F6B4F" }}
                >
                  {fmt(Math.abs(bal))}
                  <span className="block font-sans text-[0.68rem] font-medium text-inkSoft">
                    {bal > 0 ? "due" : bal < 0 ? "advance" : "settled"}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-5 py-9 text-center text-sm text-inkSoft">
            {customers.length
              ? "No customers match your search."
              : "No customers yet. Tap + to add one."}
          </div>
        )}
      </div>
    </div>
  );
}
