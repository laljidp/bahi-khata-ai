"use client";

import { useState } from "react";
import { AuthUser } from "../lib/types";

export default function AuthModal({
  onSuccess,
}: {
  onSuccess: (user: AuthUser) => void;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const payload =
        mode === "signup"
          ? { shopName: shopName.trim(), phone: phone.trim(), password }
          : { phone: phone.trim(), password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      onSuccess(data.user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-paper px-4 py-8">
      <div className="w-full max-w-[420px] rounded-2xl border border-paperLine bg-card p-6 shadow-sm sm:p-8">
        {/* Header Branding */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber/15 text-amber">
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h10" />
              <path d="M6 14h6" />
            </svg>
          </div>
          <h1 className="mt-3 font-slab text-2xl font-bold text-ink">Bahi Khata</h1>
          <p className="mt-1 text-xs text-inkSoft">
            Digital credit & khata ledger for Indian shopkeepers
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mt-6 flex rounded-lg border border-paperLine bg-paper/60 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 rounded-md py-2 text-xs font-semibold transition-colors ${
              mode === "login"
                ? "bg-card text-ink shadow-xs"
                : "text-inkSoft hover:text-ink"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`flex-1 rounded-md py-2 text-xs font-semibold transition-colors ${
              mode === "signup"
                ? "bg-card text-ink shadow-xs"
                : "text-inkSoft hover:text-ink"
            }`}
          >
            New Shopkeeper
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 rounded-md border border-due/30 bg-dueSoft/50 px-3.5 py-2.5 text-xs font-medium text-due">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-inkSoft">
                Shop / Store Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Gupta General Store"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-paperLine bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-amber focus:ring-1 focus:ring-amber"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-inkSoft">
              Mobile Number
            </label>
            <div className="relative mt-1.5 flex items-center">
              <span className="absolute left-3.5 text-xs font-semibold text-inkSoft">
                +91
              </span>
              <input
                type="tel"
                required
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border border-paperLine bg-paper py-2.5 pl-12 pr-3.5 text-sm text-ink outline-none transition focus:border-amber focus:ring-1 focus:ring-amber"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-inkSoft">
                Password or 4-digit PIN
              </label>
            </div>
            <input
              type="password"
              required
              placeholder="••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-paperLine bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-amber focus:ring-1 focus:ring-amber"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-md bg-amber py-3 text-sm font-semibold text-white transition hover:bg-amberDark disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Sign In to Bahi Khata"
              : "Create Shop Ledger"}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 text-center text-[0.72rem] text-inkSoft">
          {mode === "login" ? (
            <p>
              New shopkeeper?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className="font-semibold text-amber hover:underline"
              >
                Register your shop
              </button>
            </p>
          ) : (
            <p>
              Already registered?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="font-semibold text-amber hover:underline"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
