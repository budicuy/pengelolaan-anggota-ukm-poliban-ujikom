import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Clean existing data
  await prisma.anggota.deleteMany({});
  await prisma.pendaftaran.deleteMany({});
  await prisma.mahasiswa.deleteMany({});
  await prisma.uKM.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Seed User (Administrator)
  const admin = await prisma.user.create({
    data: {
      name: "Budi Administrator",
      email: "admin@poliban.ac.id",
      password: "admin123", // Plain text password for demo
      role: "Administrator",
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  // Seed other demo users for other roles if they want to login manually
  const wadir = await prisma.user.create({
    data: {
      name: "Dr. H. Akhmad Mauladi, M.T.",
      email: "wadir3@poliban.ac.id",
      password: "wadir3123",
      role: "Wakil Direktur 3",
    },
  });
  const kabag = await prisma.user.create({
    data: {
      name: "Hj. Noor Laili, M.Pd.",
      email: "kabag.akademik@poliban.ac.id",
      password: "kabag123",
      role: "Kepala Bagian Akademik",
    },
  });
  const ketua = await prisma.user.create({
    data: {
      name: "Rian Hidayat (Ketua Robotika)",
      email: "ketuaukm@poliban.ac.id",
      password: "ukm123",
      role: "Ketua UKM",
    },
  });
  console.log("Created role users");

  // 3. Seed UKM
  await prisma.uKM.create({
    data: { id: "UKM-001", nama: "Mapala Justitia", deskripsi: "Unit Kegiatan Mahasiswa Pecinta Alam Justitia Politeknik Negeri Banjarmasin." },
  });
  await prisma.uKM.create({
    data: { id: "UKM-002", nama: "UKM Seni & Budaya", deskripsi: "Wadah pengembangan minat dan bakat mahasiswa di bidang seni musik, tari, teater, dan seni rupa." },
  });
  await prisma.uKM.create({
    data: { id: "UKM-003", nama: "UKM Robotika", deskripsi: "Fokus pada pengembangan teknologi otomasi, pemrograman mikrokontroler, dan kompetisi robotika tingkat nasional." },
  });
  await prisma.uKM.create({
    data: { id: "UKM-004", nama: "UKM Olahraga", deskripsi: "Mengembangkan potensi mahasiswa di bidang olahraga futsal, basket, voli, bulutangkis, dan catur." },
  });
  console.log("Created UKMs");

  // 4. Seed Mahasiswa
  await prisma.mahasiswa.create({
    data: { nim: "E020323002", nama: "Siti Aminah", jurusan: "Akuntansi" },
  });
  await prisma.mahasiswa.create({
    data: { nim: "E020323003", nama: "Ahmad Fauzi", jurusan: "Teknik Elektro" },
  });
  await prisma.mahasiswa.create({
    data: { nim: "E020323004", nama: "Aulia Rahman", jurusan: "Administrasi Bisnis" },
  });
  await prisma.mahasiswa.create({
    data: { nim: "E020323006", nama: "Fitriani", jurusan: "Teknik Sipil" },
  });
  console.log("Created Mahasiswa");

  // 5. Seed Pendaftaran
  await prisma.pendaftaran.create({
    data: { mahasiswaNim: "E020323001", ukmId: "UKM-003", status: "Disetujui" }
  });
  await prisma.pendaftaran.create({
    data: { mahasiswaNim: "E020323002", ukmId: "UKM-002", status: "Menunggu" }
  });
  await prisma.pendaftaran.create({
    data: { mahasiswaNim: "E020323003", ukmId: "UKM-004", status: "Disetujui" }
  });
  await prisma.pendaftaran.create({
    data: { mahasiswaNim: "E020323004", ukmId: "UKM-001", status: "Menunggu" }
  });
  console.log("Created Pendaftaran");

  // 6. Seed Anggota (Approved ones)
  await prisma.anggota.create({
    data: { mahasiswaNim: "E020323001", ukmId: "UKM-003" }
  });
  await prisma.anggota.create({
    data: { mahasiswaNim: "E020323003", ukmId: "UKM-004" }
  });
  console.log("Created Anggota");

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
