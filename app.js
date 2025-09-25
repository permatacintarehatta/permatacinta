// File: app.js

// Fungsi dieksekusi setelah seluruh konten halaman dimuat
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

    // --- 2. AMBIL DATA BERITA (LOGIKA LAMA) ---
    fetchNews();

    // --- 3. LOGIKA NAVIGASI HALAMAN (BARU) ---
    const pageLinks = document.querySelectorAll('.page-link');
    const pages = document.querySelectorAll('.page');
    const navItems = document.querySelectorAll('.nav-item');

    // Fungsi untuk menampilkan halaman yang dipilih dan menyembunyikan yang lain
    function navigateTo(pageId) {
        pages.forEach(page => {
            // Jika ID halaman cocok, tampilkan. Jika tidak, sembunyikan.
            page.classList.toggle('hidden', page.id !== pageId);
        });
    }

    // Fungsi untuk memperbarui status 'active' di navigasi bawah
    function updateActiveNav(targetPage) {
        navItems.forEach(item => {
            // Jika data-page pada item nav cocok, beri kelas 'active'
            item.classList.toggle('active', item.dataset.page === targetPage);
        });
    }

    // Tambahkan event listener untuk semua link navigasi
    pageLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Mencegah link pindah halaman secara default
            
            const targetPage = link.dataset.page;
            
            // Hentikan jika target halaman tidak ada/belum dibuat
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
});


// Fungsi untuk mengambil berita (dipisahkan agar lebih rapi)
function fetchNews() {
    const newsContainer = document.querySelector('.news-container');
    if (!newsContainer) return;

    newsContainer.innerHTML = ''; // Kosongkan kontainer

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
}
