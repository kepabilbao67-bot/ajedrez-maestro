// Prepara vercel-public/ con los archivos de la web.
// Ademas fija el nombre de la cache del service worker a partir del contenido de
// los archivos: cada despliegue con cambios usa una cache nueva y el navegador
// descarta la anterior (sw.js sirve primero desde cache, asi que sin esto los
// usuarios se quedarian con la version vieja hasta que alguien subiera "vN" a mano).
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const OUT = 'vercel-public';
const files = [
  'css/styles.css',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/icon.svg',
  'img/marble_dark.png', 'img/marble_light.png', 'img/slate_dark.png', 'img/slate_light.png',
  'img/wood_dark.png', 'img/wood_light.png',
  'index.html',
  'js/ai-worker.js', 'js/app.js', 'js/engine.js', 'js/i18n.js', 'js/lessons.js', 'js/pieces.js', 'js/sounds.js',
  'manifest.webmanifest',
  'sw.js',
];

const hash = createHash('sha256');
for (const file of files) {
  if (file === 'sw.js') continue;
  hash.update(file).update(readFileSync(file));
}

const sw = readFileSync('sw.js', 'utf8');
const swCacheRe = /const CACHE = '([^']+)';/;
if (!swCacheRe.test(sw)) throw new Error("sw.js: no se encontro la linea const CACHE = '...';");

// Todo lo que sw.js precachea debe publicarse; si no, addAll() falla al instalar.
const swAssets = [...sw.matchAll(/'\.\/([^']+)'/g)].map((m) => m[1]);
const missing = swAssets.filter((a) => !files.includes(a));
if (missing.length) throw new Error('sw.js precachea archivos que no se publican: ' + missing.join(', '));

for (const file of files) {
  const target = path.join(OUT, file);
  mkdirSync(path.dirname(target), { recursive: true });
  copyFileSync(file, target);
}

const version = hash.update(sw).digest('hex').slice(0, 12);
const cacheName = `ajedrez-maestro-${version}`;
writeFileSync(path.join(OUT, 'sw.js'), sw.replace(swCacheRe, `const CACHE = '${cacheName}';`));

console.log(`Web preparada: ${files.length} archivos. Cache del service worker: ${cacheName}`);
