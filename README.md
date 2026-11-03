# Iron Teknik Penawaran - Android

Aplikasi Android offline untuk membuat surat penawaran Iron Teknik tanpa membuka link atau membutuhkan koneksi internet.

## Nama aplikasi

**Iron Teknik Penawaran**

Nama ini dipilih agar mudah ditemukan setelah instalasi dengan pencarian `Iron`, `Teknik`, atau `Penawaran` pada launcher Android.

## Fitur

- Berjalan offline melalui WebView lokal.
- Data Surat terpisah dari Input Barang dan Data Barang.
- Default data lama tetap tersedia: PT. COMETA CAN, alamat, BCA, nomor rekening, serta Heri Widodo.
- Data tersimpan lokal menggunakan `localStorage` WebView.
- PDF dibuat offline dan disimpan ke `Download/Iron Teknik`.
- Launcher icon khusus aplikasi surat penawaran.
- Splash screen dengan logo Iron Teknik dan animasi fade/scale.
- Tidak meminta akses internet.

## Build

Project menggunakan Java 17, Android Gradle Plugin 8.7.3, Gradle 8.9, compileSdk/targetSdk 35 dan minSdk 29 (Android 10).

Buka root repository branch `apk` dengan Android Studio, lalu build APK dari menu **Build > Build APK(s)**.

## GitHub Actions

Setiap push ke branch `apk` menjalankan workflow **Build Android APK**. APK debug dapat diunduh dari artifact bernama **Iron-Teknik-Penawaran-APK** pada workflow run yang berhasil.
