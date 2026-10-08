import { mkdir, copyFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const destination = resolve(projectRoot, process.argv[2] || '../docs');
await mkdir(destination, { recursive: true });
await copyFile(resolve(projectRoot, 'index.html'), resolve(destination, 'index.html'));
await writeFile(resolve(destination, '.nojekyll'), '');
await mkdir(resolve(destination, 'licenses'), { recursive: true });
for (const file of await readdir(resolve(projectRoot, 'public/fonts'))) {
  if (file.endsWith('-LICENSE.txt')) {
    await copyFile(resolve(projectRoot, 'public/fonts', file), resolve(destination, 'licenses', file));
  }
}
console.log(`GitHub Pages files exported to ${destination}`);
