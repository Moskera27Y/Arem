"use client";

import { useState } from "react";

const ORDER_STATUSES = ["pending_payment", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];
const PAY_STATUSES = ["pending", "paid", "refunded", "failed"];

export function OrderStatusEditor({ orderId, initialStatus, initialPayment }: { orderId: string; initialStatus: string; initialPayment: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [payment, setPayment] = useState(initialPayment);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, payment_status: payment }),
      });
      setMsg(res.ok ? "Saved" : "Error");
    } catch {
      setMsg("Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-card" style={{ marginTop: "1rem" }}>
      <h3 style={{ margin: "0 0 1rem" }}>Update status</h3>
      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: 13 }}>
          Fulfillment
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: 13 }}>
          Payment
          <select className="select" value={payment} onChange={(e) => setPayment(e.target.value)}>
            {PAY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn--primary btn--sm" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        {msg && <span className="muted">{msg}</span>}
      </div>
    </div>
  );
}
