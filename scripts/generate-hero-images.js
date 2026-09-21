const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const W = 1920, H = 820;

const palette = {
  paper: '#f7f1e4', paperDeep: '#efe6d3', cream: '#e9dcc3', bone: '#dccaa6',
  sand: '#c9b27e', ink: '#1c1712', ink2: '#33291f', inkDeep: '#0d0a07',
  gold: '#b98a3e', goldSoft: '#d3ac5f', clay: '#a6502e', teal: '#59643f',
};

async function generate() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const html = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; padding: 0; overflow: hidden; }
  canvas { display: block; }
</style>
</head>
<body>
<canvas id="canvas" width="${W}" height="${H}"></canvas>
<script>
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = ${W}, H = ${H};

const palette = ${JSON.stringify(palette)};

// Dark gradients for each slide (contrast for white text)
const gradients = [
  [0, '#0d0a07', 0.35, '#2a1e17', 0.7, '#4a3a2d', 1, '#1c1712'],
  [0, '#1a130f', 0.4, '#3a2d20', 0.75, '#5a4a3a', 1, '#2a1e17'],
  [0, '#0d0a07', 0.3, '#1c1712', 0.6, '#33291f', 0.85, '#0d0a07'],
];

// Generate a subtle paper grain texture that we can use as fill
function createPaperTexture(w, h, intensity) {
  const tex = document.createElement('canvas');
  tex.width = w;
  tex.height = h;
  const tctx = tex.getContext('2d');
  tctx.fillStyle = palette.ink2;
  tctx.globalAlpha = intensity;
  for (let i = 0; i < w * h * 0.05; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const size = Math.random() * 1.5 + 0.3;
    tctx.beginPath();
    tctx.arc(x, y, size, 0, Math.PI * 2);
    tctx.fill();
  }
  // Fibre lines
  tctx.strokeStyle = palette.ink2;
  tctx.lineWidth = 0.5;
  tctx.globalAlpha = intensity * 0.5;
  for (let i = 0; i < w; i += 2) {
    const y = Math.random() * h;
    tctx.beginPath();
    tctx.moveTo(i, y);
    tctx.lineTo(i + (Math.random() - 0.5) * 60, y);
    tctx.stroke();
  }
  tctx.globalAlpha = 1;
  return tex;
}

// Pre-generate texture
const paperTex = createPaperTexture(256, 256, 0.12);

function drawVignette() {
  const grad = ctx.createRadialGradient(W/2, H/2, W*0.2, W/2, H/2, W*1.4);
  grad.addColorStop(0, 'rgba(255,255,255,0.02)');
  grad.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

function drawTools(x, y, scale = 0.6) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = palette.goldSoft;
  ctx.fillStyle = 'transparent';
  ctx.lineWidth = 3;
  // Scissors
  ctx.beginPath();
  ctx.moveTo(40, 30);
  ctx.bezierCurveTo(60, 30, 80, 40, 80, 60);
  ctx.bezierCurveTo(80, 80, 60, 90, 40, 90);
  ctx.stroke();
  // Thread spool
  ctx.beginPath();
  ctx.arc(100, 60, 25, 0, Math.PI * 2);
  ctx.stroke();
  ctx.moveTo(75, 60);
  ctx.lineTo(125, 60);
  ctx.restore();
}

function drawThreadWeft(x, y, w, h, threads) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = palette.sand;
  ctx.globalAlpha = 0.08;
  ctx.lineWidth = 1;
  for (let i = 0; i < threads; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * (h / threads));
    ctx.lineTo(w, i * (h / threads) + 5);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function renderSlide(slideIdx) {
  ctx.clearRect(0, 0, W, H);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Dark gradient background
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  const g = gradients[slideIdx];
  for (let i = 0; i < g.length; i += 2) {
    grad.addColorStop(g[i], g[i+1]);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Paper texture overlay
  ctx.globalAlpha = 0.18;
  ctx.drawImage(paperTex, 0, 0, W, H);
  ctx.globalAlpha = 1;

  if (slideIdx === 0) {
    // Slide 1: textiles — woven bands + silhouettes + gold accent
    
    // Woven weft texture
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = palette.sand;
    for (let i = 0; i < 10; i++) {
      const y = 200 + i * 60;
      ctx.fillRect(200, y, 1600, 1);
    }
    ctx.globalAlpha = 1;

    // Thread weave
    drawThreadWeft(200, 300, 1500, 200, 15);

    // Artisan silhouettes (mochila + bowl) — gold tinted
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = palette.goldSoft;
    ctx.beginPath();
    ctx.moveTo(320, 340);
    ctx.lineTo(360, 330);
    ctx.lineTo(375, 480);
    ctx.lineTo(335, 490);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(380, 420, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Gold polygon accent
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = palette.goldSoft;
    ctx.beginPath();
    ctx.moveTo(1500, 180);
    ctx.lineTo(1800, 180);
    ctx.lineTo(1760, 380);
    ctx.lineTo(1460, 380);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // Tools
    drawTools(480, 680, 0.5);
    drawTools(1700, 720, 0.35);

  } else if (slideIdx === 1) {
    // Slide 2: sale — diagonal gold band + silhouettes
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = palette.gold;
    ctx.save();
    ctx.transform(1, 0, 0.3, 1, -300, 0);
    ctx.fillRect(520, 120, 760, 560);
    ctx.restore();
    ctx.globalAlpha = 1;

    // Hand silhouette — gold tinted for warmth
    ctx.globalAlpha = 0.32;
    ctx.fillStyle = palette.goldSoft;
    ctx.beginPath();
    ctx.ellipse(220, 410, 60, 95, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Jewelry silhouettes — gold
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = palette.goldSoft;
    ctx.beginPath();
    ctx.arc(1600, 300, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(1625, 300, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(1680, 420, 55, 65, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    drawTools(390, 690, 0.6);
    drawTools(1830, 650, 0.45);

  } else if (slideIdx === 2) {
    // Slide 3: workshop — grid + floating pieces + gold circle
    
    // Subtle grid
    ctx.globalAlpha = 0.03;
    ctx.strokeStyle = palette.sand;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 12; i++) {
      ctx.beginPath();
      ctx.moveTo(220 + i * 120, 180);
      ctx.lineTo(220 + i * 120, 720);
      ctx.stroke();
    }
    for (let i = 0; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo(220, 180 + i * 75);
      ctx.lineTo(1680, 180 + i * 75);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Floating artisanal pieces — gold
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = palette.goldSoft;
    ctx.beginPath();
    ctx.arc(520, 300, 65, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(560, 320, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(540, 420, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(1470, 550, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(1440, 580, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Gold circle accent
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = palette.goldSoft;
    ctx.beginPath();
    ctx.arc(1620, 120, 130, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    drawTools(320, 680, 0.55);
    drawTools(1750, 620, 0.42);
  }

  // Center radial light for depth
  const centerGrad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.8);
  centerGrad.addColorStop(0, 'rgba(255,255,255,0.015)');
  centerGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = centerGrad;
  ctx.fillRect(0, 0, W, H);

  drawVignette();
}

renderSlide(0);
const data1 = canvas.toDataURL('image/webp', 0.95).split(',')[1];
renderSlide(1);
const data2 = canvas.toDataURL('image/webp', 0.95).split(',')[1];
renderSlide(2);
const data3 = canvas.toDataURL('image/webp', 0.95).split(',')[1];

window.__results = { data1, data2, data3 };
</script>
</body>
</html>`;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.waitForFunction('window.__results !== undefined');

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

generate().catch(e => console.error(e));
