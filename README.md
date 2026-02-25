# 🐔 Ayam Petelur - Layer Chicken Management System

Aplikasi manajemen peternakan ayam petelur berbasis web dengan desain simpel & elegan, responsive (web & mobile).

![Tech Stack](https://img.shields.io/badge/Vite-React-TypeScript-blue?style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=flat-square&logo=vercel)

## 🚀 Features

- **Dashboard** - Ringkasan performa peternakan
- **Manajemen Kandang** - Kelola kandang ayam
- **Manajemen Ayam** - Tracking batch ayam petelur
- **Produksi Telur** - Input & monitoring produksi harian
- **Pakan** - Record pemberian pakan & biaya
- **Kesehatan** - Vaksinasi, pengobatan, pemeriksaan
- **Penjualan** - Catat penjualan telur
- **Laporan** - Analisis profit/loss & grafik

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vite + React 18 + TypeScript |
| Styling | Tailwind CSS |
| Backend/DB | Supabase (PostgreSQL + Auth) |
| Deployment | Vercel |

## 📋 Prerequisites

- Node.js 18+ 
- npm/yarn
- Supabase account

## 🚀 Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/ayam-petelur.git
cd ayam-petelur
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Jalankan SQL migration di `supabase/schema.sql` di Supabase SQL Editor
3. Dapatkan `SUPABASE_URL` dan `SUPABASE_ANON_KEY` dari Settings > API

### 4. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Push code ke GitHub
2. Connect repository ke [Vercel](https://vercel.com)
3. Add environment variables di Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy otomatis pada setiap push ke `main`

## 📁 Project Structure

```
ayam-petelur/
├── src/
│   ├── components/       # Reusable components
│   ├── layouts/          # Layout components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom hooks (auth)
│   ├── lib/              # Supabase client
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── supabase/
│   └── schema.sql        # Database migration
├── .env.example          # Environment variables template
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🗄️ Database Schema

```
profiles (id, email, farm_name, location)
coops (id, user_id, name, capacity)
chickens (id, coop_id, batch_number, breed, initial_count, current_count, birth_date, status)
egg_production (id, chicken_id, date, count, weight, quality, notes)
feed (id, coop_id, date, type, quantity_kg, cost, notes)
health_records (id, chicken_id, date, type, description, cost, vet_name)
sales (id, date, egg_count, price_per_unit, total, customer, status)
```

## 📱 Screenshots

### Dashboard
- Total ayam, produksi telur hari ini, total kandang, total penjualan
- Grafik produksi 7 hari terakhir
- Quick actions untuk input data

### Mobile Responsive
- Bottom navigation untuk mobile
- Sidebar untuk desktop
- Responsive tables & cards

## 🔐 Authentication

Menggunakan Supabase Auth dengan email/password. User harus registrasi terlebih dahulu dan setiap user memiliki data yang terisolasi.

## 📝 License

MIT License

## 👨‍💻 Author

Created with ❤️ for Indonesian poultry farmers

---

**Happy Farming! 🐔🥚**
# ayam
