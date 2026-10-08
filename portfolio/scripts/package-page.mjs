import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const dataUrl = async (path, type) => `data:${type};base64,${(await readFile(new URL(path, root))).toString('base64')}`;

// The chat's HTML viewer opens a single document without a Vite module server.
// Include every display asset so this entry also works offline and in srcdoc.
let css = `${await read('src/style.css')}\n${await read('src/interactions.css')}`;
for (const match of [...css.matchAll(/url\('\/fonts\/([^']+)'\)/g)]) {
  css = css.replace(match[0], `url('${await dataUrl(`public/fonts/${match[1]}`, 'font/woff2')}')`);
}
const content = (await read('src/content.js')).replace(/^export const /gm, 'const ');
const main = (await read('src/main.js')).replace(/^import .+;\r?\n/gm, '');
const introduction = await read('public/intro-cues.json');
const script = `(() => {\nconst introduction = ${introduction};\n${content}\n${main}\n})();`.replace(/<\/script/gi, '<\\/script');
const avatar = await dataUrl('public/character.svg', 'image/svg+xml');
const inlineAvatar = (await read('public/character.svg')).replace('<svg ', '<svg class="character" role="img" aria-label="Yash, an animated developer avatar" ');
const voice = await dataUrl('public/intro.mp3', 'audio/mpeg');
const html = (await read('src/page.html'))
  .replace('</head>', () => `<style>\n${css}\n</style>\n</head>`)
  .replace('<!-- TALKING_AVATAR -->', () => inlineAvatar)
  .replaceAll('src="/character.svg"', `src="${avatar}"`)
  .replace('src="/intro.mp3"', () => `src="${voice}"`)
  .replace('<script type="module" src="/src/main.js"></script>', () => `<script>\n${script}\n</script>`);
await writeFile(new URL('index.html', root), html);
console.log(`Packaged standalone portfolio: ${fileURLToPath(new URL('index.html', root))}`);
