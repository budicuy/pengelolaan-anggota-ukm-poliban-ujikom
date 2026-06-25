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
