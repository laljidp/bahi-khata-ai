"use client";

import { useState } from "react";
import Sheet from "./Sheet";
import { Customer, uid } from "../lib/types";

const inputCls = "app-input";
const labelCls = "app-label";

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
          className="button-secondary flex-1"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="button-primary flex-1"
          onClick={handleSave}
        >
          {existing ? "Save changes" : "Save customer"}
        </button>
      </div>
      {existing && onDelete && (
        <button
          className="button-danger mt-4 block w-full text-center"
          onClick={onDelete}
        >
          Delete customer
        </button>
      )}
    </Sheet>
  );
}
