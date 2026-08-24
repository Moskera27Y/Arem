// AREM WORLD — placeholder imagery generator.
// Produces a consistent set of warm, editorial SVG artworks used across the
// storefront until real photography is available. Run: node scripts/generate-placeholders.mjs
// Output: public/images/*.svg

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "images");
mkdirSync(root, { recursive: true });

/* ------------------------------------------------------------------ */
/* Palettes                                                            */
/* ------------------------------------------------------------------ */

const P = {
  paper:   { bg: ["#F8F2E4", "#EDE2C9"], ink: "#3A3128", accent: "#A6502E", soft: "#D8C4A0" },
  cream:   { bg: ["#F3EBD9", "#E5D7BB"], ink: "#42372A", accent: "#8A3F22", soft: "#CDB488" },
  clay:    { bg: ["#EBDAC4", "#D8BD9B"], ink: "#5C3A24", accent: "#8A3F22", soft: "#C19A6B" },
  sand:    { bg: ["#F1E7D3", "#E0D0B0"], ink: "#4A3C2A", accent: "#C09A5B", soft: "#B9A273" },
  olive:   { bg: ["#E8E5D6", "#D4D3BA"], ink: "#3E4531", accent: "#5A6442", soft: "#A9A879" },
  moss:    { bg: ["#E4E7DC", "#CCD3C0"], ink: "#38432F", accent: "#4F6140", soft: "#9FAB85" },
  caribe:  { bg: ["#E9EDEB", "#CBD8D2"], ink: "#27424A", accent: "#2E6E6E", soft: "#86A8A0" },
  pacific: { bg: ["#E7E9E4", "#C9CEC2"], ink: "#2C3B31", accent: "#3F5A46", soft: "#8FA08A" },
  guajira: { bg: ["#F2E7D4", "#E0CCAA"], ink: "#503A26", accent: "#B4552D", soft: "#C9A86A" },
  emerald: { bg: ["#E7EBE4", "#CBD5C4"], ink: "#2E4436", accent: "#2F6B4F", soft: "#8FB297" },
  wine:    { bg: ["#EFE4D8", "#DCC8B2"], ink: "#4A2A28", accent: "#7A3B34", soft: "#C09A8B" },
  cocoa:   { bg: ["#ECE2D0", "#D9C6A8"], ink: "#4A3222", accent: "#6E4A2E", soft: "#B2906B" },
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const esc = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function svg(w, h, title, body, { grain = 0.07 } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">
<defs>
<filter id="g" x="0" y="0" width="100%" height="100%">
<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.30 0 0 0 0 0.28 0 0 0 0 0.24 0 0 0 ${grain} 0"/>
</filter>
</defs>
${body}
<rect width="${w}" height="${h}" filter="url(#g)" opacity="0.9"/>
</svg>`;
}

const grad = (id, c1, c2, x1 = 0, y1 = 0, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
<stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
</linearGradient>`;

const vignette = (w, h) =>
  `<radialGradient id="v" cx="0.5" cy="0.42" r="0.85">
<stop offset="0.55" stop-color="#000" stop-opacity="0"/>
<stop offset="1" stop-color="#000" stop-opacity="0.16"/>
</radialGradient>
<rect width="${w}" height="${h}" fill="url(#v)"/>`;

/* ------------------------------------------------------------------ */
/* Motifs (drawn in a local coordinate space, params: p, cx, cy, s)   */
/* ------------------------------------------------------------------ */

function mountains(p, cx, cy, s, w, h) {
  const c1 = p.soft, c2 = p.accent;
  return `
<path d="M0 ${h} L0 ${cy + 14 * s} L${cx - 34 * s} ${cy - 8 * s} L${cx + 6 * s} ${cy + 16 * s} L${cx + 26 * s} ${cy + 2 * s} L${w} ${cy + 22 * s} L${w} ${h} Z" fill="${c1}" opacity="0.55"/>
<path d="M0 ${h} L0 ${cy + 26 * s} L${cx - 18 * s} ${cy + 8 * s} L${cx + 14 * s} ${cy + 26 * s} L${cx + 40 * s} ${cy + 12 * s} L${w} ${cy + 30 * s} L${w} ${h} Z" fill="${c2}" opacity="0.8"/>
<circle cx="${cx - 40 * s}" cy="${cy - 26 * s}" r="${9 * s}" fill="${p.accent}" opacity="0.85"/>`;
}

function beans(p, cx, cy, s) {
  let out = "";
  const spots = [[-1, 0.4, 1], [-0.15, -0.7, 0.85], [1.15, -0.25, 0.75], [0.35, 0.9, 0.65], [-0.9, -0.55, 0.6], [0.95, 0.85, 0.5], [-1.2, 0.1, 0.45], [0.05, 0.2, 0.9]];
  for (const [dx, dy, r] of spots) {
    const x = cx + dx * 34 * s, y = cy + dy * 34 * s, rr = r * 17 * s;
    out += `<ellipse cx="${x}" cy="${y}" rx="${rr}" ry="${rr * 0.72}" transform="rotate(${(dx * 37 + dy * 22).toFixed(1)} ${x} ${y})" fill="${p.ink}" opacity="0.82"/>`;
    out += `<path d="M${x - rr * 0.55} ${y} Q${x} ${y - rr * 0.4} ${x + rr * 0.55} ${y}" stroke="${p.bg[1]}" stroke-width="${rr * 0.16}" fill="none" opacity="0.9"/>`;
  }
  return out;
}

function weave(p, cx, cy, s, w, h) {
  let out = `<rect x="${cx - 46 * s}" y="${cy - 52 * s}" width="${92 * s}" height="${104 * s}" rx="${4 * s}" fill="${p.ink}" opacity="0.9"/>`;
  const colors = [p.bg[1], p.accent, p.soft, p.bg[0], p.accent, p.soft, p.bg[1]];
  colors.forEach((c, i) => {
    const y = cy - 46 * s + i * 15.6 * s;
    out += `<rect x="${cx - 44 * s}" y="${y}" width="${88 * s}" height="${9 * s}" fill="${c}"/>`;
    out += `<path d="M${cx - 44 * s} ${y + 2.4 * s} h${88 * s} M${cx - 44 * s} ${y + 6.4 * s} h${88 * s}" stroke="${p.ink}" stroke-width="${1.1 * s}" stroke-dasharray="${2.2 * s} ${3.4 * s}" opacity="0.5"/>`;
  });
  out += `<rect x="${cx - 46 * s}" y="${cy - 52 * s}" width="${92 * s}" height="${104 * s}" rx="${4 * s}" fill="none" stroke="${p.ink}" stroke-width="${1.5 * s}"/>`;
  return out;
}

function pot(p, cx, cy, s) {
  const w = 30 * s, neck = 16 * s, h = 66 * s;
  return `
<ellipse cx="${cx}" cy="${cy + h * 0.56}" rx="${w * 1.15}" ry="${9 * s}" fill="${p.ink}" opacity="0.18"/>
<path d="M${cx - neck} ${cy - h * 0.42} L${cx - neck + 3 * s} ${cy - h * 0.42 - 8 * s} H${cx + neck - 3 * s} L${cx + neck} ${cy - h * 0.42} C${cx + w * 1.1} ${cy - 4 * s} ${cx + w} ${cy + h * 0.3} ${cx + w * 0.62} ${cy + h * 0.56} C${cx + w * 0.3} ${cy + h * 0.74} ${cx - w * 0.3} ${cy + h * 0.74} ${cx - w * 0.62} ${cy + h * 0.56} C${cx - w} ${cy + h * 0.3} ${cx - w * 1.1} ${cy - 4 * s} Z" fill="${p.accent}"/>
<path d="M${cx - neck + 3 * s} ${cy - h * 0.42 - 8 * s} C${cx - 6 * s} ${cy - h * 0.62} ${cx + 6 * s} ${cy - h * 0.62} ${cx + neck - 3 * s} ${cy - h * 0.42 - 8 * s}" fill="${p.ink}" opacity="0.85"/>
<path d="M${cx - w * 0.55} ${cy + h * 0.18} C${cx - w * 0.2} ${cy + h * 0.12} ${cx + w * 0.2} ${cy + h * 0.12} ${cx + w * 0.55} ${cy + h * 0.18}" stroke="${p.bg[0]}" stroke-width="${2.4 * s}" fill="none" opacity="0.85"/>
<path d="M${cx - w * 0.62} ${cy + h * 0.38} C${cx - w * 0.2} ${cy + h * 0.3} ${cx + w * 0.2} ${cy + h * 0.3} ${cx + w * 0.62} ${cy + h * 0.38}" stroke="${p.bg[0]}" stroke-width="${2 * s}" fill="none" opacity="0.6"/>
<path d="M${cx - w * 0.2} ${cy - h * 0.28} C${cx - w * 0.1} ${cy - h * 0.24} ${cx + w * 0.1} ${cy - h * 0.24} ${cx + w * 0.2} ${cy - h * 0.28}" stroke="${p.bg[0]}" stroke-width="${1.6 * s}" fill="none" opacity="0.5"/>`;
}

function mochila(p, cx, cy, s) {
  const w = 44 * s, h = 52 * s;
  return `
<path d="M${cx - w} ${cy - h * 0.5} C${cx - w * 1.2} ${cy + h * 0.1} ${cx - w * 1.02} ${cy + h * 0.42} ${cx} ${cy + h * 0.5} C${cx + w * 1.02} ${cy + h * 0.42} ${cx + w * 1.2} ${cy + h * 0.1} ${cx + w} ${cy - h * 0.5} L${cx + w * 0.62} ${cy - h * 0.66} L${cx - w * 0.62} ${cy - h * 0.66} Z" fill="${p.bg[1]}" stroke="${p.ink}" stroke-width="${2 * s}"/>
<path d="M${cx - w * 0.62} ${cy - h * 0.66} C${cx - w * 0.35} ${cy - h * 0.88} ${cx + w * 0.35} ${cy - h * 0.88} ${cx + w * 0.62} ${cy - h * 0.66}" fill="none" stroke="${p.ink}" stroke-width="${3 * s}"/>
<path d="M${cx - w * 0.55} ${cy - h * 0.2} L${cx + w * 0.55} ${cy - h * 0.2}" stroke="${p.ink}" stroke-width="${3.4 * s}"/>
<path d="M${cx - w * 0.55} ${cy - h * 0.2} L${cx - w * 0.35} ${cy + h * 0.08} L${cx + w * 0.35} ${cy + h * 0.08} L${cx + w * 0.55} ${cy - h * 0.2} Z" fill="none" stroke="${p.ink}" stroke-width="${2 * s}"/>
${[0.62, 0.45, 0.28, 0.1].map((t, i) => `<path d="M${cx - w * 0.98 + w * t} ${cy - h * 0.46 + i * 2} l${7 * s} ${14 * s} l${-7 * s} ${14 * s}" stroke="${p.accent}" stroke-width="${3 * s}" fill="none" opacity="${0.9 - i * 0.12}"/>`).join("")}
<path d="M${cx - w * 0.98 + w * 0.62} ${cy - h * 0.46 + 2} q${5 * s} ${-16 * s} ${10 * s} ${-2 * s} q${4 * s} ${8 * s} ${0} ${10 * s}" stroke="${p.accent}" stroke-width="${3 * s}" fill="none"/>`;
}

function hammock(p, cx, cy, s) {
  return `
<path d="M${cx - 52 * s} ${cy - 14 * s} Q${cx - 26 * s} ${cy - 40 * s} ${cx} ${cy - 14 * s} Q${cx + 26 * s} ${cy + 12 * s} ${cx + 52 * s} ${cy - 14 * s}" fill="${p.accent}" opacity="0.9"/>
<path d="M${cx - 52 * s} ${cy - 14 * s} Q${cx - 26 * s} ${cy + 2 * s} ${cx} ${cy + 28 * s} Q${cx + 26 * s} ${cy + 2 * s} ${cx + 52 * s} ${cy - 14 * s}" fill="${p.ink}" opacity="0.82"/>
${[0, 1, 2, 3, 4].map((i) => `<path d="M${cx - 44 * s + i * 22 * s} ${cy - 22 * s - i * 5 * s} q${3 * s} ${10 * s} ${-1 * s} ${12 * s}" stroke="${p.soft}" stroke-width="${2 * s}" fill="none"/>`).join("")}
<path d="M${cx - 52 * s} ${cy - 14 * s} l${-10 * s} ${-26 * s} M${cx + 52 * s} ${cy - 14 * s} l${10 * s} ${-26 * s}" stroke="${p.ink}" stroke-width="${4 * s}" stroke-linecap="round"/>`;
}

function emerald(p, cx, cy, s) {
  const pts = (r, k) => Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2 + (k || 0);
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return `
<polygon points="${pts(30 * s)}" fill="${p.accent}"/>
<polygon points="${pts(18 * s, 0)}" fill="${p.bg[0]}" opacity="0.85"/>
<polygon points="${pts(9 * s, 0)}" fill="${p.ink}" opacity="0.7"/>
<path d="M${cx - 30 * s} ${cy} L${cx - 30 * s} ${cy - 12 * s} L${cx - 22 * s} ${cy - 14 * s}" stroke="${p.bg[0]}" stroke-width="${2 * s}" fill="none"/>`;
}

function flowers(p, cx, cy, s) {
  let out = "";
  const centers = [[0, 0, 1], [-1.3, -0.9, 0.72], [1.25, -1.1, 0.8], [1.15, 1.05, 0.6], [-1.05, 1.15, 0.66]];
  for (const [dx, dy, k] of centers) {
    const x = cx + dx * 26 * s, y = cy + dy * 26 * s, r = 15 * s * k;
    out += `<circle cx="${x}" cy="${y}" r="${r}" fill="${p.bg[0]}"/>`;
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      out += `<ellipse cx="${x + r * 0.55 * Math.cos(a)}" cy="${y + r * 0.55 * Math.sin(a)}" rx="${r * 0.42}" ry="${r * 0.24}" transform="rotate(${(a * 180 / Math.PI).toFixed(1)} ${x + r * 0.55 * Math.cos(a)} ${y + r * 0.55 * Math.sin(a)})" fill="${p.accent}" opacity="0.85"/>`;
    }
    out += `<circle cx="${x}" cy="${y}" r="${r * 0.3}" fill="${p.ink}" opacity="0.85"/>`;
  }
  return out;
}

function basket(p, cx, cy, s) {
  let out = "";
  for (let i = -4; i <= 4; i++) {
    out += `<path d="M${cx - 40 * s} ${cy + i * 9 * s} Q${cx} ${cy + (i - 2.4) * 9 * s} ${cx + 40 * s} ${cy + i * 9 * s}" stroke="${p.ink}" stroke-width="${2.6 * s}" fill="none"/>`;
  }
  for (let i = -3; i <= 3; i++) {
    out += `<path d="M${cx + i * 13 * s} ${cy - 34 * s} Q${cx + (i + 1.4) * 13 * s} ${cy} ${cx + i * 13 * s} ${cy + 34 * s}" stroke="${p.ink}" stroke-width="${2.6 * s}" fill="none"/>`;
  }
  out += `<path d="M${cx - 22 * s} ${cy - 34 * s} Q${cx} ${cy - 46 * s} ${cx + 22 * s} ${cy - 34 * s}" stroke="${p.ink}" stroke-width="${3 * s}" fill="none"/>`;
  return out;
}

function ruana(p, cx, cy, s) {
  return `
<rect x="${cx - 40 * s}" y="${cy - 34 * s}" width="${80 * s}" height="${62 * s}" rx="${3 * s}" fill="${p.accent}" opacity="0.9"/>
<rect x="${cx - 40 * s}" y="${cy - 34 * s}" width="${24 * s}" height="${62 * s}" fill="${p.ink}" opacity="0.55"/>
<rect x="${cx + 16 * s}" y="${cy - 34 * s}" width="${24 * s}" height="${62 * s}" fill="${p.ink}" opacity="0.55"/>
${[-30, -18, -6, 6, 18, 30].map((dx) => `<path d="M${cx + dx * s} ${cy + 28 * s} q${2 * s} ${7 * s} ${0} ${12 * s}" stroke="${p.ink}" stroke-width="${2 * s}" fill="none"/>`).join("")}
<path d="M${cx - 40 * s} ${cy - 34 * s} h${80 * s}" stroke="${p.bg[0]}" stroke-width="${3 * s}" opacity="0.8"/>`;
}

function leather(p, cx, cy, s) {
  return `
<path d="M${cx - 46 * s} ${cy + 6 * s} q${10 * s} ${-10 * s} ${30 * s} ${-10 * s} q${20 * s} ${0} ${30 * s} ${10 * s} q${12 * s} ${12 * s} ${4 * s} ${20 * s} q${-8 * s} ${8 * s} ${-20 * s} ${6 * s} q${-22 * s} ${-4 * s} ${-36 * s} ${-2 * s} q${-14 * s} ${2 * s} ${-22 * s} ${-8 * s} q${-6 * s} ${-8 * s} ${14 * s} ${-16 * s} Z" fill="${p.accent}"/>
<rect x="${cx - 12 * s}" y="${cy - 20 * s}" width="${24 * s}" height="${26 * s}" rx="${4 * s}" fill="${p.bg[0]}" stroke="${p.ink}" stroke-width="${2 * s}"/>
<rect x="${cx - 5 * s}" y="${cy - 14 * s}" width="${10 * s}" height="${14 * s}" rx="${2 * s}" fill="${p.ink}"/>`;
}

function cacao(p, cx, cy, s) {
  return `
<ellipse cx="${cx}" cy="${cy}" rx="${22 * s}" ry="${36 * s}" fill="${p.accent}"/>
${[-10, 0, 10].map((dx) => `<path d="M${cx + dx * s} ${cy - 32 * s} q${-4 * s} ${32 * s} ${0} ${64 * s}" stroke="${p.bg[0]}" stroke-width="${2 * s}" fill="none" opacity="0.7"/>`).join("")}
${[[-1.3, -0.9, 0.6], [-0.2, -1.15, 0.75], [1.25, -0.5, 0.65], [0.8, 0.9, 0.55], [-0.85, 0.55, 0.5]].map(([dx, dy, k], i) => `<ellipse cx="${cx + dx * 26 * s}" cy="${cy + dy * 26 * s}" rx="${8 * s * k}" ry="${5.6 * s * k}" transform="rotate(${i * 24} ${cx + dx * 26 * s} ${cy + dy * 26 * s})" fill="${p.ink}" opacity="0.8"/>`).join("")}`;
}

function sun(p, cx, cy, s) {
  let out = `<circle cx="${cx}" cy="${cy}" r="${26 * s}" fill="${p.accent}" opacity="0.9"/>`;
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI / 6) * i;
    out += `<line x1="${cx + 31 * s * Math.cos(a)}" y1="${cy + 31 * s * Math.sin(a)}" x2="${cx + 40 * s * Math.cos(a)}" y2="${cy + 40 * s * Math.sin(a)}" stroke="${p.accent}" stroke-width="${2.4 * s}" stroke-linecap="round" opacity="0.85"/>`;
  }
  return out;
}

