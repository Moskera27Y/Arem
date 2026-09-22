const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const W = 1920, H = 820;
const palette = {
  paper: '#f7f1e4', paperDeep: '#efe6d3', cream: '#e9dcc3', bone: '#dccaa6',
  sand: '#c9b27e', ink: '#1c1712', ink2: '#33291f', inkDeep: '#0d0a07',
  gold: '#b98a3e', goldSoft: '#d3ac5f', goldDark: '#7a5c1e',
  clay: '#a6502e', teal: '#59643f', white: '#fffdf8',
};

const gradients = [
  [0, '#0a0704', 0.3, '#1a130f', 0.55, '#3a2d20', 0.85, '#5a4a3a', 1, '#1c1712'],
  [0, '#0a0704', 0.4, '#2a1e17', 0.65, '#6a4a2e', 0.85, '#a6502e', 1, '#1a130f'],
  [0, '#0a0704', 0.35, '#1c1712', 0.6, '#3a2d20', 0.85, '#59643f', 1, '#0a0704'],
];

const canvasScript = `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = ${W}, H = ${H};
const palette = ${JSON.stringify(palette)};
const gradients = ${JSON.stringify(gradients)};

function createPaperTexture(w, h, grain, fiberCount) {
  const tex = document.createElement('canvas');
  tex.width = w; tex.height = h;
  const tctx = tex.getContext('2d');
  let imageData = tctx.createImageData(w, h);
  let data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * grain;
    data[i] = 255; data[i+1] = 253; data[i+2] = 248;
    data[i+3] = noise * 255 + 128;
  }
  tctx.putImageData(imageData, 0, 0);
  tctx.globalAlpha = 0.03;
  tctx.strokeStyle = '#1c1712';
  tctx.lineWidth = 0.8;
  for (let i = 0; i < fiberCount; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const len = 80 + Math.random() * 200;
    const angle = (Math.random() - 0.5) * 0.3;
    tctx.save();
    tctx.translate(x, y);
    tctx.rotate(angle);
    tctx.beginPath();
    tctx.moveTo(0, 0);
    tctx.lineTo(len, 0);
    tctx.stroke();
    tctx.restore();
  }
  tctx.globalAlpha = 1;
  return tex;
}

const paperTex = createPaperTexture(512, 256, 15, 80);

function drawVignette() {
  const grad = ctx.createRadialGradient(W/2, H/2, W*0.2, W/2, H/2, W*1.5);
  grad.addColorStop(0, 'rgba(255,255,255,0.02)');
  grad.addColorStop(0.4, 'rgba(255,255,255,0.01)');
  grad.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

function drawTool(x, y, scale, type) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = type === 'gold' ? palette.goldSoft : palette.ink2;
  ctx.fillStyle = 'transparent';
  ctx.lineWidth = 4;
  if (type === 'scissors') {
    ctx.beginPath();
    ctx.moveTo(30, 40);
    ctx.bezierCurveTo(60, 30, 80, 45, 80, 70);
    ctx.bezierCurveTo(80, 95, 60, 110, 30, 100);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(50, 70, 18, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = palette.sand;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(35, 70);
    ctx.lineTo(15, 70);
    ctx.stroke();
  } else if (type === 'spool') {
    ctx.beginPath();
    ctx.arc(0, 0, 35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(20, 0);
    ctx.stroke();
  } else if (type === 'awl') {
    ctx.fillRect(-3, -40, 6, 80);
    ctx.beginPath();
    ctx.arc(0, -45, 8, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTextilePattern(x, y, w, h, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 1;
  const size = 18;
  for (let i = 0; i <= w; i += size * 2) {
    for (let j = 0; j <= h; j += size * 2) {
      ctx.save();
      ctx.translate(x + i, y + j);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(size, 0);
      ctx.lineTo(size, size);
      ctx.lineTo(0, size);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawCeramicPattern(x, y, w, h, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = palette.ink2;
  for (let i = 0; i < 12; i++) {
    const px = x + Math.random() * w;
    const py = y + Math.random() * h;
    const r = Math.random() * 3 + 1;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function renderSlide(slideIdx) {
  ctx.clearRect(0, 0, W, H);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  const g = gradients[slideIdx];
  for (let i = 0; i < g.length; i += 2) {
    grad.addColorStop(g[i], g[i+1]);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.globalAlpha = 0.15;
  ctx.drawImage(paperTex, 0, 0, W, H);
  ctx.globalAlpha = 1;

  if (slideIdx === 0) {
    drawTextilePattern(150, 220, 480, 380, 0.12);
    drawCeramicPattern(1300, 300, 450, 350, 0.28);
    drawCeramicPattern(1400, 520, 380, 280, 0.22);
    drawTool(250, 650, 0.7, 'scissors');
    drawTool(1600, 220, 0.5, 'spool');
    drawTool(1700, 620, 0.8, 'awl');

    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = palette.sand;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 12; i++) {
      const y = 160 + i * 42;
      ctx.beginPath();
      ctx.moveTo(100, y);
      ctx.lineTo(1750, y + (Math.sin(i) * 3));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

  } else if (slideIdx === 1) {
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = palette.gold;
    ctx.transform(1, 0, 0.28, 1, -200, 0);
    ctx.fillRect(550, 120, 720, 580);
    ctx.restore();
    ctx.globalAlpha = 1;

    ctx.globalAlpha = 0.32;
    ctx.fillStyle = palette.goldSoft;
    ctx.beginPath(); ctx.arc(1550, 280, 38, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(1580, 290, 28, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(200, 480); ctx.lineTo(260, 470); ctx.lineTo(275, 640); ctx.lineTo(215, 655); ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.globalAlpha = 0.28;
    ctx.fillStyle = palette.ink2;
    ctx.beginPath();
    ctx.moveTo(250, 440); ctx.lineTo(310, 430); ctx.lineTo(325, 580); ctx.lineTo(265, 595); ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    drawTool(420, 680, 0.6, 'scissors');
    drawTool(1750, 650, 0.45, 'spool');

  } else if (slideIdx === 2) {
    ctx.globalAlpha = 0.025;
    ctx.strokeStyle = palette.sand;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 14; i++) {
      ctx.beginPath();
      ctx.moveTo(180 + i * 110, 200);
      ctx.lineTo(180 + i * 110, 740);
      ctx.stroke();
    }
    for (let i = 0; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo(180, 200 + i * 70);
      ctx.lineTo(1660, 200 + i * 70);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    ctx.globalAlpha = 0.3;
    ctx.fillStyle = palette.goldSoft;
    ctx.beginPath(); ctx.arc(450, 320, 58, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(490, 340, 42, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(470, 440, 32, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(1350, 500, 52, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(1320, 530, 38, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    ctx.globalAlpha = 0.12;
    ctx.fillStyle = palette.goldSoft;
    ctx.beginPath(); ctx.arc(1550, 120, 120, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    drawTool(300, 660, 0.55, 'scissors');
    drawTool(1720, 600, 0.42, 'spool');
  }

  const centerGrad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.8);
  centerGrad.addColorStop(0, 'rgba(255,255,255,0.015)');
  centerGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = centerGrad;
  ctx.fillRect(0, 0, W, H);

  drawVignette();
}

try {
  renderSlide(0);
  const data1 = canvas.toDataURL('image/webp', 0.95).split(',')[1];
  renderSlide(1);
  const data2 = canvas.toDataURL('image/webp', 0.95).split(',')[1];
  renderSlide(2);
  const data3 = canvas.toDataURL('image/webp', 0.95).split(',')[1];
  window.__results = { data1, data2, data3 };
  window.__error = null;
} catch(e) {
  window.__error = e.message;
  window.__results = null;
}
`;

async function generate() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Capture console logs and errors
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
  await page.waitForFunction('window.__results !== undefined || window.__error !== undefined', { timeout: 10000 });

  const error = await page.evaluate(() => window.__error);
  if (error) {
    console.error('Canvas error:', error);
    await browser.close();
    return;
  }

  const results = await page.evaluate(() => window.__results);
  await browser.close();

  const imgDir = path.join(__dirname, '..', 'public', 'images');
  const sizes = [];
  for (let i = 0; i < 3; i++) {
    const data = [results.data1, results.data2, results.data3][i];
    const outPath = path.join(imgDir, `hero-dedicado-${i + 1}.webp`);
    const buf = Buffer.from(data, 'base64');
    fs.writeFileSync(outPath, buf);
    sizes.push(buf.length);
    console.log(`Saved: ${outPath} (${buf.length} bytes)`);
  }
  console.log('All hero images generated!');
  console.log('Sizes: ' + sizes.map(s => Math.round(s/1024) + ' KB').join(', '));
}

generate().catch(e => console.error('Outer error:', e.message));
