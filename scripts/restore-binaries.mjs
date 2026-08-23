import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const partsDirectory = join(root, 'vendor-binaries');
const assets = [
  ['stockfish-wasm', 'public/stockfish/stockfish-18-lite-single.wasm'],
  ['app-icon', 'assets/images/ajedrezpro-icon-v2.png'],
  ['ios-icon', 'assets/images/ajedrezpro-ios-icon-1024.png'],
  ['legacy-icon', 'assets/images/icon.png'],
];

if (!existsSync(partsDirectory)) {
  process.exit(0);
}

const partNames = readdirSync(partsDirectory);

for (const [prefix, relativeOutput] of assets) {
  const matchingParts = partNames.filter((name) => name.startsWith(`${prefix}.b64.part-`)).sort();
  if (matchingParts.length === 0) continue;

  const encoded = matchingParts
    .map((name) => readFileSync(join(partsDirectory, name), 'utf8'))
    .join('')
    .replace(/\s/g, '');
  const output = join(root, relativeOutput);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, Buffer.from(encoded, 'base64'));
}
