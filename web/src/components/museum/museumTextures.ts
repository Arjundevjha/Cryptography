import * as THREE from 'three';

function createCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

function configureTexture(
  canvas: HTMLCanvasElement,
  repeatX = 1,
  repeatY = 1,
  isColor = true
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  if (isColor) {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

// Deterministic pseudo-random helper for repeatable architectural textures
function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Botticino / Carrara veined marble tile floor texture.
 */
export function createMarbleTileTexture(repeatX = 24, repeatY = 26): THREE.CanvasTexture {
  const size = 512;
  const [canvas, ctx] = createCanvas(size, size);
  const rand = seededRandom(42);

  // Warm cream marble base
  ctx.fillStyle = '#ece3d5';
  ctx.fillRect(0, 0, size, size);

  const tiles = 2;
  const tileSize = size / tiles;

  for (let ty = 0; ty < tiles; ty++) {
    for (let tx = 0; tx < tiles; tx++) {
      const ox = tx * tileSize;
      const oy = ty * tileSize;

      // Subtle per-tile warm limestone/marble variation
      const shade = Math.floor((rand() - 0.5) * 10);
      ctx.fillStyle = `rgb(${236 + shade}, ${227 + shade}, ${213 + shade})`;
      ctx.fillRect(ox + 2, oy + 2, tileSize - 4, tileSize - 4);

      // Soft cloudy mineral patches
      for (let p = 0; p < 5; p++) {
        const px = ox + rand() * tileSize;
        const py = oy + rand() * tileSize;
        const r = 40 + rand() * 80;
        const grad = ctx.createRadialGradient(px, py, 2, px, py, r);
        grad.addColorStop(0, 'rgba(210, 196, 176, 0.22)');
        grad.addColorStop(1, 'rgba(210, 196, 176, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(ox, oy, tileSize, tileSize);
      }

      // Organic marble veining
      for (let v = 0; v < 4; v++) {
        ctx.beginPath();
        let vx = ox + rand() * tileSize;
        let vy = oy + (v % 2 === 0 ? 0 : rand() * tileSize);
        ctx.moveTo(vx, vy);
        for (let step = 0; step < 6; step++) {
          vx += (rand() - 0.35) * 55;
          vy += 20 + rand() * 45;
          ctx.lineTo(vx, vy);
        }
        ctx.strokeStyle = v === 0 ? 'rgba(196, 170, 128, 0.28)' : 'rgba(176, 164, 148, 0.24)';
        ctx.lineWidth = 0.8 + rand() * 1.4;
        ctx.stroke();
      }
    }
  }

  // Crisp subtle mortar/grout seams
  ctx.strokeStyle = 'rgba(165, 152, 134, 0.45)';
  ctx.lineWidth = 3;
  for (let i = 0; i <= tiles; i++) {
    const pos = i * tileSize;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(size, pos);
    ctx.stroke();
  }

  return configureTexture(canvas, repeatX, repeatY);
}

/**
 * Honey-oak herringbone parquet runner texture.
 */
export function createHerringboneParquetTexture(repeatX = 2, repeatY = 14): THREE.CanvasTexture {
  const size = 512;
  const [canvas, ctx] = createCanvas(size, size);
  const rand = seededRandom(108);

  ctx.fillStyle = '#6c492d';
  ctx.fillRect(0, 0, size, size);

  const plankW = 64;
  const plankH = 128;
  const woods = ['#7a5436', '#6d4a2e', '#845b3b', '#634127', '#744f32'];

  for (let y = -plankH; y < size + plankH; y += plankW) {
    for (let x = -plankH; x < size + plankH; x += plankW) {
      const idx = Math.floor(rand() * woods.length);
      ctx.save();
      ctx.translate(x, y);
      const isEven = (Math.floor(x / plankW) + Math.floor(y / plankW)) % 2 === 0;
      ctx.rotate(isEven ? Math.PI / 4 : -Math.PI / 4);

      ctx.fillStyle = woods[idx];
      ctx.fillRect(-plankW / 2, -plankH / 2, plankW - 2, plankH - 2);

      // Subtle wood grain lines
      ctx.strokeStyle = 'rgba(42, 24, 12, 0.22)';
      ctx.lineWidth = 1;
      for (let g = -plankW / 2 + 6; g < plankW / 2 - 4; g += 7) {
        ctx.beginPath();
        ctx.moveTo(g, -plankH / 2);
        ctx.lineTo(g + (rand() - 0.5) * 4, plankH / 2);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(36, 20, 10, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-plankW / 2, -plankH / 2, plankW - 2, plankH - 2);
      ctx.restore();
    }
  }

  return configureTexture(canvas, repeatX, repeatY);
}

/**
 * Textured Venetian plaster / gallery wall finish (avoids flat solid-color walls).
 */
export function createVenetianPlasterTexture(
  baseHex: string,
  accentHex: string,
  repeatX = 2,
  repeatY = 1,
  seed = 77
): THREE.CanvasTexture {
  const size = 256;
  const [canvas, ctx] = createCanvas(size, size);
  const rand = seededRandom(seed);

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, size, size);

  // Soft trowel-mottled plaster clouds
  for (let i = 0; i < 45; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 24 + rand() * 58;
    const grad = ctx.createRadialGradient(x, y, 2, x, y, r);
    grad.addColorStop(0, accentHex);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha = 0.14 + rand() * 0.12;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Fine mineral flecks
  for (let i = 0; i < 450; i++) {
    const x = rand() * size;
    const y = rand() * size;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,250,240,0.08)' : 'rgba(60,45,30,0.06)';
    ctx.fillRect(x, y, 2, 2);
  }

  return configureTexture(canvas, repeatX, repeatY);
}

/**
 * Neoclassical fluted limestone column texture.
 */
export function createFlutedColumnTexture(): THREE.CanvasTexture {
  const width = 512;
  const height = 256;
  const [canvas, ctx] = createCanvas(width, height);
  const rand = seededRandom(303);

  ctx.fillStyle = '#ece3d5';
  ctx.fillRect(0, 0, width, height);

  const flutes = 20;
  const fluteW = width / flutes;
  for (let i = 0; i < flutes; i++) {
    const x = i * fluteW;
    const grad = ctx.createLinearGradient(x, 0, x + fluteW, 0);
    grad.addColorStop(0, '#cfc2b0');
    grad.addColorStop(0.2, '#e6dccd');
    grad.addColorStop(0.5, '#f4ede2');
    grad.addColorStop(0.8, '#e3d8c7');
    grad.addColorStop(1, '#c8baa6');
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, fluteW, height);
  }

  // Subtle horizontal stone drum seams
  ctx.strokeStyle = 'rgba(130, 115, 96, 0.25)';
  ctx.lineWidth = 2;
  for (let y = 64; y < height; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Stone grain
  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = 'rgba(110, 95, 78, 0.06)';
    ctx.fillRect(rand() * width, rand() * height, 2, 2);
  }

  return configureTexture(canvas, 1, 2);
}

/**
 * Coffered classical ceiling texture with warm architectural depth.
 */
export function createCofferedCeilingTexture(repeatX = 18, repeatY = 20): THREE.CanvasTexture {
  const size = 256;
  const [canvas, ctx] = createCanvas(size, size);

  ctx.fillStyle = '#e5dacb';
  ctx.fillRect(0, 0, size, size);

  // Outer molding frame
  ctx.strokeStyle = '#cbbca8';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, size - 14, size - 14);

  // Inner stepped coffer recess
  ctx.fillStyle = '#dcd0bf';
  ctx.fillRect(28, 28, size - 56, size - 56);
  ctx.strokeStyle = '#bfa98a';
  ctx.lineWidth = 3;
  ctx.strokeRect(32, 32, size - 64, size - 64);

  // Subtle brass rosette center
  ctx.fillStyle = '#c8a656';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, 8, 0, Math.PI * 2);
  ctx.fill();

  return configureTexture(canvas, repeatX, repeatY);
}

