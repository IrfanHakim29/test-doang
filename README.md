# 🎯 Link Tracker Gallery

Sistem tracking link dengan tampilan gallery Pinterest-style yang cantik.

## Fitur

- **Gallery Cantik**: Tampilan Pinterest-style dengan gambar landscape dari Unsplash
- **Tracking Lengkap**: Catat waktu, device, browser, OS, lokasi, ISP, durasi
- **Admin Dashboard**: Kelola link dan lihat semua log kunjungan
- **Unique Link**: Setiap link memiliki ID unik untuk tracking personal
- **Simple Storage**: Menggunakan JSON file, tidak perlu database eksternal

## Data yang Di-track

| Data | Keterangan |
|------|------------|
| Waktu | Kapan link dibuka |
| IP Address | Alamat IP pengunjung |
| Device Type | Mobile / Desktop / Tablet |
| Browser | Chrome, Safari, Firefox, dll |
| OS | Windows, Android, iOS, dll |
| Lokasi | Kota & Negara (dari IP) |
| ISP | Provider internet |
| Screen Size | Resolusi layar |
| Referrer | Dari mana mereka klik link |
| Durasi | Berapa lama di halaman |

## Cara Pakai

### 1. Install Dependencies

```bash
npm install
```

### 2. Jalankan Development Server

```bash
npm run dev
```

### 3. Buka Admin Dashboard

Buka `http://localhost:3000/admin`

### 4. Buat Link Baru

1. Klik "Buat Link Baru"
2. Masukkan label (misal: "Link untuk Si A")
3. Copy link yang dihasilkan
4. Kirim ke target

### 5. Monitor Kunjungan

- Lihat semua kunjungan di tab "Log Kunjungan"
- Filter berdasarkan link tertentu dengan klik "Lihat Log"

## Struktur URL

- `/admin` - Dashboard admin
- `/v/[id]` - Halaman gallery dengan tracking (kirim link ini ke target)

## Catatan Penting

1. **Label tidak terlihat** oleh pengunjung - hanya untuk reference kamu
2. **IP geolocation** menggunakan layanan gratis, akurasi level kota
3. **Durasi** dihitung saat pengunjung meninggalkan halaman
4. **Database** disimpan di file `data.json` di root project

## Tech Stack

- Next.js 15 (App Router)
- JSON file storage
- TypeScript
- CSS (tanpa framework)
