import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    // Vercel akan otomatis mengambil [id] dari URL
    const id = searchParams.get('id');

    if (!id) {
      return res.status(400).json({ message: 'ID Berita diperlukan.' });
    }

    const { rows } = await sql`
      SELECT * FROM berita WHERE id = ${id};
    `;

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Berita tidak ditemukan.' });
    }

    return res.status(200).json(rows[0]);

  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ message: 'Gagal mengambil data berita.' });
  }
}
