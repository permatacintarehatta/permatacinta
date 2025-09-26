// File: app.js

window.addEventListener('DOMContentLoaded', () => {

    // --- DEKLARASI VARIABEL & FUNGSI GLOBAL ---
    const pages = document.querySelectorAll('.page');
    const navItems = document.querySelectorAll('.nav-item');

    // Fungsi untuk menampilkan halaman yang dipilih dan menyembunyikan yang lain
    // Dibuat di sini agar bisa diakses oleh semua fungsi setup
    function navigateTo(pageId) {
        pages.forEach(page => {
            page.classList.toggle('hidden', page.id !== pageId);
        });
        window.scrollTo(0, 0);
    }

    // Fungsi untuk memperbarui status 'active' di navigasi bawah
    function updateActiveNav(targetPage) {
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.page === targetPage);
        });
    }

    // --- INISIALISASI SEMUA MODUL ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('ServiceWorker registration successful'))
            .catch(err => console.log('ServiceWorker registration failed:', err));
    }
    
    fetchNews();
    setupPageNavigation(navigateTo, updateActiveNav); // Kirim fungsi sebagai argumen
    setupAdminAuth(navigateTo); // Kirim fungsi sebagai argumen
    setupBeritaForm();
});


// --- FUNGSI-FUNGSI SETUP ---

function fetchNews() {
    const newsContainer = document.querySelector('.news-container');
    if (!newsContainer) return;

    newsContainer.innerHTML = ''; 

    fetch('/api/berita')
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data)) {
                console.error('Data fetched is not an array:', data);
                newsContainer.innerHTML = '<p>Gagal memuat berita (format data salah).</p>';
                return;
            }
            data.forEach(berita => {
                const newsCard = document.createElement('div');
                newsCard.className = 'news-card';
                newsCard.innerHTML = `<img src="${berita.thumbnail_url}" alt="${berita.judul}"><h3>${berita.judul}</h3>`;
                newsContainer.appendChild(newsCard);
            });
        })
        .catch(error => {
            console.error('Error fetching news:', error);
            newsContainer.innerHTML = '<p>Gagal memuat berita.</p>';
        });
}

function setupPageNavigation(navigateTo, updateActiveNav) {
    const pageLinks = document.querySelectorAll('.page-link');

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

    // Tampilkan halaman Beranda saat pertama kali dimuat
    navigateTo('beranda-page');
}

// REVISI DI FUNGSI INI
function setupAdminAuth(navigateTo) {
    const openBtn = document.getElementById('open-admin-berita-button');
    const closeBtn = document.getElementById('close-pin-button');
    const pinPopup = document.getElementById('pin-popup');
    const pinForm = document.getElementById('pin-form');
    const pinInput = document.getElementById('pin-input');
    const pinError = document.getElementById('pin-error');
    
    if (!openBtn || !pinPopup || !closeBtn || !pinForm || !pinInput || !pinError) return;

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
            // --- INI PERBAIKANNYA ---
            // Langsung panggil fungsi navigasi, bukan mensimulasikan klik.
            navigateTo('admin-berita-page');
        } else {
            pinError.classList.remove('hidden');
            pinInput.select();
        }
    });

    pinPopup.addEventListener('click', (event) => {
        if (event.target === pinPopup) {
            pinPopup.classList.add('hidden');
        }
    });
}

function setupBeritaForm() {
    const beritaForm = document.getElementById('berita-form');
    const thumbnailInput = document.getElementById('thumbnail');
    const thumbnailPreview = document.getElementById('thumbnail-preview');

    if (!beritaForm || !thumbnailInput || !thumbnailPreview) return;

    thumbnailInput.addEventListener('change', () => {
        const file = thumbnailInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                thumbnailPreview.src = e.target.result;
                thumbnailPreview.classList.remove('hidden');
            }
            reader.readAsDataURL(file);
        } else {
            thumbnailPreview.src = '#';
            thumbnailPreview.classList.add('hidden');
        }
    });

    beritaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Fitur simpan berita belum terhubung ke backend!');
    });
}
