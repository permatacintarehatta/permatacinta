import { put } from '@vercel/blob';
import formidable from 'formidable';
import fs from 'fs';
import sharp from 'sharp';

// Konfigurasi penting untuk menonaktifkan body parser bawaan Vercel.
// Ini diperlukan agar formidable bisa menangani file upload.
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const form = formidable({});
    
    // Menggunakan Promise agar bisa memakai async/await dengan formidable
    const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            resolve([fields, files]);
        });
    });

    const file = files.thumbnail[0];

    if (!file) {
      return res.status(400).json({ message: 'Tidak ada file yang diupload.' });
    }

    // Baca file dari path sementara tempat ia disimpan
    const fileBuffer = fs.readFileSync(file.filepath);

    // Proses gambar menggunakan Sharp
    const processedBuffer = await sharp(fileBuffer)
      .resize({ width: 1200, withoutEnlargement: true }) // Ubah lebar max 1200px, jangan perbesar jika lebih kecil
      .webp({ quality: 80 }) // Konversi ke format WebP dengan kualitas 80%
      .toBuffer();

    // Buat nama file yang unik
    const filename = `berita-${Date.now()}.webp`;

    // Upload buffer gambar yang sudah diproses ke Vercel Blob
    const blob = await put(filename, processedBuffer, {
      access: 'public',
      contentType: 'image/webp',
    });

    // Kirim kembali URL gambar yang sudah tersimpan di Vercel Blob
    return res.status(200).json({ url: blob.url });

  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({ message: 'Gagal mengupload gambar.' });
  }
}