function wave(p, cx, cy, s, w) {
  let out = "";
  [0, 1, 2].forEach((i) => {
    const y0 = cy + (i - 1) * 16 * s;
    out += `<path d="M0 ${y0} Q${w * 0.25} ${y0 + 26 * s} ${w * 0.5} ${y0} T${w} ${y0}" stroke="${i === 1 ? p.accent : p.ink}" stroke-width="${3.4 * s}" fill="none" opacity="${i === 1 ? 0.9 : 0.45}"/>`;
  });
  return out;
}

function dots(p, cx, cy, s) {
  let out = "";
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      out += `<circle cx="${cx - 40 * s + i * 20 * s}" cy="${cy - 40 * s + j * 20 * s}" r="${2.6 * s}" fill="${(i + j) % 2 === 0 ? p.accent : p.ink}" opacity="0.55"/>`;
    }
  }
  return out;
}

function loom(p, cx, cy, s, w, h) {
  let out = "";
  for (let i = -5; i <= 5; i++) {
    const x = cx + i * 9 * s;
    out += `<line x1="${x}" y1="${cy - 48 * s}" x2="${x}" y2="${cy + 48 * s}" stroke="${p.ink}" stroke-width="${1.6 * s}" opacity="0.7"/>`;
  }
  for (let i = -5; i <= 5; i++) {
    const y = cy + i * 9 * s;
    out += `<line x1="${cx - 48 * s}" y1="${y}" x2="${cx + 48 * s}" y2="${y}" stroke="${(i + 5) % 3 === 0 ? p.accent : p.soft}" stroke-width="${2.4 * s}" opacity="0.85"/>`;
  }
  return out;
}

