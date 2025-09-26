// File: app.js

window.addEventListener('DOMContentLoaded', () => {

    // --- 1. REGISTRASI SERVICE WORKER ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('ServiceWorker registration successful:', registration.scope))
            .catch(err => console.log('ServiceWorker registration failed:', err));
    }

    // --- 2. AMBIL DATA BERITA ---
    fetchNews();

    // --- 3. LOGIKA NAVIGASI HALAMAN ---
    setupPageNavigation();
    
    // --- 4. (BARU) LOGIKA POPUP PDF ---
    setupPdfPopup();

});

// --- FUNGSI-FUNGSI ---

function fetchNews() {
    const newsContainer = document.querySelector('.news-container');
    if (!newsContainer) return;

    newsContainer.innerHTML = ''; 

    fetch('/api/berita')
        .then(response => response.json())
        .then(data => {
            data.forEach(berita => {
                const newsCard = document.createElement('div');
                newsCard.className = 'news-card';
                newsCard.innerHTML = `<img src="${berita.gambar}" alt="${berita.judul}"><h3>${berita.judul}</h3>`;
                newsContainer.appendChild(newsCard);
            });
        })
        .catch(error => {
            console.error('Error fetching news:', error);
            newsContainer.innerHTML = '<p>Gagal memuat berita.</p>';
        });
}

function setupPageNavigation() {
    const pageLinks = document.querySelectorAll('.page-link');
    const pages = document.querySelectorAll('.page');
    const navItems = document.querySelectorAll('.nav-item');

    function navigateTo(pageId) {
        pages.forEach(page => page.classList.toggle('hidden', page.id !== pageId));
        window.scrollTo(0, 0);
    }

    function updateActiveNav(targetPage) {
        navItems.forEach(item => item.classList.toggle('active', item.dataset.page === targetPage));
    }

    pageLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); 
            const targetPage = link.dataset.page;
            if (!document.getElementById(targetPage)) return;
            navigateTo(targetPage);
            updateActiveNav(targetPage);
        });
    });

    navigateTo('beranda-page');
}

// (BARU) Fungsi untuk mengatur logika popup
function setupPdfPopup() {
    const openButton = document.getElementById('open-guide-button');
    const closeButton = document.getElementById('close-guide-button');
    const pdfPopup = document.getElementById('pdf-popup');

    if (!openButton || !closeButton || !pdfPopup) {
        console.error('Elemen popup tidak ditemukan!');
        return;
    }

    // Tampilkan popup saat tombol "Panduan" diklik
    openButton.addEventListener('click', () => {
        pdfPopup.classList.remove('hidden');
    });

    // Sembunyikan popup saat tombol "Close" (X) diklik
    closeButton.addEventListener('click', () => {
        pdfPopup.classList.add('hidden');
    });

    // Sembunyikan popup saat area gelap di luar konten diklik
    pdfPopup.addEventListener('click', (event) => {
        if (event.target === pdfPopup) {
            pdfPopup.classList.add('hidden');
        }
    });
}
