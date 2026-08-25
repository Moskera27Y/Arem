"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_CURRENCY,
  convertUsd,
  formatUsd,
  isCurrency,
  type Currency,
} from "@/lib/money";
import { AUTH_CHANGED_EVENT } from "@/lib/store/wishlist-context";

const STORAGE_KEY = "arem.display_currency";
const CURRENCIES = ["USD", "COP", "EUR", "GBP", "CAD"] as const;

interface CurrencyContextValue {
  currency: Currency;
  rates: Partial<Record<Currency, number>>;
  updatedAt: string | null;
  source: string | null;
  loading: boolean;
  authed: boolean;
  isEstimate: boolean;
  setCurrency: (c: Currency) => void;
  convert: (amountUsd: number) => number;
  format: (amountUsd: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function readLocal(): Currency | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isCurrency(raw) ? raw : null;
  } catch {
    return null;
  }
}
function writeLocal(c: Currency): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, c);
  } catch {
    /* ignore */
  }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setState] = useState<Currency>(DEFAULT_CURRENCY);
  const [rates, setRates] = useState<Partial<Record<Currency, number>>>({});
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  const resolve = useCallback(async () => {
    setLoading(true);
    try {
      // rates
      const rt = await fetch("/api/rates");
      if (rt.ok) {
        const d = (await rt.json()) as { rates?: Partial<Record<Currency, number>>; updatedAt?: string | null; source?: string | null };
        setRates(d.rates ?? {});
        setUpdatedAt(d.updatedAt ?? null);
        setSource(d.source ?? null);
      }
      // auth
      const st = await fetch("/api/customer/auth/status");
      const s = (await st.json()) as { authenticated?: boolean };
      const isAuthed = s.authenticated === true;
      setAuthed(isAuthed);
      const local = readLocal();
      if (isAuthed) {
        const me = await fetch("/api/customer/me");
        if (me.ok) {
          const p = (await me.json()) as { display_currency?: string };
          const profileCur = isCurrency(p.display_currency) ? p.display_currency : DEFAULT_CURRENCY;
          // Merge guest preference into the account (guest pref wins on sign-in).
          if (local && local !== profileCur) {
            await fetch("/api/customer/profile", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ display_currency: local }),
            });
            setState(local);
          } else {
            setState(profileCur);
          }
        } else {
          setState(local ?? DEFAULT_CURRENCY);
        }
      } else {
        setState(local ?? DEFAULT_CURRENCY);
      }
    } catch {
      setState(readLocal() ?? DEFAULT_CURRENCY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    resolve();
  }, [resolve]);

  useEffect(() => {
    const onAuth = () => resolve();
    window.addEventListener(AUTH_CHANGED_EVENT, onAuth);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, onAuth);
  }, [resolve]);

  const setCurrency = useCallback(
    (c: Currency) => {
      if (!isCurrency(c)) return;
      setState(c);
      writeLocal(c);
      if (authed) {
        fetch("/api/customer/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ display_currency: c }),
        }).catch(() => {});
      }
    },
    [authed],
  );

  const rate = (c: Currency) => (c === "USD" ? 1 : (rates[c] ?? 1));
  const convert = useCallback((amountUsd: number) => convertUsd(amountUsd, currency, rate(currency)), [currency, rates]);
  const format = useCallback((amountUsd: number) => formatUsd(amountUsd, currency, rate(currency)), [currency, rates]);

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      rates,
      updatedAt,
      source,
      loading,
      authed,
      isEstimate: currency !== "USD",
      setCurrency,
      convert,
      format,
    }),
    [currency, rates, updatedAt, source, loading, authed, setCurrency, convert, format],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}

/** For the header/account selector — the supported display currencies. */
export const DISPLAY_CURRENCIES = CURRENCIES;
