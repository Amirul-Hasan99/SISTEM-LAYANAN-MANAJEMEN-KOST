# KostHub — Sistem Manajemen Kost

KostHub adalah sistem manajemen rumah kost berbasis web yang dirancang untuk memudahkan pemilik kost (admin) dan penghuni (tenant) dalam mengelola operasional rumah kost secara efisien.

---

## 🚀 Fitur Utama

### 👑 Admin (Pemilik/Pengelola Kost)
| Fitur | Deskripsi |
|-------|-----------|
| **Dashboard** | Statistik operasional: jumlah penghuni, kamar tersedia, pendapatan, grafik revenue |
| **Manajemen Kamar** | CRUD kamar, kategori, fasilitas, kapasitas, harga sewa, foto |
| **Manajemen Penghuni** | Kelola data penghuni, assign kamar, tanggal masuk/keluar, status sewa |
| **Manajemen Pembayaran** | Tagihan bulanan, validasi bukti bayar, riwayat transaksi |
| **Manajemen Komplain** | Tangani keluhan, komentar, ubah status & prioritas |
| **Pengumuman** | Buat dan publish informasi ke seluruh penghuni |
| **Manajemen User** | Kelola akses, role, dan status pengguna |
| **Laporan** | Report pendapatan, okupansi, komplain, pembayaran |
| **Audit Log** | Pantau setiap aktivitas & perubahan data di sistem |
| **Pengaturan** | Konfigurasi info kost, rekening bank, denda keterlambatan |

### 👤 Penghuni (Tenant/User)
| Fitur | Deskripsi |
|-------|-----------|
| **Dashboard** | Ringkasan personal: info kamar, tagihan, notifikasi |
| **Informasi Kamar** | Detail kamar yang disewa beserta fasilitas |
| **Pembayaran** | Lihat tagihan, riwayat, upload bukti transfer |
| **Komplain** | Ajukan laporan kerusakan/kendala, pantau status |
| **Pengumuman** | Baca informasi terbaru dari pengelola |
| **Notifikasi** | Pemberitahuan otomatis (jatuh tempo, status komplain) |
| **Profil** | Kelola data pribadi & kontak darurat |

---

## 🛠️ Tech Stack

### Frontend (`/frontend`)
- **Framework**: Next.js (App Router, Static Export)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Shadcn UI
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query

### Backend (`/backend`)
- **Language**: Go (Golang)
- **Database**: PostgreSQL (Supabase)
- **Driver**: `pgx`
- **Auth**: `golang-jwt` & `bcrypt`

---

## 📁 Deployment & Integrasi

Sistem ini menggunakan arsitektur terpisah untuk kemudahan skalabilitas:

- **Frontend**: Di-deploy ke **Vercel**
- **Backend**: Di-deploy ke **Vercel (Go Serverless Functions)**
- **Database**: Di-host di **Supabase**

URL Backend: *(Di-set melalui environment variables saat deploy)*

---

## 🔐 Akun Demo

Database akan di-seed otomatis saat backend dijalankan. Akun berikut tersedia:

| Role | Email | Password | Nama |
|------|-------|----------|------|
| **Admin** | `admin@kosthub.com` | `123` | Pak Mun |
| **User** | `user@kosthub.com` | `123` | Dany Doisin |
| **User** | `tenant2@kosthub.com` | `123` | Nawa Bakir |

> **Catatan:** Kolom username pada form login diisi dengan **alamat email**.
