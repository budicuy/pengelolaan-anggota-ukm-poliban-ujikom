# Dokumentasi Use Case Specification
## Aplikasi Pengelolaan Anggota UKM Politeknik Negeri Banjarmasin (POLIBAN)

Dokumen ini menjelaskan diagram dan spesifikasi kasus penggunaan (*Use Case*) sistem dengan berpusat pada satu aktor utama: **Administrator**.

---

## 👥 1. Identifikasi Aktor

| Nama Aktor | Deskripsi |
| :--- | :--- |
| **Administrator** | Aktor tunggal pengelola sistem yang memiliki otoritas penuh untuk mengelola data mahasiswa, data organisasi UKM, memproses pengajuan pendaftaran, mengelola daftar anggota aktif, mencari informasi, mencetak laporan, serta mengekspor data ke file CSV. |

---

## 🗺️ 2. Use Case Diagram (Mermaid)

Berikut adalah visualisasi hubungan antara aktor **Administrator** dengan seluruh fungsi (Use Case) di dalam sistem:

```mermaid
useCaseDiagram
    actor Administrator as "Administrator"

    rectangle "SIM UKM POLIBAN" {
        usecase UC1 as "UC-1: Login Sistem"
        usecase UC2 as "UC-2: Mengelola Mahasiswa (CRUD)"
        usecase UC3 as "UC-3: Mengelola UKM (CRUD)"
        usecase UC4 as "UC-4: Mengelola Pendaftaran Anggota"
        usecase UC5 as "UC-5: Mengelola Anggota UKM"
        usecase UC6 as "UC-6: Pencarian Data"
        usecase UC7 as "UC-7: Cetak Laporan (Print)"
        usecase UC8 as "UC-8: Ekspor CSV"
        usecase UC9 as "UC-9: Logout"
    }

    Administrator --> UC1
    Administrator --> UC2
    Administrator --> UC3
    Administrator --> UC4
    Administrator --> UC5
    Administrator --> UC6
    Administrator --> UC7
    Administrator --> UC8
    Administrator --> UC9
```

---

## 📝 3. Daftar Kasus Penggunaan (Use Case List)

| Kode UC | Nama Use Case | Deskripsi Singkat |
| :--- | :--- | :--- |
| **UC-1** | Login Sistem | Administrator masuk ke sistem menggunakan email dan password agar dapat mengakses dasbor utama. |
| **UC-2** | Mengelola Mahasiswa | Administrator menambah, melihat, memperbarui, dan menghapus data mahasiswa POLIBAN (NIM, Nama, Jurusan). |
| **UC-3** | Mengelola UKM | Administrator menambah, melihat, memperbarui, dan menghapus organisasi UKM (Kode UKM, Nama UKM). |
| **UC-4** | Mengelola Pendaftaran | Administrator mendaftarkan mahasiswa ke UKM atau memverifikasi (Setuju/Tolak) pendaftaran mahasiswa yang statusnya menunggu. |
| **UC-5** | Mengelola Anggota UKM | Administrator melihat daftar anggota aktif per UKM dan dapat mengeluarkan mahasiswa dari anggota UKM. |
| **UC-6** | Pencarian Data | Administrator menyaring data pada tabel Mahasiswa, UKM, Pendaftaran, atau Anggota secara real-time. |
| **UC-7** | Cetak Laporan (Print) | Administrator mencetak rekapitulasi data ke media fisik/kertas melalui fungsi cetak browser. |
| **UC-8** | Ekspor CSV | Administrator mengunduh file spreadsheet (.csv) rekapitulasi data untuk kebutuhan laporan dinas. |
| **UC-9** | Logout | Administrator keluar dari sesi sistem dan menghapus data otentikasi di penyimpanan lokal. |

---

## 📖 4. Detail Skenario Use Case Utama

