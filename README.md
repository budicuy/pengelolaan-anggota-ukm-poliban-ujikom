# Aplikasi Pengelolaan Anggota UKM Politeknik Negeri Banjarmasin (POLIBAN)

Sistem Informasi Manajemen Unit Kegiatan Mahasiswa (SIM UKM) POLIBAN dirancang untuk menyelesaikan pencatatan mahasiswa, pendaftaran anggota baru, pengelolaan organisasi UKM, dan pelaporan laporan resmi secara digital.

Aplikasi ini dibangun menggunakan **Next.js 16 (App Router)**, **Tailwind CSS v4**, **Prisma ORM**, dan **Neon PostgreSQL Database (Serverless)**.

---

## 🎨 Desain Estetika & Tema
Sistem ini menggunakan antarmuka **warna terang (light theme)** yang bersih dengan aksen **gradasi merah-oranye-amber** yang modern, dinamis, dan responsif.
- Panel Login kiri menampilkan visual branding aktivitas kemahasiswaan dengan overlay gradasi merah-jingga yang estetik.
- Dashboard menggunakan skema visual berbasis kartu (*cards*) berwarna putih bersih, bayangan melayang lembut (*drop shadows*), dan ikon dari library `lucide-react`.

---

## 💾 Struktur Database Relasional (Prisma + Neon DB)
Sistem memiliki 1 tabel pengguna (`User`) untuk authentikasi login dan 4 tabel data utama yang saling berelasi kuat:

```mermaid
erDiagram
    USER {
        string id PK
        string name
        string email UK
        string password
        string role
    }
    MAHASISWA {
        string nim PK
        string nama
        string jurusan
    }
    UKM {
        string id PK
        string nama
    }
    PENDAFTARAN {
        string id PK
        string mahasiswaNim FK
        string ukmId FK
        date tanggalDaftar
        string status
    }
    ANGGOTA {
        string id PK
        string mahasiswaNim FK "Unique (1-to-1)"
        string ukmId FK
        date tanggalBergabung
    }

    MAHASISWA ||--o| ANGGOTA : "1-to-1 (Aturan PRD 7)"
    MAHASISWA ||--o{ PENDAFTARAN : "1-to-Many"
    UKM ||--o{ ANGGOTA : "1-to-Many"
    UKM ||--o{ PENDAFTARAN : "1-to-Many"
```

### Rincian Tabel:
1. **`User`**: Menyimpan kredensial akun untuk login administrator, wakil direktur, kabag akademik, dan ketua UKM.
2. **`Mahasiswa`**: Basis data mahasiswa resmi yang terdaftar di Politeknik.
3. **`UKM`**: Daftar Unit Kegiatan Mahasiswa yang aktif dan diakui.
4. **`Pendaftaran`**: Menyimpan pengajuan permohonan gabung UKM oleh mahasiswa dengan status `Menunggu`, `Disetujui`, atau `Ditolak`.
5. **`Anggota`**: Tabel persatuan anggota resmi. Relasi `mahasiswaNim` bersifat `@unique` (1-to-1 dengan Mahasiswa) untuk menjamin aturan PRD-7: **1 mahasiswa hanya bisa tergabung dalam maksimal 1 UKM**.

---

## 🔑 Akun Uji Coba (Seeder Credentials)
Setelah menjalankan seeder, Anda dapat mengetik manual kredensial berikut untuk menguji pembagian hak akses (role-based access) sesuai aturan PRD:

| Peran (Role) | Email | Sandi | Otoritas Hak Akses |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@poliban.ac.id` | `admin123` | **Akses Penuh**: Kelola penuh Mahasiswa, UKM, Pendaftaran, dan Anggota. |
| **Wakil Direktur 3** | `wadir3@poliban.ac.id` | `wadir3123` | **Mahasiswa & UKM**: Pendaftaran & kelola mahasiswa/UKM. (Tidak akses menu Anggota). |
| **Kabag Akademik** | `kabag.akademik@poliban.ac.id` | `kabag123` | **Mahasiswa & UKM**: Pendaftaran & kelola mahasiswa/UKM. (Tidak akses menu Anggota). |
| **Ketua UKM** | `ketuaukm@poliban.ac.id` | `ukm123` | **Pendaftaran & Anggota**: Verifikasi persetujuan (Setuju/Tolak) pendaftaran anggota baru. |

---

## 🚀 Panduan Memulai & Instalasi

### 1. Kloning dan Instal Dependensi
Pastikan Anda menggunakan package manager `bun` atau `npm` untuk menginstal seluruh pustaka pendukung:
```bash
bun install
# atau
npm install
```

### 2. Konfigurasi Variabel Lingkungan (.env)
Pastikan berkas `.env` di direktori root sudah terisi dengan `DATABASE_URL` Neon PostgreSQL:
```env
DATABASE_URL=postgresql://neondb_owner:npg_g1rJKZsla3LU@ep-steep-frog-ao99iks9-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 3. Sinkronisasi Database (Prisma Push)
Jalankan perintah berikut untuk mensinkronkan model skema prisma dengan Neon Database Anda:
```bash
npx prisma db push
```

