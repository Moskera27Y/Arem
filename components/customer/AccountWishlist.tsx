"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/locale-context";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getProductById } from "@/lib/content";
import { useWishlist } from "@/lib/store/wishlist-context";
import { ProductCard } from "@/components/cards/ProductCard";
import { Icon } from "@/components/ui/icons";

export function AccountWishlist() {
  const locale = useLocale();
  const dict = getDictionary(locale);
  const a = dict.account;
  const prefix = `/${locale}`;
  const { ids, clear, authed, loading } = useWishlist();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const products = mounted
    ? ids.map((id) => getProductById(locale, id)).filter((p): p is NonNullable<typeof p> => Boolean(p))
    : [];

  return (
    <div className="account__card">
      <div className="account__heading">
        <h1>{a.wishlistTitle}</h1>
        <p>{a.wishlistSub}</p>
      </div>
      <p className="acc-note" style={{ marginTop: "-0.5rem", marginBottom: "1.5rem" }}>
        {a.wishlistAccount}
      </p>
      {!mounted || loading ? (
        <p className="acc-empty">{a.loading}</p>
      ) : products.length === 0 ? (
        <div className="acc-empty">
          <Icon name="heart" size={26} />
          <p>{dict.wishlist.empty}</p>
          <Link href={`${prefix}/shop`} className="btn btn--primary">
            {dict.nav.shop}
          </Link>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <p className="muted">{dict.wishlist.saved(products.length)}</p>
            <button type="button" className="cart-line__remove" onClick={clear}>
              {dict.wishlist.clear}
            </button>
          </div>
          <div className="grid grid--4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
