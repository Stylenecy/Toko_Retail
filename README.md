
# 🛒 Toko Retail Inventory & POS System

Aplikasi Manajemen Inventaris dan Kasir (POS) berbasis Web yang terintegrasi.
Project ini menggunakan arsitektur **Monorepo** (Backend dan Frontend dalam satu repositori).

## 🛠️ Tech Stack

- **Backend:** Node.js, Express, MySQL, Sequelize ORM
- **Frontend:** React.js, Vite, Tailwind CSS, Chart.js

---

## 📋 Prasyarat (Wajib Install Dulu)

Pastikan komputer kamu sudah terinstall aplikasi berikut sebelum memulai:

1.  **Node.js (LTS Version)**
    * **Cara Website:** Download dari [nodejs.org](https://nodejs.org/) (Pilih tombol "LTS").
    * **Cara CMD (Windows):** Ketik `winget install OpenJS.NodeJS.LTS` di terminal.
2.  **XAMPP** (Atau MySQL Server lainnya)
    * Pastikan modul **Apache** dan **MySQL** sudah berjalan (Start).
3.  **Git**

---

## 🚀 Cara Menjalankan Project (Step-by-Step)

Ikuti langkah ini secara berurutan agar tidak ada error.

### 1️⃣ Clone Repositori
Buka terminal (CMD / Git Bash) di folder tujuanmu:
```bash
git clone [https://github.com/Stylenecy/Toko_Retail.git](https://github.com/Stylenecy/Toko_Retail.git)
cd Toko_Retail

```

---

### 2️⃣ Setup Backend (Server)

1. **Masuk ke folder backend:**
```bash
cd Toko_Retail

```


2. **Install Library:**
```bash
npm install

```


3. **Setup Database:**
* Buka browser ke [http://localhost/phpmyadmin](https://www.google.com/search?q=http://localhost/phpmyadmin).
* Buat database baru dengan nama persis: **`toko_retail`**.


4. **Konfigurasi Environment (`.env`):**
* Buat file baru bernama `.env` di dalam folder `Toko_Retail`.
* Copy dan Paste kode di bawah ini ke dalamnya:
```env
# Server Config
NODE_ENV=development
PORT=3000

# Database Config
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=toko_retail
DB_USER=root
DB_PASSWORD=
# (Kosongkan password jika pakai XAMPP default)

# Keamanan
JWT_SECRET=rahasia_super_aman_12345
JWT_EXPIRY=30m

# Lainnya
CORS_ORIGIN=*

```




5. **Migrasi Database (Membuat Tabel):**
```bash
npm run db:migrate

```


6. **Jalankan Server Backend:**
```bash
npm run dev

```


✅ *Pastikan muncul pesan: `Server is running on port 3000`.*
⚠️ **JANGAN MENUTUP TERMINAL INI.**

---

### 3️⃣ Setup Frontend (Aplikasi Kasir)

1. **Buka Terminal Baru** (Terminal backend biarkan tetap jalan).
2. **Masuk ke folder frontend:**
```bash
cd pos-frontend

```


*(Jika kamu masih di folder root, pastikan path-nya sesuai)*.
3. **Install Library:**
```bash
npm install

```


4. **Jalankan Aplikasi:**
```bash
npm run dev

```


5. **Buka Aplikasi:**
Klik link yang muncul di terminal (biasanya **http://localhost:5173**).

---

## 🆘 Troubleshooting (Masalah Umum)

| Error | Penyebab & Solusi |
| --- | --- |
| **`'npm' is not recognized`** | Node.js belum terinstall. Install dulu lalu restart terminal. |
| **`Unknown database 'toko_retail'`** | Lupa membuat database di phpMyAdmin. Buat DB dengan nama `toko_retail`. |
| **`Access denied for user 'root'`** | Password database salah. Cek file `.env`, kosongkan `DB_PASSWORD` jika pakai XAMPP standar. |
| **Gagal Login / Data Kosong** | Backend mati. Pastikan terminal Backend (`npm run dev`) masih berjalan. |
| **`vite is not recognized`** | Lupa menjalankan `npm install` di folder `pos-frontend`. |

---

```

```