function hands(p, cx, cy, s) {
  return `
<circle cx="${cx - 18 * s}" cy="${cy - 10 * s}" r="${16 * s}" fill="${p.bg[1]}" stroke="${p.ink}" stroke-width="${2 * s}"/>
<circle cx="${cx + 18 * s}" cy="${cy - 10 * s}" r="${16 * s}" fill="${p.bg[1]}" stroke="${p.ink}" stroke-width="${2 * s}"/>
<path d="M${cx - 20 * s} ${cy + 6 * s} q${2 * s} ${14 * s} ${0} ${22 * s} M${cx - 10 * s} ${cy + 8 * s} q${2 * s} ${12 * s} ${0} ${20 * s} M${cx + 10 * s} ${cy + 8 * s} q${-2 * s} ${12 * s} ${0} ${20 * s} M${cx + 20 * s} ${cy + 6 * s} q${-2 * s} ${14 * s} ${0} ${22 * s}" stroke="${p.ink}" stroke-width="${2.6 * s}" fill="none" stroke-linecap="round"/>
<rect x="${cx - 26 * s}" y="${cy + 24 * s}" width="${52 * s}" height="${10 * s}" rx="${5 * s}" fill="${p.accent}"/>`;
}

function steam(p, cx, cy, s) {
  let out = "";
  [-1, 1].forEach((d) => {
    out += `<path d="M${cx + d * 12 * s} ${cy} q${d * 6 * s} ${-10 * s} ${0} ${-18 * s} q${-d * 6 * s} ${-10 * s} ${0} ${-20 * s}" stroke="${p.ink}" stroke-width="${3 * s}" fill="none" opacity="0.6" stroke-linecap="round"/>`;
  });
  return out;
}

