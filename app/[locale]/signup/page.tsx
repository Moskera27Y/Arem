"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/locale-context";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { AuthCard } from "@/components/customer/AuthCard";
import { clearGuestWishlist, notifyAuthChange, readGuestWishlist } from "@/lib/customer/auth-client";

export default function SignUpPage() {
  const locale = useLocale();
  const router = useRouter();
  const dict = getDictionary(locale);
  const a = dict.account;
  const prefix = `/${locale}`;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (password !== confirm) {
      setError(locale === "es" ? "Las contraseñas no coinciden" : "Passwords don't match");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/customer/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          password,
          preferred_language: locale,
          wishlist: readGuestWishlist(),
        }),
      });
      if (res.ok) {
        clearGuestWishlist();
        notifyAuthChange();
        router.push(`${prefix}/account`);
        router.refresh();
      } else {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setError(d.error || a.emailExists);
      }
    } catch {
      setError("Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title={a.signUpTitle} sub={a.signUpSub}>
      <form onSubmit={submit}>
        {error && <div className="acc-status acc-status--err">{error}</div>}
        <div className="acc-form__row">
          <div className="acc-field">
            <label htmlFor="su-first">{a.firstName}</label>
            <input id="su-first" className="acc-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="acc-field">
            <label htmlFor="su-last">{a.lastName}</label>
            <input id="su-last" className="acc-input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>
        <div className="acc-field">
          <label htmlFor="su-email">{a.email}</label>
          <input id="su-email" type="email" className="acc-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="acc-field">
          <label htmlFor="su-phone">{a.phone}</label>
          <input id="su-phone" className="acc-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="acc-form__row">
          <div className="acc-field">
            <label htmlFor="su-password">{a.password}</label>
            <input id="su-password" type="password" className="acc-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="acc-field">
            <label htmlFor="su-confirm">{a.confirmPassword}</label>
            <input id="su-confirm" type="password" className="acc-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
        </div>
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? a.loading : a.signUp}
        </button>
      </form>
      <p className="auth-caret">
        {a.signInTitle} <Link href={`${prefix}/signin`}>{a.signIn}</Link>
      </p>
    </AuthCard>
  );
}
