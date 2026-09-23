"use client";

import { useEffect, useState } from "react";
import { AuthUser, Customer, DB, Entry } from "./types";

export function useDB() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [db, setDB] = useState<DB>({ customers: [] });
  const [loadingData, setLoadingData] = useState(false);

  // Check current session on mount
  useEffect(() => {
    let ignore = false;
    async function fetchMe() {
      try {
        const res = await fetch("/api/auth/me");
        if (!ignore) {
          if (res.ok) {
            const data = await res.json();
            setUser(data.user || null);
          } else {
            setUser(null);
          }
        }
      } catch {
        if (!ignore) setUser(null);
      } finally {
        if (!ignore) setAuthLoading(false);
      }
    }
    fetchMe();
    return () => {
      ignore = true;
    };
  }, []);

  // Fetch customers when user is logged in
  useEffect(() => {
    if (!user) {
      return;
    }
    let ignore = false;
    async function fetchCustomers() {
      try {
        const res = await fetch("/api/customers");
        if (res.ok && !ignore) {
          const data = await res.json();
          setDB({ customers: data.customers || [] });
        }
      } catch (err) {
        console.error("Failed to load customers from server:", err);
      } finally {
        if (!ignore) setLoadingData(false);
      }
    }
    fetchCustomers();
    return () => {
      ignore = true;
    };
  }, [user]);

  // Save customer (create or update)
  async function saveCustomer(c: Customer): Promise<Customer> {
    const isNew = !c.id || c.id.startsWith("temp_") || !db.customers.some((x) => x.id === c.id);

    // Optimistic UI update
    setDB((prev) => {
      const exists = prev.customers.some((x) => x.id === c.id);
      return {
        customers: exists
          ? prev.customers.map((x) => (x.id === c.id ? c : x))
          : [c, ...prev.customers],
      };
    });

    try {
      if (isNew) {
        const res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: c.name, phone: c.phone }),
        });
        if (res.ok) {
          const data = await res.json();
          const serverCust = data.customer;
          setDB((prev) => ({
            customers: prev.customers.map((x) => (x.id === c.id ? serverCust : x)),
          }));
          return serverCust;
        }
      } else {
        const res = await fetch(`/api/customers/${c.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: c.name, phone: c.phone }),
        });
        if (res.ok) {
          const data = await res.json();
          const serverCust = data.customer;
          setDB((prev) => ({
            customers: prev.customers.map((x) => (x.id === c.id ? serverCust : x)),
          }));
          return serverCust;
        }
      }
    } catch (err) {
      console.error("Failed to persist customer to database:", err);
    }
    return c;
  }

  // Delete customer
  async function deleteCustomer(id: string) {
    setDB((prev) => ({
      customers: prev.customers.filter((c) => c.id !== id),
    }));

    try {
      await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete customer on database:", err);
    }
  }

  // Save entry (create or update)
  async function saveEntry(customerId: string, e: Entry) {
    const isNew = !e.id || e.id.startsWith("temp_");

    // Optimistic update
    setDB((prev) => ({
      customers: prev.customers.map((c) => {
        if (c.id !== customerId) return c;
        const exists = c.entries.some((x) => x.id === e.id);
        return {
          ...c,
          entries: exists
            ? c.entries.map((x) => (x.id === e.id ? e : x))
            : [e, ...c.entries],
        };
      }),
    }));

    try {
      if (isNew) {
        const res = await fetch(`/api/customers/${customerId}/entries`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: e.amount,
            type: e.type,
            date: e.date,
            notes: e.note || e.notes || e.item,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const serverEntry = data.entry;
          setDB((prev) => ({
            customers: prev.customers.map((c) => {
              if (c.id !== customerId) return c;
              return {
                ...c,
                entries: c.entries.map((x) => (x.id === e.id ? serverEntry : x)),
              };
            }),
          }));
        }
      } else {
        await fetch(`/api/customers/${customerId}/entries/${e.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: e.amount,
            type: e.type,
            date: e.date,
            notes: e.note || e.notes || e.item,
          }),
        });
      }
    } catch (err) {
      console.error("Failed to persist entry to database:", err);
    }
  }

  // Delete entry
  async function deleteEntry(customerId: string, entryId: string) {
    setDB((prev) => ({
      customers: prev.customers.map((c) => {
        if (c.id !== customerId) return c;
        return {
          ...c,
          entries: c.entries.filter((x) => x.id !== entryId),
        };
      }),
    }));

    try {
      await fetch(`/api/customers/${customerId}/entries/${entryId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete entry on database:", err);
    }
  }

  // Logout
  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setUser(null);
    setDB({ customers: [] });
  }

  return {
    user,
    setUser,
    authLoading,
    ready: !authLoading,
    loadingData,
    db,
    setDB,
    saveCustomer,
    deleteCustomer,
    saveEntry,
    deleteEntry,
    logout,
  };
}
