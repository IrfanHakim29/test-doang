# 🎯 Link Tracker Gallery

Sistem tracking link dengan tampilan gallery Pinterest-style yang cantik.

## Fitur

- **Gallery Cantik**: Tampilan Pinterest-style dengan gambar landscape dari Unsplash
- **Google Sign-In**: Login 1-klik dengan akun Google (otomatis ambil email)
- **URL Parameter**: Auto-detect email dari URL (?e=email@example.com)
- **Tracking Lengkap**: Catat waktu, device, browser, OS, lokasi, ISP, durasi
- **Admin Dashboard**: Kelola link dan lihat semua log kunjungan
- **Unique Link**: Setiap link memiliki ID unik untuk tracking personal
- **Simple Storage**: Menggunakan JSON file, tidak perlu database eksternal

## Data yang Di-track

| Data | Keterangan |
|------|------------|
| Email | Email pengunjung (via Google atau form) |
| Nama | Nama pengunjung |
| Waktu | Kapan link dibuka |
| IP Address | Alamat IP pengunjung |
| Device Type | Mobile / Desktop / Tablet |
| Browser | Chrome, Safari, Firefox, dll |
| OS | Windows, Android, iOS, dll |
| Lokasi | Kota & Negara (GPS atau dari IP) |
| ISP | Provider internet |
| Screen Size | Resolusi layar |
| Referrer | Dari mana mereka klik link |
| Durasi | Berapa lama di halaman |

## Cara Pakai

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Google OAuth (Opsional - untuk login 1-klik)

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih yang ada
3. Pergi ke **APIs & Services** > **Credentials**
4. Klik **Create Credentials** > **OAuth client ID**
5. Pilih **Web application**
6. Tambahkan **Authorized JavaScript origins**:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
7. Copy Client ID dan buat file `.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

> ⚠️ Tanpa Google Client ID, sistem akan fallback ke form manual

### 3. Jalankan Development Server

```bash
npm run dev
```

### 4. Buka Admin Dashboard

Buka `http://localhost:3000/admin`

### 5. Buat Link Baru

1. Klik "Buat Link Baru"
2. Masukkan label (misal: "Link untuk Si A")
3. Copy link yang dihasilkan
4. Kirim ke target

### 6. Monitor Kunjungan

- Lihat semua kunjungan di tab "Log Kunjungan"
- Filter berdasarkan link tertentu dengan klik "Lihat Log"

## Struktur URL

- `/admin` - Dashboard admin
- `/v/[id]` - Halaman gallery dengan tracking (kirim link ini ke target)
- `/v/[id]?e=email@example.com` - Auto-login dengan email tertentu
- `/v/[id]?n=Nama&e=email@example.com` - Auto-login dengan nama dan email

## Metode Pengambilan Email

1. **Google Sign-In** (Prioritas 1): Pengunjung klik tombol Google, email otomatis diambil dari akun Google
2. **URL Parameter** (Prioritas 2): Jika ada `?e=email` di URL, langsung auto-submit
3. **Form Manual** (Fallback): Jika tidak ada Google Client ID, tampilkan form input email

## Catatan Penting

1. **Label tidak terlihat** oleh pengunjung - hanya untuk reference kamu
2. **Google Sign-In** memerlukan setup Google Cloud Console
3. **IP geolocation** menggunakan layanan gratis, akurasi level kota
4. **GPS location** lebih akurat jika pengunjung mengizinkan
5. **Durasi** dihitung saat pengunjung meninggalkan halaman
6. **Database** disimpan di file `data.json` di root project

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- GSAP (Animasi)
- Google OAuth (@react-oauth/google)
- JSON file storage
- CSS (Nature Theme)
