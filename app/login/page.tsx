"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudo iniciar sesión");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-body" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <form
        onSubmit={onSubmit}
        className="admin-card"
        style={{ width: "100%", maxWidth: "24rem", display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <div>
          <span className="admin-brand__name">AREM</span>
          <span className="admin-brand__tag"> · Admin</span>
          <p className="admin-card__sub" style={{ marginTop: "0.5rem" }}>
            Acceso restringido a administradores.
          </p>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="admin-email">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            required
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            placeholder="admin@ejemplo.com"
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="admin-password">
            Contraseña
          </label>
          <input
            id="admin-password"
            type="password"
            required
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="admin-form__error-summary" role="alert">
            {error}
          </div>
        )}

        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? "Iniciando sesión…" : "Entrar"}
        </button>

        <Link href="/" className="footer__link" style={{ fontSize: "var(--text-xs)" }}>
          ← Volver a la tienda
        </Link>
      </form>
    </div>
  );
}
