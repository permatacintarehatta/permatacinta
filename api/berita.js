import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    // Menjalankan perintah SQL untuk mengambil semua data dari tabel 'berita'
    // Diurutkan berdasarkan tanggal dibuat, yang terbaru paling atas.
    const { rows: berita } = await sql`
      SELECT * FROM berita 
      ORDER BY created_at DESC;
    `;

    // Mengirim data yang berhasil diambil dari database sebagai respons
    return res.status(200).json(berita);

  } catch (error) {
    // Jika terjadi error saat koneksi atau query database
    console.error('Database Error:', error);
    return res.status(500).json({ message: 'Gagal mengambil data dari database' });
  }
}
