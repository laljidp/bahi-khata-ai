"use client";

import { useState } from "react";
import Sheet from "./Sheet";
import { Customer, uid } from "../lib/types";

const inputCls =
  "w-full rounded-md border border-paperLine bg-white px-3.5 py-2.5 font-sans text-sm text-ink";
const labelCls = "mb-1.5 block text-xs font-semibold text-inkSoft";

export default function CustomerSheet({
  open,
  onClose,
  existing,
  onSave,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  existing: Customer | null;
  onSave: (c: Customer) => void;
  onDelete?: () => void;
  }) {
  const [name, setName] = useState(existing?.name ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [note, setNote] = useState(existing?.note ?? "");

  // reset fields whenever a different customer (or "new") is opened
  const key = existing?.id ?? "new";
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) {
    setLastKey(key);
    setName(existing?.name ?? "");
    setPhone(existing?.phone ?? "");
    setNote(existing?.note ?? "");
  }

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({
      id: existing?.id ?? uid(),
      name: trimmed,
      phone: phone.trim(),
      note: note.trim(),
      entries: existing?.entries ?? [],
    });
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <h3 className="mb-4 font-slab text-lg font-bold">
        {existing ? "Edit customer" : "New customer"}
      </h3>
      <div className="mb-3.5">
        <label className={labelCls}>Name</label>
        <input
          className={inputCls}
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Ramesh Patel"
        />
      </div>
      <div className="mb-3.5">
        <label className={labelCls}>Phone (optional)</label>
        <input
          className={inputCls}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 98765 43210"
        />
      </div>
      <div className="mb-3.5">
        <label className={labelCls}>Note (optional)</label>
        <input
          className={inputCls}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Owns the tea stall nearby"
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
          className="flex-1 rounded-md bg-amber py-3 text-sm font-semibold text-white hover:bg-amberDark"
          onClick={handleSave}
        >
          {existing ? "Save changes" : "Save customer"}
        </button>
      </div>
      {existing && onDelete && (
        <button
          className="mt-4 block w-full text-center text-sm font-semibold text-due underline"
          onClick={onDelete}
        >
          Delete customer
        </button>
      )}
    </Sheet>
  );
}
