"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/lib/store/cart-context";
import { WishlistProvider } from "@/lib/store/wishlist-context";

/** Global client store: cart + wishlist. */
export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <WishlistProvider>
      <CartProvider>{children}</CartProvider>
    </WishlistProvider>
  );
}
