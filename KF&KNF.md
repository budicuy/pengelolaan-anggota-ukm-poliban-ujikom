# Dokumentasi Kebutuhan Fungsional (KF) & KFN (Kebutuhan Non-Fungsional)
## Aplikasi Pengelolaan Anggota UKM Politeknik Negeri Banjarmasin (POLIBAN)

Dokumen ini menjelaskan spesifikasi kebutuhan sistem untuk Aplikasi Pengelolaan Anggota Unit Kegiatan Mahasiswa (SIM UKM) POLIBAN. Dokumen ini disesuaikan dengan revisi terbaru (penghapusan kolom `kelas` dan `email` pada data mahasiswa, serta penghapusan kategori & dosen pembina pada data UKM).

---

## 📋 1. Kebutuhan Fungsional (KF)

Kebutuhan fungsional mendefinisikan layanan atau fungsi spesifik yang harus disediakan oleh aplikasi.

### KF-1: Sistem Otentikasi & Akun Tunggal (Single Role)
*   **KF-1.1**: Sistem harus menyediakan halaman masuk (*Login*) dengan menggunakan alamat email dan kata sandi (*password*).
*   **KF-1.2**: Sistem hanya memiliki peran tunggal yaitu **Administrator** yang memegang kontrol penuh atas semua menu (Mahasiswa, UKM, Pendaftaran, dan Anggota).

### KF-2: Manajemen Data Mahasiswa (CRUD)
*   **KF-2.1**: Sistem harus dapat menampilkan daftar mahasiswa resmi POLIBAN.
*   **KF-2.2**: Sistem harus dapat menambahkan data mahasiswa baru dengan atribut:
    *   **NIM** (Nomor Induk Mahasiswa - sebagai Primary Key unik).
    *   **Nama Lengkap**.
    *   **Jurusan** (Teknik Informatika, Teknik Elektro, Akuntansi, Administrasi Bisnis, Teknik Sipil, Teknik Mesin).
*   **KF-2.3**: Sistem harus dapat memperbarui nama lengkap dan jurusan mahasiswa yang sudah terdaftar. NIM tidak dapat diubah setelah disimpan.
*   **KF-2.4**: Sistem harus dapat menghapus data mahasiswa secara aman (menghapus data terkait secara *cascade* pada tabel relasional seperti pendaftaran dan anggota).

### KF-3: Manajemen Unit Kegiatan Mahasiswa (UKM)
*   **KF-3.1**: Sistem harus dapat menampilkan daftar organisasi UKM POLIBAN resmi.
*   **KF-3.2**: Sistem harus dapat mendaftarkan UKM baru dengan atribut:
    *   **Kode UKM** (Primary Key unik, contoh: `UKM-001`).
    *   **Nama UKM**.
*   **KF-3.3**: Sistem harus dapat memperbarui data nama UKM. Kode UKM bersifat permanen dan tidak dapat diubah.
*   **KF-3.4**: Sistem harus dapat menghapus data UKM.

### KF-4: Proses Pendaftaran Anggota Baru
*   **KF-4.1**: Sistem harus menyediakan fungsi pengajuan pendaftaran mahasiswa ke salah satu UKM.
*   **KF-4.2**: Sistem harus menerapkan validasi transaksional:
    *   Hanya mahasiswa yang **terdaftar resmi** di sistem yang bisa didaftarkan.
    *   **Aturan Satu Mahasiswa Satu UKM**: Sistem harus memvalidasi agar satu mahasiswa tidak dapat diterima di lebih dari satu UKM aktif (relasi 1-to-1 di tingkat data Anggota).
*   **KF-4.3**: Pendaftaran anggota baru memiliki status awal `Menunggu` persetujuan.
*   **KF-4.4**: Administrator dapat memverifikasi status pendaftaran dengan opsi:
    *   `Disetujui`: Sistem secara otomatis memasukkan mahasiswa tersebut ke tabel `Anggota` (relasi atomic).
    *   `Ditolak`: Pendaftaran diarsipkan dengan status ditolak tanpa dimasukkan ke tabel Anggota.

### KF-5: Manajemen Anggota UKM
*   **KF-5.1**: Sistem harus menampilkan daftar anggota resmi masing-masing UKM beserta tanggal pendaftarannya.
*   **KF-5.2**: Administrator dapat menghapus anggota dari organisasi (mengeluarkan anggota).

### KF-6: Fitur Pencarian Data
*   **KF-6.1**: Sistem harus menyediakan kotak pencarian global pada setiap tabel data.
*   **KF-6.2**: Pencarian pada menu Mahasiswa harus menyaring data berdasarkan kecocokan NIM, Nama, atau Jurusan secara *real-time*.

### KF-7: Cetak Laporan (Print Data)
*   **KF-7.1**: Sistem harus menyediakan fungsi cetak data (*Print Layout*) yang ramah kertas untuk mencetak rekapitulasi data mahasiswa, UKM, pendaftaran, maupun daftar anggota.

### KF-8: Ekspor Data ke Excel/CSV
*   **KF-8.1**: Sistem harus menyediakan tombol ekspor data instan ke format file spreadsheet (`.csv`) untuk seluruh data rekapitulasi guna keperluan pelaporan eksternal.

---

## ⚡ 2. Kebutuhan Non-Fungsional (KFN)

Kebutuhan non-fungsional mendefinisikan aspek kualitas, batasan teknis, dan standar kinerja sistem.

### KFN-1: Antarmuka & Estetika Visual (Usability)
*   **KFN-1.1**: Sistem harus menggunakan desain antarmuka warna terang (*light theme*) dengan aksen **gradasi merah-oranye-amber** yang modern.
*   **KFN-1.2**: Sistem harus sepenuhnya responsif (*mobile-friendly*) untuk akses optimal dari ponsel pintar, tablet, maupun desktop.
*   **KFN-1.3**: Elemen tombol dan interaksi harus memiliki animasi mikro (*transition* & *hover effects*) untuk meningkatkan keintiman pengguna.

### KFN-2: Kinerja & Efisiensi (Performance)
*   **KFN-2.1**: Waktu muat halaman pertama (*first page load*) tidak boleh lebih dari 2 detik pada koneksi internet standar.
*   **KFN-2.2**: Pengambilan data dari Neon PostgreSQL menggunakan Prisma client harus dioptimalkan untuk meminimalkan *cold start* serverless database.
*   **KFN-2.3**: Pencarian data pada tabel harus diproses secara instan (*real-time filtering* di sisi klien).

### KFN-3: Keamanan Data & Sistem (Security)
*   **KFN-3.1**: Akses ke dasbor utama harus dilindungi oleh otentikasi sesi login; pengguna yang belum masuk harus diarahkan kembali ke halaman Login.
*   **KFN-3.2**: Kata sandi pengguna harus terlindungi secara aman (tidak diekspos di sisi browser klien).
*   **KFN-3.3**: Penghapusan data penting harus dikonfirmasi terlebih dahulu melalui kotak dialog (*confirmation dialog*) untuk mencegah kehilangan data tidak sengaja.

### KFN-4: Ketersediaan & Skalabilitas (Reliability & Scalability)
*   **KFN-4.1**: Sistem dibangun menggunakan arsitektur serverless (Next.js App Router & Neon DB) untuk memastikan skalabilitas otomatis saat terjadi lonjakan trafik pendaftaran anggota baru.
*   **KFN-4.2**: Penggunaan ORM Prisma harus menjamin konsistensi transaksi (atomic transaction) saat melakukan persetujuan anggota baru untuk menghindari inkonsistensi data relasional.
