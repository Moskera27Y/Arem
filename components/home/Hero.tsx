"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { HomeSection } from "@/lib/types";
import { Icon } from "@/components/ui/icons";
import { ARREM } from "@/components/ui/ARREM";

interface HeroProps {
  section: Extract<HomeSection, { kind: "hero" }>;
  locale: Locale;
}

/** Luxury Hero: dark starry canvas + reactive particles + animated AR❀EM logo. */
export function Hero({ section, locale }: HeroProps) {
  const [contentVisible, setContentVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number; near: boolean }>({ x: 0, y: 0, near: false });

  // — Responsive label / copy —
  const label = useMemo(() => ({
    eyebrow: "COLOMBIAN CRAFT FROM WORKSHOP TO WORLD",
    title: "Colombia to wear.",
    titleAccent: "To feel, to share.",
    sub: "Each piece is hand-forged in our Bogotá atelier, where pre-collected metals meet traditional tooling. We work with reclaimed silver, ethically sourced stones, and gold-filled findings — built to last a lifetime.",
    cta: locale === "es" ? "DESCUBRE LAS PIEZAS" : "DISCOVER THE CRAFTS",
  }), [locale]);

  // — Reduced motion only (no visibility hack that kills canvas) —
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const fn = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", fn);
    const t = setTimeout(() => setContentVisible(true), 200);
    return () => {
      clearTimeout(t);
      mq.removeEventListener("change", fn);
    };
  }, []);

  // — Mouse proximity for particle interaction —
  const handlePointerMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
    const near = Math.hypot(mouseRef.current.x - rect.width / 2, mouseRef.current.y - rect.height / 2) < rect.width * 0.4;
    mouseRef.current.near = near;
  }, []);

  useEffect(() => {
    if (reduceMotion || !canvasRef.current) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const W = canvas.width, H = canvas.height;
      ctx.fillStyle = "#0a0502";
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * W, y = Math.random() * H;
        const s = Math.random() * 1.4 + 0.3;
        ctx.fillStyle = `rgba(201, 168, 74, ${Math.random() * 0.4 + 0.1})`;
        ctx.fillRect(x, y, s, s);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const DPR = window.devicePixelRatio || 1;

    // Particles: stars + sparkles — always visible, never fully dark
    const P = 340;
    const particles = Array.from({ length: P }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.35,
      size: Math.random() * 1.8 + 0.4,
      twinkle: Math.random() * Math.PI * 2,
      sparkle: i % 6 === 0,
      baseAlpha: 0.35 + Math.random() * 0.5,
    }));

    let t = 0;
    let idleFade = 0; // 0 = active, max 1 = idle (but particles ALWAYS visible)

    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, W, H);

      // Idle detection: after 6s of no mouse activity → subtle dimming
      if (!mouseRef.current.near) {
        idleFade = Math.min(1, idleFade + 0.0015); // slower fade in
      } else {
        idleFade = Math.max(0, idleFade - 0.012); // faster restore
      }

      // Dark gradient background — rich midnight, not flat black
      const darkBase = "#0d0703";
      const darkMid = "#080402";
      const darkEnd = "#050301";
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, darkBase);
      grad.addColorStop(0.5, darkMid);
      grad.addColorStop(1, darkEnd);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Vignette — intensifies on idle but never blackouts
      const vignetteStrength = 0.28 + idleFade * 0.12;
      const rad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) / 1.3);
      rad.addColorStop(0, "transparent");
      rad.addColorStop(1, `rgba(10, 5, 2, ${vignetteStrength})`);
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, W, H);

      t += 0.016;
      const mouse = mouseRef.current;
      // Idle factor: 0 = active, 1 = idle (reduces speed, keeps min brightness)
      const speedFactor = 1 - (idleFade * 0.7);
      const brightnessFactor = 0.7 + (idleFade * 0.3); // always at least 70% visible

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      particles.forEach((p) => {
        // Organic drift — slowed on idle
        p.x += p.vx * speedFactor;
        p.y += p.vy * speedFactor;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        // Cursor-reactive: accelerate toward pointer when nearby
        if (mouse.near) {
          const dx = mouse.x - p.x, dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 320) {
            const force = (320 - dist) / 320;
            p.vx += (dx / dist) * 0.18 * force * speedFactor;
            p.vy += (dy / dist) * 0.12 * force * speedFactor;
            p.vx *= 0.97; p.vy *= 0.97;
          }
        }

        // Twinkle — dimmed on idle but NEVER disappears
        const a = (p.baseAlpha + Math.sin(t * 0.6 + p.twinkle) * 0.1) * brightnessFactor;
        ctx.globalAlpha = a;
        ctx.fillStyle = p.sparkle ? "#d9c97a" : "#c9a85a";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Sparkle rays on sparkle particles — dimmed on idle but still visible
        if (p.sparkle && p.size > 0.9 && Math.sin(t * 2 + p.twinkle) > 0.3) {
          ctx.globalAlpha = a * 0.6;
          ctx.strokeStyle = "#d9c97a";
          ctx.lineWidth = 0.5;
          for (let r = 0; r < 4; r++) {
            const angle = (r * Math.PI) / 2 + t;
            const len = p.size * (2 + Math.sin(t * 3 + p.twinkle));
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + Math.cos(angle) * len, p.y + Math.sin(angle) * len);
            ctx.stroke();
          }
        }
      });

      // Golden beam when cursor is within range — always subtle
      if (mouse.near && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        ctx.globalAlpha = 0.22 * brightnessFactor;
        const beamGrad = ctx.createLinearGradient(rect.width / 2, rect.height / 2, mouse.x, mouse.y);
        beamGrad.addColorStop(0, "#d9a85a");
        beamGrad.addColorStop(1, "transparent");
        ctx.fillStyle = beamGrad;
        ctx.fillRect(0, 0, W, H);
      }

      ctx.restore();
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * DPR;
      canvas.height = rect.height * DPR;
      ctx.scale(DPR, DPR);
    };
    resize();
    window.addEventListener("resize", resize);

    animate();

    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [reduceMotion]);

  // Pointer + touch events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const opts = { passive: true };
    canvas.addEventListener("pointermove", handlePointerMove, opts);
    return () => canvas.removeEventListener("pointermove", handlePointerMove);
  }, [handlePointerMove]);

  return (
    <section
      className="hero hero--luxury"
      data-animate={contentVisible ? "ready" : undefined}
      aria-label="Colombian craft from workshop to world"
    >
      {/* Reactive particle canvas — background layer */}
      <canvas
        ref={canvasRef}
        className="hero__canvas"
        aria-hidden="true"
        width={1920}
        height={820}
      />

      {/* Central AR❀EM logo — inside hero, animated */}
      <div
        className="hero__brand-outer"
        data-animate={contentVisible ? "ready" : undefined}
        role="img"
        aria-label="AR❀EM"
      >
        <ARREM animated={!reduceMotion} />
      </div>

      {/* Floating polyhedron (right side only) */}
      <div
        className="hero__geom hero__geom--poly"
        style={{
          right: "3%",
          top: "40%",
          animationDelay: reduceMotion ? "0s" : "0.85s",
        }}
      />

      {/* Main content — left aligned */}
      <div className="hero__content">
        <p className="hero__eyebrow" data-hero-delay="580">
          {label.eyebrow}
        </p>
        <h1 className="hero__title" data-hero-delay="730">
          {label.title}
          <em className="hero__title-accent">{label.titleAccent}</em>
        </h1>
        <p className="hero__sub" data-hero-delay="880">
          {label.sub}
        </p>
        <div className="hero__actions" data-hero-delay="1030">
          <Link href={`/${locale}/shop`} className="btn btn--gold-dark btn--lg hero__cta">
            <span className="btn__glow" />
            {label.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
