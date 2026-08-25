"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/locale-context";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { AuthCard } from "@/components/customer/AuthCard";
import { clearGuestWishlist, notifyAuthChange, readGuestWishlist } from "@/lib/customer/auth-client";

export default function SignInPage() {
  const locale = useLocale();
  const router = useRouter();
  const dict = getDictionary(locale);
  const a = dict.account;
  const prefix = `/${locale}`;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/customer/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, wishlist: readGuestWishlist() }),
      });
      if (res.ok) {
        clearGuestWishlist();
        notifyAuthChange();
        router.push(`${prefix}/account`);
        router.refresh();
      } else {
        setError(a.invalidCredentials);
      }
    } catch {
      setError("Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title={a.signInTitle} sub={a.signInSub}>
      <form onSubmit={submit}>
        {error && <div className="acc-status acc-status--err">{error}</div>}
        <div className="acc-field">
          <label htmlFor="si-email">{a.email}</label>
          <input id="si-email" type="email" className="acc-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="acc-field">
          <label htmlFor="si-password">{a.password}</label>
          <input id="si-password" type="password" className="acc-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? a.loading : a.signIn}
        </button>
      </form>
      <p className="auth-caret">
        <Link href={`${prefix}/forgot-password`}>{a.forgotTitle}</Link>
      </p>
      <p className="auth-caret">
        {a.signUpTitle} <Link href={`${prefix}/signup`}>{a.signUp}</Link>
      </p>
    </AuthCard>
  );
}
