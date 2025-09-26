window.addEventListener('DOMContentLoaded', () => {
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

function fetchNews() { /* (Tidak ada perubahan) */ }
function setupPageNavigation(navigateTo, updateActiveNav) { /* (Tidak ada perubahan) */ }
function setupAdminAuth(navigateTo) { /* (Tidak ada perubahan) */ }

// REVISI DI FUNGSI INI
function setupBeritaForm() {
    const beritaForm = document.getElementById('berita-form');
    const thumbnailInput = document.getElementById('thumbnail');
    const thumbnailPreview = document.getElementById('thumbnail-preview');
    const submitButton = beritaForm.querySelector('button[type="submit"]');

    if (!beritaForm || !thumbnailInput || !thumbnailPreview || !submitButton) return;

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
            // 1. Dapatkan data dari form
            const judul = document.getElementById('judul').value;
            const isi = document.getElementById('isi').value;
            const file = thumbnailInput.files[0];

            if (!file) {
                throw new Error('Gambar thumbnail harus dipilih.');
            }

            // 2. Upload gambar terlebih dahulu
            const formData = new FormData();
            formData.append('thumbnail', file);

            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error('Gagal mengupload gambar.');
            }
            const uploadResult = await uploadResponse.json();
            const thumbnailUrl = uploadResult.url;


            // 3. Simpan data berita (termasuk URL gambar) ke database
            const beritaData = { judul, isi, thumbnailUrl };

            const saveResponse = await fetch('/api/berita/tambah', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(beritaData),
            });

            if (!saveResponse.ok) {
                throw new Error('Gagal menyimpan data berita.');
            }

            // 4. Proses berhasil
            alert('Berita berhasil disimpan!');
            beritaForm.reset(); // Kosongkan form
            thumbnailPreview.classList.add('hidden'); // Sembunyikan preview
            
            // Pindahkan pengguna kembali ke dashboard admin
            document.querySelector('.page-link[data-page="admin-page"]').click();

        } catch (error) {
            console.error('Submit Error:', error);
            alert(`Terjadi kesalahan: ${error.message}`);
        } finally {
            // Kembalikan tombol ke keadaan semula, baik berhasil maupun gagal
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });
}
