const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const W = 1920, H = 820;

const palette = {
  deepBlack: '#050402',
  paper: '#f7f1e4', paperDeep: '#efe6d3', cream: '#e9dcc3', bone: '#dccaa6',
  sand: '#c9b27e', ink: '#1c1712', ink2: '#33291f', inkDeep: '#0d0a07',
  gold: '#b98a3e', goldSoft: '#d3ac5f', goldDark: '#7a5c1e',
  goldBright: '#e6c14b', goldDust: '#e8d09e',
  clay: '#a6502e', teal: '#59643f', white: '#fffdf8',
  starDust1: '#120e0a', starDust2: '#0a0704',
};

// Dark starry gradients for all 3 slides (very dark base)
const gradients = [
  [0, '#020100', 0.35, '#080603', 0.65, '#0f0b06', 0.85, '#1a140d', 1, '#050300'],
  [0, '#020100', 0.30, '#0a0804', 0.60, '#120e0a', 0.82, '#1e180e', 1, '#030200'],
  [0, '#020100', 0.40, '#0d0a05', 0.70, '#15110c', 0.88, '#221a10', 1, '#040300'],
];

const canvasScript = `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = ${W}, H = ${H};
const palette = ${JSON.stringify(palette)};
const gradients = ${JSON.stringify(gradients)};

function createStarDust() {
  const tex = document.createElement('canvas');
  tex.width = W; tex.height = H;
  const tctx = tex.getContext('2d');

  // Dense golden starfield — many tiny pinpricks + larger bokeh
  const imageData = tctx.createImageData(W, H);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random();
    if (noise > 0.975) {
      // Bright pinprick stars
      data[i] = 230 + Math.random() * 25;
      data[i+1] = 200 + Math.random() * 40;
      data[i+2] = 120 + Math.random() * 60;
      data[i+3] = 255;
    } else if (noise > 0.92) {
      // Dimmer stars
      data[i] = 211; data[i+1] = 172; data[i+2] = 95;
      data[i+3] = 180 + Math.random() * 60;
    } else if (noise > 0.86) {
      // Very dim stars
      data[i] = 211; data[i+1] = 172; data[i+2] = 95;
      data[i+3] = 60 + Math.random() * 60;
    } else if (noise > 0.75) {
      // Ultra-dim micro stars
      data[i] = 255; data[i+1] = 248; data[i+2] = 220;
      data[i+3] = 15 + Math.random() * 20;
    } else {
      data[i] = 0; data[i+1] = 0; data[i+2] = 0; data[i+3] = 3;
    }
  }
  tctx.putImageData(imageData, 0, 0);

  // Larger bokeh dots with glow
  tctx.shadowColor = 'rgba(211, 172, 95, 0.35)';
  tctx.shadowBlur = 1.5;
  for (let i = 0; i < 250; i++) {
    const sx = Math.random() * W;
    const sy = Math.random() * H;
    const r = 0.4 + Math.random() * 1.2;
    tctx.fillStyle = 'rgba(' + (211 + Math.random() * 30) + ',' + (172 + Math.random() * 40) + ',95, ' + (0.4 + Math.random() * 0.4) + ')';
    tctx.beginPath();
    tctx.arc(sx, sy, r, 0, Math.PI * 2);
    tctx.fill();
  }
  tctx.shadowBlur = 0;

  // Subtle paper texture grain
  tctx.globalAlpha = 0.04;
  tctx.fillStyle = '#33291f';
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const size = Math.random() * 1.5;
    tctx.fillRect(x, y, size, size);
  }
  tctx.globalAlpha = 1;

  return tex;
}

const starTex = createStarDust();

function drawStreaks() {
  // Diagonal magic dust streaks — mainly upper right
  ctx.save();
  ctx.lineCap = 'round';
  for (let s = 0; s < 4; s++) {
    const x1 = W * (0.65 + Math.random() * 0.25);
    const y1 = H * (0.05 + Math.random() * 0.2);
    const len = 180 + Math.random() * 200;
    const angle = -0.4 - Math.random() * 0.3;
    const x2 = x1 + Math.cos(angle) * len;
    const y2 = y1 + Math.sin(angle) * len;

    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, 'rgba(211, 172, 95, 0)');
    grad.addColorStop(0.5, 'rgba(211, 172, 95, 0.25)');
    grad.addColorStop(1, 'rgba(211, 172, 95, 0)');
    ctx.strokeStyle = 'rgba(230, 193, 75, 0.18)';
    ctx.lineWidth = 1.5 + Math.random() * 2;
    ctx.globalAlpha = 0.25 + Math.random() * 0.15;
    ctx.stroke();

    // Glow behind streak
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = 'rgba(211, 172, 95, 0.4)';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawGlitterCircle(x, y, r, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  // Metallic radial gradient: gold center, dark edges
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, '#fff9e6');
  grad.addColorStop(0.45, '#e6c14b');
  grad.addColorStop(0.7, '#b98a3e');
  grad.addColorStop(0.82, '#8c6c2e');
  grad.addColorStop(1, 'rgba(51, 41, 31, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // Inner highlight
  ctx.globalAlpha = opacity * 0.6;
  ctx.fillStyle = 'rgba(255, 248, 220, 0.7)';
  ctx.beginPath();
  ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Specular glitter specks
  ctx.globalAlpha = opacity * 0.5;
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.3;
    const dist = r * (0.3 + Math.random() * 0.4);
    const sx = x + Math.cos(angle) * dist;
    const sy = y + Math.sin(angle) * dist;
    ctx.fillStyle = 'rgba(255, 248, 220, 0.8)';
    ctx.beginPath();
    ctx.arc(sx, sy, 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawFoldedShape(x, y, w, h, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = 'rgba(211, 172, 95, 0.18)';

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w * 0.6, y);
  ctx.lineTo(x + w, y - h * 0.4);
  ctx.lineTo(x + w * 0.4, y - h * 0.4);
  ctx.closePath();
  ctx.fill();

  // Highlight
  ctx.fillStyle = 'rgba(255, 248, 220, 0.25)';
  ctx.globalAlpha = opacity * 0.7;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w * 0.6, y);
  ctx.lineTo(x + w * 0.65, y + 3);
  ctx.lineTo(x + 0.05, y + 3);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawTool(x, y, scale, type) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = palette.goldBright;
  ctx.fillStyle = 'transparent';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = palette.goldBright;
  ctx.shadowBlur = 14;
  ctx.globalAlpha = 0.85;
  if (type === 'scissors') {
    ctx.beginPath();
    ctx.moveTo(30, 40);
    ctx.bezierCurveTo(60, 30, 80, 45, 80, 70);
    ctx.bezierCurveTo(80, 95, 60, 110, 30, 100);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(50, 70, 20, 9, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = palette.goldDark;
    ctx.shadowBlur = 6;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(38, 70);
    ctx.lineTo(12, 70);
    ctx.stroke();
  } else if (type === 'spool') {
    ctx.beginPath();
    ctx.arc(0, 0, 38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 7;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-26, 0);
    ctx.lineTo(26, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -26);
    ctx.lineTo(0, 26);
    ctx.stroke();
  } else if (type === 'awl') {
    ctx.shadowBlur = 8;
    ctx.lineWidth = 7;
    ctx.fillRect(-4, -42, 8, 84);
    ctx.beginPath();
    ctx.arc(0, -47, 9, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawConstellation(x, y, size, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = palette.goldBright;
  ctx.shadowColor = palette.goldBright;
  ctx.shadowBlur = 4;
  ctx.lineWidth = 1.8;
  const points = [];
  for (let i = 0; i < 6; i++) {
    points.push({
      x: x + (Math.cos(i / 6 * Math.PI * 2) * size * (0.5 + Math.random() * 0.5)),
      y: y + (Math.sin(i / 6 * Math.PI * 2) * size * (0.5 + Math.random() * 0.5)),
    });
  }
  for (let i = 0; i < points.length; i++) {
    ctx.beginPath();
    ctx.arc(points[i].x, points[i].y, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = palette.goldBright;
    ctx.fill();
    const next = points[(i + 1) % points.length];
    ctx.beginPath();
    ctx.moveTo(points[i].x, points[i].y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawComet(x, y, angle, opacity) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = opacity;
  ctx.shadowColor = palette.goldBright;
  ctx.shadowBlur = 10;
  const grad = ctx.createLinearGradient(0, 0, 140, 0);
  grad.addColorStop(0, palette.white);
  grad.addColorStop(0.2, palette.goldBright);
  grad.addColorStop(0.5, palette.goldBright);
  grad.addColorStop(1, 'rgba(211, 172, 95, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, -3, 140, 6);
  ctx.globalAlpha = opacity * 0.7;
  ctx.fillStyle = palette.teal;
  ctx.beginPath();
  ctx.arc(130, 0, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawVignette() {
  const vgrad = ctx.createRadialGradient(W/2, H/2, W*0.15, W/2, H/2, W*2);
  vgrad.addColorStop(0, 'rgba(255,255,255,0.01)');
  vgrad.addColorStop(0.5, 'rgba(255,255,255,0.003)');
  vgrad.addColorStop(1, 'rgba(0,0,0,0.78)');
  ctx.fillStyle = vgrad;
  ctx.fillRect(0, 0, W, H);
}

function renderSlide(slideIdx) {
  ctx.clearRect(0, 0, W, H);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const grad = ctx.createLinearGradient(0, 0, W * 0.5, H);
  const g = gradients[slideIdx];
  for (let i = 0; i < g.length; i += 2) {
    grad.addColorStop(g[i], g[i+1]);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Starfield background
  ctx.globalAlpha = 1;
  ctx.drawImage(starTex, 0, 0, W, H);
  ctx.globalAlpha = 1;

  if (slideIdx === 0) {
    drawGlitterCircle(380, 280, 180, 0.32);
    drawFoldedShape(1500, 580, 320, 180, 0.24);
    drawConstellation(550, 180, 85, 0.45);
    drawConstellation(1350, 480, 70, 0.38);
    drawConstellation(1750, 260, 60, 0.3);
    drawComet(280, 660, -0.25, 0.45);
    drawComet(1820, 520, -0.32, 0.35);
    drawStreaks();
    drawTool(300, 740, 0.7, 'scissors');
    drawTool(1700, 680, 0.52, 'spool');
    drawTool(1450, 620, 0.6, 'awl');

  } else if (slideIdx === 1) {
    drawGlitterCircle(1550, 320, 210, 0.28);
    drawFoldedShape(200, 520, 380, 220, 0.26);
    drawConstellation(800, 140, 75, 0.4);
    drawConstellation(1200, 620, 95, 0.42);
    drawConstellation(1780, 400, 65, 0.32);
    drawComet(320, 400, -0.28, 0.5);
    drawComet(1880, 360, -0.35, 0.4);
    drawStreaks();
    drawTool(420, 760, 0.7, 'awl');
    drawTool(1500, 720, 0.6, 'spool');

  } else if (slideIdx === 2) {
    drawGlitterCircle(450, 480, 190, 0.3);
    drawFoldedShape(1580, 240, 340, 190, 0.27);
    drawConstellation(300, 200, 80, 0.38);
    drawConstellation(1600, 540, 90, 0.44);
    drawConstellation(1000, 100, 65, 0.28);
    drawComet(180, 600, -0.3, 0.45);
    drawComet(1850, 480, -0.22, 0.35);
    drawStreaks();
    drawTool(1400, 760, 0.65, 'scissors');
    drawTool(280, 360, 0.55, 'awl');
  }

  drawVignette();
}

try {
  renderSlide(0);
  const data1 = canvas.toDataURL('image/webp', 0.72).split(',')[1];
  renderSlide(1);
  const data2 = canvas.toDataURL('image/webp', 0.72).split(',')[1];
  renderSlide(2);
  const data3 = canvas.toDataURL('image/webp', 0.72).split(',')[1];
  window.__results = { data1, data2, data3 };
  window.__error = null;
} catch(e) {
  window.__error = e.message + ' at line ' + e.stack;
  window.__results = null;
}
`;

async function generate() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>body{margin:0;padding:0;overflow:hidden;}canvas{display:block;}</style></head>
<body><canvas id="canvas" width="${W}" height="${H}"></canvas>
<script>${canvasScript}</script>
</body></html>`;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.waitForFunction('window.__results !== undefined || window.__error !== undefined', { timeout: 15000 });

  const error = await page.evaluate(() => window.__error);
  if (error) {
    console.error('Canvas error:', error);
    await browser.close();
    return;
  }

  const results = await page.evaluate(() => window.__results);
  await browser.close();

  const imgDir = path.join(__dirname, '..', 'public', 'images');
  for (let i = 0; i < 3; i++) {
    const data = [results.data1, results.data2, results.data3][i];
    const outPath = path.join(imgDir, `hero-dedicado-${i + 1}.webp`);
    const buf = Buffer.from(data, 'base64');
    fs.writeFileSync(outPath, buf);
    console.log(`Saved: ${outPath} (${buf.length} bytes)`);
  }
  console.log('STARDUST HERO IMAGES GENERATED');
}

generate().catch(e => console.error('Outer error:', e.message));
