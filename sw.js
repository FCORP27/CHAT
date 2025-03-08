self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(response => response || fetch(e.request))
    );
});

self.addEventListener('periodicsync', (e) => {
    if (e.tag === 'resume-upload') {
        e.waitUntil(handleResume());
    }
});

async function handleResume() {
    const db = await openDB();
    const data = await db.get('progress', 1);
    if (data && data.batches.length > 0) {
        await processBatches(data.batches);
    }
}
