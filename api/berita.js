import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const limit = searchParams.get('limit');

    let query = 'SELECT * FROM berita ORDER BY created_at DESC';
    
    if (limit) {
      query += ` LIMIT ${parseInt(limit, 10)}`;
    }

    const { rows: berita } = await sql.query(query);

    return res.status(200).json(berita);

  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ message: 'Gagal mengambil data dari database' });
  }
}
