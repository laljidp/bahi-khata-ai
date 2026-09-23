"use client";

import { useState } from "react";
import Sheet from "./Sheet";
import { Entry, EntryType, uid } from "../lib/types";

const inputCls =
  "w-full rounded-md border border-paperLine bg-white px-3.5 py-2.5 font-sans text-sm text-ink";
const labelCls = "mb-1.5 block text-xs font-semibold text-inkSoft";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function EntrySheet({
  open,
  onClose,
  type,
  existing,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  type: EntryType;
  existing: Entry | null;
  onSave: (e: Entry) => void;
}) {
  const isCredit = type === "credit";
  const [item, setItem] = useState(existing?.item ?? "");
  const [amount, setAmount] = useState(existing ? String(existing.amount) : "");
  const [date, setDate] = useState(existing?.date.slice(0, 10) ?? todayISO());
  const [note, setNote] = useState(existing?.note ?? "");

  const key = existing?.id ?? `new-${type}`;
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) {
    setLastKey(key);
    setItem(existing?.item ?? "");
    setAmount(existing ? String(existing.amount) : "");
    setDate(existing?.date.slice(0, 10) ?? todayISO());
    setNote(existing?.note ?? "");
  }

  function handleSave() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    onSave({
      id: existing?.id ?? uid(),
      type,
      amount: amt,
      date: date || todayISO(),
      item: isCredit ? item.trim() : undefined,
      note: note.trim(),
    });
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <h3 className="mb-4 font-slab text-lg font-bold">
        {existing ? "Edit entry" : isCredit ? "Add item on credit" : "Record cash payment"}
      </h3>
      {isCredit && (
        <div className="mb-3.5">
          <label className={labelCls}>Item</label>
          <input
            className={inputCls}
            value={item}
            autoFocus
            onChange={(e) => setItem(e.target.value)}
            placeholder="e.g. Rice 5kg, Soap, etc."
          />
        </div>
      )}
      <div className="mb-3.5">
        <label className={labelCls}>Amount (₹)</label>
        <input
          className={inputCls}
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
        />
      </div>
      <div className="mb-3.5">
        <label className={labelCls}>Date</label>
        <input
          className={inputCls}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="mb-3.5">
        <label className={labelCls}>Note (optional)</label>
        <input
          className={inputCls}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Any extra detail"
        />
      </div>
      <div className="mt-4 flex gap-2.5">
        <button
          className="flex-1 rounded-md border border-paperLine py-3 text-sm font-semibold hover:bg-[#F1EADA]"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className={`flex-1 rounded-md py-3 text-sm font-semibold text-white ${
            isCredit ? "bg-due" : "bg-paid"
          }`}
          onClick={handleSave}
        >
          {existing ? "Save" : isCredit ? "Add entry" : "Record payment"}
        </button>
      </div>
    </Sheet>
  );
}
