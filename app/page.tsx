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
import AuthModal from "./components/AuthModal";

export type View = "dashboard" | "customers" | "detail";

export default function Page() {
  const {
    user,
    setUser,
    authLoading,
    loadingData,
    db,
    saveCustomer,
    deleteCustomer,
    saveEntry,
    deleteEntry,
    logout,
  } = useDB();

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

  async function handleSaveCustomer(c: Customer) {
    const isNew = !editingCustomer;
    setCustSheetOpen(false);
    const saved = await saveCustomer(c);
    if (isNew) {
      setCustomerId(saved.id);
      setView("detail");
      flash("Customer added");
    } else {
      flash("Customer updated");
    }
  }

  async function handleDeleteCustomer() {
    if (!customerId) return;
    const idToDelete = customerId;
    setCustSheetOpen(false);
    setView("customers");
    setCustomerId(null);
    await deleteCustomer(idToDelete);
    flash("Customer removed");
  }

  async function handleSaveEntry(e: Entry) {
    if (!customerId) return;
    setEntrySheetOpen(false);
    await saveEntry(customerId, e);
    flash(e.type === "credit" ? "Credit entry added" : "Payment recorded");
  }

  async function handleDeleteEntry(id: string) {
    if (!customerId) return;
    await deleteEntry(customerId, id);
    flash("Entry deleted");
  }

  // Initial authentication check
  if (authLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-paper">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-amber border-t-transparent" />
          <div className="mt-3 font-slab text-sm font-semibold text-ink">
            Loading Bahi Khata...
          </div>
        </div>
      </div>
    );
  }

  // If not logged in, show AuthModal
  if (!user) {
    return (
      <AuthModal
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          flash(`Welcome, ${loggedUser.shopName}`);
        }}
      />
    );
  }

  return (
    <div className="flex min-h-[100dvh]">
      <Sidebar
        view={view}
        setView={openView}
        onAddCustomer={() => {
          setEditingCustomer(null);
          setCustSheetOpen(true);
        }}
        user={user}
        onLogout={logout}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader user={user} onLogout={logout} />
        <Topbar view={view} user={user} onLogout={logout} />

        {loadingData && db.customers.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-amber border-t-transparent" />
              <p className="mt-2 text-xs text-inkSoft">Syncing ledger...</p>
            </div>
          </div>
        ) : (
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
                onDeleteEntry={handleDeleteEntry}
              />
            )}
          </div>
        )}
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
        onSave={handleSaveCustomer}
        onDelete={editingCustomer ? handleDeleteCustomer : undefined}
      />
      <EntrySheet
        open={entrySheetOpen}
        onClose={() => setEntrySheetOpen(false)}
        type={entryType}
        existing={editingEntry}
        onSave={handleSaveEntry}
      />

      <Toast message={toast} />
    </div>
  );
}