/* ------------------------------------------------------------------ */
/* Scene builders                                                      */
/* ------------------------------------------------------------------ */

function scene(motif, palette, w, h, opts = {}) {
  const p = P[palette];
  const cx = w / 2, cy = h / 2;
  const s = Math.min(w, h) / 120;
  const motifS = opts.scale || 1;
  const body = `
<rect width="${w}" height="${h}" fill="url(#bg)"/>
${opts.extra ? opts.extra(p, cx, cy, s, w, h) : ""}
<g transform="translate(0 ${(opts.shift || 0) * s}) scale(${motifS})" transform-origin="${cx} ${cy}">
${motif(p, cx, cy, s, w, h)}
</g>
${vignette(w, h)}`;
  const defs = grad("bg", p.bg[0], p.bg[1]);
  return svg(w, h, opts.title || opts.name || "AREM WORLD", defs + body, opts);
}

/* ------------------------------------------------------------------ */
/* File list                                                           */
/* ------------------------------------------------------------------ */

const files = [];
const add = (name, palette, w, h, motif, opts = {}) => {
  files.push([name, scene(motif, palette, w, h, { name, ...opts })]);
};

// Hero / wide editorial scenes
add("hero-main", "paper", 1920, 1080, mountains, { scale: 1.25, shift: -6, title: "Andean highlands at dawn" });
add("hero-alt", "guajira", 1920, 1080, sun, { scale: 1.1, title: "Guajira desert sun" });
add("hero-craft", "clay", 1920, 1080, hands, { scale: 1.15, title: "Artisan hands at work" });
add("about-1", "olive", 1600, 1100, loom, { title: "Loom in an artisan workshop" });
add("brand-1", "cream", 1600, 900, mountains, { title: "Mountains of the coffee axis" });

