"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icons";

/**
 * Craft ticker — thin ink marquee strip under the hero, Khoi-style.
 * Pure CSS motion (pauses on hover or via accessible toggle, static
 * under reduced motion). Decorative duplicate of the announcement bar,
 * hidden from assistive tech.
 */
export function Ticker({ items }: { items: string[] }) {
  const [paused, setPaused] = useState(false);
  if (items.length === 0) return null;

  const row = (key: string) => (
    <span key={key} className="ticker__row">
      {items.map((message, index) => (
        <span key={`${key}-${index}`} className="ticker__item">
          <Icon name="star" size={11} className="ticker__sep" />
          {message}
        </span>
      ))}
    </span>
  );

  return (
    <div className="ticker" aria-hidden="true" data-paused={paused || undefined}>
      <div className="ticker__track">
        {row("a")}
        {row("b")}
      </div>
      <button
        type="button"
        className="ticker__pause"
        aria-pressed={paused}
        aria-label={paused ? "Reanudar" : "Pausar"}
        tabIndex={-1}
        onClick={() => setPaused((v) => !v)}
      >
        <span className="marquee-toggle" data-playing={paused || undefined} aria-hidden="true" />
      </button>
    </div>
  );
}
