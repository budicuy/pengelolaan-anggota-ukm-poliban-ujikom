# Dokumentasi Pengujian Black Box (Black-Box Testing)
## Aplikasi Pengelolaan Anggota UKM Politeknik Negeri Banjarmasin (POLIBAN)

Dokumen ini mencatat hasil pengujian fungsionalitas sistem menggunakan metode *Black-Box Testing*. Pengujian difokuskan pada fungsionalitas luar sistem tanpa melihat kode internal, guna memastikan semua kebutuhan fungsional berjalan sesuai spesifikasi.

---

## 📊 Tabel Hasil Pengujian Black-Box

| NO | Kebutuhan fungsional yang di uji | Keterangan (Berhasil / tidak) |
| :--- | :--- | :--- |
| 1 | **Login dan autentikasi**<br>• Melakukan masuk sistem (*login*) menggunakan email administrator (`admin@poliban.ac.id`) dan password (`admin123`).<br>• Validasi kesalahan input email/password.<br>• Menyimpan status login di `localStorage` agar tidak keluar saat halaman di-refresh. | **Berhasil** |
| 2 | **Manajemen Data Mahasiswa**<br>• Menampilkan list data mahasiswa resmi dari database Neon.<br>• Menambahkan mahasiswa baru (input NIM, Nama Lengkap, Jurusan).<br>• Memvalidasi agar NIM tidak boleh duplikat.<br>• Mengubah data nama dan jurusan mahasiswa.<br>• Menghapus data mahasiswa. | **Berhasil** |
| 3 | **Manajemen Unit Kegiatan Mahasiswa**<br>• Menampilkan list data organisasi UKM.<br>• Menambahkan UKM baru (input Kode UKM, Nama UKM).<br>• Memvalidasi agar Kode UKM tidak boleh duplikat.<br>• Mengubah data nama UKM.<br>• Menghapus data organisasi UKM. | **Berhasil** |
| 4 | **Pendaftaran Anggota UKM**<br>• Mendaftarkan mahasiswa ke salah satu UKM aktif.<br>• Memvalidasi agar mahasiswa yang belum terdaftar tidak bisa didaftarkan.<br>• Memvalidasi agar mahasiswa yang sudah aktif di UKM lain tidak bisa mendaftar lagi.<br>• Memvalidasi status pendaftaran awal adalah `Menunggu`.<br>• Menyetujui (*Approve*) atau Menolak (*Reject*) pendaftaran. | **Berhasil** |
| 5 | **Manajemen Anggota UKM**<br>• Menampilkan list anggota resmi per UKM secara detail.<br>• Mengeluarkan mahasiswa dari keanggotaan UKM (*delete membership*). | **Berhasil** |
| 6 | **Fitur Pencarian**<br>• Mencari data mahasiswa berdasarkan NIM, Nama, atau Jurusan secara real-time.<br>• Mencari data organisasi UKM berdasarkan Kode atau Nama UKM.<br>• Mencari data pendaftaran berdasarkan status atau nama mahasiswa/UKM.<br>• Mencari data anggota aktif. | **Berhasil** |
| 7 | **Fitur Cetak Laporan PDF**<br>• Mencetak halaman tabel/laporan rekapitulasi data menggunakan tata letak cetak ramah kertas (*print preview* browser).<br>• Menyimpan cetakan secara langsung ke format file PDF. | **Berhasil** |
| 8 | **Fitur Export ke Excel**<br>• Mengunduh (*export*) seluruh tabel data (mahasiswa, UKM, pendaftaran, atau anggota aktif) ke format spreadsheet (.csv/Excel).<br>• Memastikan file CSV yang diunduh terformat dengan rapi dan tidak mengandung kolom kelas/email mahasiswa yang sudah dihapus. | **Berhasil** |