// Categories
add("cat-coffee", "cocoa", 1200, 900, beans, { title: "Coffee beans" });
add("cat-textiles", "clay", 1200, 900, weave, { title: "Handwoven textiles" });
add("cat-ceramics", "sand", 1200, 900, pot, { title: "Ceramic pottery" });
add("cat-bags", "guajira", 1200, 900, mochila, { title: "Wayuu mochila bag" });
add("cat-jewelry", "emerald", 1200, 900, emerald, { title: "Emerald jewellery" });
add("cat-home", "olive", 1200, 900, basket, { title: "Handwoven baskets" });

// Regions
add("r-andes", "olive", 1600, 1100, mountains, { title: "Andes & coffee axis" });
add("r-caribe", "caribe", 1600, 1100, wave, { title: "Caribbean coast" });
add("r-pacifico", "pacific", 1600, 1100, mountains, { title: "Pacific coast" });
add("r-guajira", "guajira", 1600, 1100, sun, { title: "La Guajira desert" });
add("r-bogota", "paper", 1600, 1100, loom, { title: "Bogota craft ateliers" });

// Stories
add("s-tejer", "guajira", 1400, 900, mochila, { title: "Weaving the desert" });
add("s-cafe", "cocoa", 1400, 900, steam, { title: "Coffee journey" });
add("s-barro", "clay", 1400, 900, pot, { title: "Clay of Raquira" });
add("s-esmeralda", "emerald", 1400, 900, emerald, { title: "Mountain emerald" });
add("s-hamaca", "caribe", 1400, 900, hammock, { title: "Caribbean hammock" });
add("s-guadua", "moss", 1400, 900, weave, { title: "Guadua & the coffee axis" });

