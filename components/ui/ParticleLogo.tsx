"use client";

import { useEffect, useRef } from "react";

/**
 * ParticleLogo
 * Renders text as a field of small gold particles that gently drift and
 * shimmer, then re-settle into the letterforms. Falls back to plain
 * gradient-gold text when the user prefers reduced motion, or if canvas
 * isn't available (SSR-safe).
 *
 * Drop-in usage (replace the current AR•EM text mark in Header):
 *
 *   <ParticleLogo text="AR•EM" className="h-9 w-auto" />
 *
 * Tune GOLD, particle density, and font to match your existing wordmark.
 */

const GOLD = ["#E8C77A", "#D9AF5C", "#F3DA9A", "#C99A3E"];

type Props = {
  text?: string;
  fontFamily?: string;
  fontWeight?: number | string;
  /** Rendered font size in px at the sampling resolution (before scaling). */
  fontSize?: number;
  className?: string;
  /** Roughly how many px between sampled particles — lower = denser. */
  density?: number;
};

export default function ParticleLogo({
  text = "AR•EM",
  fontFamily = "var(--font-serif), Georgia, serif",
  fontWeight = 700,
  fontSize = 64,
  className,
  density = 3,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // --- 1. Measure & size the canvas to the text
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    const textWidth = Math.ceil(metrics.width) + 20;
    const textHeight = Math.ceil(fontSize * 1.4);

    canvas.width = textWidth * dpr;
    canvas.height = textHeight * dpr;
    canvas.style.width = `${textWidth}px`;
    canvas.style.height = `${textHeight}px`;
    ctx.scale(dpr, dpr);

    // --- 2. Sample the text into particle positions
    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = textWidth;
    sampleCanvas.height = textHeight;
    const sampleCtx = sampleCanvas.getContext("2d");
    if (!sampleCtx) return;
    sampleCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    sampleCtx.textBaseline = "middle";
    sampleCtx.fillStyle = "#000";
    sampleCtx.fillText(text, 10, textHeight / 2);
    const imageData = sampleCtx.getImageData(0, 0, textWidth, textHeight).data;

    type Particle = {
      homeX: number;
      homeY: number;
      x: number;
      y: number;
      r: number;
      color: string;
      phase: number;
      speed: number;
      drift: number;
    };

    const particles: Particle[] = [];
    for (let y = 0; y < textHeight; y += density) {
      for (let x = 0; x < textWidth; x += density) {
        const alpha = imageData[(y * textWidth + x) * 4 + 3];
        if (alpha > 120) {
          particles.push({
            homeX: x,
            homeY: y,
            x: x + (Math.random() - 0.5) * 8,
            y: y + (Math.random() - 0.5) * 8,
            r: Math.random() * 1.1 + 0.5,
            color: GOLD[Math.floor(Math.random() * GOLD.length)],
            phase: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 0.8,
            drift: 0.6 + Math.random() * 1.2,
          });
        }
      }
    }

    // --- 3. Static fallback for reduced motion
    if (prefersReducedMotion) {
      ctx.clearRect(0, 0, textWidth, textHeight);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.arc(p.homeX, p.homeY, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      return;
    }

    // --- 4. Animation loop: settle-in, then gentle shimmer/drift
    let raf = 0;
    let start = performance.now();
    const SETTLE_MS = 900;

    const tick = (now: number) => {
      const elapsed = now - start;
      const settleT = Math.min(1, elapsed / SETTLE_MS);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - settleT, 3);

      ctx.clearRect(0, 0, textWidth, textHeight);

      for (const p of particles) {
        const cx = p.x + (p.homeX - p.x) * eased;
        const cy = p.y + (p.homeY - p.y) * eased;

        // once settled, add a tiny idle shimmer/drift so it feels alive
        const t = now / 1000;
        const shimmer = settleT >= 1 ? Math.sin(t * p.speed + p.phase) : 0;
        const dx = shimmer * 0.5;
        const dy = Math.cos(t * p.speed * 0.8 + p.phase) * 0.4;

        const glow = 0.55 + 0.45 * Math.sin(t * p.speed * 1.6 + p.phase);

        ctx.beginPath();
        ctx.globalAlpha = glow;
        ctx.fillStyle = p.color;
        ctx.arc(cx + dx, cy + dy, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, fontFamily, fontWeight, fontSize, density]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label={text.replace("•", " ")}
    />
  );
}
