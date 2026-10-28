export type EntryType = "credit" | "payment";

export interface AuthUser {
  id: string;
  shopName: string;
  phone: string;
  email: string | null;
}

export interface Entry {
  id: string | null;
  type: EntryType;
  amount: number;
  date: string; // ISO string or yyyy-mm-dd
  item?: string;
  note?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  note?: string;
  entries: Entry[];
}

export interface DB {
  customers: Customer[];
}

export interface DashboardData {
  outstanding: number;
  customerCount: number;
  customersWithDues: number;
  recent: Array<{
    id: string;
    customerId: string;
    customerName: string;
    amount: number;
    type: EntryType;
    date: string;
    notes?: string;
  }>;
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function balanceOf(cust: Customer): number {
  return cust.entries.reduce(
    (sum, e) => sum + (e.type === "credit" ? e.amount : -e.amount),
    0,
  );
}

export function fmt(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
