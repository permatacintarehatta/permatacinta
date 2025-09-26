// Nama cache (gunakan v1, v2, dst. jika ada pembaruan besar)
const CACHE_NAME = 'permata-cinta-v1';

// Daftar file penting yang akan disimpan untuk mode offline
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/img/header.png', // <-- Menambahkan header agar offline
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// 1. Proses Instalasi Service Worker
// Event ini berjalan saat service worker pertama kali diinstal
self.addEventListener('install', event => {
  // Tunggu sampai proses caching selesai
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache dibuka. Menyimpan file-file penting...');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Proses Intercept Request (Fetch)
// Event ini berjalan setiap kali aplikasi meminta sebuah file/data
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika file yang diminta ADA di dalam cache, kembalikan dari cache
        if (response) {
          return response;
        }

        // Jika TIDAK ADA, lanjutkan permintaan ke internet
        return fetch(event.request);
      })
  );
});
