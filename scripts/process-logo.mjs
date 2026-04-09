import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const source = 'C:/Users/vishal/Downloads/fd4ee72e-3fef-4007-ae70-7344fb501fb1.png';
const outDir = 'D:/studyQ/Cofee/saree-studio-os/public/brand';
const appDir = 'D:/studyQ/Cofee/saree-studio-os/src/app';

await fs.mkdir(outDir, { recursive: true });
await fs.mkdir(appDir, { recursive: true });

const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const pixels = new Uint8ClampedArray(data);

function idx(x, y) {
  return (y * width + x) * channels;
}

function rgbAt(x, y) {
  const i = idx(x, y);
  return [pixels[i], pixels[i + 1], pixels[i + 2]];
}

function matchesReferenceTone(r, g, b) {
  return refs.some(({ rgb }) => {
    const dr = Math.abs(r - rgb[0]);
    const dg = Math.abs(g - rgb[1]);
    const db = Math.abs(b - rgb[2]);
    return dr < 26 && dg < 26 && db < 26;
  });
}

function isLikelyBackgroundTone(r, g, b, a) {
  if (a === 0) return true;
  const avg = (r + g + b) / 3;
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  if (!(avg > 214 && spread < 30)) return false;
  return matchesReferenceTone(r, g, b);
}

const samplePoints = [];
for (let x = 0; x < width; x += Math.max(1, Math.floor(width / 24))) {
  samplePoints.push([x, 0], [x, height - 1]);
}
for (let y = 0; y < height; y += Math.max(1, Math.floor(height / 24))) {
  samplePoints.push([0, y], [width - 1, y]);
}

const refs = [];
for (const [x, y] of samplePoints) {
  const [r, g, b] = rgbAt(x, y);
  const avg = (r + g + b) / 3;
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  if (avg > 220 && spread < 20) {
    const key = `${r},${g},${b}`;
    if (!refs.some((entry) => entry.key === key)) {
      refs.push({ key, rgb: [r, g, b] });
    }
  }
}

function matchesBg(x, y) {
  const i = idx(x, y);
  const r = pixels[i];
  const g = pixels[i + 1];
  const b = pixels[i + 2];
  const a = pixels[i + 3];
  return isLikelyBackgroundTone(r, g, b, a);
}

const queue = [];
const visited = new Uint8Array(width * height);
function push(x, y) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const pos = y * width + x;
  if (visited[pos]) return;
  visited[pos] = 1;
  queue.push([x, y]);
}

for (let x = 0; x < width; x += 1) {
  push(x, 0);
  push(x, height - 1);
}
for (let y = 0; y < height; y += 1) {
  push(0, y);
  push(width - 1, y);
}

while (queue.length) {
  const [x, y] = queue.shift();
  if (!matchesBg(x, y)) continue;
  const i = idx(x, y);
  pixels[i + 3] = 0;
  push(x + 1, y);
  push(x - 1, y);
  push(x, y + 1);
  push(x, y - 1);
}

const componentVisited = new Uint8Array(width * height);
const componentQueue = [];
const componentCutoff = Math.max(220, Math.floor((width * height) * 0.00015));

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const pos = y * width + x;
    if (componentVisited[pos]) continue;

    const i = idx(x, y);
    if (!isLikelyBackgroundTone(pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3]) || pixels[i + 3] === 0) {
      componentVisited[pos] = 1;
      continue;
    }

    const component = [];
    componentVisited[pos] = 1;
    componentQueue.push([x, y]);

    while (componentQueue.length) {
      const [cx, cy] = componentQueue.pop();
      component.push([cx, cy]);

      for (const [nx, ny] of [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1],
      ]) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const nextPos = ny * width + nx;
        if (componentVisited[nextPos]) continue;
        componentVisited[nextPos] = 1;

        const nextIndex = idx(nx, ny);
        if (!isLikelyBackgroundTone(pixels[nextIndex], pixels[nextIndex + 1], pixels[nextIndex + 2], pixels[nextIndex + 3])) continue;
        if (pixels[nextIndex + 3] === 0) continue;
        componentQueue.push([nx, ny]);
      }
    }

    if (component.length < componentCutoff) continue;
    for (const [cx, cy] of component) {
      pixels[idx(cx, cy) + 3] = 0;
    }
  }
}

