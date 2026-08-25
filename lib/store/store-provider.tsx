"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/lib/store/cart-context";
import { WishlistProvider } from "@/lib/store/wishlist-context";
import { CurrencyProvider } from "@/lib/currency/currency-context";

/** Global client store: currency preference + cart + wishlist. */
export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <CurrencyProvider>
      <WishlistProvider>
        <CartProvider>{children}</CartProvider>
      </WishlistProvider>
    </CurrencyProvider>
  );
}
