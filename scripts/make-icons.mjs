// Draws the app icon: black tile, orange progress ring (the calorie ring) with a glowing centre.
// Pure Node: a tiny PNG encoder with 4×4 supersampling. Writes public/icons/*.png.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');
fs.mkdirSync(outDir, { recursive: true });

const SS = 4;
const SWEEP = Math.PI * 2 * 0.78; // 78% of a full ring
const c1 = [255, 180, 92]; // #FFB45C
const c2 = [255, 122, 0]; // #FF7A00
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

function crc32(buf) {
  const table = crc32.t || (crc32.t = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  }));
  let crc = 0xffffffff;
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, pixels) {
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    pixels.copy(raw, y * (size * 3 + 1) + 1, y * size * 3, (y + 1) * size * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// Colour of one sample point in unit coordinates (0..1).
function sample(x, y) {
  const dx = x - 0.5, dy = y - 0.5;
  const d = Math.hypot(dx, dy);
  const R = 0.3, T = 0.085;
  let a = Math.atan2(dx, -dy); if (a < 0) a += Math.PI * 2; // clockwise from 12 o'clock
  // ring arc with round caps
  if (Math.abs(d - R) <= T / 2 && a <= SWEEP) return mix(c1, c2, a / SWEEP);
  const end = [0.5 + Math.sin(SWEEP) * R, 0.5 - Math.cos(SWEEP) * R];
  if (Math.hypot(x - 0.5, y - (0.5 - R)) <= T / 2) return c1;
  if (Math.hypot(x - end[0], y - end[1]) <= T / 2) return c2;
  // faint track for the rest of the ring
  if (Math.abs(d - R) <= T / 2) return [38, 38, 38];
  // glowing centre disc
  const r2 = 0.17;
  if (d <= r2) return mix([255, 200, 140], [255, 138, 31], Math.pow(d / r2, 1.4));
  // soft glow around the disc
  if (d <= r2 + 0.06) { const g = 1 - (d - r2) / 0.06; return mix([0, 0, 0], [120, 55, 0], g * g * 0.6); }
  return [0, 0, 0];
}

function draw(size) {
  const px = Buffer.alloc(size * size * 3);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        const c = sample((x + (sx + 0.5) / SS) / size, (y + (sy + 0.5) / SS) / size);
        r += c[0]; g += c[1]; b += c[2];
      }
      const n = SS * SS, i = (y * size + x) * 3;
      px[i] = Math.round(r / n); px[i + 1] = Math.round(g / n); px[i + 2] = Math.round(b / n);
    }
  }
  return png(size, px);
}

for (const [name, size] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512], ['icon-maskable-512.png', 512]]) {
  fs.writeFileSync(path.join(outDir, name), draw(size));
  console.log('wrote', name);
}
