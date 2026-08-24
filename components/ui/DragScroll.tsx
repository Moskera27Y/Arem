"use client";

import { useRef, type ReactNode } from "react";

interface DragScrollProps {
  className?: string;
  children: ReactNode;
}

/**
 * Enables mouse drag-to-scroll on horizontal scroll containers (the category
 * and product rows). Touch devices use native swipe; this only activates for
 * mouse pointers so it never hijacks touch scrolling.
 */
export function DragScroll({ className, children }: DragScrollProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    dragging.current = true;
    startX.current = e.clientX;
    startScroll.current = ref.current.scrollLeft;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !ref.current) return;
    ref.current.scrollLeft = startScroll.current - (e.clientX - startX.current);
  };
  const end = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={ref}
      className={`drag-scroll${className ? ` ${className}` : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerLeave={end}
    >
      {children}
    </div>
  );
}
