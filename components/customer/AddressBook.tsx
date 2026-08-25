"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/locale-context";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { CustomerAddress } from "@/lib/server/customer-db";

interface Draft {
  recipient_name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default_shipping: boolean;
  is_default_billing: boolean;
}
const EMPTY: Draft = {
  recipient_name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "CO",
  is_default_shipping: true,
  is_default_billing: true,
};

export function AddressBook({ initial }: { initial: CustomerAddress[] }) {
  const locale = useLocale();
  const dict = getDictionary(locale);
  const a = dict.account;
  const [list, setList] = useState<CustomerAddress[]>(initial);
  const [editing, setEditing] = useState<CustomerAddress | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  function openAdd() {
    setDraft({ ...EMPTY, is_default_shipping: list.length === 0, is_default_billing: list.length === 0 });
    setEditing(null);
    setAdding(true);
    setStatus(null);
  }
  function openEdit(addr: CustomerAddress) {
    setDraft({
      recipient_name: addr.recipient_name,
      phone: addr.phone ?? "",
      line1: addr.line1,
      line2: addr.line2 ?? "",
      city: addr.city,
      state: addr.state ?? "",
      postal_code: addr.postal_code ?? "",
      country: addr.country,
      is_default_shipping: addr.is_default_shipping,
      is_default_billing: addr.is_default_billing,
    });
    setEditing(addr);
    setAdding(true);
    setStatus(null);
  }
  function close() {
    setAdding(false);
    setEditing(null);
    setConfirmDelete(null);
  }
  const set = (k: keyof Draft, v: unknown) => setDraft((d) => ({ ...d, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.recipient_name || !draft.line1 || !draft.city || !draft.country) {
      setStatus({ ok: false, message: "Faltan campos" });
      return;
    }
    const payload = {
      recipient_name: draft.recipient_name,
      phone: draft.phone || null,
      line1: draft.line1,
      line2: draft.line2 || null,
      city: draft.city,
      state: draft.state || null,
      postal_code: draft.postal_code || null,
      country: draft.country,
      is_default_shipping: draft.is_default_shipping,
      is_default_billing: draft.is_default_billing,
    };
    try {
      const url = editing ? `/api/customer/addresses/${editing.id}` : "/api/customer/addresses";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const r = await fetch("/api/customer/addresses");
        setList(await r.json());
        setStatus({ ok: true, message: a.addressSaved });
        close();
      } else {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus({ ok: false, message: d.error || "Error" });
      }
    } catch {
      setStatus({ ok: false, message: "Error" });
    }
  }

  async function doDelete(id: string) {
    try {
      const res = await fetch(`/api/customer/addresses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setList((prev) => prev.filter((x) => x.id !== id));
        setStatus({ ok: true, message: a.addressDeleted });
      } else {
        setStatus({ ok: false, message: "Error" });
      }
    } catch {
      setStatus({ ok: false, message: "Error" });
    }
    setConfirmDelete(null);
  }

  return (
    <div className="account__card">
      <div className="account__heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>{a.addressesTitle}</h1>
          <p>{a.addressesSub}</p>
        </div>
        {!adding && (
          <button type="button" className="btn--primary" onClick={openAdd} style={{ whiteSpace: "nowrap" }}>
            {a.addAddress}
          </button>
        )}
      </div>
      {status && <div className={`acc-status ${status.ok ? "acc-status--ok" : "acc-status--err"}`}>{status.message}</div>}

      {adding && (
        <form onSubmit={save} style={{ marginBottom: "1.5rem", borderTop: "1px solid #efeae2", paddingTop: "1.25rem" }}>
          <div className="acc-form__row">
            <div className="acc-field">
              <label>{a.recipientName}</label>
              <input className="acc-input" value={draft.recipient_name} onChange={(e) => set("recipient_name", e.target.value)} required />
            </div>
            <div className="acc-field">
              <label>{a.phone}</label>
              <input className="acc-input" value={draft.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
          </div>
          <div className="acc-field">
            <label>{a.addressLine1}</label>
            <input className="acc-input" value={draft.line1} onChange={(e) => set("line1", e.target.value)} required />
          </div>
          <div className="acc-field">
            <label>{a.addressLine2}</label>
            <input className="acc-input" value={draft.line2} onChange={(e) => set("line2", e.target.value)} />
          </div>
          <div className="acc-form__row">
            <div className="acc-field">
              <label>{a.city}</label>
              <input className="acc-input" value={draft.city} onChange={(e) => set("city", e.target.value)} required />
            </div>
            <div className="acc-field">
              <label>{a.state}</label>
              <input className="acc-input" value={draft.state} onChange={(e) => set("state", e.target.value)} />
            </div>
          </div>
          <div className="acc-form__row">
            <div className="acc-field">
              <label>{a.postalCode}</label>
              <input className="acc-input" value={draft.postal_code} onChange={(e) => set("postal_code", e.target.value)} />
            </div>
            <div className="acc-field">
              <label>{a.country}</label>
              <input className="acc-input" value={draft.country} onChange={(e) => set("country", e.target.value)} required />
            </div>
          </div>
          <label className="acc-check">
            <input type="checkbox" checked={draft.is_default_shipping} onChange={(e) => set("is_default_shipping", e.target.checked)} />
            {a.defaultShipping}
          </label>
          <label className="acc-check">
            <input type="checkbox" checked={draft.is_default_billing} onChange={(e) => set("is_default_billing", e.target.checked)} />
            {a.defaultBilling}
          </label>
          <div className="acc-form__actions">
            <button type="submit" className="btn--primary">{editing ? a.save : a.add}</button>
            <button type="button" className="acc-btn-secondary" onClick={close}>{a.cancel}</button>
          </div>
        </form>
      )}

      {list.length === 0 && !adding ? (
        <p className="acc-empty">{a.addressesSub}</p>
      ) : (
        list.map((addr) => (
          <div className="acc-addr" key={addr.id}>
            <div>
              <strong>{addr.recipient_name}</strong>
              <div className="meta">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</div>
              <div className="meta">{[addr.city, addr.state, addr.postal_code].filter(Boolean).join(", ")} · {addr.country}</div>
              {addr.phone && <div className="meta">{addr.phone}</div>}
              <div className="badges">
                {addr.is_default_shipping && <span className="acc-badge">{a.defaultShipping}</span>}
                {addr.is_default_billing && <span className="acc-badge">{a.defaultBilling}</span>}
              </div>
            </div>
            <div className="acc-actions">
              <button type="button" onClick={() => openEdit(addr)}>{a.edit}</button>
              {confirmDelete === addr.id ? (
                <>
                  <button type="button" className="danger" onClick={() => doDelete(addr.id)}>{a.confirmDelete}</button>
                  <button type="button" onClick={() => setConfirmDelete(null)}>{a.cancel}</button>
                </>
              ) : (
                <button type="button" className="danger" onClick={() => setConfirmDelete(addr.id)}>{a.delete}</button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
