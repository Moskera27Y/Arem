"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { HomeSection } from "@/lib/types";
import { Icon } from "@/components/ui/icons";

interface HeroProps {
  section: Extract<HomeSection, { kind: "hero" }>;
  locale: Locale;
}

/** Luxury Hero: dark starry canvas + reactive particles + animated AR❀EM logo. */
export function Hero({ section, locale }: HeroProps) {
  const [contentVisible, setContentVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number; near: boolean }>({ x: 0, y: 0, near: false });

  // — Responsive label / copy —
  const label = useMemo(() => ({
    eyebrow: "COLOMBIAN CRAFT FROM WORKSHOP TO WORLD",
    title: "Colombia to wear.",
    titleAccent: "To feel, to share.",
    sub: "Each piece is hand-forged in our Bogotá atelier, where pre-collected metals meet traditional tooling. We work with reclaimed silver, ethically sourced stones, and gold‑filled findings — built to last a lifetime.",
    cta: locale === "es" ? "DESCUBRE LAS PIEZAS" : "DISCOVER THE CRAFTS",
  }), [locale]);

  // — Reduced motion + visibility (stagger entrance) —
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const fn = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", fn);
    const onVis = () => document.hidden && setReduceMotion(true);
    document.addEventListener("visibilitychange", onVis);
    // Entrance delay
    const t = setTimeout(() => setContentVisible(true), 200);
    return () => { clearTimeout(t); mq.removeEventListener("change", fn); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  // — Mouse proximity for particle + logo interaction —
  const handlePointerMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
    const near = Math.hypot(mouseRef.current.x - rect.width / 2, mouseRef.current.y - rect.height / 2) < rect.width * 0.35;
    mouseRef.current.near = near;
  }, []);

  useEffect(() => {
    if (reduceMotion || !canvasRef.current) {
      // Draw static fallback — no animation
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

    // Particles: stars + sparkles
    const P = 320;
    const particles = Array.from({ length: P }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 0.3,
      twinkle: Math.random() * Math.PI * 2,
      sparkle: i % 7 === 0,
      baseAlpha: 0.3 + Math.random() * 0.5,
    }));

    let t = 0;

    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, W, H);

      // Dark gradient background with wood-grain texture (subtle)
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, "#0a0502");
      grad.addColorStop(0.5, "#060301");
      grad.addColorStop(1, "#040200");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Subtle radial vignette (darkness in edges)
      const rad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) / 1.3);
      rad.addColorStop(0, "transparent");
      rad.addColorStop(1, "rgba(10, 5, 2, 0.35)");
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, W, H);

      t += 0.016;
      const mouse = mouseRef.current;

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      particles.forEach((p) => {
        // Organic drift
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        // Cursor-reactive: accelerate toward pointer when nearby
        if (mouse.near) {
          const dx = mouse.x - p.x, dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 300) {
            const force = (300 - dist) / 300;
            p.vx += (dx / dist) * 0.18 * force;
            p.vy += (dy / dist) * 0.12 * force;
            p.vx *= 0.97; p.vy *= 0.97;
          }
        }

        // Twinkle
        const a = p.baseAlpha + Math.sin(t * 0.6 + p.twinkle) * 0.1;
        ctx.globalAlpha = a;
        ctx.fillStyle = p.sparkle ? "#d9c97a" : "#c9a85a";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Sparkle rays on sparkle particles
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

      // Golden beam when cursor is within range
      if (mouse.near && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        ctx.globalAlpha = 0.15;
        const beamGrad = ctx.createLinearGradient(rect.width / 2, rect.height / 2, mouse.x, mouse.y);
        beamGrad.addColorStop(0, "#d9a85a");
        beamGrad.addColorStop(1, "transparent");
        ctx.fillStyle = beamGrad;
        ctx.fillRect(0, 0, W, H);
      }

      ctx.restore();
    };

    // Init canvas size
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

  // Pointer event listener on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("pointermove", handlePointerMove);
    return () => canvas.removeEventListener("pointermove", handlePointerMove);
  }, [handlePointerMove]);

  return (
    <>
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

        {/* Floating geometric elements */}
        <div
          className="hero__geom hero__geom--circle"
          style={{
            left: "3%",
            top: "45%",
            animationDelay: reduceMotion ? "0s" : "0.7s",
          }}
        />
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

      {/* Central AR❀EM logo — animated, separate layer for full control */}
      <div
        className="hero__brand-outer"
        ref={logoRef}
        data-animate={contentVisible ? "ready" : undefined}
        role="img"
        aria-label="AR❀EM"
      >
        <div className="hero__brand-mark">
          <span className="hero__brand-letter" style={{ animationDelay: "0s" }}>AR</span>
          <span className="hero__brand-flower" aria-hidden="true">❀</span>
          <span className="hero__brand-letter" style={{ animationDelay: "0.4s" }}>EM</span>
        </div>
      </div>
    </>
  );
}
