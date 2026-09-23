"use client";

import { useState } from "react";
import { useDB } from "./lib/useDB";
import { Customer, Entry, EntryType } from "./lib/types";
import { Sidebar, MobileHeader, Topbar, BottomNav, Fab } from "./components/Nav";
import Dashboard from "./components/Dashboard";
import CustomersList from "./components/CustomersList";
import CustomerDetail from "./components/CustomerDetail";
import CustomerSheet from "./components/CustomerSheet";
import EntrySheet from "./components/EntrySheet";
import Toast from "./components/Toast";

export type View = "dashboard" | "customers" | "detail";

export default function Page() {
  const { db, setDB, ready } = useDB();
  const [view, setView] = useState<View>("dashboard");
  const [customerId, setCustomerId] = useState<string | null>(null);

  const [custSheetOpen, setCustSheetOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [entrySheetOpen, setEntrySheetOpen] = useState(false);
  const [entryType, setEntryType] = useState<EntryType>("credit");
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }

  const customer = db.customers.find((c) => c.id === customerId) || null;

  function openView(v: View) {
    setView(v);
  }
  function openCustomer(id: string) {
    setCustomerId(id);
    setView("detail");
  }

  function saveCustomer(c: Customer) {
    setDB((prev) => {
      const exists = prev.customers.some((x) => x.id === c.id);
      return {
        customers: exists
          ? prev.customers.map((x) => (x.id === c.id ? c : x))
          : [...prev.customers, c],
      };
    });
    setCustSheetOpen(false);
    if (!editingCustomer) {
      setCustomerId(c.id);
      setView("detail");
      flash("Customer added");
    } else {
      flash("Customer updated");
    }
  }

  function deleteCustomer() {
    if (!customerId) return;
    setDB((prev) => ({
      customers: prev.customers.filter((c) => c.id !== customerId),
    }));
    setCustSheetOpen(false);
    setView("customers");
    flash("Customer removed");
  }

  function saveEntry(e: Entry) {
    if (!customerId) return;
    setDB((prev) => ({
      customers: prev.customers.map((c) => {
        if (c.id !== customerId) return c;
        const exists = c.entries.some((x) => x.id === e.id);
        return {
          ...c,
          entries: exists
            ? c.entries.map((x) => (x.id === e.id ? e : x))
            : [...c.entries, e],
        };
      }),
    }));
    setEntrySheetOpen(false);
    flash(e.type === "credit" ? "Credit entry added" : "Payment recorded");
  }

  function deleteEntry(id: string) {
    if (!customerId) return;
    setDB((prev) => ({
      customers: prev.customers.map((c) =>
        c.id === customerId
          ? { ...c, entries: c.entries.filter((e) => e.id !== id) }
          : c
      ),
    }));
    flash("Entry deleted");
  }

  if (!ready) return null;

  return (
    <div className="flex min-h-[100dvh]">
      <Sidebar
        view={view}
        setView={openView}
        onAddCustomer={() => {
          setEditingCustomer(null);
          setCustSheetOpen(true);
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader />
        <Topbar view={view} />

        <div className="mx-auto w-full max-w-[920px] flex-1 px-4 pb-[90px] pt-4 sm:px-8 sm:pb-8 sm:pt-7">
          {view === "dashboard" && <Dashboard customers={db.customers} />}
          {view === "customers" && (
            <CustomersList customers={db.customers} onOpen={openCustomer} />
          )}
          {view === "detail" && customer && (
            <CustomerDetail
              customer={customer}
              onBack={() => setView("customers")}
              onEditCustomer={() => {
                setEditingCustomer(customer);
                setCustSheetOpen(true);
              }}
              onAddCredit={() => {
                setEntryType("credit");
                setEditingEntry(null);
                setEntrySheetOpen(true);
              }}
              onAddPayment={() => {
                setEntryType("payment");
                setEditingEntry(null);
                setEntrySheetOpen(true);
              }}
              onEditEntry={(e) => {
                setEntryType(e.type);
                setEditingEntry(e);
                setEntrySheetOpen(true);
              }}
              onDeleteEntry={deleteEntry}
            />
          )}
        </div>
      </div>

      <Fab
        show={view !== "detail"}
        onClick={() => {
          setEditingCustomer(null);
          setCustSheetOpen(true);
        }}
      />
      <BottomNav view={view} setView={openView} />

      <CustomerSheet
        open={custSheetOpen}
        onClose={() => setCustSheetOpen(false)}
        existing={editingCustomer}
        onSave={saveCustomer}
        onDelete={editingCustomer ? deleteCustomer : undefined}
      />
      <EntrySheet
        open={entrySheetOpen}
        onClose={() => setEntrySheetOpen(false)}
        type={entryType}
        existing={editingEntry}
        onSave={saveEntry}
      />

      <Toast message={toast} />
    </div>
  );
}
