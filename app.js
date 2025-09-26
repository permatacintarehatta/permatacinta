window.addEventListener('DOMContentLoaded', () => {
    // --- Inisialisasi semua modul ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('ServiceWorker registration successful'))
            .catch(err => console.log('ServiceWorker registration failed:', err));
    }
    fetchNews();
    setupPageNavigation();
    setupAdminAuth();
    setupBeritaForm();
});

// --- FUNGSI-FUNGSI ---

function fetchNews() {
    const newsContainer = document.querySelector('.news-container');
    if (!newsContainer) return;

    newsContainer.innerHTML = ''; 

    fetch('/api/berita')
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data)) {
                // Jika data bukan array, tampilkan pesan error dan hentikan
                console.error('Data fetched is not an array:', data);
                newsContainer.innerHTML = '<p>Gagal memuat berita (format data salah).</p>';
                return;
            }
            data.forEach(berita => {
                const newsCard = document.createElement('div');
                newsCard.className = 'news-card';
                // Menggunakan thumbnail_url dari database
                newsCard.innerHTML = `<img src="${berita.thumbnail_url}" alt="${berita.judul}"><h3>${berita.judul}</h3>`;
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
        pages.forEach(page => {
            page.classList.toggle('hidden', page.id !== pageId);
        });
        window.scrollTo(0, 0);
    }

    function updateActiveNav(targetPage) {
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.page === targetPage);
        });
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

function setupAdminAuth() {
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
            
            // Cari link navigasi ke halaman admin berita dan simulasikan klik
            const adminBeritaLink = document.querySelector('.page-link[data-page="admin-berita-page"]');
            if (adminBeritaLink) {
                 // Navigasi manual karena admin-berita-page tidak ada di bottom nav
                const pages = document.querySelectorAll('.page');
                pages.forEach(page => {
                    page.classList.toggle('hidden', page.id !== 'admin-berita-page');
                });
                window.scrollTo(0, 0);
            }
        } else {
            pinError.classList.remove('hidden');
            pinInput.select();
        }
    });

    // Sembunyikan popup saat area gelap di luar konten diklik
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
        // Nanti di sini kita akan panggil fungsi upload gambar dan simpan data
    });
}