/**
 * Soft radial contact shadow decal texture for grounding pedestals, columns, and benches.
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const [canvas, ctx] = createCanvas(size, size);
  const grad = ctx.createRadialGradient(size / 2, size / 2, 8, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(35, 25, 16, 0.42)');
  grad.addColorStop(0.55, 'rgba(35, 25, 16, 0.16)');
  grad.addColorStop(1, 'rgba(35, 25, 16, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return configureTexture(canvas, 1, 1);
}

/**
 * Framed archival diagram / gallery plate mounted inside each exhibit room's back alcove.
 */
export function createWingGalleryArtTexture(
  title: string,
  category: 'Classical' | 'Historical' | 'Modern',
  timeline: string
): THREE.CanvasTexture {
  const w = 512;
  const h = 440;
  const [canvas, ctx] = createCanvas(w, h);

  const palette =
    category === 'Classical'
      ? { bg: '#f6efe2', border: '#9c5a3c', accent: '#7c3f24', ink: '#3b2518' }
      : category === 'Historical'
      ? { bg: '#f1f2ea', border: '#3e5746', accent: '#2f4536', ink: '#1d2b22' }
      : { bg: '#eef2f6', border: '#3a5268', accent: '#2b4054', ink: '#172430' };

  // Archival rag paper background
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, w, h);

  // Double museum mat border
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 6;
  ctx.strokeRect(18, 18, w - 36, h - 36);
  ctx.strokeStyle = '#c5a059';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, w - 56, h - 56);

  // Center schematic cipher motif
  const cx = w / 2;
  const cy = 195;
  ctx.save();
  ctx.strokeStyle = palette.accent;
  ctx.globalAlpha = 0.82;

  if (category === 'Classical') {
    // Concentric cipher wheel rings
    [95, 72, 46].forEach((r, idx) => {
      ctx.lineWidth = idx === 0 ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 46, cy + Math.sin(a) * 46);
      ctx.lineTo(cx + Math.cos(a) * 95, cy + Math.sin(a) * 95);
      ctx.stroke();
    }
  } else if (category === 'Historical') {
    // Rotor & wiring schematic
    [-68, 0, 68].forEach((rx) => {
      ctx.lineWidth = 2;
      ctx.strokeRect(cx + rx - 22, cy - 72, 44, 144);
      for (let y = -52; y <= 52; y += 26) {
        ctx.beginPath();
        ctx.arc(cx + rx, cy + y, 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    ctx.lineWidth = 1.2;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - 46, cy + i * 26);
      ctx.lineTo(cx - 22, cy - i * 26);
      ctx.moveTo(cx + 22, cy - i * 26);
      ctx.lineTo(cx + 46, cy + i * 26);
      ctx.stroke();
    }
  } else {
    // Lattice / modular cryptographic grid
    ctx.lineWidth = 1.5;
    for (let gx = -90; gx <= 90; gx += 30) {
      ctx.beginPath();
      ctx.moveTo(cx + gx, cy - 85);
      ctx.lineTo(cx + gx, cy + 85);
      ctx.stroke();
    }
    for (let gy = -60; gy <= 60; gy += 30) {
      ctx.beginPath();
      ctx.moveTo(cx - 105, cy + gy);
      ctx.lineTo(cx + 105, cy + gy);
      ctx.stroke();
    }
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 48, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Curatorial plate typography
  ctx.fillStyle = palette.ink;
  ctx.textAlign = 'center';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText(title.toUpperCase(), w / 2, 342);

  ctx.fillStyle = palette.border;
  ctx.font = 'italic 16px Georgia, serif';
  ctx.fillText(`Archival Study · ${timeline}`, w / 2, 372);

  return configureTexture(canvas, 1, 1);
}
