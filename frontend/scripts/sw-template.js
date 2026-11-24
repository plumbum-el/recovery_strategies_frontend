/* Generated only for the public mock build, not for the authenticated local site. */
const VERSION = __CACHE_VERSION__;
const FILES = __PRECACHE_FILES__;
const SCOPE = self.registration.scope;
const PREFIX = `recovery-strategies-${SCOPE}-`;
const CACHE = `${PREFIX}${VERSION}`;
const URLS = FILES.map(file => new URL(file, SCOPE).href);
const STATIC = new Set(URLS);
const INDEX = new URL('./index.html', SCOPE).href;

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE);
        // Cache full responses, including MP4; never cache API, cookies or private data.
        await cache.addAll(URLS.map(url => new Request(url, { cache: 'reload' })));
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        for (const name of await caches.keys()) {
            if (name.startsWith(PREFIX) && name !== CACHE) await caches.delete(name);
        }
        await self.clients.claim();
    })());
});

// Browser video players use byte ranges. Serve these from the cached full MP4 offline.
async function rangedResponse(response, range) {
    const body = await response.arrayBuffer();
    const length = body.byteLength;
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (!match[1] && !match[2])) {
        return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${length}` } });
    }
    let start = match[1] ? Number(match[1]) : Math.max(0, length - Number(match[2]));
    let end = match[1] && match[2] ? Math.min(Number(match[2]), length - 1) : length - 1;
    if (start >= length || end < start) {
        return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${length}` } });
    }
    return new Response(body.slice(start, end + 1), {
        status: 206,
        headers: {
            'Content-Type': response.headers.get('Content-Type') || 'video/mp4',
            'Accept-Ranges': 'bytes',
            'Content-Range': `bytes ${start}-${end}/${length}`,
            'Content-Length': String(end - start + 1),
        },
    });
}

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET' || !request.url.startsWith(SCOPE)) return;
    const path = new URL(request.url);
    path.search = '';
    path.hash = '';
    const isAppEntry = path.href === SCOPE || path.href === INDEX;
    if (request.mode === 'navigate' && isAppEntry) {
        // Use this version's cached index so offline reloads and assets remain consistent.
        event.respondWith((async () => {
            const cached = await (await caches.open(CACHE)).match(INDEX);
            return cached || fetch(request);
        })());
    } else if (STATIC.has(path.href)) {
        event.respondWith((async () => {
            const cached = await (await caches.open(CACHE)).match(path.href);
            if (!cached) return fetch(request);
            const range = request.headers.get('Range');
            return range ? rangedResponse(cached, range) : cached;
        })());
    }
});
