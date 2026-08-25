"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "arem.wishlist.v1";
export const AUTH_CHANGED_EVENT = "arem:auth-change";

interface WishlistContextValue {
  ids: string[];
  has: (productId: string) => boolean;
  toggle: (productId: string) => void;
  clear: () => void;
  authed: boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readStoredIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Guest wishlist lives in localStorage only; the account wishlist is the
  // source of truth in Neon. Never persist account ids into guest storage.
  useEffect(() => {
    if (authed) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* storage unavailable — non-critical */
    }
  }, [ids, authed]);

  const sync = useCallback(async () => {
    setLoading(true);
    try {
      const me = await fetch("/api/customer/auth/status");
      const authState = (await me.json()) as { authenticated?: boolean };
      const isAuthed = authState.authenticated === true;
      setAuthed(isAuthed);
      if (isAuthed) {
        const r = await fetch("/api/customer/wishlist");
        const data = (await r.json()) as { ids?: string[] };
        const neon = Array.isArray(data.ids) ? data.ids : [];
        const guest = readStoredIds();
        const toMerge = guest.filter((id) => !neon.includes(id));
        if (toMerge.length > 0) {
          await fetch("/api/customer/wishlist/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productIds: toMerge }),
          });
        }
        setIds([...neon, ...toMerge]);
        // Keep guest storage in sync so a logout restores what a guest added.
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...neon, ...toMerge]));
        } catch {}
      } else {
        setIds(readStoredIds());
      }
    } catch {
      setAuthed(false);
      setIds(readStoredIds());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    sync();
  }, [sync]);

  useEffect(() => {
    const onAuth = () => sync();
    window.addEventListener(AUTH_CHANGED_EVENT, onAuth);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, onAuth);
  }, [sync]);

  const has = useCallback((productId: string) => ids.includes(productId), [ids]);

  const toggle = useCallback(
    (productId: string) => {
      const present = ids.includes(productId);
      if (authed) {
        const url = present
          ? `/api/customer/wishlist?productId=${encodeURIComponent(productId)}`
          : "/api/customer/wishlist";
        const opts = present
          ? { method: "DELETE" }
          : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) };
        fetch(url, opts)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data && Array.isArray(data.ids)) setIds(data.ids as string[]);
          })
          .catch(() => {});
      } else {
        setIds((prev) => (present ? prev.filter((id) => id !== productId) : [...prev, productId]));
      }
    },
    [ids, authed],
  );

  const clear = useCallback(() => {
    if (authed) {
      fetch("/api/customer/wishlist?clear=1", { method: "DELETE" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => setIds(data && Array.isArray(data.ids) ? (data.ids as string[]) : []))
        .catch(() => {}); // keep optimistic fallback below
    } else {
      setIds([]);
    }
  }, [authed]);

  const value = useMemo<WishlistContextValue>(
    () => ({ ids, has, toggle, clear, authed, loading }),
    [ids, has, toggle, clear, authed, loading],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
