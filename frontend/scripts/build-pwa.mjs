import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Generate a versioned precache from the actual Vite output, including mock media.
const dist = resolve('dist');
async function listFiles(directory, prefix = '') {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const relative = `${prefix}${entry.name}`;
        if (entry.isDirectory()) {
            files.push(...await listFiles(resolve(directory, entry.name), `${relative}/`));
        } else if (relative !== 'sw.js') {
            files.push(relative);
        }
    }
    return files.sort();
}
const files = await listFiles(dist);
const template = await readFile(new URL('./sw-template.js', import.meta.url), 'utf8');
const hash = createHash('sha256').update(template);
for (const file of files) {
    hash.update(file);
    hash.update(await readFile(resolve(dist, file)));
}
const version = hash.digest('hex').slice(0, 16);
const worker = template
    .replace('__CACHE_VERSION__', JSON.stringify(version))
    .replace('__PRECACHE_FILES__', JSON.stringify(files.map(file => `./${file}`)));
await writeFile(resolve(dist, 'sw.js'), worker);
console.log(`PWA: ${files.length} static files, cache ${version}`);
