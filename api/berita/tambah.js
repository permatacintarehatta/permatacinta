import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { judul, isi, thumbnailUrl } = req.body;

    // Validasi sederhana
    if (!judul || !isi || !thumbnailUrl) {
      return res.status(400).json({ message: 'Judul, isi, dan thumbnail URL harus diisi.' });
    }

    // Simpan data ke database
    await sql`
      INSERT INTO berita (judul, isi, thumbnail_url)
      VALUES (${judul}, ${isi}, ${thumbnailUrl});
    `;

    return res.status(201).json({ message: 'Berita berhasil disimpan!' });

  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ message: 'Gagal menyimpan data ke database.' });
  }
}