### 4. Jalankan Seeder Database
Populasikan database dengan data master uji coba (Akun User, Mahasiswa, UKM, Pendaftaran, dan Anggota) dengan perintah:
```bash
npx prisma db seed
```

### 5. Jalankan Server Pengembangan
Nyalakan server lokal Next.js Anda:
```bash
bun run dev
# atau
npm run dev
```
Buka browser di alamat [http://localhost:3000](http://localhost:3000).

---

## 📝 Fitur Utama Aplikasi
- **Dashboard Overview**: Ringkasan data statistik real-time dari database.
- **Form CRUD Validasi**: Manajemen Mahasiswa dan UKM lengkap dengan filter input.
- **Persetujuan Transaksional**: Persetujuan pendaftaran menggunakan Prisma transaction (`$transaction`) untuk membuat data `Anggota` baru secara aman dan atomic.
- **Ekspor Excel (CSV)**: Menyediakan download data instan untuk laporan.
- **Cetak Laporan**: Layanan print ramah cetak (`window.print()`).

---

## 📋 Spesifikasi Kebutuhan Fungsional (KF) & Non-Fungsional (KFN)

### 1. Kebutuhan Fungsional (KF)

*   **KF-1: Sistem Otentikasi & Multi-Role (Otorisasi)**
    *   **KF-1.1**: Halaman masuk (*Login*) email & password.
    *   **KF-1.2**: Pembatasan hak akses peran (*Role-Based Access Control*):
        *   **Administrator**: Hak akses penuh (CRUD) pada seluruh menu.
        *   **Wakil Direktur 3 & Kabag Akademik**: Kelola Mahasiswa & UKM.
        *   **Ketua/Sekretaris UKM**: Verifikasi pendaftaran & list anggota UKM.
*   **KF-2: Manajemen Data Mahasiswa (CRUD)**
    *   **KF-2.1**: Tampil list mahasiswa POLIBAN.
    *   **KF-2.2**: Tambah mahasiswa baru (NIM, Nama Lengkap, Jurusan).
    *   **KF-2.3**: Update nama lengkap & jurusan. NIM permanen.
    *   **KF-2.4**: Hapus data mahasiswa (*Cascade delete*).
*   **KF-3: Manajemen Unit Kegiatan Mahasiswa (UKM)**
    *   **KF-3.1**: Tampil list organisasi UKM POLIBAN.
    *   **KF-3.2**: Daftarkan UKM baru (Kode UKM, Nama UKM).
    *   **KF-3.3**: Update nama UKM.
    *   **KF-3.4**: Hapus data UKM.
*   **KF-4: Proses Pendaftaran Anggota Baru**
    *   **KF-4.1**: Pengajuan pendaftaran mahasiswa ke salah satu UKM.
    *   **KF-4.2**: Validasi transaksional (Mahasiswa harus terdaftar resmi & aturan 1 mahasiswa maks 1 UKM).
    *   **KF-4.3**: Pendaftaran anggota baru berstatus awal `Menunggu`.
    *   **KF-4.4**: Verifikasi status pendaftaran (Setuju/Tolak).
*   **KF-5: Manajemen Anggota UKM**
    *   **KF-5.1**: Tampil list anggota resmi beserta tanggal bergabungnya.
    *   **KF-5.2**: Pengeluaran mahasiswa dari keanggotaan UKM.
*   **KF-6: Fitur Pencarian Data**
    *   **KF-6.1**: Kotak pencarian global di setiap tabel data.
    *   **KF-6.2**: Pencarian mahasiswa berdasarkan NIM, Nama, atau Jurusan.
*   **KF-7: Cetak Laporan (Print Data)**
    *   **KF-7.1**: Fungsi print layout ramah kertas untuk mencetak rekapitulasi data.
*   **KF-8: Ekspor Data ke Excel/CSV**
    *   **KF-8.1**: Tombol ekspor instan data rekapitulasi ke format spreadsheet `.csv`.

### 2. Kebutuhan Non-Fungsional (KFN)

*   **KFN-1: Antarmuka & Estetika Visual (Usability)**
    *   **KFN-1.1**: Desain antarmuka warna terang (*light theme*) dengan gradasi merah-oranye-amber.
    *   **KFN-1.2**: Desain web responsif (*mobile-friendly*).
    *   **KFN-1.3**: Animasi mikro (*transition* & *hover effects*) pada tombol.
*   **KFN-2: Kinerja & Efisiensi (Performance)**
    *   **KFN-2.1**: Waktu muat halaman pertama di bawah 2 detik.
    *   **KFN-2.2**: Optimasi query database Neon PostgreSQL serverless.
    *   **KFN-2.3**: Pencarian tabel dilakukan secara instan di sisi klien.
*   **KFN-3: Keamanan Data & Sistem (Security)**
    *   **KFN-3.1**: Dasbor dilindungi session login.
    *   **KFN-3.2**: Kata sandi terenkripsi & tersimpan aman.
    *   **KFN-3.3**: Kotak dialog konfirmasi pada penghapusan data penting.
*   **KFN-4: Ketersediaan & Skalabilitas (Reliability & Scalability)**
    *   **KFN-4.1**: Arsitektur serverless scalable Next.js + Neon DB.
    *   **KFN-4.2**: Penggunaan Prisma `$transaction` menjamin konsistensi transaksi (atomic).

---

## 🗺️ Spesifikasi Kasus Penggunaan (Use Case Specification)

### 1. Identifikasi Aktor
- **Administrator**: Aktor tunggal pengelola sistem dengan hak akses penuh.

### 2. Use Case Diagram (Mermaid)
```mermaid
flowchart LR
    admin["👤 Administrator"]

    subgraph SIM_UKM_POLIBAN["SIM UKM POLIBAN"]
        UC1(["UC-1: Login Sistem"])
        UC2(["UC-2: Mengelola Mahasiswa (CRUD)"])
        UC3(["UC-3: Mengelola UKM (CRUD)"])
        UC4(["UC-4: Mengelola Pendaftaran Anggota"])
        UC5(["UC-5: Mengelola Anggota UKM"])
        UC6(["UC-6: Pencarian Data"])
        UC7(["UC-7: Cetak Laporan (Print)"])
        UC8(["UC-8: Ekspor CSV"])
        UC9(["UC-9: Logout"])
    end

    admin --> UC1
    admin --> UC2
    admin --> UC3
    admin --> UC4
    admin --> UC5
    admin --> UC6
    admin --> UC7
    admin --> UC8
    admin --> UC9

    classDef actor fill:#ffe0b2,stroke:#fb8c00,stroke-width:2px,color:#000;
    classDef usecase fill:#e1f5fe,stroke:#0288d1,stroke-width:2px,color:#000;
    class admin actor;
    class UC1,UC2,UC3,UC4,UC5,UC6,UC7,UC8,UC9 usecase;
    style SIM_UKM_POLIBAN fill:#f9f9f9,stroke:#666,stroke-width:2px
```

### 3. Skenario Utama Kasus Penggunaan
- **UC-1: Login Sistem**: Masuk memakai email `admin@poliban.ac.id` & sandi `admin123`. Sesi login disimpan ke `localStorage`.
- **UC-2: Tambah Mahasiswa**: Memasukkan NIM, Nama Lengkap, Jurusan. Sistem memvalidasi keunikan NIM sebelum disimpan.
- **UC-4: Persetujuan Pendaftaran**: Mengubah status pendaftaran ke `Disetujui` dan secara otomatis memasukkan mahasiswa sebagai anggota baru secara atomic (transaksional).
- **UC-8: Ekspor CSV (Excel)**: Mengonversi data visual aktif ke format spreadsheet `.csv` dengan membuang kolom kelas & email secara dinamis.

---

## 📊 Hasil Pengujian Black-Box (Black-Box Testing)

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