// Products (2 artworks each)
const productShots = [
  ["p-mochila-katsu", "guajira", mochila],
  ["p-mochila-shiro", "sand", mochila],
  ["p-cafe-altura", "cocoa", beans],
  ["p-cafe-sierra", "olive", beans],
  ["p-vasija-raiz", "clay", pot],
  ["p-plato-luna", "sand", pot],
  ["p-ruana-paramo", "clay", ruana],
  ["p-camino-flores", "wine", flowers],
  ["p-bolso-monte", "cocoa", leather],
  ["p-cinturon-monte", "paper", leather],
  ["p-collar-andino", "emerald", emerald],
  ["p-aretes-tairona", "caribe", emerald],
  ["p-canasto-norte", "olive", basket],
  ["p-canasto-brisa", "moss", basket],
  ["p-hamaca-brisa", "caribe", hammock],
  ["p-hamaca-sol", "guajira", hammock],
  ["p-cacao-origen", "cocoa", cacao],
  ["p-cacao-puro", "sand", cacao],
  ["p-ruana-pajaro", "olive", ruana],
  ["p-bolso-verde", "moss", leather],
  ["p-vela-hierbas", "cream", flowers],
  ["p-poncho-nube", "paper", weave],
  ["p-bolso-carmesi", "wine", leather],
  ["p-collar-noche", "pacific", emerald],
];
productShots.forEach(([name, palette, motif], i) => {
  const variant = (i % 3) === 0 ? mountains : (i % 3) === 1 ? dots : weave;
  add(name + "-1", palette, 1200, 1500, variant, { title: name, scale: 1.1 });
  add(name + "-2", palette, 1200, 1500, motif, { title: name, scale: 1.05 });
});

// Instagram tiles (square)
const igTiles = [
  ["ig-1", "guajira", sun], ["ig-2", "clay", hands], ["ig-3", "olive", beans],
  ["ig-4", "emerald", emerald], ["ig-5", "caribe", wave], ["ig-6", "cocoa", cacao],
];
igTiles.forEach(([name, palette, motif]) => add(name, palette, 800, 800, motif, { title: "@arem.world" }));

// Artisans
add("a-amalia", "guajira", 1200, 1500, mochila, { title: "Amalia Rojas" });
add("a-miguel", "cocoa", 1200, 1500, steam, { title: "Miguel Cardenas" });
add("a-lucia", "clay", 1200, 1500, pot, { title: "Lucia Vasquez" });
add("a-esteban", "paper", 1200, 1500, leather, { title: "Esteban Morales" });
add("a-yamile", "emerald", 1200, 1500, emerald, { title: "Yamile Cuesta" });

/* ------------------------------------------------------------------ */
/* Write                                                               */
/* ------------------------------------------------------------------ */

for (const [name, content] of files) {
  writeFileSync(join(root, `${name}.svg`), content, "utf8");
}
console.log(`Generated ${files.length} placeholder images → public/images/`);
