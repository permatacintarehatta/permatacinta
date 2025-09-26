// File: app.js

window.addEventListener('DOMContentLoaded', () => {

    // --- 1. REGISTRASI SERVICE WORKER ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful:', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed:', err);
            });
    }

    // --- 2. AMBIL DATA BERITA ---
    fetchNews();

    // --- 3. LOGIKA NAVIGASI HALAMAN ---
    setupPageNavigation();
    
    // --- 4. LOGIKA POPUP PDF (TIDAK DIGUNAKAN LAGI) ---
    // setupPdfPopup(); // Dihapus karena tombol diganti link biasa

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
                newsCard.innerHTML = `<img src="${berita.thumbnail_url}" alt="${berita.judul}"><h3>${berita.judul}</h3>`; // Menggunakan thumbnail_url
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
            if (!document.getElementById(targetPage)) {
                console.warn(`Halaman "${targetPage}" belum dibuat.`);
                return;
            }
            navigateTo(targetPage);
            updateActiveNav(targetPage);
        });
    });

    navigateTo('beranda-page');
}

// (BARU) Fungsi untuk otentikasi PIN admin
function setupAdminAuth() {
    const openBtn = document.getElementById('open-admin-berita-button');
    const closeBtn = document.getElementById('close-pin-button');
    const pinPopup = document.getElementById('pin-popup');
    const pinForm = document.getElementById('pin-form');
    const pinInput = document.getElementById('pin-input');
    const pinError = document.getElementById('pin-error');
    
    if (!openBtn || !pinPopup || !closeBtn || !pinForm) return;

    const correctPin = "123456";

    openBtn.addEventListener('click', () => {
        pinInput.value = '';
        pinError.classList.add('hidden');
        pinPopup.classList.remove('hidden');
        pinInput.focus();
    });

    closeBtn.addEventListener('click', () => {
        pinPopup.classList.add('hidden');
    });

    pinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (pinInput.value === correctPin) {
            pinPopup.classList.add('hidden');
            // Navigasi ke halaman admin berita setelah PIN benar
            document.querySelector('.page-link[data-page="admin-berita-page"]').click();
        } else {
            pinError.classList.remove('hidden');
            pinInput.select();
        }
    });
}

// (BARU) Fungsi untuk form berita (preview gambar)
function setupBeritaForm() {
    const thumbnailInput = document.getElementById('thumbnail');
    const thumbnailPreview = document.getElementById('thumbnail-preview');

    if (!thumbnailInput || !thumbnailPreview) return;

    thumbnailInput.addEventListener('change', () => {
        const file = thumbnailInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                thumbnailPreview.src = e.target.result;
                thumbnailPreview.classList.remove('hidden');
            }
            reader.readAsDataURL(file);
        }
    });

    // Logika submit form akan ditambahkan di sini nanti
    document.getElementById('berita-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Fitur simpan berita belum terhubung ke backend!');
        // Nanti di sini kita akan panggil fungsi upload gambar dan simpan data
    });
}