let minX = width;
let minY = height;
let maxX = 0;
let maxY = 0;
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const alpha = pixels[idx(x, y) + 3];
    if (alpha > 10) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
}

const pad = 18;
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(width - 1, maxX + pad);
maxY = Math.min(height - 1, maxY + pad);

const transparent = sharp(Buffer.from(pixels), { raw: { width, height, channels } });
await transparent
  .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
  .png({ compressionLevel: 9, palette: true, quality: 90 })
  .toFile(path.join(outDir, 'logo-transparent.png'));

const rowCounts = [];
for (let y = minY; y <= maxY; y += 1) {
  let count = 0;
  for (let x = minX; x <= maxX; x += 1) {
    if (pixels[idx(x, y) + 3] > 10) count += 1;
  }
  rowCounts.push(count);
}

const threshold = Math.max(30, Math.floor((maxX - minX + 1) * 0.05));
const searchStart = Math.floor(rowCounts.length * 0.45);
const searchEnd = Math.floor(rowCounts.length * 0.94);
let bestGapStart = -1;
let bestGapEnd = -1;
let gapStart = -1;

for (let y = searchStart; y <= searchEnd; y += 1) {
  const inactive = rowCounts[y] <= threshold;
  if (inactive && gapStart === -1) gapStart = y;
  if ((!inactive || y === searchEnd) && gapStart !== -1) {
    const gapEnd = inactive && y === searchEnd ? y : y - 1;
    if (bestGapStart === -1 || gapEnd - gapStart > bestGapEnd - bestGapStart) {
      bestGapStart = gapStart;
      bestGapEnd = gapEnd;
    }
    gapStart = -1;
  }
}

const emblemTop = minY;
const emblemBottom =
  bestGapStart !== -1 && bestGapEnd - bestGapStart >= 10
    ? Math.min(maxY, minY + bestGapStart + 8)
    : Math.min(maxY, minY + Math.floor(rowCounts.length * 0.68));

let emblemMinX = width;
let emblemMaxX = 0;
for (let y = emblemTop; y <= emblemBottom; y += 1) {
  for (let x = minX; x <= maxX; x += 1) {
    if (pixels[idx(x, y) + 3] > 10) {
      if (x < emblemMinX) emblemMinX = x;
      if (x > emblemMaxX) emblemMaxX = x;
    }
  }
}

emblemMinX = Math.max(0, emblemMinX - 18);
const emblemWidth = Math.min(width - emblemMinX, emblemMaxX - emblemMinX + 37);
const emblemHeight = emblemBottom - emblemTop + 1;

const emblemBuffer = await sharp(Buffer.from(pixels), { raw: { width, height, channels } })
  .extract({ left: emblemMinX, top: emblemTop, width: emblemWidth, height: emblemHeight })
  .resize({ width: 820, height: 820, fit: 'inside' })
  .png({ compressionLevel: 9, palette: true, quality: 90 })
  .toBuffer();

await sharp({
  create: {
    width: 1024,
    height: 1024,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([{ input: emblemBuffer, gravity: 'center' }])
  .png({ compressionLevel: 9, palette: true, quality: 90 })
  .toFile(path.join(outDir, 'app-icon.png'));

await sharp(path.join(outDir, 'app-icon.png')).resize(512, 512).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(path.join(appDir, 'icon.png'));
await sharp(path.join(outDir, 'app-icon.png')).resize(512, 512).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(path.join(appDir, 'apple-icon.png'));

console.log('Created:', path.join(outDir, 'logo-transparent.png'));
console.log('Created:', path.join(outDir, 'app-icon.png'));
console.log('Created:', path.join(appDir, 'icon.png'));
console.log('Created:', path.join(appDir, 'apple-icon.png'));
