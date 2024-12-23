# EmailtoWA-API

Layanan untuk memonitor email masuk menggunakan IMAP dan meneruskannya ke API eksternal. Dibangun menggunakan Node.js dan Docker.

## 📋 Prasyarat

- Docker dan Docker Compose terinstall di sistem
- Akses ke server IMAP
- Akses ke API endpoint tujuan

## 🛠️ Konfigurasi

1. Clone repository ini
   ```bash
   git clone https://github.com/fahreziisnaen/EmailtoWA-API.git
   cd EmailtoWA-API
   ```

2. Sesuaikan variabel environment di `docker-compose.yml` dan `app.js`:
   ```yaml
   environment:
     IMAP_SERVER: your_imap_server    # Server IMAP Anda
     IMAP_PORT: 143                   # Port IMAP (default: 143)
     IMAP_USER: your_mail_user        # Username email
     IMAP_PASSWORD: your_mail_password # Password email
     API_URL: http://your_api_url     # URL API tujuan
     RECIPIENT_ID: your_wa_api_number # ID penerima
   ```

## 🚀 Deployment

1. Build dan jalankan container:
   ```bash
   docker-compose up -d
   ```

2. Cek logs untuk memastikan service berjalan:
   ```bash
   docker logs email-forwarder
   ```

3. Untuk menghentikan service:
   ```bash
   docker-compose down
   ```

## ⚙️ Cara Kerja

Service ini akan:
1. Terhubung ke server IMAP yang ditentukan
2. Memonitor email baru yang masuk
3. Mengekstrak konten email
4. Mengirimkan konten ke API yang ditentukan dengan format:
   ```json
   {
     "message": "konten_email",
     "id": "recipient_id"
   }
   ```

## 🔍 Troubleshooting

### Koneksi IMAP gagal:
- Pastikan kredensial IMAP benar
- Verifikasi server IMAP dapat diakses
- Cek firewall/security group mengizinkan port 143

### API calls gagal:
- Verifikasi URL API benar
- Pastikan API endpoint dapat diakses dari container
- Cek format request yang dikirim sesuai dengan yang diharapkan API

## 💻 Pengembangan Lokal

1. Install dependensi:
   ```bash
   npm install
   ```

2. Set environment variables dalam file `.env`:
   ```env
   IMAP_SERVER=your_imap_server
   IMAP_PORT=143
   IMAP_USER=your_mail_user
   IMAP_PASSWORD=your_mail_password
   API_URL=your_api_url
   RECIPIENT_ID=your_wa_api_number
   ```

3. Jalankan aplikasi:
   ```bash
   node app.js
   ```

## 📦 Dependencies

- imap: ^0.8.19
- mailparser: ^3.0.0
- axios: ^1.7.9

## 📄 Lisensi

MIT License

## 🤝 Kontribusi

Kontribusi selalu diterima! Silakan buat pull request atau issue jika Anda memiliki saran perbaikan.