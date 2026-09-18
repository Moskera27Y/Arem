"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/locale-context";

interface Ev {
  status: string;
  description: string | null;
  occurred_at: string;
}

export default function TrackingPage() {
  const locale = useLocale();
  const es = locale === "es";
  const [code, setCode] = useState("");
  const [state, setState] = useState<{ status: string; events: Ev[] } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setState(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/shipping/track?tracking=${encodeURIComponent(code.trim())}`);
      const d = await res.json();
      if (!res.ok) setError(d.error || "Error");
      else setState({ status: String(d.shipment?.status ?? ""), events: d.events ?? [] });
    } catch {
      setError("Error de conexión");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: "34rem" }}>
        <h1 className="h2">{es ? "Rastrea tu pedido" : "Track your order"}</h1>
        <p className="muted">{es ? "Ingresa tu número de guía (ej. AREM-XXXXXXXX)." : "Enter your tracking number (e.g. AREM-XXXXXXXX)."}</p>
        <form onSubmit={submit} className="acc-field">
          <label htmlFor="trk">{es ? "Número de guía" : "Tracking number"}</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input id="trk" className="acc-input" value={code} onChange={(e) => setCode(e.target.value)} required />
            <button type="submit" className="btn btn--primary" disabled={busy}>
              {busy ? "…" : es ? "Rastrear" : "Track"}
            </button>
          </div>
        </form>
        {error && <div className="acc-status acc-status--err">{error}</div>}
        {state && (
          <div style={{ marginTop: "1.5rem" }}>
            <p>
              <strong>{state.status}</strong>
            </p>
            <ul className="acc-timeline">
              {state.events.map((e, i) => (
                <li key={i} className="done">
                  <div className="t-status">{e.status}</div>
                  {e.description && <div className="t-desc">{e.description}</div>}
                  <div className="t-desc">{new Date(e.occurred_at).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
