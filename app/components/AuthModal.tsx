"use client";

import { useState } from "react";
import { AuthUser } from "../lib/types";

type AuthMode = "login" | "signup" | "forgot";

export default function AuthModal({
  onSuccess,
}: {
  onSuccess: (user: AuthUser) => void;
}) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError(null);
    setNotice(null);
    setOtpSent(false);
    setCode("");
    setPassword("");
  }

  async function requestResetCode() {
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to request a reset code");
      }
      setOtpSent(true);
      setNotice(data.message);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (mode === "forgot" && !otpSent) {
      await requestResetCode();
      return;
    }

    setError(null);
    setNotice(null);
    setLoading(true);

    try {
      if (mode === "forgot") {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            code: code.trim(),
            password,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Unable to reset password");
        }
        changeMode("login");
        setNotice(data.message);
        return;
      }

      const endpoint =
        mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const payload =
        mode === "signup"
          ? {
              shopName: shopName.trim(),
              phone: phone.trim(),
              email: email.trim(),
              password,
            }
          : { email: email.trim(), password };

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
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-md border border-paperLine bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-amber focus:ring-1 focus:ring-amber";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-wider text-inkSoft";

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-paper px-4 py-8">
      <div className="w-full max-w-[420px] rounded-2xl border border-paperLine bg-card p-6 shadow-sm sm:p-8">
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
          <h1 className="mt-3 font-slab text-2xl font-bold text-ink">
            Bahi Khata
          </h1>
          <p className="mt-1 text-xs text-inkSoft">
            Digital credit &amp; khata ledger for Indian shopkeepers
          </p>
        </div>

        {mode !== "forgot" && (
          <div className="mt-6 flex rounded-lg border border-paperLine bg-paper/60 p-1">
            <button
              type="button"
              onClick={() => changeMode("login")}
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
              onClick={() => changeMode("signup")}
              className={`flex-1 rounded-md py-2 text-xs font-semibold transition-colors ${
                mode === "signup"
                  ? "bg-card text-ink shadow-xs"
                  : "text-inkSoft hover:text-ink"
              }`}
            >
              New Shopkeeper
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md border border-due/30 bg-dueSoft/50 px-3.5 py-2.5 text-xs font-medium text-due">
            {error}
          </div>
        )}
        {notice && (
          <div className="mt-4 rounded-md border border-amber/30 bg-amber/10 px-3.5 py-2.5 text-xs font-medium text-ink">
            {notice}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode === "signup" && (
            <div>
              <label className={labelClass} htmlFor="shopName">
                Shop / Store Name
              </label>
              <input
                id="shopName"
                type="text"
                required
                autoComplete="organization"
                placeholder="e.g. Gupta General Store"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label className={labelClass} htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          {mode === "signup" && (
            <div>
              <label className={labelClass} htmlFor="phone">
                Mobile Number
              </label>
              <div className="relative mt-1.5 flex items-center">
                <span className="absolute left-3.5 text-xs font-semibold text-inkSoft">
                  +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  required
                  autoComplete="tel-national"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-md border border-paperLine bg-paper py-2.5 pl-12 pr-3.5 text-sm text-ink outline-none transition focus:border-amber focus:ring-1 focus:ring-amber"
                />
              </div>
            </div>
          )}

          {mode === "forgot" && otpSent && (
            <div>
              <label className={labelClass} htmlFor="resetCode">
                Email verification code
              </label>
              <input
                id="resetCode"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className={inputClass}
              />
            </div>
          )}

          {(mode !== "forgot" || otpSent) && (
            <div>
              <label className={labelClass} htmlFor="password">
                {mode === "forgot"
                  ? "New Password or 4-digit PIN"
                  : "Password or 4-digit PIN"}
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={4}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                placeholder="••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          {mode === "login" && (
            <div className="-mt-2 text-right">
              <button
                type="button"
                onClick={() => changeMode("forgot")}
                className="text-xs font-semibold text-amber hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-md bg-amber py-3 text-sm font-semibold text-white transition hover:bg-amberDark disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Sign In to Bahi Khata"
                : mode === "signup"
                  ? "Create Shop Ledger"
                  : otpSent
                    ? "Reset Password"
                    : "Send reset code"}
          </button>
        </form>

        {mode === "forgot" && otpSent && (
          <div className="mt-4 text-center">
            <button
              type="button"
              disabled={loading}
              onClick={requestResetCode}
              className="text-xs font-semibold text-amber hover:underline disabled:opacity-60"
            >
              Send a new code
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-[0.72rem] text-inkSoft">
          {mode === "login" ? (
            <p>
              New shopkeeper?{" "}
              <button
                type="button"
                onClick={() => changeMode("signup")}
                className="font-semibold text-amber hover:underline"
              >
                Register your shop
              </button>
            </p>
          ) : mode === "signup" ? (
            <p>
              Already registered?{" "}
              <button
                type="button"
                onClick={() => changeMode("login")}
                className="font-semibold text-amber hover:underline"
              >
                Sign in here
              </button>
            </p>
          ) : (
            <p>
              Remembered your password?{" "}
              <button
                type="button"
                onClick={() => changeMode("login")}
                className="font-semibold text-amber hover:underline"
              >
                Back to sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
