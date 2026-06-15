# Generator Surat Penawaran Barang

Aplikasi web statis sederhana untuk membuat surat penawaran harga seperti template IRON TEKNIK.

## Fitur

- Input nama barang
- Input jumlah
- Input satuan
- Input harga satuan
- Input harga jasa per item secara opsional
- Harga jasa dihitung per jumlah item
- Tanggal otomatis mengikuti tanggal hari ini
- Total otomatis
- Cetak atau simpan sebagai PDF melalui fitur print browser
- Bisa deploy langsung ke GitHub Pages

## Rumus Perhitungan

Jika item memiliki jasa:

```text
Total per item = (Harga Satuan x Jumlah) + (Harga Jasa x Jumlah)
```

Contoh:

```text
Jumlah = 2
Harga Satuan = 50.000
Harga Jasa = 25.000
Total = (50.000 x 2) + (25.000 x 2) = 150.000
```

## Cara Menjalankan Lokal

Cukup buka file `index.html` di browser.

## Cara Deploy ke GitHub Pages

1. Buat repository baru di GitHub.
2. Upload semua file: `index.html`, `style.css`, `script.js`, dan `README.md`.
3. Masuk ke menu **Settings** repository.
4. Pilih **Pages**.
5. Pada bagian **Build and deployment**, pilih branch `main` dan folder `/root`.
6. Simpan, lalu buka link GitHub Pages yang muncul.

## Catatan

Aplikasi ini tidak membutuhkan backend dan tidak membutuhkan database. Data barang sementara disimpan di browser menggunakan `localStorage`.
