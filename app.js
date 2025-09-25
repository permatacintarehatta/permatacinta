// File: app.js

// 1. Mendaftarkan Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

// 2. Mengambil data berita dari API dan menampilkannya
document.addEventListener('DOMContentLoaded', () => {
  const newsContainer = document.querySelector('.news-container');
  
  // Mengosongkan kontainer dari konten placeholder
  newsContainer.innerHTML = '';

  fetch('/api/berita')
    .then(response => response.json())
    .then(data => {
      data.forEach(berita => {
        const newsCard = document.createElement('div');
        newsCard.className = 'news-card';
        
        newsCard.innerHTML = `
          <img src="${berita.gambar}" alt="${berita.judul}">
          <h3>${berita.judul}</h3>
        `;
        
        newsContainer.appendChild(newsCard);
      });
    })
    .catch(error => {
      console.error('Error fetching news:', error);
      newsContainer.innerHTML = '<p>Gagal memuat berita.</p>';
    });
});
