"use client";

import { useCallback, useEffect, useState } from "react";
import { fmt, fmtDate, type EntryType } from "../lib/types";

type ActivityEntry = {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  type: EntryType;
  date: string;
  notes?: string;
};

type ActivityResponse = {
  entries: ActivityEntry[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
};

export default function RecentActivity({ onOpenCustomer }: { onOpenCustomer: (id: string) => void }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestPage = useCallback(async (requestedPage: number, signal?: AbortSignal): Promise<ActivityResponse> => {
    const response = await fetch(`/api/activity?page=${requestedPage}&pageSize=20`, { signal });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not load recent activity.");
    return result;
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    requestPage(page, controller.signal).then((result) => {
      setData(result);
      setError(null);
      setLoading(false);
    }).catch((err: unknown) => {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        setError(err instanceof Error ? err.message : "Could not load recent activity.");
        setLoading(false);
      }
    });
    return () => controller.abort();
  }, [page, requestPage]);

  const retry = async () => {
    setLoading(true);
    try {
      setData(await requestPage(page));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load recent activity.");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = data?.pagination.totalPages ?? 0;

  return <section>
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h1 className="m-0 font-slab text-2xl font-bold text-ink">Recent activity</h1>
        <p className="mb-0 mt-1 text-sm text-ink-muted">Credits and payments across all customers.</p>
      </div>
      {data && <span className="whitespace-nowrap text-xs text-ink-muted">{data.pagination.total} {data.pagination.total === 1 ? "entry" : "entries"}</span>}
    </div>

    <div className="app-card overflow-hidden">
      {loading ? <div className="px-5 py-10 text-center text-sm text-ink-muted">Loading activity…</div>
        : error ? <div className="px-5 py-10 text-center text-sm text-ledger-due">{error}<button className="ml-2 font-semibold underline" onClick={() => void retry()}>Retry</button></div>
        : data?.entries.length ? data.entries.map((entry) => <button key={entry.id} type="button" onClick={() => onOpenCustomer(entry.customerId)} className="ledger-row w-full text-left">
          <div className="min-w-0"><div className="truncate text-sm font-semibold text-ink">{entry.customerName}</div><div className="mt-0.5 truncate text-xs text-ink-muted">{entry.type === "credit" ? entry.notes || "Credit given" : entry.notes || "Payment received"} · {fmtDate(entry.date)}</div></div>
          <div className={`whitespace-nowrap pl-3 font-slab font-bold ${entry.type === "credit" ? "text-ledger-due" : "text-ledger-paid"}`}>{entry.type === "credit" ? "+" : "−"}{fmt(entry.amount)}</div>
        </button>) : <div className="px-5 py-12 text-center"><div className="font-semibold text-ink">No activity yet</div><p className="mb-0 mt-1 text-sm text-ink-muted">Customer credits and payments will appear here.</p></div>}
    </div>

    {data && totalPages > 0 && <div className="mt-4 flex items-center justify-between gap-3">
      <span className="text-xs text-ink-muted">Page {page} of {totalPages}</span>
      <div className="flex gap-2">
        <button type="button" onClick={() => { setLoading(true); setPage((current) => Math.max(1, current - 1)); }} disabled={page <= 1 || loading} className="rounded-md border border-paper-line bg-paper-card px-3 py-2 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
        <button type="button" onClick={() => { setLoading(true); setPage((current) => Math.min(totalPages, current + 1)); }} disabled={page >= totalPages || loading} className="rounded-md border border-paper-line bg-paper-card px-3 py-2 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-40">Next</button>
      </div>
    </div>}
  </section>;
}
