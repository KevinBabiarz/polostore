const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const srcLogo = path.join(ROOT, 'public', 'images', 'PB-removebg-preview.png');
const outDir = path.join(ROOT, 'public', 'images');

const BRAND = '#e02323';
const targets = [
  { size: 192, name: 'pb-icon-192-maskable.png' },
  { size: 512, name: 'pb-icon-512-maskable.png' },
  { size: 180, name: 'apple-touch-icon-180x180.png' },
];

async function ensureExists(p) {
  await fs.promises.mkdir(p, { recursive: true });
}

async function generateOne({ size, name }) {
  const dim = size;
  // 15% padding around the logo to be maskable-safe
  const padding = Math.round(dim * 0.15);
  const inner = dim - padding * 2;

  // Prepare background
  const background = sharp({
    create: {
      width: dim,
      height: dim,
      channels: 4,
      background: BRAND,
    },
  });

  // Prepare centered logo on a transparent square canvas (inner x inner)
  const logoContained = await sharp(srcLogo)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const innerCanvas = sharp({
    create: {
      width: inner,
      height: inner,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  const centeredLogo = await innerCanvas
    .composite([{ input: logoContained, gravity: 'center' }])
    .png()
    .toBuffer();

  // Composite inner canvas onto background at padding offset
  const outPath = path.join(outDir, name);
  await background
    .composite([{ input: centeredLogo, left: padding, top: padding }])
    .png()
    .toFile(outPath);

  return outPath;
}

(async () => {
  try {
    if (!fs.existsSync(srcLogo)) {
      throw new Error(`Logo introuvable: ${srcLogo}`);
    }
    await ensureExists(outDir);

    for (const t of targets) {
      const out = await generateOne(t);
      console.log(`✔ Généré: ${path.relative(ROOT, out)} (${t.size}x${t.size})`);
    }
    console.log('Icônes générées avec succès.');
  } catch (err) {
    console.error('Erreur lors de la génération des icônes:', err);
    process.exit(1);
  }
})();

