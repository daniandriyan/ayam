# 🚀 Deployment Guide - GitHub & Vercel

## Step 1: Setup Supabase

### 1.1 Create Supabase Account
1. Buka [supabase.com](https://supabase.com)
2. Sign up dengan GitHub/Email
3. Create new project

### 1.2 Setup Database
1. Di Supabase Dashboard, buka **SQL Editor**
2. Copy isi file `supabase/schema.sql`
3. Paste dan **Run** di SQL Editor
4. Semua tabel akan dibuat otomatis

### 1.3 Dapatkan API Credentials
1. Buka **Settings** > **API**
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

---

## Step 2: Setup GitHub

### 2.1 Initialize Git Local
```bash
cd ayam-petelur
git init
git add .
git commit -m "Initial commit: Ayam Petelur App"
```

### 2.2 Create GitHub Repository
1. Buka [github.com/new](https://github.com/new)
2. Repository name: `ayam-petelur`
3. Pilih **Public** atau **Private**
4. **Create repository**

### 2.3 Push ke GitHub
```bash
# Ganti YOUR_USERNAME dengan username GitHub Anda
git remote add origin https://github.com/YOUR_USERNAME/ayam-petelur.git
git branch -M main
git push -u origin main
```

---

## Step 3: Setup Vercel

### 3.1 Create Vercel Account
1. Buka [vercel.com](https://vercel.com)
2. **Sign up** dengan GitHub (recommended)

### 3.2 Import Project
1. Klik **Add New...** > **Project**
2. Di bagian **Import Git Repository**, cari `ayam-petelur`
3. Klik **Import**

### 3.3 Configure Environment Variables
Di Vercel project settings:

1. **Settings** > **Environment Variables**
2. Add variables:
   ```
   VITE_SUPABASE_URL = https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGc... (copy dari Supabase)
   ```

### 3.4 Deploy
1. Klik **Deploy**
2. Tunggu build selesai (~1-2 menit)
3. App live di `https://ayam-petelur.vercel.app`

---

## Step 4: Auto Deploy

Setiap kali Anda push ke GitHub:
```bash
git add .
git commit -m "Your commit message"
git push
```

Vercel akan **auto-deploy** perubahan Anda!

---

## Step 5: Custom Domain (Optional)

### 5.1 Di Vercel
1. **Settings** > **Domains**
2. Add domain: `peternakan-anda.com`
3. Follow DNS configuration instructions

### 5.2 DNS Configuration
Di domain provider Anda:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## 🔧 Troubleshooting

### Build Error di Vercel
```
Error: Node version mismatch
```
**Solution:** Tambahkan `engines` di `package.json`:
```json
"engines": {
  "node": ">=18.0.0"
}
```

### Environment Variables Not Working
Pastikan variable diawali `VITE_`:
```env
✅ VITE_SUPABASE_URL
✅ VITE_SUPABASE_ANON_KEY
❌ SUPABASE_URL (tidak akan bekerja)
```

### Supabase Connection Error
1. Cek RLS (Row Level Security) policies di Supabase
2. Pastikan user sudah login
3. Cek console untuk error detail

---

## 📱 Testing Checklist

- [ ] Register akun baru
- [ ] Login dengan akun
- [ ] Tambah kandang
- [ ] Tambah ayam
- [ ] Input produksi telur
- [ ] Input pakan
- [ ] Input kesehatan
- [ ] Catat penjualan
- [ ] Lihat laporan
- [ ] Logout

---

## 🎉 Done!

Aplikasi Anda sekarang live dan siap digunakan!

**Next Steps:**
- Share ke team/peternak lain
- Monitor usage di Supabase Dashboard
- Add more features sesuai kebutuhan

---

**Need Help?**
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Vite Docs](https://vitejs.dev/guide/)
- [React Docs](https://react.dev)
