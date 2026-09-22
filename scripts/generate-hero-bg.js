const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const W = 1440, H = 600;

const palette = {
  bg: '#0a0704',
  bgDeep: '#050402',
  gold: '#c9a85a',
  goldSoft: '#e6c14b',
  goldBright: '#f2e0a6',
  goldDark: '#8c6c2e',
  goldWarm: '#b98a3e',
  teal: '#59643f',
  cream: '#f7f1e4',
  paper: '#f9f4e6',
  dust: '#1a1510',
};

const canvasScript = `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = ${W}, H = ${H};
const palette = ${JSON.stringify(palette)};

function createBackground() {
  const tex = document.createElement('canvas');
  tex.width = W; tex.height = H;
  const tctx = tex.getContext('2d');

  // 1. Base dark warm gradient
  const bgGrad = tctx.createLinearGradient(0, 0, W * 0.5, H);
  bgGrad.addColorStop(0, '#020100');
  bgGrad.addColorStop(0.35, '#060402');
  bgGrad.addColorStop(0.65, '#0c0a06');
  bgGrad.addColorStop(0.85, '#120e0a');
  bgGrad.addColorStop(1, '#0a0704');
  tctx.fillStyle = bgGrad;
  tctx.fillRect(0, 0, W, H);

  // 2. Paper texture grain — subtle
  tctx.globalAlpha = 0.015;
  tctx.fillStyle = '#dccaa6';
  for (let i = 0; i < 1400; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const size = Math.random() * 0.7;
    tctx.fillRect(x, y, size, size);
  }
  tctx.globalAlpha = 0.02;
  tctx.fillStyle = '#33291f';
  for (let i = 0; i < 1800; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const size = Math.random() * 0.6;
    tctx.fillRect(x, y, size, size);
  }
  tctx.globalAlpha = 1;

  // 3. Dense golden star field — sharp pinpricks + bokeh
  const imageData = tctx.createImageData(W, H);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random();
    if (noise > 0.975) {
      // Bright sharp stars
      data[i] = 255; data[i+1] = 245; data[i+2] = 220;
      data[i+3] = 255;
    } else if (noise > 0.93) {
      // Medium stars
      data[i] = 211; data[i+1] = 172; data[i+2] = 95;
      data[i+3] = 170 + Math.random() * 70;
    } else if (noise > 0.89) {
      // Dim stars
      data[i] = 211; data[i+1] = 172; data[i+2] = 95;
      data[i+3] = 40 + Math.random() * 60;
    } else if (noise > 0.83) {
      // Very dim
      data[i] = 255; data[i+1] = 245; data[i+2] = 220;
      data[i+3] = 15 + Math.random() * 25;
    } else {
      data[i] = 0; data[i+1] = 0; data[i+2] = 0; data[i+3] = 3;
    }
  }
  tctx.putImageData(imageData, 0, 0);

  // 4. Bokeh glow dots — soft out-of-focus circles
  tctx.shadowColor = 'rgba(211, 172, 95, 0.5)';
  tctx.shadowBlur = 2;
  for (let i = 0; i < 120; i++) {
    const bx = Math.random() * W;
    const by = Math.random() * H;
    const r = 0.5 + Math.random() * 1.8;
    const glow = Math.random();
    tctx.fillStyle = glow > 0.5
      ? 'rgba(211, 172, 95, ' + (0.3 + Math.random() * 0.2) + ')'
      : 'rgba(255, 245, 220, ' + (0.2 + Math.random() * 0.2) + ')';
    tctx.beginPath();
    tctx.arc(bx, by, r, 0, Math.PI * 2);
    tctx.fill();
  }
  tctx.shadowBlur = 0;

  // 5. Magic dust streaks — upper right diagonal
  tctx.save();
  tctx.lineCap = 'round';
  for (let s = 0; s < 8; s++) {
    const x1 = W * (0.7 + Math.random() * 0.18);
    const y1 = H * (0.08 + Math.random() * 0.12);
    const len = 140 + Math.random() * 180;
    const angle = -0.45 - Math.random() * 0.25;
    const x2 = x1 + Math.cos(angle) * len;
    const y2 = y1 + Math.sin(angle) * len;
    const grad = tctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, 'rgba(255, 245, 220, 0)');
    grad.addColorStop(0.5, 'rgba(255, 245, 220, 0.22)');
    grad.addColorStop(1, 'rgba(211, 172, 95, 0)');
    tctx.strokeStyle = grad;
    tctx.lineWidth = 1 + Math.random() * 2;
    tctx.globalAlpha = 0.2 + Math.random() * 0.15;
    tctx.stroke();
    tctx.globalAlpha = 1;
  }
  tctx.restore();

  // 6. Bright star flares with diffraction spikes (top center)
  const flares = [
    { x: 850, y: 160, r: 60 },
    { x: 420, y: 220, r: 35 },
    { x: 1480, y: 190, r: 42 },
  ];
  for (const f of flares) {
    const grad = tctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
    grad.addColorStop(0, 'rgba(255, 245, 220, 0.9)');
    grad.addColorStop(0.4, 'rgba(255, 245, 220, 0.3)');
    grad.addColorStop(1, 'rgba(211, 172, 95, 0)');
    tctx.fillStyle = grad;
    tctx.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
    // Cross spikes
    tctx.strokeStyle = 'rgba(211, 172, 95, 0.25)';
    tctx.lineWidth = 1.5;
    tctx.beginPath();
    tctx.moveTo(f.x - f.r * 1.5, f.y);
    tctx.lineTo(f.x + f.r * 1.5, f.y);
    tctx.moveTo(f.x, f.y - f.r * 1.5);
    tctx.lineTo(f.x, f.y + f.r * 1.5);
    tctx.stroke();
  }

  // 7. Left side fog/smoke texture (dark smoke overlay)
  const fogGrad = tctx.createRadialGradient(200, H * 0.55, 0, 200, H * 0.55, 520);
  fogGrad.addColorStop(0, 'rgba(10, 7, 4, 0.35)');
  fogGrad.addColorStop(0.4, 'rgba(10, 7, 4, 0.18)');
  fogGrad.addColorStop(1, 'rgba(10, 7, 4, 0)');
  tctx.fillStyle = fogGrad;
  tctx.fillRect(0, 0, W * 0.45, H);

  // 8. Large golden circle on the left (moon/planet)
  const circleGrad = tctx.createRadialGradient(160, 280, 0, 160, 280, 240);
  circleGrad.addColorStop(0, 'rgba(211, 172, 95, 0.12)');
  circleGrad.addColorStop(0.5, 'rgba(211, 172, 95, 0.06)');
  circleGrad.addColorStop(1, 'rgba(211, 172, 95, 0)');
  tctx.fillStyle = circleGrad;
  tctx.beginPath();
  tctx.arc(160, 280, 240, 0, Math.PI * 2);
  tctx.fill();
  // Inner highlight
  tctx.fillStyle = 'rgba(255, 245, 220, 0.08)';
  tctx.beginPath();
  tctx.arc(120, 240, 40, 0, Math.PI * 2);
  tctx.fill();

  // 9. Vertical golden bar on left
  tctx.fillStyle = 'rgba(211, 172, 95, 0.07)';
  tctx.shadowColor = 'rgba(211, 172, 95, 0.15)';
  tctx.shadowBlur = 20;
  tctx.fillRect(280, 180, 8, 480);
  tctx.shadowBlur = 0;

  // 10. Right side folded geometric shape (gold foil envelope)
  tctx.save();
  tctx.translate(1680, 320);
  const shapeGrad = tctx.createLinearGradient(0, 0, 320, 0);
  shapeGrad.addColorStop(0, 'rgba(211, 172, 95, 0.18)');
  shapeGrad.addColorStop(0.5, 'rgba(166, 80, 46, 0.04)');
  shapeGrad.addColorStop(1, 'rgba(211, 172, 95, 0)');
  tctx.fillStyle = shapeGrad;
  tctx.shadowColor = 'rgba(211, 172, 95, 0.25)';
  tctx.shadowBlur = 15;
  tctx.beginPath();
  tctx.moveTo(0, 0);
  tctx.lineTo(260, 0);
  tctx.lineTo(320, -140);
  tctx.lineTo(60, -140);
  tctx.closePath();
  tctx.fill();
  // Highlight on fold
  tctx.fillStyle = 'rgba(255, 245, 220, 0.18)';
  tctx.shadowBlur = 0;
  tctx.beginPath();
  tctx.moveTo(0, 0);
  tctx.lineTo(260, 0);
  tctx.lineTo(268, 4);
  tctx.lineTo(8, 4);
  tctx.closePath();
  tctx.fill();
  tctx.restore();

  // 11. Vignette
  const vignette = tctx.createRadialGradient(W/2, H/2, W*0.15, W/2, H/2, W*2.2);
  vignette.addColorStop(0, 'rgba(255,255,255,0.01)');
  vignette.addColorStop(0.6, 'rgba(255,255,255,0.003)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
  tctx.fillStyle = vignette;
  tctx.fillRect(0, 0, W, H);

  return tex;
}

const bgTex = createBackground();

// Render the single persistent background
function render() {
  ctx.clearRect(0, 0, W, H);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.drawImage(bgTex, 0, 0, W, H);
  ctx.globalAlpha = 1;
}

try {
  render();
  const dataUrl = canvas.toDataURL('image/webp', 0.88).split(',')[1];
  window.__results = { dataUrl };
  window.__error = null;
} catch(e) {
  window.__error = e.message + ' | ' + e.stack;
  window.__results = null;
}
`;

async function generate() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

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
  const outPath = path.join(imgDir, 'hero-starry-bg.webp');
  const buf = Buffer.from(results.dataUrl, 'base64');
  fs.writeFileSync(outPath, buf);
  console.log('Saved: ' + outPath + ' (' + buf.length + ' bytes)');
  console.log('PERSISTENT STARRY BACKGROUND GENERATED');
}

generate().catch(e => console.error('Error:', e.message));
