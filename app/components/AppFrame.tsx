"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDB } from "../lib/useDB";
import { Customer, DashboardData, Entry, EntryType } from "../lib/types";
import { Sidebar, MobileHeader, Topbar, BottomNav, Fab, type View } from "./Nav";
import CustomerSheet from "./CustomerSheet";
import EntrySheet from "./EntrySheet";
import Toast from "./Toast";
import AuthModal from "./AuthModal";

type AppContextValue = {
  customers: Customer[];
  dashboard: DashboardData | null;
  loading: boolean;
  loadError: string | null;
  openCustomer: (id: string) => void;
  openAddCustomer: () => void;
  openEditCustomer: (customer: Customer) => void;
  openEntry: (type: EntryType, entry?: Entry) => void;
  saveEntry: (entry: Entry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  deleteCurrentCustomer: () => Promise<void>;
  currentCustomer: Customer | null;
};
const AppContext = createContext<AppContextValue | null>(null);
export function useAppFrame() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useAppFrame must be used within AppFrame");
  return value;
}

function LoadingState() {
  return <div className="flex min-h-64 items-center justify-center"><div className="text-center"><div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-brand border-t-transparent" /><p className="mt-3 text-sm text-ink-muted">Loading...</p></div></div>;
}

export default function AppFrame({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const customerMatch = pathname.match(/^\/customers\/([^/]+)\/?$/);
  const customerId = customerMatch ? decodeURIComponent(customerMatch[1]) : undefined;
  const view: View = customerId ? "detail" : pathname.startsWith("/customers") ? "customers" : pathname.startsWith("/activity") ? "activity" : "dashboard";
  const routeKey = customerId ? `customer:${customerId}` : view;
  const { user, setUser, authLoading, db, setDB, saveCustomer, deleteCustomer, saveEntry: persistEntry, deleteEntry: persistDeleteEntry, logout } = useDB();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedRouteKey, setLoadedRouteKey] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [customerSheetOpen, setCustomerSheetOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [entrySheetOpen, setEntrySheetOpen] = useState(false);
  const [entryType, setEntryType] = useState<EntryType>("credit");
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const currentCustomer = db.customers.find((c) => c.id === customerId) ?? null;
  const flash = (message: string) => { setToast(message); setTimeout(() => setToast(null), 1800); };

  useEffect(() => {
    if (authLoading || !user) return;
    const controller = new AbortController();
    let ignore = false;
    async function loadRouteData() {
      setLoading(true);
      setLoadError(null);
      if (view === "activity") {
        setLoadedRouteKey(routeKey);
        setLoading(false);
        return;
      }
      const endpoint = view === "dashboard" ? "/api/dashboard" : customerId ? `/api/customers/${encodeURIComponent(customerId)}` : "/api/customers";
      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load this page.");
        if (ignore) return;
        if (view === "dashboard") setDashboard(data.dashboard);
        else if (customerId && data.customer) {
          const selected = data.customer as Customer;
          setDB((prev) => ({ customers: prev.customers.some((c) => c.id === selected.id)
            ? prev.customers.map((c) => c.id === selected.id ? selected : c)
            : [selected, ...prev.customers] }));
        } else if (!customerId) setDB({ customers: data.customers || [] });
        setLoadedRouteKey(routeKey);
      } catch (error) {
        if (!ignore && !(error instanceof DOMException && error.name === "AbortError")) {
          setLoadError(error instanceof Error ? error.message : "Could not load this page.");
          setLoadedRouteKey(routeKey);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    void loadRouteData();
    return () => { ignore = true; controller.abort(); };
  }, [authLoading, user, view, customerId, routeKey, setDB]);

  const context = useMemo<AppContextValue>(() => ({
    customers: db.customers,
    dashboard,
    loading,
    loadError,
    currentCustomer,
    openCustomer: (id) => router.push(`/customers/${encodeURIComponent(id)}`),
    openAddCustomer: () => { setEditingCustomer(null); setCustomerSheetOpen(true); },
    openEditCustomer: (customer) => { setEditingCustomer(customer); setCustomerSheetOpen(true); },
    openEntry: (type, entry) => { setEntryType(type); setEditingEntry(entry ?? null); setEntrySheetOpen(true); },
    saveEntry: async (entry) => {
      if (!customerId) return;
      setEntrySheetOpen(false);
      await persistEntry(customerId, entry);
      flash(entry.type === "credit" ? "Credit entry added" : "Payment recorded");
    },
    deleteEntry: async (id) => {
      if (!customerId) return;
      await persistDeleteEntry(customerId, id);
      flash("Entry deleted");
    },
    deleteCurrentCustomer: async () => {
      if (!customerId) return;
      setCustomerSheetOpen(false);
      router.push("/customers");
      await deleteCustomer(customerId);
      flash("Customer removed");
    },
  }), [db.customers, dashboard, loading, loadError, currentCustomer, router, customerId, persistEntry, persistDeleteEntry, deleteCustomer]);

  if (authLoading) return <div className="flex min-h-[100dvh] items-center justify-center bg-paper"><div className="text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" /><div className="mt-3 font-slab text-sm font-semibold text-ink">Loading Bahi Khata...</div></div></div>;
  if (!user) return <AuthModal onSuccess={(loggedUser) => { setUser(loggedUser); flash(`Welcome, ${loggedUser.shopName}`); }} />;

  const navigate = (next: View) => router.push(next === "customers" ? "/customers" : next === "activity" ? "/activity" : "/");
  const handleSaveCustomer = async (customer: Customer) => {
    const isNew = !editingCustomer;
    setCustomerSheetOpen(false);
    const saved = await saveCustomer(customer);
    if (isNew) { router.push(`/customers/${encodeURIComponent(saved.id)}`); flash("Customer added"); }
    else flash("Customer updated");
  };

  return <AppContext.Provider value={context}>
    <div className="flex min-h-[100dvh]">
      <Sidebar view={view} setView={navigate} onAddCustomer={context.openAddCustomer} user={user} onLogout={logout} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader user={user} onLogout={logout} />
        <Topbar view={view} user={user} onLogout={logout} />
        <main className="mx-auto w-full max-w-[920px] flex-1 px-4 pb-[90px] pt-4 sm:px-8 sm:pb-8 sm:pt-7">
          {loading || loadedRouteKey !== routeKey ? <LoadingState /> : loadError ? <div className="py-10 text-center text-sm text-ledger-due">{loadError}</div> : <div key={routeKey} className="route-content">{children}</div>}
        </main>
      </div>
      <Fab show={view !== "detail"} onClick={context.openAddCustomer} />
      <BottomNav view={view} setView={navigate} />
      <CustomerSheet open={customerSheetOpen} onClose={() => setCustomerSheetOpen(false)} existing={editingCustomer} onSave={handleSaveCustomer} onDelete={editingCustomer ? context.deleteCurrentCustomer : undefined} />
      <EntrySheet open={entrySheetOpen} onClose={() => setEntrySheetOpen(false)} type={entryType} existing={editingEntry} onSave={context.saveEntry} />
      <Toast message={toast} />
    </div>
  </AppContext.Provider>;
}
