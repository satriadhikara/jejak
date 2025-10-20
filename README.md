# <img src="apps/ui/assets/Logo.png" alt="Jejak Logo" width="20" /> Jejak

> **Platform Pelacakan & Keamanan Pejalan Kaki Pintar**

[![Status](https://img.shields.io/badge/Status-Finalist-brightgreen)](https://gemastik.id)
[![Competition](https://img.shields.io/badge/Competition-Gemastik%2018-blue)](https://gemastik.id)
[![Team](https://img.shields.io/badge/Team-GajahBiru%20%7C%20ITB-informational)](https://www.itb.ac.id)
[![License](https://img.shields.io/badge/License-Proprietary-red)](#)

## 🏆 Informasi Kompetisi

**Jejak** adalah proyek finalis yang berkompetisi di **Gemastik 18** yang diselenggarakan oleh **PusPresNas** (Pusat Prestasi Nasional). Tim kami **GajahBiru** dari **Institut Teknologi Bandung (ITB)** bangga menjadi salah satu finalis dan akan bertanding untuk menjadi juara di babak final.

- 🎯 **Kompetisi**: Gemastik 18
- 🏛️ **Penyelenggara**: PusPresNas (Pusat Prestasi Nasional)
- 👥 **Tim**: GajahBiru
- 🎓 **Institusi**: Institut Teknologi Bandung (ITB)
- 🥇 **Status**: Finalis (Bertanding di Babak Final)

---

## 📱 Tentang Jejak

**Jejak** adalah platform inovatif untuk pelacakan dan keamanan pejalan kaki yang dirancang untuk meningkatkan mobilitas perkotaan dan keamanan pejalan kaki. Platform ini menggabungkan aksesibilitas mobile dengan layanan backend yang kuat untuk menyediakan pelacakan rute pejalan kaki secara real-time, pemantauan keamanan, dan pelaporan kerusakan trotoar.

### Fitur Utama

- 🗺️ **Pelacakan Rute Real-time**: Melacak perjalanan pejalan kaki dengan koordinat GPS yang akurat
- 🛡️ **Pemantauan Keamanan**: Notifikasi keamanan real-time dan analisis kepadatan keramaian
- 📍 **Pelaporan Insiden**: Sistem pelaporan berbasis komunitas untuk bahaya dan area tidak aman
- 🔐 **autentikasi Aman**: Keamanan data pengguna tingkat enterprise
- ☁️ **Integrasi Cloud**: Penyimpanan foto insiden dan bukti di S3 secara seamless
- 🤖 **Analisis Berbasis AI**: Menggunakan Google Gemini AI untuk saran rute cerdas dan penilaian risiko

---

## 🏗️ Arsitektur Proyek

Ini adalah proyek **monorepo** yang dibangun dengan teknologi modern:

```
jejak/
├── apps/
│   ├── api/           # Backend API (Hono.js)
│   └── ui/            # Mobile App (React Native/Expo)
├── package.json       # Konfigurasi workspace
└── tsconfig.json      # Konfigurasi TypeScript
```

### Backend (`apps/api`)

- **Framework**: [Hono.js](https://hono.dev) 
- **Database**: PostgreSQL dengan [Drizzle ORM](https://orm.drizzle.team)
- **autentikasi**: [Better Auth](https://better-auth.vercel.app)
- **Validasi API**: Zod untuk validasi tipe yang aman
- **Testing**: Bun test framework
- **Linting**: oxlint untuk kualitas kode

**Tech Stack**: Hono, Drizzle ORM, PostgreSQL, Zod, Better Auth, Google Gemini AI

### Frontend (`apps/ui`)

- **Framework**: [React Native](https://reactnative.dev) dengan [Expo](https://expo.dev)
- **Routing**: Expo Router (routing berbasis file)
- **Manajemen State**: React Query untuk state server
- **autentikasi**: Better Auth untuk sesi pengguna yang seamless
- **Styling**: NativeWind (Tailwind CSS untuk React Native)
- **Maps**: Integrasi Expo Maps
- **Lokasi**: API Expo Location

**Tech Stack**: React Native, Expo, Expo Router, React Query, NativeWind, Better Auth

---

## 🚀 Memulai

### Prasyarat

- [Bun](https://bun.sh) v1.2.19 atau lebih baru
- Node.js 18+ (untuk kompatibilitas)
- Git

### Instalasi

1. **Clone repository**

   ```bash
   git clone https://github.com/satriadhikara/jejak.git
   cd jejak
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

### Pengembangan

```bash
cd apps/ui
bunx expo run:android
```
pastikan emulator android atau android tersedia

### Database

#### Inisialisasi Database

```bash
cd apps/api
bun run db:generate   # Generate client Drizzle
bun run db:migrate    # Terapkan migrasi
```

#### Database Studio

Buka Drizzle Studio untuk visualisasi dan manajemen data:

```bash
cd apps/api
bun run db:studio
```

---

## 📋 Skrip Tersedia

### Level Root

| Skrip              | Deskripsi                                 |
| ------------------ | ----------------------------------------- |
| `bun run dev`      | Jalankan semua layanan dalam mode dev     |
| `bun run dev:ui`   | Jalankan hanya mobile UI                  |
| `bun run dev:api`  | Jalankan hanya backend API                |

### API (`apps/api`)

| Skrip                  | Deskripsi                      |
| ---------------------- | ------------------------------ |
| `bun run dev`          | Mulai API dengan hot reload    |
| `bun run start`        | Mulai API untuk produksi       |
| `bun run test`         | Jalankan test suite            |
| `bun run lint`         | Lint kode dengan oxlint        |
| `bun run db:generate`  | Generate client Drizzle ORM    |
| `bun run db:migrate`   | Jalankan migrasi database      |
| `bun run db:studio`    | Buka Drizzle Studio            |

### UI (`apps/ui`)

| Skrip             | Deskripsi                        |
| ----------------- | -------------------------------- |
| `bun run start`   | Mulai server pengembangan Expo   |
| `bunx expo run:android` | Build dan jalankan di Android    |
| `bun run lint`    | Lint dan cek format              |
| `bun run format`  | Format kode otomatis             |
| `bun run prebuild`| Prebuild aplikasi native         |

---

## 🔧 Konfigurasi

### Environment Variables

Buat file `.env` di setiap app:

**`apps/api/.env`**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/jejak
BETTER_AUTH_SECRET=your_secret_key
GOOGLE_GENAI_API_KEY=your_google_api_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_bucket_name
```

**`apps/ui/.env`**

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_APP_NAME=Jejak
```

---

## 📚 Struktur Proyek

### API Routes

- `/health` - Endpoint cek kesehatan
- `/auth` - Endpoint autentikasi
- `/maps` - Data maps dan lokasi
- `/points` - Pelacakan poin lingkungan
- `/reports` - Manajemen laporan
- `/storage` - Upload/download file

### Mobile Screens

- `sign-in` - autentikasi pengguna
- `(secure)` - Rute terlindungi
  - `beranda` - Home/Dashboard dengan pelacakan rute
  - `analyze` - Analitik & insight keamanan
  - `riwayat` - Riwayat pejalan kaki & log perjalanan
  - `location-search` - Pencarian rute & bahaya

---

## 🧪 Pengujian

### Jalankan Tes

```bash
cd apps/api
bun run test
```

### Test Coverage

```bash
cd apps/api
bun run test --coverage
```

Tes berada di `apps/api/tests/` dengan:

- Tes integrasi
- Tes route
- Tes unit service
- Setup database mock

---

## 🎨 Kualitas Kode

### Linting

**API:**

```bash
cd apps/api
bun run lint
```

**UI:**

```bash
cd apps/ui
bun run lint
```

### Format Kode

**UI:**

```bash
cd apps/ui
bun run format
```

---

## 📦 Build & Deployment

### Mobile App

```bash
cd apps/ui
bun run prebuild        # Generate kode native
bun run android         # Build dan deploy ke Android
bun run ios             # Build dan deploy ke iOS
```

### Backend API

```bash
cd apps/api
bun run start           # Mulai server produksi
```

Untuk deployment Docker:

```bash
docker build -t jejak .
docker run -p 3000:3000 jejak
```

---

## 🔐 Keamanan

- ✅ autentikasi terenkripsi dengan Better Auth
- ✅ Environment variable untuk data sensitif
- ✅ Middleware CORS untuk proteksi API
- ✅ Validasi input dengan Zod
- ✅ Manajemen sesi yang aman

---

## 📄 Lisensi

Proyek ini bersifat proprietary dan merupakan bagian dari kompetisi Gemastik 18. Reproduksi atau distribusi tanpa izin dilarang.

---

## 👥 Tim GajahBiru

| Nama                | Github                                                | Institusi                                   |
| ------------------- | ----------------------------------------------------- | ------------------------------------------- |
| Satriadhikara Panji | [satriadhikara](https://github.com/satriadhikara)     | ITB - Teknik Informatika 22                 |
| Mohammad Andhika    | [andhikafdh](https://github.com/andhikafdh)           | ITB - Teknik Informatika 22                 |
| Yusril Fazri M.     | [YusrilMahendraa](https://github.com/YusrilMahendraa) | ITB - Sistem dan Teknologi Informasi 22     |

---

## 📞 Dukungan

Untuk pertanyaan atau masalah terkait proyek ini, silakan hubungi tim pengembang.

---

<div align="center">

**Finalis Gemastik 18 | Tim GajahBiru | ITB**

_Membangun ruang kota yang lebih aman melalui teknologi pelacakan pejalan kaki yang cerdas_

</div>
