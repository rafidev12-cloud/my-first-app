# 🎬 InstantVideoGen

**Generator Video Lengkap Berbasis Web** - Dibuat sepenuhnya di browser tanpa server!

[![GitHub Pages](https://img.shields.io/badge/Live-Demo-brightgreen)](https://[USERNAME].github.io/[REPO-NAME])
[![License](https://img.shields.io/badge/Licensi-MIT-blue)](LICENSE)

## ✨ Fitur Utama
- ✅ **100% Client-side** - Tidak perlu server, tidak ada upload data
- ✅ **FFmpeg.wasm** - Encoding video langsung di browser
- ✅ **Customizable** - Teks, warna, durasi sesuka hati
- ✅ **Export MP4** - Format standar, kompatibel semua pemutar
- ✅ **Open Source** - Kode lengkap tersedia

## 🚀 Cara Deploy ke GitHub Pages

### **Metode 1: Upload ZIP (Paling Mudah)**
1. **Download** file ZIP dari repositori ini
2. **Unzip** ke folder lokal
3. **Buat repositori baru** di GitHub dengan nama apa pun
4. **Upload semua file** ke repositori tersebut
5. **Pergi ke Settings → Pages**
6. **Branch:** pilih `main` / `master`
7. **Folder:** pilih `/root`
8. **Save** - Tunggu 1-2 menit
9. **Akses** di: `https://[username].github.io/[nama-repo]`

### **Metode 2: Git Clone**
```bash
git clone https://github.com/[username]/[repo-name].git
cd [repo-name]
# Tambahkan file
git add .
git commit -m "Deploy InstantVideoGen"
git push origin main