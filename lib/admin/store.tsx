"use client";

/**
 * Centralized Admin content store — the single mutable source for catalog
 * content in this prototype. Persists to localStorage so changes survive
 * refresh; the storefront client surfaces read the same store, so edits are
 * reflected immediately. SSR renders the static seeds (no mismatch); the
 * store hydrates from localStorage after mount.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ADMIN_STORAGE_KEY,
  ADMIN_STORAGE_VERSION,
  type AdminCategory,
  type AdminContentState,
  type AdminProduct,
  type MediaAsset,
  type Promotion,
  type SocialLink,
} from "@/lib/admin/types";
import { getDefaultAdminState } from "@/lib/admin/seed";

interface AdminStoreValue extends AdminContentState {
  hydrated: boolean;
  upsertProduct: (product: AdminProduct) => void;
  deleteProduct: (id: string) => void;
  upsertCategory: (category: AdminCategory) => void;
  deleteCategory: (id: string) => void;
  upsertPromotion: (promotion: Promotion) => void;
  deletePromotion: (id: string) => void;
  upsertSocialLink: (link: SocialLink) => void;
  deleteSocialLink: (id: string) => void;
  upsertMedia: (asset: MediaAsset) => void;
  deleteMedia: (id: string) => void;
  resetContent: () => void;
}

const AdminStoreContext = createContext<AdminStoreValue | null>(null);

function readStoredState(): AdminContentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { version?: number; state?: AdminContentState };
    if (parsed.version !== ADMIN_STORAGE_VERSION || !parsed.state) return null;
    const state = parsed.state;
    if (!Array.isArray(state.products) || !Array.isArray(state.categories)) return null;
    return state;
  } catch {
    return null;
  }
}

export function AdminProvider({ children }: { children: ReactNode }) {
  // SSR + first client paint use the seeds so markup matches.
  const [state, setState] = useState<AdminContentState>(() => getDefaultAdminState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredState();
    if (stored) setState(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        ADMIN_STORAGE_KEY,
        JSON.stringify({ version: ADMIN_STORAGE_VERSION, state }),
      );
    } catch {
      /* storage unavailable — keep in memory */
    }
  }, [state, hydrated]);

  const upsertProduct = useCallback((product: AdminProduct) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.some((p) => p.id === product.id)
        ? prev.products.map((p) => (p.id === product.id ? product : p))
        : [...prev.products, product],
    }));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setState((prev) => ({ ...prev, products: prev.products.filter((p) => p.id !== id) }));
  }, []);

  const upsertCategory = useCallback((category: AdminCategory) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.some((c) => c.id === category.id)
        ? prev.categories.map((c) => (c.id === category.id ? category : c))
        : [...prev.categories, category],
    }));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setState((prev) => ({ ...prev, categories: prev.categories.filter((c) => c.id !== id) }));
  }, []);

  const upsertPromotion = useCallback((promotion: Promotion) => {
    setState((prev) => ({
      ...prev,
      promotions: prev.promotions.some((p) => p.id === promotion.id)
        ? prev.promotions.map((p) => (p.id === promotion.id ? promotion : p))
        : [...prev.promotions, promotion],
    }));
  }, []);

  const deletePromotion = useCallback((id: string) => {
    setState((prev) => ({ ...prev, promotions: prev.promotions.filter((p) => p.id !== id) }));
  }, []);

  const upsertSocialLink = useCallback((link: SocialLink) => {
    setState((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.some((s) => s.id === link.id)
        ? prev.socialLinks.map((s) => (s.id === link.id ? link : s))
        : [...prev.socialLinks, link],
    }));
  }, []);

  const deleteSocialLink = useCallback((id: string) => {
    setState((prev) => ({ ...prev, socialLinks: prev.socialLinks.filter((s) => s.id !== id) }));
  }, []);

  const upsertMedia = useCallback((asset: MediaAsset) => {
    setState((prev) => ({
      ...prev,
      mediaAssets: prev.mediaAssets.some((m) => m.id === asset.id)
        ? prev.mediaAssets.map((m) => (m.id === asset.id ? asset : m))
        : [...prev.mediaAssets, asset],
    }));
  }, []);

  const deleteMedia = useCallback((id: string) => {
    setState((prev) => ({ ...prev, mediaAssets: prev.mediaAssets.filter((m) => m.id !== id) }));
  }, []);

  const resetContent = useCallback(() => {
    setState(getDefaultAdminState());
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      hydrated,
      upsertProduct,
      deleteProduct,
      upsertCategory,
      deleteCategory,
      upsertPromotion,
      deletePromotion,
      upsertSocialLink,
      deleteSocialLink,
      upsertMedia,
      deleteMedia,
      resetContent,
    }),
    [
      state,
      hydrated,
      upsertProduct,
      deleteProduct,
      upsertCategory,
      deleteCategory,
      upsertPromotion,
      deletePromotion,
      upsertSocialLink,
      deleteSocialLink,
      upsertMedia,
      deleteMedia,
      resetContent,
    ],
  );

  return <AdminStoreContext.Provider value={value}>{children}</AdminStoreContext.Provider>;
}

export function useAdminStore(): AdminStoreValue {
  const ctx = useContext(AdminStoreContext);
  if (!ctx) throw new Error("useAdminStore must be used within AdminProvider");
  return ctx;
}
