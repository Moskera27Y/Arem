"use client";

import { useState } from "react";

/** Customer confirms receipt: shipped → delivered (completed). */
export function ConfirmReceiptButton({
  orderId,
  label,
  doneLabel,
}: {
  orderId: string;
  label: string;
  doneLabel: string;
}) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function confirm() {
    if (state === "busy" || state === "done") return;
    setState("busy");
    try {
      const res = await fetch(`/api/customer/orders/${orderId}/confirm`, { method: "POST" });
      if (!res.ok) throw new Error("confirm failed");
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="form-status form-status--ok" role="status">
        {doneLabel}
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        className="btn btn--primary"
        disabled={state === "busy"}
        aria-busy={state === "busy"}
        onClick={confirm}
      >
        {label}
      </button>
      {state === "error" && (
        <p className="form-status form-status--err" role="alert" style={{ marginTop: "0.75rem" }}>
          Error
        </p>
      )}
    </div>
  );
}
