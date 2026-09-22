"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { HomeSection } from "@/lib/types";
import { ARREM } from "@/components/ui/ARREM";

interface HeroProps {
  section: Extract<HomeSection, { kind: "hero" }>;
  locale: Locale;
}

/** Luxury Hero: dark starry canvas + reactive particles + gold swarm around AR❀EM + animated logo. */
export function Hero({ section, locale }: HeroProps) {
  const [contentVisible, setContentVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number; near: boolean }>({ x: 0, y: 0, near: false });
  const logoPosRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  /** Paint gate: false while the hero is scrolled out of view (mobile battery saver). */
  const visibleRef = useRef(true);

  const label = useMemo(() => {
    if (locale === "es") {
      return {
        eyebrow: "ARTESANÍA COLOMBIANA DE TALLER PARA EL MUNDO",
        title: "Colombia para vestir.",
        titleAccent: "Para sentir, para compartir.",
        sub: "Mochilas wayuu de La Guajira, cerámica de Ráquira, café del Eje Cafetero, tejidos de todo el país. Cada pieza nace en manos de artesanos colombianos y viaja para el mundo.",
        cta: "DESCUBRE LAS PIEZAS",
      };
    }
    return {
      eyebrow: "COLOMBIAN CRAFT FROM WORKSHOP TO WORLD",
      title: "Colombia to wear.",
      titleAccent: "To feel, to share.",
      sub: "From Wayuu mochilas of La Guajira to Ráquira clay, Eje Cafetero coffee and textiles from every region. Each piece is forged by Colombian hands, sent out for the world.",
      cta: "DISCOVER THE CRAFTS",
    };
  }, [locale]);

  // — Reduced motion only —
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const fn = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", fn);
    const t = setTimeout(() => setContentVisible(true), 200);
    return () => { clearTimeout(t); mq.removeEventListener("change", fn); };
  }, []);

  // — Track logo position via ResizeObserver on brand-mark —
  useEffect(() => {
    const el = document.querySelector(".hero__brand-mark") as HTMLElement | null;
    if (!el) return;
    const updateLogoPos = () => {
      const rect = el.getBoundingClientRect();
      const canvas = canvasRef.current;
      if (canvas) {
        const cRect = canvas.getBoundingClientRect();
        logoPosRef.current = {
          x: rect.left + rect.width / 2 - cRect.left,
          y: rect.top + rect.height / 2 - cRect.top,
          w: rect.width,
          h: rect.height,
        };
      }
    };
    const ro = new ResizeObserver(() => updateLogoPos());
    ro.observe(el);
    const onWin = () => updateLogoPos();
    window.addEventListener("scroll", onWin, { passive: true });
    window.addEventListener("resize", onWin);
    updateLogoPos();
    return () => { ro.disconnect(); window.removeEventListener("scroll", onWin); window.removeEventListener("resize", onWin); };
  }, [contentVisible]);

  // — Mouse proximity for particle + logo interaction —
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
      ctx.fillStyle = "#0d0703";
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
    // Cap DPR at 2: modern phones report 3-4x, which multiplies the
    // per-frame cost of the full-screen gradients.
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    // Live CSS-pixel dims (canvas.width is device px; the context is
    // scaled by DPR in resize(), so all logic runs in CSS px).
    const dims = () => ({ W: canvas.clientWidth || 1, H: canvas.clientHeight || 1 });
    let { W, H } = dims();
    const isMobile = Math.min(window.innerWidth, W) < 800 || /Mobi|Android/i.test(navigator.userAgent);

    // Adapt particle counts: fewer on mobile to keep 60fps
    const P = isMobile ? 120 : 340;
    const G = isMobile ? 52 : 110;
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

    // GOLD SWARM — premium particles that orbit and are attracted to the logo
    const goldParticles = Array.from({ length: G }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.4 + 0.5,
      angle: (i / G) * Math.PI * 2,
      radius: Math.random() * 110 + 40, // tight orbit hugging the logo
      speed: 0.0012 + Math.random() * 0.0018,
      pulse: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    let idleFade = 0;

    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      // Off-screen: skip all paint work (mobile battery/CPU saver)
      if (!visibleRef.current) return;
      // Refresh live dims in case a resize slipped through
      W = canvas.clientWidth || W;
      H = canvas.clientHeight || H;
      ctx.clearRect(0, 0, W, H);

      // Idle detection
      if (!mouseRef.current.near) {
        idleFade = Math.min(1, idleFade + 0.0015);
      } else {
        idleFade = Math.max(0, idleFade - 0.012);
      }

      // Dark gradient background
      const darkBase = "#0d0703";
      const darkMid = "#080402";
      const darkEnd = "#050301";
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, darkBase);
      grad.addColorStop(0.5, darkMid);
      grad.addColorStop(1, darkEnd);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Vignette
      const vignetteStrength = 0.28 + idleFade * 0.12;
      const rad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) / 1.3);
      rad.addColorStop(0, "transparent");
      rad.addColorStop(1, `rgba(10, 5, 2, ${vignetteStrength})`);
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, W, H);

      t += 0.016;
      const mouse = mouseRef.current;
      const speedFactor = 1 - (idleFade * 0.7);
      const brightnessFactor = 0.7 + (idleFade * 0.3);
      const logo = logoPosRef.current;

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      // === BACKGROUND STARS ===
      particles.forEach((p) => {
        p.x += p.vx * speedFactor;
        p.y += p.vy * speedFactor;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

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

        const a = (p.baseAlpha + Math.sin(t * 0.6 + p.twinkle) * 0.1) * brightnessFactor;
        ctx.globalAlpha = a;
        ctx.fillStyle = p.sparkle ? "#d9c97a" : "#c9a85a";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

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

      // === GOLD SWARM — premium particles around AR❀EM logo ===
      if (logo) {
        goldParticles.forEach((g, i) => {
          // Orbit animation around logo
          g.angle += g.speed * speedFactor;
          const orbitX = logo.x + Math.cos(g.angle) * g.radius;
          const orbitY = logo.y + Math.sin(g.angle) * (g.radius * 0.7);

          // Attraction to mouse when nearby logo
          const dxMouse = mouse.x - orbitX;
          const dyMouse = mouse.y - orbitY;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
          let tx = orbitX, ty = orbitY;
          if (distMouse < 120 && mouse.near) {
            const force = (120 - distMouse) / 120;
            tx += (dxMouse / distMouse) * 30 * force;
            ty += (dyMouse / distMouse) * 30 * force;
          }
          // Drift back to orbit point
          g.vx += (tx - g.x) * 0.02 * speedFactor;
          g.vy += (ty - g.y) * 0.02 * speedFactor;
          g.vx *= 0.96; g.vy *= 0.96;
          g.x += g.vx; g.y += g.vy;

          // Draw gold spark with glow
          const sparkle = Math.sin(t * 3 + g.pulse) > 0.3;
          const size = g.size * (1 + Math.sin(t * 2 + g.pulse) * 0.2);
          ctx.globalAlpha = brightnessFactor * (0.6 + Math.sin(t * 1.3 + g.pulse) * 0.4);
          if (sparkle) {
            // Draw sparkle star shape
            ctx.save();
            ctx.translate(g.x, g.y);
            ctx.scale(size / 2, size / 2);
            ctx.beginPath();
            for (let s = 0; s < 8; s++) {
              const a2 = (s * Math.PI) / 4;
              const r1 = s % 2 === 0 ? 1 : 0.5;
              ctx.lineTo(Math.cos(a2) * r1, Math.sin(a2) * r1);
            }
            ctx.closePath();
            ctx.fillStyle = "#fff5d4";
            ctx.fill();
            ctx.restore();
          } else {
            ctx.fillStyle = "#d9c97a";
            ctx.beginPath();
            ctx.arc(g.x, g.y, size, 0, Math.PI * 2);
            ctx.fill();
          }

          // Draw connecting lines between nearby gold particles
          if (i % 2 === 0) {
            goldParticles.forEach((g2, j) => {
              if (j <= i + 3 && j > i) {
                const dx = g.x - g2.x, dy = g.y - g2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 50) {
                  ctx.globalAlpha = 0.25 * brightnessFactor * (1 - dist / 50);
                  ctx.strokeStyle = "#d9c97a";
                  ctx.lineWidth = 0.5;
                  ctx.beginPath();
                  ctx.moveTo(g.x, g.y);
                  ctx.lineTo(g2.x, g2.y);
                  ctx.stroke();
                }
              }
            });
          }
        });

        // Halo glow beneath logo
        ctx.globalAlpha = 0.25 * brightnessFactor;
        ctx.fillStyle = "radial-gradient";
        const halo = ctx.createRadialGradient(logo.x, logo.y, 0, logo.x, logo.y, 90);
        halo.addColorStop(0, "rgba(217, 168, 74, 0.4)");
        halo.addColorStop(0.5, "rgba(217, 168, 74, 0.15)");
        halo.addColorStop(1, "transparent");
        ctx.fillStyle = halo;
        ctx.fillRect(logo.x - 90, logo.y - 90, 180, 180);
      }

      // Golden beam when cursor is within range
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
      canvas.width = Math.max(1, Math.round(rect.width * DPR));
      canvas.height = Math.max(1, Math.round(rect.height * DPR));
      // setTransform (not scale): re-asserted after the width reset, never stacks
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ({ W, H } = dims());
    };
    resize();
    window.addEventListener("resize", resize);

    animate();

    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [reduceMotion]);

  // Pause canvas paint when the hero scrolls out of view
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        visibleRef.current = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 },
    );
    io.observe(canvas);
    return () => io.disconnect();
  }, []);

  // Pointer + touch events on the whole hero section (not just the canvas,
  // which sits behind the content): mouse AND finger drags stir the swarm.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const target = canvas.parentElement ?? canvas;
    const opts = { passive: true };
    target.addEventListener("pointermove", handlePointerMove, opts);
    return () => target.removeEventListener("pointermove", handlePointerMove);
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

      {/* Central AR❀EM logo — animated gold foil + halo */}
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

      {/* Main content — left aligned, pushed down past logo on desktop */}
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
