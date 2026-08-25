"use client";

import type { ReactNode } from "react";

export function AuthCard({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <p className="auth-card__brand">
          AREM <span className="tag">· Account</span>
        </p>
        <h1>{title}</h1>
        {sub && <p className="auth-card__sub">{sub}</p>}
        {children}
      </div>
    </div>
  );
}
