/* AMC app — ตัวช่วยให้ติดตั้งเป็นแอปได้ + เปิดหน้าเปลือกได้ตอนเน็ตหลุด
 * แตะเฉพาะไฟล์ของแอปนี้เอง (โดเมนเดียวกัน) · ไม่แตะ/ไม่เก็บอะไรของ hub หรือห้องอื่น
 * เปลี่ยนไฟล์แอปเมื่อไหร่ ให้เพิ่มเลข VERSION 1 ครั้ง */
const VERSION = 'amc-app-v4';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/logo.png',
  './intro.wav'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // hub / Google = ปล่อยผ่าน ไม่เก็บ

  // หน้าแอป: เอาของใหม่จากเน็ตก่อน (แก้แล้วทุกเครื่องเห็นทันที) · เน็ตหลุดค่อยใช้ของในเครื่อง
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put('./index.html', copy)); return res; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  // ไอคอน/ไฟล์ประกอบ: ใช้ของในเครื่องก่อน
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
