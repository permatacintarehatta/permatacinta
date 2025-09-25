// File: api/berita.js

// Handler utama yang akan dieksekusi Vercel
export default function handler(req, res) {
  // Data berita (nantinya bisa diambil dari database)
  const berita = [
    {
      id: 1,
      judul: "Kegiatan Akreditasi Rumah Sakit",
      gambar: "https://via.placeholder.com/200x120?text=Akreditasi"
    },
    {
      id: 2,
      judul: "Sosialisasi Keselamatan Pasien",
      gambar: "https://via.placeholder.com/200x120?text=Sosialisasi"
    },
    {
      id: 3,
      judul: "Pelatihan Peningkatan Kompetensi Staf",
      gambar: "https://via.placeholder.com/200x120?text=Pelatihan"
    },
    {
      id: 4,
      judul: "Jadwal Baru Layanan Poliklinik",
      gambar: "https://via.placeholder.com/200x120?text=Jadwal+Poli"
    },
    {
        id: 5,
        judul: "Peringatan Hari Kesehatan Nasional",
        gambar: "https://via.placeholder.com/200x120?text=HKN"
    }
  ];

  // Mengatur header respons sebagai JSON
  res.setHeader('Content-Type', 'application/json');
  // Mengirim data berita dengan status 200 (OK)
  res.status(200).json(berita);
}
