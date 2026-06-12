# Catatan Keuangan Kantor - PWA

Aplikasi PWA pencatatan keuangan kantor berbasis Vite + React + TypeScript + Tailwind CSS.

## Struktur Proyek

```
.
├── public/                    # File statis (manifest, icons)
├── src/
│   ├── components/            # Komponen reusable
│   ├── pages/                 # Halaman aplikasi
│   ├── hooks/                 # Custom React hooks
│   ├── utils/                 # Fungsi utilitas
│   ├── services/              # Service layer (API, IndexedDB, dll)
│   ├── types/                 # TypeScript type definitions
│   └── assets/                # Asset gambar, font, dll.
├── index.html
├── vite.config.ts             # Konfigurasi Vite + PWA
├── tailwind.config.ts         # Konfigurasi Tailwind
├── postcss.config.js          # Konfigurasi PostCSS
├── tsconfig.json
└── package.json
```

## Cara Install & Menjalankan

```bash
# 1. Install dependencies
npm install

# 2. Jalankan dev server (localhost:5173)
npm run dev

# 3. Build production
npm run build

# 4. Preview build
npm run preview
```

## PWA

- Service Worker dan manifest dikelola otomatis oleh `vite-plugin-pwa`
- Mode `autoUpdate`: service worker akan otomatis diperbarui
- Ikon PWA (placeholder SVG) ada di `public/`. Ganti dengan PNG asli untuk kompatibilitas maksimal
- Gunakan tools seperti `pwa-asset-generator` untuk generate ikon dari gambar sumber

## Catatan

- Halaman dan komponen bisa ditambah sesuai kebutuhan
- API endpoint di `vite.config.ts` bisa disesuaikan dengan backend riil
- Saat build produksi, PWA dapat diinstal ke Home Screen (Android/Chrome)
