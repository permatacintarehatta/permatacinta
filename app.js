window.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. DEKLARASI FUNGSI HELPER UTAMA & VARIABEL GLOBAL
    // =========================================================================
    const pages = document.querySelectorAll('.page');
    const navItems = document.querySelectorAll('.nav-item');
    let previousPage = 'beranda-page'; // Untuk tombol kembali

    // Fungsi untuk menampilkan halaman yang dipilih dan menyembunyikan yang lain
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


    // =========================================================================
    // 2. DEFINISI FUNGSI SETUP MODUL
    // =========================================================================

    // Mengambil 7 berita terbaru untuk Beranda
    function fetchHomepageNews() {
        const newsContainer = document.querySelector('.news-container');
        if (!newsContainer) return;

        newsContainer.innerHTML = ''; 

        fetch('/api/berita?limit=7')
            .then(response => response.json())
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error('Format data berita salah.');
                }
                data.forEach(berita => {
                    const newsCard = document.createElement('div');
                    newsCard.className = 'news-card';
                    newsCard.dataset.id = berita.id; // Tambahkan ID untuk bisa diklik
                    newsCard.innerHTML = `<img src="${berita.thumbnail_url}" alt="${berita.judul}"><h3>${berita.judul}</h3>`;
                    newsContainer.appendChild(newsCard);
                });
            })
            .catch(error => {
                console.error('Error fetching homepage news:', error);
                newsContainer.innerHTML = '<p>Gagal memuat berita.</p>';
            });
    }

    // Mengambil semua berita untuk halaman "Semua Berita"
    async function fetchAllNews() {
        const container = document.getElementById('semua-berita-container');
        if (!container) return;
        container.innerHTML = '<p>Memuat berita...</p>'; // Tampilkan pesan loading

        try {
            const response = await fetch('/api/berita');
            const data = await response.json();
            if (!Array.isArray(data)) throw new Error('Format data salah.');

            container.innerHTML = ''; // Kosongkan container setelah data diterima
            data.forEach(berita => {
                const listItem = document.createElement('a');
                listItem.className = 'list-item';
                listItem.href = '#';
                listItem.dataset.id = berita.id; // Tambahkan ID
                listItem.innerHTML = `
                    <img src="${berita.thumbnail_url}" class="list-item-thumbnail">
                    <div class="text">
                        <h3>${berita.judul}</h3>
                        <p>${new Date(berita.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <span class="material-symbols-outlined chevron">chevron_right</span>
                `;
                container.appendChild(listItem);
            });
        } catch (error) {
            console.error('Error fetching all news:', error);
            container.innerHTML = '<p>Gagal memuat semua berita.</p>';
        }
    }

    // Mengambil dan menampilkan satu artikel berita
    async function fetchSingleNews(id) {
        const container = document.getElementById('baca-berita-container');
        if (!container) return;
        container.innerHTML = '<p>Memuat artikel...</p>'; // Pesan loading

        try {
            const response = await fetch(`/api/berita/${id}`);
            if (!response.ok) throw new Error('Artikel tidak ditemukan.');
            const berita = await response.json();

            const formattedDate = new Date(berita.created_at).toLocaleDateString('id-ID', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            });

            container.innerHTML = `
                <img src="${berita.thumbnail_url}" alt="${berita.judul}" class="article-image">
                <h1 class="article-title">${berita.judul}</h1>
                <p class="article-date">${formattedDate}</p>
                <div class="article-content">${berita.isi}</div>
            `;
        } catch (error) {
            console.error('Error fetching single news:', error);
            container.innerHTML = `<p>Gagal memuat artikel. ${error.message}</p>`;
        }
    }


    function setupPageNavigation() {
        const pageLinks = document.querySelectorAll('.page-link');

        pageLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault(); 
                const targetPage = link.dataset.page;
                
                if (!document.getElementById(targetPage)) {
                    console.warn(`Halaman "${targetPage}" belum dibuat.`);
                    return;
                }
                
                // Jika target adalah halaman 'semua-berita', panggil fungsinya
                if (targetPage === 'semua-berita-page') {
                    fetchAllNews();
                }

                navigateTo(targetPage);
                updateActiveNav(targetPage);
            });
        });
    }

    function setupNewsClickListeners() {
        // Event listener untuk semua kartu berita (di Beranda atau di halaman Semua Berita)
        document.body.addEventListener('click', (e) => {
            // .closest mencari elemen terdekat yang cocok dengan selector
            const newsCard = e.target.closest('.news-card, .list-item[data-id]');
            
            if (newsCard && newsCard.dataset.id) {
                e.preventDefault();
                const articleId = newsCard.dataset.id;
                // Simpan halaman saat ini sebagai halaman sebelumnya
                previousPage = document.querySelector('.page:not(.hidden)').id;
                
                fetchSingleNews(articleId);
                navigateTo('baca-berita-page');
            }
        });

        // Event listener untuk tombol kembali di halaman artikel
        const backButton = document.getElementById('back-from-article-button');
        if(backButton) {
            backButton.addEventListener('click', () => {
                navigateTo(previousPage); // Kembali ke halaman yang tersimpan
            });
        }
    }

    function setupAdminAuth() { /* (Fungsi ini tetap sama, tidak ada perubahan) */ }
    function setupBeritaForm() { /* (Fungsi ini tetap sama, tidak ada perubahan) */ }


    // =========================================================================
    // 3. INISIALISASI APLIKASI
    // =========================================================================
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('ServiceWorker registration successful'))
            .catch(err => console.log('ServiceWorker registration failed:', err));
    }
    
    // Panggil semua fungsi setup
    fetchHomepageNews();
    setupPageNavigation();
    setupAdminAuth();
    setupBeritaForm();
    setupNewsClickListeners();

    // Tampilkan halaman Beranda saat pertama kali dimuat
    navigateTo('beranda-page');
});
