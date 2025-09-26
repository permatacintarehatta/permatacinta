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
            if (item.dataset.page) {
                item.classList.toggle('active', item.dataset.page === targetPage);
            }
        });
    }


    // =========================================================================
    // 2. DEFINISI FUNGSI SETUP MODUL
    // =========================================================================

    function fetchHomepageNews() {
        const newsContainer = document.querySelector('.news-container');
        if (!newsContainer) return;
        newsContainer.innerHTML = ''; 
        fetch('/api/berita?limit=7')
            .then(response => response.json())
            .then(data => {
                if (!Array.isArray(data)) throw new Error('Format data berita salah.');
                data.forEach(berita => {
                    const newsCard = document.createElement('div');
                    newsCard.className = 'news-card';
                    newsCard.dataset.id = berita.id;
                    newsCard.innerHTML = `<img src="${berita.thumbnail_url}" alt="${berita.judul}"><h3>${berita.judul}</h3>`;
                    newsContainer.appendChild(newsCard);
                });
            })
            .catch(error => {
                console.error('Error fetching homepage news:', error);
                newsContainer.innerHTML = '<p>Gagal memuat berita.</p>';
            });
    }
    
    async function fetchAllNews() {
        const container = document.getElementById('semua-berita-container');
        if (!container) return;
        container.innerHTML = '<p>Memuat berita...</p>';
        try {
            const response = await fetch('/api/berita');
            if (!response.ok) throw new Error('Gagal mengambil data.');
            const data = await response.json();
            if (!Array.isArray(data)) throw new Error('Format data salah.');
            container.innerHTML = ''; 
            data.forEach(berita => {
                const newsCard = document.createElement('div');
                newsCard.className = 'news-card';
                newsCard.dataset.id = berita.id;
                newsCard.innerHTML = `
                    <img src="${berita.thumbnail_url}" alt="${berita.judul}">
                    <h3>${berita.judul}</h3>
                `;
                container.appendChild(newsCard);
            });
        } catch (error) {
            console.error('Error fetching all news:', error);
            container.innerHTML = '<p>Gagal memuat semua berita.</p>';
        }
    }

    async function fetchSingleNews(id) {
        const container = document.getElementById('baca-berita-container');
        if (!container) return;
        container.innerHTML = '<p>Memuat artikel...</p>';
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
                if (targetPage === 'semua-berita-page') {
                    fetchAllNews();
                }
                navigateTo(targetPage);
                updateActiveNav(targetPage);
            });
        });
    }

    function setupNewsClickListeners() {
        document.body.addEventListener('click', (e) => {
            const newsCard = e.target.closest('.news-card[data-id]');
            if (newsCard && newsCard.dataset.id) {
                e.preventDefault();
                const articleId = newsCard.dataset.id;
                previousPage = document.querySelector('.page:not(.hidden)').id;
                fetchSingleNews(articleId);
                navigateTo('baca-berita-page');
            }
        });
        const backButton = document.getElementById('back-from-article-button');
        if(backButton) {
            backButton.addEventListener('click', () => {
                navigateTo(previousPage);
            });
        }
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
        closeBtn.addEventListener('click', () => { pinPopup.classList.add('hidden'); });
        pinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (pinInput.value === correctPin) {
                pinPopup.classList.add('hidden');
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
        if (!beritaForm) return;
        const thumbnailInput = document.getElementById('thumbnail');
        const thumbnailPreview = document.getElementById('thumbnail-preview');
        const submitButton = beritaForm.querySelector('button[type="submit"]');
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
        beritaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = 'Menyimpan...';
            try {
                const judul = document.getElementById('judul').value;
                const isi = document.getElementById('isi').value;
                const file = thumbnailInput.files[0];
                if (!file) throw new Error('Gambar thumbnail harus dipilih.');
                const formData = new FormData();
                formData.append('thumbnail', file);
                const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
                if (!uploadResponse.ok) throw new Error('Gagal mengupload gambar.');
                const uploadResult = await uploadResponse.json();
                const thumbnailUrl = uploadResult.url;
                const beritaData = { judul, isi, thumbnailUrl };
                const saveResponse = await fetch('/api/berita/tambah', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(beritaData) });
                if (!saveResponse.ok) throw new Error('Gagal menyimpan data berita.');
                alert('Berita berhasil disimpan!');
                beritaForm.reset(); 
                thumbnailPreview.classList.add('hidden'); 
                navigateTo('admin-page');
                fetchHomepageNews();
            } catch (error) {
                console.error('Submit Error:', error);
                alert(`Terjadi kesalahan: ${error.message}`);
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        });
    }


    // =========================================================================
    // 3. INISIALISASI APLIKASI
    // =========================================================================
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('ServiceWorker registration successful'))
            .catch(err => console.log('ServiceWorker registration failed:', err));
    }
    
    fetchHomepageNews();
    setupPageNavigation();
    setupAdminAuth();
    setupBeritaForm();
    setupNewsClickListeners();

    // PERBAIKAN: Mengganti 'berita-page' menjadi 'beranda-page'
    navigateTo('beranda-page');
});
