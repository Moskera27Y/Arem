/**
 * Client-side hook for fetching product recommendations.
 * Uses SWR-style caching + deduping for performance.
 */
"use client";

import { useEffect, useState, useRef } from "react";
import type { Product } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";

export type RecType = "similar" | "popular" | "category";

interface UseRecommendationsResult {
  products: Product[];
  loading: boolean;
  error: Error | null;
}

export function useRecommendations(
  locale: Locale,
  type: RecType = "popular",
  options: {
    productId?: string;
    categoryId?: string;
    limit?: number;
    exclude?: string[];
  } = {},
): UseRecommendationsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Dedupe concurrent requests within this tick
  const pendingRef = useRef<boolean>(false);

  useEffect(() => {
    const controller = new AbortController();
    pendingRef.current = true;

    const params = new URLSearchParams({ locale, limit: String(options.limit ?? 4) });
    if (type === "similar" && options.productId) {
      params.set("product", options.productId);
    } else if (type === "category" && options.categoryId) {
      params.set("category", options.categoryId);
    }
    if (options.exclude && options.exclude.length > 0) {
      params.set("exclude", options.exclude.join(","));
    }

    setLoading(true);
    setError(null);

    fetch(`/api/recommendations?${params.toString()}`, {
      signal: controller.signal,
      headers: { "x-nextjs-data": "recommendation" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { products: Product[] }) => {
        if (!pendingRef.current) return;
        setProducts(data.products ?? []);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        if (!pendingRef.current) return;
        setError(err);
        setLoading(false);
      });

    return () => {
      pendingRef.current = false;
      controller.abort();
    };
  }, [locale, type, options.productId, options.categoryId, options.limit, options.exclude]);

  return { products, loading, error };
}
