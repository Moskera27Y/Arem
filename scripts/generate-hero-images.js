const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const W = 1920, H = 820;
const palette = {
  paper: '#f7f1e4', paperDeep: '#efe6d3', cream: '#e9dcc3', bone: '#dccaa6',
  sand: '#c9b27e', ink: '#1c1712', ink2: '#33291f', inkDeep: '#0d0a07',
  gold: '#b98a3e', goldSoft: '#d3ac5f', goldDark: '#7a5c1e',
  clay: '#a6502e', teal: '#59643f', white: '#fffdf8',
  spaceDark: '#0a0704', spaceMid: '#0d0a07', spaceLite: '#120e0a',
};

// Dark space gradients for all 3 slides
const gradients = [
  [0, '#050402', 0.22, '#0c0a06', 0.45, '#1a140d', 0.72, '#2a1d12', 0.88, '#120e0a', 1, '#050402'],
  [0, '#050402', 0.25, '#120e0a', 0.50, '#1a140d', 0.75, '#2a1d12', 0.92, '#0a0704', 1, '#050402'],
  [0, '#050402', 0.20, '#0d0a06', 0.42, '#15110c', 0.70, '#221a10', 0.90, '#1a140d', 1, '#050402'],
];

const canvasScript = `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = ${W}, H = ${H};
const palette = ${JSON.stringify(palette)};
const gradients = ${JSON.stringify(gradients)};

function createStarfield() {
  const tex = document.createElement('canvas');
  tex.width = W; tex.height = H;
  const tctx = tex.getContext('2d');
  const imageData = tctx.createImageData(W, H);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random();
    if (noise > 0.99) {
      // Bright star
      data[i] = 255; data[i+1] = 248; data[i+2] = 220;
      data[i+3] = 255;
    } else if (noise > 0.955) {
      // Dim star
      data[i] = 255; data[i+1] = 253; data[i+2] = 248;
      data[i+3] = 140 + Math.random() * 90;
    } else if (noise > 0.89) {
      // Very dim star
      data[i] = 255; data[i+1] = 253; data[i+2] = 248;
      data[i+3] = 55 + Math.random() * 75;
    } else {
      data[i] = 0; data[i+1] = 0; data[i+2] = 0; data[i+3] = 8;
    }
  }
  tctx.putImageData(imageData, 0, 0);

  // Sparkle clusters — groups of bright stars (reduced for file size)
  for (let c = 0; c < 14; c++) {
    const cx = Math.random() * W;
    const cy = Math.random() * H;
    const size = 70 + Math.random() * 100;
    for (let s = 0; s < 10; s++) {
      const angle = (s / 10) * Math.PI * 2;
      const dist = Math.random() * size;
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;
      if (x > 0 && x < W && y > 0 && y < H) {
        tctx.fillStyle = 'rgba(211, 172, 95, ' + (0.4 + Math.random() * 0.3) + ')';
        tctx.beginPath();
        tctx.arc(x, y, 0.5 + Math.random() * 1.2, 0, Math.PI * 2);
        tctx.fill();
      }
    }
  }

  // Nebula clouds — soft radial glows in teal/gold (reduced)
  for (let n = 0; n < 5; n++) {
    const nx = Math.random() * W;
    const ny = Math.random() * H * 0.8 + 40;
    const r = 100 + Math.random() * 150;
    const color = Math.random() > 0.5 ? palette.gold : palette.teal;
    const hex = color.replace('#', '');
    const rComp = parseInt(hex.substr(0, 2), 16);
    const gComp = parseInt(hex.substr(2, 2), 16);
    const bComp = parseInt(hex.substr(4, 2), 16);
    const grad2 = tctx.createRadialGradient(nx, ny, 0, nx, ny, r);
    grad2.addColorStop(0, 'rgba(' + rComp + ',' + gComp + ',' + bComp + ',0.12)');
    grad2.addColorStop(0.4, 'rgba(' + rComp + ',' + gComp + ',' + bComp + ',0.06)');
    grad2.addColorStop(1, 'rgba(' + rComp + ',' + gComp + ',' + bComp + ',0)');
    tctx.fillStyle = grad2;
    tctx.fillRect(nx - r, ny - r, r * 2, r * 2);
  }

  // Soft glow on bright stars — additional pass with shadow
  tctx.shadowColor = 'rgba(255, 248, 220, 0.4)';
  tctx.shadowBlur = 3;
  for (let i = 0; i < 80; i++) {
    const sx = Math.random() * W;
    const sy = Math.random() * H;
    tctx.fillStyle = 'rgba(255, 248, 220, 0.8)';
    tctx.beginPath();
    tctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
    tctx.fill();
  }
  tctx.shadowBlur = 0;

  return tex;
}

const starTex = createStarfield();

function drawConstellation(x, y, size, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = palette.goldSoft;
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
    ctx.fillStyle = palette.goldSoft;
    ctx.fill();
    ctx.shadowColor = palette.goldSoft;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(points[i].x, points[i].y, 2.2, 0, Math.PI * 2);
    ctx.fill();
    const next = points[(i + 1) % points.length];
    ctx.beginPath();
    ctx.moveTo(points[i].x, points[i].y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawComet(x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.shadowColor = palette.goldSoft;
  ctx.shadowBlur = 6;
  const grad = ctx.createLinearGradient(0, 0, 130, 0);
  grad.addColorStop(0, palette.white);
  grad.addColorStop(0.25, palette.goldSoft);
  grad.addColorStop(1, 'rgba(211, 172, 95, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, -3, 130, 6);
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = palette.teal;
  ctx.beginPath();
  ctx.arc(120, 0, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawTool(x, y, scale, type) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = type === 'gold' ? palette.goldSoft : palette.goldSoft;
  ctx.fillStyle = 'transparent';
  ctx.lineWidth = 5;
  ctx.shadowColor = palette.goldSoft;
  ctx.shadowBlur = 8;
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
    ctx.shadowBlur = 4;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(35, 70);
    ctx.lineTo(15, 70);
    ctx.stroke();
  } else if (type === 'spool') {
    ctx.beginPath();
    ctx.arc(0, 0, 35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 4;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(22, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(0, 22);
    ctx.stroke();
  } else if (type === 'awl') {
    ctx.shadowBlur = 6;
    ctx.fillRect(-3, -40, 6, 80);
    ctx.beginPath();
    ctx.arc(0, -45, 8, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
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

  // Starfield background — full opacity, bright stars
  ctx.globalAlpha = 1;
  ctx.drawImage(starTex, 0, 0, W, H);
  ctx.globalAlpha = 1;

  if (slideIdx === 0) {
    drawTextilePattern(200, 240, 500, 400, 0.15);
    drawConstellation(1200, 300, 90, 0.48);
    drawConstellation(1500, 550, 70, 0.42);
    drawConstellation(400, 600, 85, 0.35);
    drawComet(300, 580, -0.3);
    drawTool(250, 680, 0.75, 'scissors');
    drawTool(1650, 240, 0.6, 'spool');
    drawTool(1780, 640, 0.9, 'awl');
  } else if (slideIdx === 1) {
    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = palette.gold;
    ctx.transform(1, 0, 0.28, 1, -150, 0);
    ctx.fillRect(600, 150, 700, 540);
    ctx.restore();
    ctx.globalAlpha = 1;

    drawConstellation(480, 280, 100, 0.5);
    drawConstellation(1400, 500, 80, 0.38);
    drawComet(280, 380, -0.25);
    drawComet(1800, 580, -0.35);
    drawTool(440, 720, 0.65, 'scissors');
    drawTool(1820, 640, 0.55, 'spool');

  } else if (slideIdx === 2) {
    drawTextilePattern(120, 280, 450, 350, 0.13);
    drawTextilePattern(1380, 420, 400, 280, 0.11);
    drawConstellation(380, 180, 75, 0.42);
    drawConstellation(1100, 150, 95, 0.48);
    drawConstellation(1600, 620, 85, 0.35);
    drawComet(150, 180, -0.38);
    drawComet(1850, 400, -0.28);
    drawTool(320, 700, 0.75, 'awl');
    drawTool(1680, 280, 0.65, 'spool');
  }

  drawVignette();
}

function drawVignette() {
  const vgrad = ctx.createRadialGradient(W/2, H/2, W*0.2, W/2, H/2, W*1.5);
  vgrad.addColorStop(0, 'rgba(255,255,255,0.02)');
  vgrad.addColorStop(0.4, 'rgba(255,255,255,0.01)');
  vgrad.addColorStop(1, 'rgba(0,0,0,0.65)');
  ctx.fillStyle = vgrad;
  ctx.fillRect(0, 0, W, H);
}

try {
  renderSlide(0);
  const data1 = canvas.toDataURL('image/webp', 0.78).split(',')[1];
  renderSlide(1);
  const data2 = canvas.toDataURL('image/webp', 0.78).split(',')[1];
  renderSlide(2);
  const data3 = canvas.toDataURL('image/webp', 0.78).split(',')[1];
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
  for (let i = 0; i < 3; i++) {
    const data = [results.data1, results.data2, results.data3][i];
    const outPath = path.join(imgDir, `hero-dedicado-${i + 1}.webp`);
    const buf = Buffer.from(data, 'base64');
    fs.writeFileSync(outPath, buf);
    console.log(`Saved: ${outPath} (${buf.length} bytes)`);
  }
  console.log('STARFIELD HERO IMAGES GENERATED');
}

generate().catch(e => console.error('Outer error:', e.message));