### UC-1: Login Sistem
*   **Aktor**: Administrator
*   **Prasyarat**: Administrator berada di halaman masuk (*Login Page*).
*   **Kondisi Akhir**: Administrator masuk ke dasbor utama dan sesi disimpan di *localStorage*.
*   **Alur Utama (Skenario Sukses)**:
    1.  Administrator memasukkan alamat email (`admin@poliban.ac.id`) dan sandi (`admin123`).
    2.  Administrator mengklik tombol **Masuk**.
    3.  Sistem melakukan validasi akun ke database Neon PostgreSQL.
    4.  Sistem mendeteksi kecocokan akun, menyimpan sesi login ke penyimpanan browser lokal (*localStorage*), dan mengarahkan pengguna ke dasbor.
    5.  Sistem menampilkan notifikasi toast selamat datang.
*   **Alur Alternatif (Gagal)**:
    *   3a. Jika email atau sandi salah, sistem menampilkan pesan error `"Email atau kata sandi salah"`. Administrator tetap berada di halaman login.

---

### UC-2: Mengelola Mahasiswa (Tambah Data)
*   **Aktor**: Administrator
*   **Prasyarat**: Administrator sudah login dan berada di tab menu **Mahasiswa**.
*   **Kondisi Akhir**: Mahasiswa baru berhasil tersimpan ke database.
*   **Alur Utama**:
    1.  Administrator mengklik tombol **Tambah Mahasiswa**.
    2.  Sistem menampilkan formulir modal tambah mahasiswa.
    3.  Administrator mengisi **NIM**, **Nama Lengkap**, dan memilih **Jurusan**.
    4.  Administrator mengklik **Simpan Mahasiswa**.
    5.  Sistem memeriksa keunikan NIM di database.
    6.  Sistem menyimpan data baru ke database, menutup modal formulir, memperbarui tampilan tabel mahasiswa di dasbor, dan memunculkan toast sukses.
*   **Alur Alternatif (NIM Duplikat)**:
    *   5a. Jika NIM sudah terdaftar, sistem menggagalkan proses penyimpanan dan memunculkan pesan toast `"NIM sudah terdaftar"`.

---

### UC-4: Mengelola Pendaftaran Anggota (Persetujuan)
*   **Aktor**: Administrator
*   **Prasyarat**: Administrator sudah login, berada di tab menu **Pendaftaran**, dan terdapat data pendaftaran dengan status `Menunggu`.
*   **Kondisi Akhir**: Status pendaftaran berubah menjadi `Disetujui` dan mahasiswa otomatis terdaftar sebagai anggota UKM.
*   **Alur Utama**:
    1.  Administrator meninjau daftar pendaftaran baru di tabel.
    2.  Administrator mengklik tombol **Setujui** (ikon centang hijau) pada baris pendaftaran yang bersangkutan.
    3.  Sistem menjalankan transaksi atomic (Prisma `$transaction`):
        *   Mengubah status pendaftaran menjadi `Disetujui`.
        *   Mengecek apakah mahasiswa sudah tergabung di UKM lain (jika sudah, transaksi dibatalkan).
        *   Membuat baris data baru pada tabel `Anggota`.
    4.  Sistem memperbarui antarmuka pendaftaran dan daftar anggota, serta memunculkan toast persetujuan sukses.

---

### UC-8: Ekspor CSV (Excel)
*   **Aktor**: Administrator
*   **Prasyarat**: Administrator berada di salah satu tab menu manajemen data (misal: Mahasiswa).
*   **Kondisi Akhir**: File CSV berisi rekapitulasi data terunduh ke komputer lokal.
*   **Alur Utama**:
    1.  Administrator mengklik tombol **Excel** di pojok kanan atas tabel.
    2.  Sistem membaca seluruh data list yang sedang ditampilkan di state memori.
    3.  Sistem menyusun header dan baris data ke format teks CSV yang bersih dari kolom kelas/email.
    4.  Sistem membungkus data tersebut ke URI biner dan memicu pengunduhan file otomatis di browser dengan nama file berformat `data-[menu]-[tanggal].csv`.
